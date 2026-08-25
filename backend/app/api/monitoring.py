from typing import Optional, List
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.database.session import get_db
from app.schemas.monitoring import (
    MonitoringOverviewResponse,
    DataQualityResponse,
    DriftResponse,
    PerformanceResponse,
    ReliabilityResponse,
    AlertResponse,
)
from app.monitoring.monitoring_service import monitoring_service
from app.monitoring.data_quality import data_quality_monitor
from app.monitoring.drift_detection import drift_detector
from app.monitoring.model_monitoring import model_performance_monitor
from app.monitoring.reliability import reliability_engine
from app.monitoring.alert_service import alert_service
from app.models.industrial_reading import IndustrialReading
from app.models.prediction import Prediction
import pandas as pd

router = APIRouter(prefix="/monitoring", tags=["Model Monitoring & Reliability"])


@router.post(
    "/run",
    response_model=MonitoringOverviewResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Execute Complete System Monitoring Cycle",
    description="Trigger manual system monitoring run: compute data quality, feature PSI/KS drift, operational performance degradation, prediction reliability, deduplicate alerts, and persist snapshot."
)
def run_monitoring_cycle(
    plant_id: Optional[int] = Query(None, description="Optional Plant ID filter"),
    days: int = Query(30, ge=1, le=365, description="Evaluation window in days"),
    db: Session = Depends(get_db)
) -> MonitoringOverviewResponse:
    """Execute monitoring cycle."""
    try:
        data = monitoring_service.run_monitoring_cycle(db=db, plant_id=plant_id, days=days)
        return MonitoringOverviewResponse(**data)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Monitoring Execution Error: {str(e)}"
        )


@router.get(
    "/overview",
    response_model=MonitoringOverviewResponse,
    status_code=status.HTTP_200_OK,
    summary="Get System Health & Monitoring Overview",
    description="Fetch latest persisted monitoring snapshot overview."
)
def get_monitoring_overview(
    plant_id: Optional[int] = Query(None, description="Optional Plant ID filter"),
    db: Session = Depends(get_db)
) -> MonitoringOverviewResponse:
    """Fetch latest monitoring overview."""
    try:
        data = monitoring_service.get_monitoring_overview(db=db, plant_id=plant_id)
        return MonitoringOverviewResponse(**data)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Monitoring Overview Error: {str(e)}"
        )


@router.get(
    "/data-quality",
    response_model=DataQualityResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Data Quality Monitoring Metrics",
    description="Evaluate missing value %, invalid negative values, duplicate records, and out-of-range bounds."
)
def get_data_quality_metrics(
    plant_id: Optional[int] = Query(None, description="Optional Plant ID filter"),
    days: int = Query(30, ge=1, le=365, description="Evaluation window in days"),
    db: Session = Depends(get_db)
) -> DataQualityResponse:
    """Fetch data quality metrics."""
    try:
        readings_query = select(IndustrialReading)
        if plant_id:
            readings_query = readings_query.where(IndustrialReading.plant_id == plant_id)
        readings = db.execute(readings_query).scalars().all()

        res = data_quality_monitor.evaluate_readings_batch(readings)
        return DataQualityResponse(**res)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Data Quality Error: {str(e)}"
        )


@router.get(
    "/drift",
    response_model=DriftResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Feature Data Drift Results (PSI & KS Test)",
    description="Fetch feature-level Population Stability Index (PSI) and Kolmogorov-Smirnov (KS) drift metrics."
)
def get_drift_results(
    plant_id: Optional[int] = Query(None, description="Optional Plant ID filter"),
    days: int = Query(30, ge=1, le=365, description="Evaluation window in days"),
    db: Session = Depends(get_db)
) -> DriftResponse:
    """Fetch data drift metrics."""
    try:
        readings_query = select(IndustrialReading)
        if plant_id:
            readings_query = readings_query.where(IndustrialReading.plant_id == plant_id)
        readings = db.execute(readings_query).scalars().all()

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
        drift_res = drift_detector.evaluate_feature_drift(current_df)

        return DriftResponse(**drift_res)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Data Drift Error: {str(e)}"
        )


