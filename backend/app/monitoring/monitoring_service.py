from datetime import datetime, timedelta
from typing import Dict, Any, Optional
import pandas as pd
from sqlalchemy.orm import Session
from sqlalchemy import select, desc

from app.models.industrial_reading import IndustrialReading
from app.models.prediction import Prediction
from app.models.monitoring import MonitoringSnapshot, DriftResult, MonitoringAlert
from app.monitoring.data_quality import data_quality_monitor
from app.monitoring.drift_detection import drift_detector
from app.monitoring.model_monitoring import model_performance_monitor
from app.monitoring.reliability import reliability_engine
from app.monitoring.alert_service import alert_service


class MonitoringService:
    """Master Orchestrator service running monitoring cycles, computing snapshots, and managing alerts."""

    def run_monitoring_cycle(self, db: Session, plant_id: Optional[int] = None, days: int = 30) -> Dict[str, Any]:
        """Execute complete monitoring evaluation cycle and persist snapshot to PostgreSQL database."""
        # 1. Fetch recent readings & predictions
        cutoff = datetime.utcnow() - timedelta(days=days)

        read_query = select(IndustrialReading).where(IndustrialReading.timestamp >= cutoff)
        pred_query = select(Prediction).where(Prediction.prediction_timestamp >= cutoff)

        if plant_id:
            read_query = read_query.where(IndustrialReading.plant_id == plant_id)
            pred_query = pred_query.where(Prediction.plant_id == plant_id)

        readings = db.execute(read_query).scalars().all()
        predictions = db.execute(pred_query).scalars().all()

        # 2. Data Quality Analysis
        dq_summary = data_quality_monitor.evaluate_readings_batch(readings)

        # 3. Data Drift Analysis
        df_dicts = [
            {
                "electricity_consumption_kwh": r.electricity_consumption_kwh,
                "diesel_consumption_liters": r.diesel_consumption_liters,
                "natural_gas_consumption_m3": r.natural_gas_consumption_m3,
                "production_quantity": r.production_quantity,
                "raw_material_consumption_kg": r.raw_material_consumption_kg,
                "machine_runtime_hours": r.machine_runtime_hours,
                "temperature_c": r.temperature_c,
                "pressure_bar": r.pressure_bar,
                "previous_co2_emission_kg": r.previous_co2_emission_kg,
            }
            for r in readings
        ]
        current_df = pd.DataFrame(df_dicts) if df_dicts else pd.DataFrame()
        drift_summary = drift_detector.evaluate_feature_drift(current_df)

        # 4. Model Performance Analysis
        perf_summary = model_performance_monitor.evaluate_performance(predictions)

        # 5. Prediction Reliability Assessment
        rel_summary = reliability_engine.evaluate_overall_system_reliability(
            dq_summary=dq_summary,
            drift_summary=drift_summary,
            perf_summary=perf_summary,
        )

        # 6. Generate Alerts
        # Data Quality Alerts
        if dq_summary["quality_status"] == "warning":
            alert_service.create_alert_if_not_exists(
                db=db,
                alert_type="DATA_QUALITY",
                severity="WARNING",
                message=f"Missing values detected in {dq_summary['missing_rate_pct']}% of recent records",
                plant_id=plant_id,
            )
        elif dq_summary["quality_status"] == "critical":
            alert_service.create_alert_if_not_exists(
                db=db,
                alert_type="DATA_QUALITY",
                severity="CRITICAL",
                message=f"Critical invalid inputs detected ({dq_summary['invalid_records']} records)",
                plant_id=plant_id,
            )

        # Feature Drift Alerts
        for f_drift in drift_summary.get("features", []):
            if f_drift["drift_status"] == "high":
                alert_service.create_alert_if_not_exists(
                    db=db,
                    alert_type="DATA_DRIFT",
                    severity="CRITICAL",
                    feature_name=f_drift["feature"],
                    message=f"Feature '{f_drift['feature']}' shows significant distribution drift (PSI = {f_drift['psi']})",
                    plant_id=plant_id,
                )
            elif f_drift["drift_status"] == "moderate":
                alert_service.create_alert_if_not_exists(
                    db=db,
                    alert_type="DATA_DRIFT",
                    severity="WARNING",
                    feature_name=f_drift["feature"],
                    message=f"Feature '{f_drift['feature']}' shows moderate distribution drift (PSI = {f_drift['psi']})",
                    plant_id=plant_id,
                )

        # Performance Alerts
        if perf_summary["overall_performance_status"] == "warning":
            alert_service.create_alert_if_not_exists(
                db=db,
                alert_type="MODEL_PERFORMANCE",
                severity="WARNING",
                message=f"Operational MAE is {perf_summary['degradation_pct']}% higher than test set baseline",
                plant_id=plant_id,
            )
        elif perf_summary["overall_performance_status"] == "degraded":
            alert_service.create_alert_if_not_exists(
                db=db,
                alert_type="MODEL_PERFORMANCE",
                severity="CRITICAL",
                message=f"Critical performance degradation (+{perf_summary['degradation_pct']}% MAE above baseline)",
                plant_id=plant_id,
            )

        active_alerts = alert_service.get_alerts(db=db, plant_id=plant_id, status="active")

        # 7. Create Monitoring Snapshot & Drift Results
        snapshot = MonitoringSnapshot(
            plant_id=plant_id,
            monitoring_date=datetime.utcnow(),
            total_records=dq_summary["total_records"],
            missing_records=dq_summary["missing_records"],
            invalid_records=dq_summary["invalid_records"],
            duplicate_records=dq_summary["duplicate_records"],
            overall_data_quality=dq_summary["quality_status"],
            overall_drift_status=drift_summary["overall_drift_status"],
            overall_performance_status=perf_summary["overall_performance_status"],
            overall_reliability=rel_summary["overall_reliability"],
            active_alerts_count=len(active_alerts),
            created_at=datetime.utcnow(),
        )

        db.add(snapshot)
        db.commit()
        db.refresh(snapshot)

        # Save Feature Drift Results
        for f_res in drift_summary.get("features", []):
            drift_obj = DriftResult(
                monitoring_snapshot_id=snapshot.id,
                feature_name=f_res["feature"],
                psi=f_res["psi"],
                ks_statistic=f_res["ks_statistic"],
                p_value=f_res["p_value"],
                drift_status=f_res["drift_status"],
                baseline_version=drift_summary.get("baseline_version", "training_baseline_v1"),
            )
            db.add(drift_obj)

        db.commit()

        return {
            "snapshot_id": snapshot.id,
            "monitoring_date": snapshot.monitoring_date.isoformat(),
            "overall_data_quality": dq_summary["quality_status"],
            "overall_drift_status": drift_summary["overall_drift_status"],
            "overall_performance_status": perf_summary["overall_performance_status"],
            "overall_reliability": rel_summary["overall_reliability"],
            "active_alerts_count": len(active_alerts),
            "data_quality": dq_summary,
            "data_drift": drift_summary,
            "performance": perf_summary,
            "reliability": rel_summary,
            "active_alerts": active_alerts,
        }

    def get_monitoring_overview(self, db: Session, plant_id: Optional[int] = None) -> Dict[str, Any]:
        """Fetch latest monitoring snapshot summary."""
        query = select(MonitoringSnapshot)
        if plant_id:
            query = query.where(MonitoringSnapshot.plant_id == plant_id)

        query = query.order_by(desc(MonitoringSnapshot.monitoring_date))
        latest = db.execute(query).scalars().first()

        if not latest:
            # Run initial monitoring cycle automatically
            return self.run_monitoring_cycle(db=db, plant_id=plant_id)

        # Load active alerts
        active_alerts = alert_service.get_alerts(db=db, plant_id=plant_id, status="active")

        # Load feature drift results
        drift_query = select(DriftResult).where(DriftResult.monitoring_snapshot_id == latest.id)
        drift_objs = db.execute(drift_query).scalars().all()

        drift_features = [
            {
                "feature": d.feature_name,
                "psi": d.psi,
                "ks_statistic": d.ks_statistic,
                "p_value": d.p_value,
                "drift_status": d.drift_status,
            }
            for d in drift_objs
        ]

        return {
            "snapshot_id": latest.id,
            "monitoring_date": latest.monitoring_date.isoformat(),
            "overall_data_quality": latest.overall_data_quality,
            "overall_drift_status": latest.overall_drift_status,
            "overall_performance_status": latest.overall_performance_status,
            "overall_reliability": latest.overall_reliability,
            "active_alerts_count": len(active_alerts),
            "total_records": latest.total_records,
            "missing_records": latest.missing_records,
            "invalid_records": latest.invalid_records,
            "duplicate_records": latest.duplicate_records,
            "drift_features": drift_features,
            "active_alerts": active_alerts,
        }


monitoring_service = MonitoringService()
