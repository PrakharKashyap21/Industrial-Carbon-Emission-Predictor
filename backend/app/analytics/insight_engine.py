from typing import List, Dict, Any


class IndustrialInsightEngine:
    """Deterministic rule-based Industrial Insight Engine evaluating operational metrics against configurable rule thresholds."""

    def generate_insights(
        self,
        kpi_data: Dict[str, Any],
        intensity_data: Dict[str, Any],
        feature_data: Dict[str, Any],
        anomaly_data: Dict[str, Any],
        optimization_data: Dict[str, Any],
    ) -> List[Dict[str, Any]]:
        """Evaluate deterministic industrial rules and generate structured insights."""
        insights = []

        # 1. Emission Intensity Efficiency Rule
        intensity_change = intensity_data.get("intensity_change_percentage", 0.0)
        prod_change = intensity_data.get("production_change_percentage", 0.0)
        co2_change = intensity_data.get("co2_change_percentage", 0.0)

        if prod_change > 0 and intensity_change < 0:
            insights.append({
                "insight_type": "EFFICIENCY",
                "severity": "INFO",
                "title": "Industrial Emission Efficiency Improved",
                "description": f"Production output increased by {prod_change}% while emission intensity decreased by {abs(intensity_change)}% ({intensity_data.get('emission_intensity')} kg CO₂/unit), demonstrating higher emissions efficiency per unit produced.",
                "metric_name": "emission_intensity",
                "metric_value": intensity_data.get("emission_intensity"),
                "reference_period": "Month-over-Month",
            })
        elif intensity_change > 5.0:
            insights.append({
                "insight_type": "EFFICIENCY",
                "severity": "WARNING",
                "title": "Emission Intensity Degraded",
                "description": f"Emission intensity increased by {intensity_change}% to {intensity_data.get('emission_intensity')} kg CO₂/unit, indicating lower production carbon efficiency.",
                "metric_name": "emission_intensity",
                "metric_value": intensity_data.get("emission_intensity"),
                "reference_period": "Month-over-Month",
            })

        # 2. Emission Trend Rule
        if co2_change > 10.0:
            insights.append({
                "insight_type": "EMISSION",
                "severity": "CRITICAL",
                "title": "Significant CO₂ Emission Rise",
                "description": f"Estimated CO₂ emissions increased by {co2_change}% compared with the previous operating period.",
                "metric_name": "total_co2",
                "metric_value": kpi_data.get("total_co2"),
                "reference_period": "Period Trend",
            })
        elif co2_change > 5.0:
            insights.append({
                "insight_type": "EMISSION",
                "severity": "WARNING",
                "title": "Moderate CO₂ Emission Increase",
                "description": f"Predicted emissions rose by {co2_change}% over the baseline period.",
                "metric_name": "total_co2",
                "metric_value": kpi_data.get("total_co2"),
                "reference_period": "Period Trend",
            })
        elif co2_change < -5.0:
            insights.append({
                "insight_type": "EMISSION",
                "severity": "INFO",
                "title": "Favorable Emission Reduction Trend",
                "description": f"Predicted emissions decreased by {abs(co2_change)}% compared to the prior period.",
                "metric_name": "total_co2",
                "metric_value": kpi_data.get("total_co2"),
                "reference_period": "Period Trend",
            })

        # 3. Operational Feature Driver Rule
        correlations = feature_data.get("correlations", [])
        if correlations:
            top_driver = correlations[0]
            if abs(top_driver.get("correlation_with_co2", 0.0)) > 0.7:
                insights.append({
                    "insight_type": "OPERATIONAL",
                    "severity": "INFO",
                    "title": f"Primary Emission Driver: {top_driver.get('display_name')}",
                    "description": f"{top_driver.get('display_name')} demonstrates the strongest statistical correlation (r = {top_driver.get('correlation_with_co2')}) with predicted CO₂ emissions.",
                    "metric_name": top_driver.get("feature_key"),
                    "metric_value": top_driver.get("correlation_with_co2"),
                    "reference_period": "Correlation Matrix",
                })

        # 4. Anomaly Rule
        tot_anomalies = anomaly_data.get("total_anomalies", 0)
        crit_anomalies = anomaly_data.get("critical_count", 0)
        if crit_anomalies > 0:
            insights.append({
                "insight_type": "ANOMALY",
                "severity": "CRITICAL",
                "title": "Critical Operational Anomalies Detected",
                "description": f"{crit_anomalies} critical operational anomalies were detected during the current monitoring period.",
                "metric_name": "anomaly_count",
                "metric_value": float(crit_anomalies),
                "reference_period": "Monitoring Period",
            })
        elif tot_anomalies > 0:
            insights.append({
                "insight_type": "ANOMALY",
                "severity": "WARNING",
                "title": "Operational Anomalies Identified",
                "description": f"{tot_anomalies} operational anomalies (emission spikes / parameter shifts) were logged.",
                "metric_name": "anomaly_count",
                "metric_value": float(tot_anomalies),
                "reference_period": "Monitoring Period",
            })

        # 5. Optimization Rule
        tot_opt = optimization_data.get("total_runs", 0)
        avg_saving_pct = optimization_data.get("average_reduction_percentage", 0.0)
        if tot_opt > 0 and avg_saving_pct > 0:
            insights.append({
                "insight_type": "OPTIMIZATION",
                "severity": "INFO",
                "title": "Optimization Search Potential",
                "description": f"Automated constrained search runs identified an average model-estimated reduction potential of {avg_saving_pct}% across feasible operating configurations.",
                "metric_name": "average_reduction_percentage",
                "metric_value": avg_saving_pct,
                "reference_period": "Optimization Search History",
            })

        if not insights:
            insights.append({
                "insight_type": "OPERATIONAL",
                "severity": "INFO",
                "title": "Normal Operating Baseline",
                "description": "Industrial operations are performing within expected parameters with stable emission intensity.",
                "metric_name": "total_co2",
                "metric_value": kpi_data.get("total_co2", 0.0),
                "reference_period": "Current Period",
            })

        return insights


industrial_insight_engine = IndustrialInsightEngine()