@router.get(
    "/performance",
    response_model=PerformanceResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Rolling Operational Model Performance",
    description="Compute rolling MAE, RMSE, MAPE, Bias, and evaluate degradation against test baseline."
)
def get_performance_metrics(
    plant_id: Optional[int] = Query(None, description="Optional Plant ID filter"),
    days: int = Query(30, ge=1, le=365, description="Evaluation window in days"),
    db: Session = Depends(get_db)
) -> PerformanceResponse:
    """Fetch performance metrics."""
    try:
        pred_query = select(Prediction)
        if plant_id:
            pred_query = pred_query.where(Prediction.plant_id == plant_id)
        predictions = db.execute(pred_query).scalars().all()

        perf_res = model_performance_monitor.evaluate_performance(predictions)
        return PerformanceResponse(**perf_res)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Performance Error: {str(e)}"
        )


@router.get(
    "/reliability",
    response_model=ReliabilityResponse,
    status_code=status.HTTP_200_OK,
    summary="Get System Prediction Reliability Framework",
    description="Fetch overall prediction reliability assessment (HIGH, MEDIUM, LOW) with explicit human-readable reasons."
)
def get_reliability_assessment(
    plant_id: Optional[int] = Query(None, description="Optional Plant ID filter"),
    days: int = Query(30, ge=1, le=365, description="Evaluation window in days"),
    db: Session = Depends(get_db)
) -> ReliabilityResponse:
    """Fetch system reliability assessment."""
    try:
        readings_query = select(IndustrialReading)
        pred_query = select(Prediction)
        if plant_id:
            readings_query = readings_query.where(IndustrialReading.plant_id == plant_id)
            pred_query = pred_query.where(Prediction.plant_id == plant_id)

        readings = db.execute(readings_query).scalars().all()
        predictions = db.execute(pred_query).scalars().all()

        dq_summary = data_quality_monitor.evaluate_readings_batch(readings)

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

        perf_summary = model_performance_monitor.evaluate_performance(predictions)

        rel_res = reliability_engine.evaluate_overall_system_reliability(
            dq_summary=dq_summary,
            drift_summary=drift_summary,
            perf_summary=perf_summary,
        )

        return ReliabilityResponse(**rel_res)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Reliability Error: {str(e)}"
        )


@router.get(
    "/alerts",
    response_model=List[AlertResponse],
    status_code=status.HTTP_200_OK,
    summary="Get System Monitoring Alerts",
    description="Fetch active or resolved system monitoring alerts."
)
def get_monitoring_alerts(
    plant_id: Optional[int] = Query(None, description="Optional Plant ID filter"),
    status_filter: Optional[str] = Query("active", alias="status", description="Filter by status ('active', 'resolved')"),
    db: Session = Depends(get_db)
) -> List[AlertResponse]:
    """Fetch monitoring alerts."""
    try:
        alerts = alert_service.get_alerts(db=db, plant_id=plant_id, status=status_filter)
        return [AlertResponse(**a) for a in alerts]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Alerts Fetch Error: {str(e)}"
        )


@router.patch(
    "/alerts/{alert_id}/resolve",
    response_model=AlertResponse,
    status_code=status.HTTP_200_OK,
    summary="Resolve Monitoring Alert",
    description="Mark active monitoring alert as resolved."
)
def resolve_alert(
    alert_id: int,
    db: Session = Depends(get_db)
) -> AlertResponse:
    """Resolve an alert."""
    resolved = alert_service.resolve_alert(db=db, alert_id=alert_id)
    if not resolved:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Alert ID {alert_id} not found")

    return AlertResponse(
        id=resolved.id,
        plant_id=resolved.plant_id,
        alert_type=resolved.alert_type,
        severity=resolved.severity,
        feature_name=resolved.feature_name,
        message=resolved.message,
        status=resolved.status,
        created_at=resolved.created_at.isoformat() if resolved.created_at else "",
        resolved_at=resolved.resolved_at.isoformat() if resolved.resolved_at else None,
    )
