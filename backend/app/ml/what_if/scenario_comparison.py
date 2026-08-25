from typing import Dict, Any, List, Optional
from app.ml.feature_metadata import get_feature_metadata


def compare_scenarios(
    baseline_pred_kg: float,
    scenario_pred_kg: float,
    baseline_prod_units: float,
    scenario_prod_units: float,
    baseline_shap: Optional[dict] = None,
    scenario_shap: Optional[dict] = None,
    tolerance: float = 1.0,
) -> Dict[str, Any]:
    """Compare baseline vs scenario predictions, compute emission intensity, and SHAP attribution changes.
    
    Args:
        baseline_pred_kg (float): Baseline predicted CO₂ emission in kg.
        scenario_pred_kg (float): Scenario predicted CO₂ emission in kg.
        baseline_prod_units (float): Baseline production output.
        scenario_prod_units (float): Scenario production output.
        baseline_shap (dict, optional): Baseline SHAP explanation payload.
        scenario_shap (dict, optional): Scenario SHAP explanation payload.
        tolerance (float): Numerical threshold for 'no_change' classification.
        
    Returns:
        Dict[str, Any]: Structured comparison metrics.
    """
    diff_kg = float(round(scenario_pred_kg - baseline_pred_kg, 2))

    if diff_kg < -tolerance:
        direction = "reduction"
        reduction_kg = float(round(abs(diff_kg), 2))
    elif diff_kg > tolerance:
        direction = "increase"
        reduction_kg = 0.0
    else:
        direction = "no_change"
        reduction_kg = 0.0

    # Percentage Change Calculation
    if baseline_pred_kg > 0:
        pct_change = float(round((diff_kg / baseline_pred_kg) * 100.0, 2))
    else:
        pct_change = None

    # CO₂ Emission Intensity (kg CO₂ / Production Unit)
    base_intensity = float(round(baseline_pred_kg / baseline_prod_units, 2)) if baseline_prod_units > 0 else None
    scen_intensity = float(round(scenario_pred_kg / scenario_prod_units, 2)) if scenario_prod_units > 0 else None

    if base_intensity is not None and scen_intensity is not None:
        intensity_change = float(round(scen_intensity - base_intensity, 2))
    else:
        intensity_change = None

    # SHAP Attribution Difference
    shap_comparison = None
    if baseline_shap and scenario_shap:
        shap_comparison = _compare_shap_attributions(baseline_shap, scenario_shap)

    return {
        "difference_kg": diff_kg,
        "reduction_kg": reduction_kg,
        "percentage_change": pct_change,
        "direction": direction,
        "baseline_co2_intensity": base_intensity,
        "scenario_co2_intensity": scen_intensity,
        "intensity_change": intensity_change,
        "shap_comparison": shap_comparison,
    }


def _compare_shap_attributions(baseline_shap: dict, scenario_shap: dict) -> List[Dict[str, Any]]:
    """Compute feature-level SHAP attribution changes between scenario and baseline."""
    base_contribs = {item["feature"]: item for item in baseline_shap.get("contributors", [])}
    scen_contribs = {item["feature"]: item for item in scenario_shap.get("contributors", [])}

    changes = []
    for feat, scen_item in scen_contribs.items():
        base_item = base_contribs.get(feat, {})
        base_sv = base_item.get("shap_value", 0.0)
        scen_sv = scen_item.get("shap_value", 0.0)
        delta_sv = float(round(scen_sv - base_sv, 2))

        base_val = base_item.get("input_value", 0.0)
        scen_val = scen_item.get("input_value", 0.0)

        meta = get_feature_metadata(feat)

        if abs(delta_sv) > 0.01 or base_val != scen_val:
            changes.append({
                "feature": feat,
                "display_name": meta["display_name"],
                "unit": meta["unit"],
                "baseline_value": base_val,
                "scenario_value": scen_val,
                "baseline_shap_kg": base_sv,
                "scenario_shap_kg": scen_sv,
                "delta_shap_kg": delta_sv,
                "direction": "reduced_contribution" if delta_sv < 0 else ("increased_contribution" if delta_sv > 0 else "no_change"),
            })

    changes.sort(key=lambda x: abs(x["delta_shap_kg"]), reverse=True)
    return changes
