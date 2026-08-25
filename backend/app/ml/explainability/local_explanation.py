import numpy as np
import pandas as pd
from typing import Dict, Any, List
from app.ml.feature_metadata import get_feature_metadata


def generate_local_explanation(
    prediction_kg: float,
    base_value_kg: float,
    shap_values: np.ndarray,
    feature_names: List[str],
    input_row: pd.Series | Dict[str, Any],
    tolerance: float = 2.0,
) -> Dict[str, Any]:
    """Generate structured single-prediction SHAP explanation with additive property validation.
    
    Args:
        prediction_kg (float): Final model prediction in kg CO₂.
        base_value_kg (float): Model base value (expected value) in kg CO₂.
        shap_values (np.ndarray): Array of SHAP feature contribution values.
        feature_names (List[str]): List of feature column names in exact model order.
        input_row (pd.Series | dict): Feature input values.
        tolerance (float): Numerical tolerance for additive sanity check.
        
    Returns:
        Dict[str, Any]: Structured explanation payload.
    """
    shap_vals = np.array(shap_values).ravel()
    sum_shap = float(np.sum(shap_vals))
    calculated_total = float(base_value_kg + sum_shap)
    diff = float(round(abs(calculated_total - prediction_kg), 4))
    additive_check = bool(diff <= tolerance)

    if not additive_check:
        print(f"[SHAP Additive Warning] Base ({base_value_kg:.2f}) + Sum SHAP ({sum_shap:.2f}) = {calculated_total:.2f} != Pred ({prediction_kg:.2f}), Diff: {diff:.4f}")

    contributors = []
    for idx, feat in enumerate(feature_names):
        meta = get_feature_metadata(feat)
        raw_val = input_row[feat] if isinstance(input_row, dict) else input_row.get(feat, 0.0)

        val_float = float(round(raw_val, 2)) if isinstance(raw_val, (int, float, np.number)) else str(raw_val)
        sv_float = float(round(shap_vals[idx], 2))

        direction = "positive" if sv_float > 0.01 else ("negative" if sv_float < -0.01 else "neutral")

        contributors.append({
            "feature": feat,
            "display_name": meta["display_name"],
            "unit": meta["unit"],
            "description": meta["description"],
            "input_value": val_float,
            "shap_value": sv_float,
            "direction": direction,
            "abs_shap": abs(sv_float),
        })

    # Sort contributors by absolute SHAP magnitude
    contributors.sort(key=lambda x: x["abs_shap"], reverse=True)

    # Extract Top 5 Positive & Negative Contributors
    positive_contribs = [c for c in contributors if c["direction"] == "positive"]
    negative_contribs = [c for c in contributors if c["direction"] == "negative"]

    top_positive = sorted(positive_contribs, key=lambda x: x["shap_value"], reverse=True)[:5]
    top_negative = sorted(negative_contribs, key=lambda x: x["shap_value"])[:5]

    # Generate deterministic text summary
    summary_text = _generate_explanation_text(prediction_kg, base_value_kg, top_positive, top_negative)

    return {
        "prediction_kg": round(prediction_kg, 2),
        "base_value_kg": round(base_value_kg, 2),
        "additive_check": additive_check,
        "difference": diff,
        "contributors": contributors,
        "top_positive": top_positive,
        "top_negative": top_negative,
        "summary_text": summary_text,
    }


def _generate_explanation_text(
    pred_kg: float,
    base_kg: float,
    top_pos: List[dict],
    top_neg: List[dict]
) -> str:
    """Generate deterministic natural explanation text based strictly on SHAP contributions."""
    diff_kg = pred_kg - base_kg
    if diff_kg >= 0:
        base_desc = f"The model predicted {pred_kg:,.1f} kg CO₂, which is {diff_kg:,.1f} kg CO₂ ABOVE the baseline ({base_kg:,.1f} kg CO₂)."
    else:
        base_desc = f"The model predicted {pred_kg:,.1f} kg CO₂, which is {abs(diff_kg):,.1f} kg CO₂ BELOW the baseline ({base_kg:,.1f} kg CO₂)."

    pos_desc = ""
    if top_pos:
        pos_names = ", ".join([f"{item['display_name']} (+{item['shap_value']:.1f} kg CO₂)" for item in top_pos[:3]])
        pos_desc = f" Key operational drivers increasing the prediction include {pos_names}."

    neg_desc = ""
    if top_neg:
        neg_names = ", ".join([f"{item['display_name']} ({item['shap_value']:.1f} kg CO₂)" for item in top_neg[:2]])
        neg_desc = f" Key factors moderating the prediction include {neg_names}."

    return base_desc + pos_desc + neg_desc
