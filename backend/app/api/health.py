from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.database.session import get_db
from app.schemas.health import HealthCheckResponse
from app.ml.prediction_service import prediction_service

router = APIRouter(tags=["Health Monitoring"])


@router.get(
    "/health",
    response_model=HealthCheckResponse,
    status_code=status.HTTP_200_OK,
    summary="Backend Health Check",
    description="Returns backend service health status, service name, and current phase."
)
async def health_check() -> HealthCheckResponse:
    """GET /api/health endpoint returning health status."""
    return HealthCheckResponse(
        status="healthy",
        service="industrial-carbon-emission-api",
        phase="phase-1"
    )


@router.get(
    "/health/live",
    status_code=status.HTTP_200_OK,
    summary="Container Liveness Health Probe",
    description="Checks whether the application process is running."
)
def liveness_probe() -> dict:
    """Liveness probe returning process status."""
    return {"status": "alive", "service": "industrial-carbon-emission-api"}


@router.get(
    "/health/ready",
    status_code=status.HTTP_200_OK,
    summary="Container Readiness Health Probe",
    description="Checks database connectivity and ML model load status for production orchestration."
)
def readiness_probe(db: Session = Depends(get_db)) -> dict:
    """Readiness probe checking database & ML model readiness."""
    db_ready = False
    try:
        db.execute(text("SELECT 1"))
        db_ready = True
    except Exception:
        db_ready = False

    model_ready = prediction_service.is_loaded() if hasattr(prediction_service, "is_loaded") else True

    if not db_ready:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={"status": "not_ready", "database": "disconnected", "model": "loaded" if model_ready else "not_loaded"}
        )

    return {
        "status": "ready",
        "database": "connected",
        "model": "loaded" if model_ready else "not_loaded",
        "phase": "Phase 15 — Production Deployment",
    }


from sqlalchemy import func, select
from app.schemas.health import HealthCheckResponse, SystemHealthResponse
from app.models.auth import User
from app.models.plant import Plant
from app.models.monitoring import MonitoringAlert
from app.models.industrial_reading import IndustrialReading

@router.get(
    "/health/system",
    response_model=SystemHealthResponse,
    status_code=status.HTTP_200_OK,
    summary="Comprehensive System Health & Infrastructure Overview",
    description="Fetch live health metrics including API, database connectivity, ML ensemble status, user counts, and data pipeline freshness."
)
def get_system_health(db: Session = Depends(get_db)) -> SystemHealthResponse:
    """Fetch comprehensive system health status."""
    db_status = "healthy"
    try:
        db.execute(text("SELECT 1"))
    except Exception:
        db_status = "unavailable"

    model_ready = prediction_service.is_loaded() if hasattr(prediction_service, "is_loaded") else True
    model_status = "available" if model_ready else "unavailable"

    total_users = db.scalar(select(func.count(User.id))) or 0
    total_plants = db.scalar(select(func.count(Plant.id))) or 0
    active_alerts = db.scalar(select(func.count(MonitoringAlert.id)).where(MonitoringAlert.status == "active")) or 0
    total_readings = db.scalar(select(func.count(IndustrialReading.id))) or 0

    latest_reading = db.scalar(select(func.max(IndustrialReading.timestamp)))
    latest_ts_str = latest_reading.isoformat() if latest_reading else "N/A"

    return SystemHealthResponse(
        api_status="healthy",
        database_status=db_status,
        model_name="RF + XGBoost Weighted Ensemble",
        model_status=model_status,
        model_version="v1.2.0-ensemble",
        total_users=total_users,
        total_plants=total_plants,
        active_alerts=active_alerts,
        total_readings=total_readings,
        latest_reading_timestamp=latest_ts_str,
        data_freshness="Operational" if total_readings > 0 else "Empty",
    )
