from typing import Optional
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.schemas.dashboard import DashboardOverviewResponse
from app.services.dashboard_service import dashboard_service

router = APIRouter(prefix="/dashboard", tags=["Industrial Analytics Dashboard"])


@router.get(
    "/overview",
    response_model=DashboardOverviewResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Industrial Dashboard Overview Data",
    description="Retrieve comprehensive industrial operational KPIs, actual vs predicted CO₂ trend lines, resource consumption trends, CO₂ intensity, model performance, SHAP drivers, and data quality summary."
)
def get_dashboard_overview(
    plant_id: Optional[int] = Query(default=None, description="Optional Plant ID filter"),
    days: int = Query(default=30, ge=1, le=365, description="Date filter range in days (7, 30, 90)"),
    db: Session = Depends(get_db)
) -> DashboardOverviewResponse:
    """Retrieve full dashboard overview payload with PostgreSQL data and ML model intelligence."""
    try:
        data = dashboard_service.get_overview(db=db, plant_id=plant_id, days=days)
        return DashboardOverviewResponse(**data)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Dashboard Service Error: {str(e)}"
        )
