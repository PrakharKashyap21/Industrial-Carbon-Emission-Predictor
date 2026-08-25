from typing import List, Dict, Any


class AnomalyAnalysisEngine:
    """Aggregates operational anomaly events from monitoring snapshots and readings."""

    def analyze_anomalies(
        self,
        monitoring_alerts: List[Dict[str, Any]],
        readings: List[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """Aggregate anomaly frequency and construct operational anomaly timeline."""
        timeline = []
        alerts_list = monitoring_alerts or []

        for a in alerts_list:
            timeline.append({
                "alert_id": a.get("alert_id") or a.get("id"),
                "date": str(a.get("created_at") or a.get("timestamp") or "2026-08-15").split("T")[0],
                "event_type": "Operational Anomaly",
                "alert_type": a.get("alert_type", "DATA_QUALITY"),
                "severity": a.get("severity", "WARNING"),
                "message": a.get("message", "Operational anomaly detected"),
                "feature_name": a.get("feature_name"),
            })

        # Calculate high emission spikes from readings if alert table is empty
        if not timeline and readings:
            co2_vals = [float(r.get("co2_emission_kg") or r.get("ensemble_prediction") or 0.0) for r in readings]
            if co2_vals:
                avg_co2 = sum(co2_vals) / len(co2_vals)
                std_co2 = (sum((v - avg_co2) ** 2 for v in co2_vals) / len(co2_vals)) ** 0.5

                for idx, r in enumerate(readings):
                    co2 = float(r.get("co2_emission_kg") or r.get("ensemble_prediction") or 0.0)
                    if std_co2 > 0 and (co2 - avg_co2) > 2.0 * std_co2:
                        ts = str(r.get("timestamp") or r.get("reading_timestamp") or "2026-08-15").split("T")[0]
                        timeline.append({
                            "alert_id": idx + 1,
                            "date": ts,
                            "event_type": "Operational Anomaly",
                            "alert_type": "EMISSION_SPIKE",
                            "severity": "WARNING",
                            "message": f"Predicted CO₂ emission spike ({round(co2, 1)} kg) exceeds operational baseline",
                            "feature_name": "co2_emission_kg",
                        })

        tot_anomalies = len(timeline)
        warning_count = len([t for t in timeline if t.get("severity") == "WARNING"])
        critical_count = len([t for t in timeline if t.get("severity") == "CRITICAL"])

        return {
            "total_anomalies": tot_anomalies,
            "warning_count": warning_count,
            "critical_count": critical_count,
            "timeline": timeline[:15],  # top 15 timeline events
        }


anomaly_analysis_engine = AnomalyAnalysisEngine()
