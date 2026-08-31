from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import select, desc, func

from app.models.industrial_reading import IndustrialReading
from app.models.prediction import Prediction
from app.models.monitoring import MonitoringAlert
from app.models.optimization import OptimizationRun
from app.models.analytics import AnalyticsSnapshot, IndustrialInsight

from app.analytics.kpi_engine import kpi_engine
from app.analytics.emission_intensity import emission_intensity_engine
from app.analytics.trend_analysis import trend_analysis_engine
from app.analytics.feature_analysis import feature_analysis_engine
from app.analytics.anomaly_analysis import anomaly_analysis_engine
from app.analytics.optimization_impact import optimization_impact_engine
from app.analytics.insight_engine import industrial_insight_engine


class AnalyticsService:
    """Master Orchestrator managing Analytics aggregation, trend analysis, KPI computation, and industrial insights."""

    def _fetch_readings(
        self,
        db: Session,
        plant_id: Optional[int] = None,
        days: int = 30,
    ) -> List[Dict[str, Any]]:
        """Fetch historical readings from database within date cutoff relative to max timestamp."""
        max_ts_query = select(func.max(IndustrialReading.timestamp))
        if plant_id:
            max_ts_query = max_ts_query.where(IndustrialReading.plant_id == plant_id)
        max_ts = db.execute(max_ts_query).scalar() or datetime.utcnow()

        cutoff = max_ts - timedelta(days=days)
        query = select(IndustrialReading).where(IndustrialReading.timestamp >= cutoff)

        if plant_id:
            query = query.where(IndustrialReading.plant_id == plant_id)

        query = query.order_by(IndustrialReading.timestamp.asc())
        objs = db.execute(query).scalars().all()

        results = []
        for r in objs:
            results.append({
                "id": r.id,
                "plant_id": r.plant_id,
                "timestamp": r.timestamp.isoformat(),
                "electricity_consumption_kwh": r.electricity_consumption_kwh,
                "diesel_consumption_liters": r.diesel_consumption_liters,
                "natural_gas_consumption_m3": r.natural_gas_consumption_m3,
                "production_quantity": r.production_quantity,
                "raw_material_consumption_kg": r.raw_material_consumption_kg,
                "machine_runtime_hours": r.machine_runtime_hours,
                "temperature_c": r.temperature_c,
                "pressure_bar": r.pressure_bar,
                "previous_co2_emission_kg": r.previous_co2_emission_kg,
                "co2_emission_kg": r.actual_co2_emission_kg,
            })
        return results

    def get_overview(self, db: Session, plant_id: Optional[int] = None, days: int = 30) -> Dict[str, Any]:
        """Fetch major KPI overview metrics."""
        readings = self._fetch_readings(db=db, plant_id=plant_id, days=days)
        return kpi_engine.calculate_kpis(readings)

    def get_emission_intensity(self, db: Session, plant_id: Optional[int] = None, days: int = 30) -> Dict[str, Any]:
        """Fetch emission intensity and MoM percentage changes."""
        curr_readings = self._fetch_readings(db=db, plant_id=plant_id, days=days)
        prev_readings = self._fetch_readings(db=db, plant_id=plant_id, days=days * 2)
        prev_readings = prev_readings[: len(curr_readings)]  # Approx previous period slice

        return emission_intensity_engine.calculate_emission_intensity(
            current_readings=curr_readings,
            previous_readings=prev_readings,
        )

    def get_emission_trend(self, db: Session, plant_id: Optional[int] = None, days: int = 30, granularity: str = "daily") -> List[Dict[str, Any]]:
        """Fetch historical CO₂ emission trend."""
        readings = self._fetch_readings(db=db, plant_id=plant_id, days=days)
        return trend_analysis_engine.aggregate_trends(readings=readings, granularity=granularity)

    def get_production_trend(self, db: Session, plant_id: Optional[int] = None, days: int = 30) -> List[Dict[str, Any]]:
        """Fetch production output trend vs emission overlay."""
        readings = self._fetch_readings(db=db, plant_id=plant_id, days=days)
        return trend_analysis_engine.aggregate_trends(readings=readings, granularity="daily")

    def get_feature_analysis(self, db: Session, plant_id: Optional[int] = None, days: int = 30) -> Dict[str, Any]:
        """Fetch feature factor trends and correlation matrix."""
        readings = self._fetch_readings(db=db, plant_id=plant_id, days=days)
        return feature_analysis_engine.analyze_features(readings)

    def get_anomaly_analytics(self, db: Session, plant_id: Optional[int] = None, days: int = 30) -> Dict[str, Any]:
        """Fetch operational anomaly timeline and frequency breakdown."""
        cutoff = datetime.utcnow() - timedelta(days=days)
        query = select(MonitoringAlert).where(MonitoringAlert.created_at >= cutoff)
        if plant_id:
            query = query.where(MonitoringAlert.plant_id == plant_id)

        objs = db.execute(query).scalars().all()
        alerts_list = [{"id": a.id, "alert_type": a.alert_type, "severity": a.severity, "message": a.message, "feature_name": a.feature_name, "created_at": a.created_at.isoformat()} for a in objs]

        readings = self._fetch_readings(db=db, plant_id=plant_id, days=days)
        return anomaly_analysis_engine.analyze_anomalies(monitoring_alerts=alerts_list, readings=readings)

    def get_optimization_impact(self, db: Session, plant_id: Optional[int] = None) -> Dict[str, Any]:
        """Fetch optimization impact tracking summary."""
        query = select(OptimizationRun)
        if plant_id:
            query = query.where(OptimizationRun.plant_id == plant_id)
        query = query.order_by(desc(OptimizationRun.created_at))

        objs = db.execute(query).scalars().all()
        runs_list = [{"optimization_id": r.optimization_id, "baseline_prediction": r.baseline_prediction, "recommended_candidate_co2": r.baseline_prediction * 0.9, "created_at": r.created_at.isoformat()} for r in objs]

        return optimization_impact_engine.calculate_impact(runs_list)

    def get_insights(self, db: Session, plant_id: Optional[int] = None, days: int = 30) -> List[Dict[str, Any]]:
        """Generate deterministic rule-based industrial insights."""
        kpi_data = self.get_overview(db=db, plant_id=plant_id, days=days)
        intensity_data = self.get_emission_intensity(db=db, plant_id=plant_id, days=days)
        feature_data = self.get_feature_analysis(db=db, plant_id=plant_id, days=days)
        anomaly_data = self.get_anomaly_analytics(db=db, plant_id=plant_id, days=days)
        opt_data = self.get_optimization_impact(db=db, plant_id=plant_id)

        return industrial_insight_engine.generate_insights(
            kpi_data=kpi_data,
            intensity_data=intensity_data,
            feature_data=feature_data,
            anomaly_data=anomaly_data,
            optimization_data=opt_data,
        )

    def get_plant_comparison(self, db: Session, days: int = 30) -> Dict[str, Any]:
        """Fetch multi-plant comparative metrics and ranking based on emission intensity."""
        from app.models.plant import Plant
        plants_query = select(Plant).where(Plant.is_active == True)
        plants_objs = db.execute(plants_query).scalars().all()

        results = []
        for p in plants_objs:
            readings = self._fetch_readings(db=db, plant_id=p.id, days=days)
            kpis = kpi_engine.calculate_kpis(readings)
            results.append({
                "plant_id": p.id,
                "plant_name": p.plant_name,
                "total_co2": kpis["total_co2"],
                "average_co2": kpis["average_co2"],
                "total_production": kpis["total_production"],
                "emission_intensity": kpis["emission_intensity"],
                "rank": 1,
            })

        # Rank by lowest emission intensity
        results.sort(key=lambda x: (x["emission_intensity"] if x["emission_intensity"] > 0 else 999999.0))
        for idx, item in enumerate(results):
            item["rank"] = idx + 1

        return {"plants": results}


analytics_service = AnalyticsService()
