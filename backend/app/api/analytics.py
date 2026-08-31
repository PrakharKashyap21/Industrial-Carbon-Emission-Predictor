from typing import Optional, List
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.schemas.analytics import (
    KPIOverviewResponse,
    EmissionIntensityResponse,
    TrendPoint,
    FeatureAnalysisResponse,
    AnomalyAnalyticsResponse,
    OptimizationImpactResponse,
    IndustrialInsightItem,
    PlantComparisonResponse,
)
from app.analytics.analytics_service import analytics_service

router = APIRouter(prefix="/analytics", tags=["Advanced Industrial Analytics & Insights"])


@router.get(
    "/overview",
    response_model=KPIOverviewResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Industrial KPI Overview Metrics",
    description="Fetch aggregated major industrial KPIs including Total CO₂, Avg CO₂, Min/Max CO₂, Total Production, Emission Intensity, and Average Inputs."
)
def get_overview(
    plant_id: Optional[int] = Query(None, description="Optional Plant ID filter"),
    days: int = Query(30, description="Date window filter in days"),
    db: Session = Depends(get_db)
) -> KPIOverviewResponse:
    """Fetch overview KPIs."""
    try:
        return KPIOverviewResponse(**analytics_service.get_overview(db=db, plant_id=plant_id, days=days))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Analytics Overview Error: {str(e)}"
        )


@router.get(
    "/emission-trend",
    response_model=List[TrendPoint],
    status_code=status.HTTP_200_OK,
    summary="Get Historical CO₂ Emission Trend",
    description="Fetch time-series aggregated CO₂ emission trend points."
)
def get_emission_trend(
    plant_id: Optional[int] = Query(None, description="Optional Plant ID filter"),
    days: int = Query(30, description="Date window filter in days"),
    db: Session = Depends(get_db)
) -> List[TrendPoint]:
    """Fetch emission trend."""
    try:
        return [TrendPoint(**t) for t in analytics_service.get_emission_trend(db=db, plant_id=plant_id, days=days)]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Emission Trend Error: {str(e)}"
        )


@router.get(
    "/emission-intensity",
    response_model=EmissionIntensityResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Production-Normalized Emission Intensity Metrics",
    description="Fetch production-normalized emission intensity metrics (kg CO₂ / unit) and Period-over-Period changes."
)
def get_emission_intensity(
    plant_id: Optional[int] = Query(None, description="Optional Plant ID filter"),
    days: int = Query(30, description="Date window filter in days"),
    db: Session = Depends(get_db)
) -> EmissionIntensityResponse:
    """Fetch emission intensity."""
    try:
        return EmissionIntensityResponse(**analytics_service.get_emission_intensity(db=db, plant_id=plant_id, days=days))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Emission Intensity Error: {str(e)}"
        )


@router.get(
    "/features",
    response_model=FeatureAnalysisResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Feature Factor Trends & Correlation Matrix",
    description="Fetch Pearson correlation matrix and operational factor trends against predicted emissions."
)
def get_features(
    plant_id: Optional[int] = Query(None, description="Optional Plant ID filter"),
    days: int = Query(30, description="Date window filter in days"),
    db: Session = Depends(get_db)
) -> FeatureAnalysisResponse:
    """Fetch feature analysis."""
    try:
        return FeatureAnalysisResponse(**analytics_service.get_feature_analysis(db=db, plant_id=plant_id, days=days))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Feature Analysis Error: {str(e)}"
        )


@router.get(
    "/anomalies",
    response_model=AnomalyAnalyticsResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Operational Anomaly Timeline & Analytics",
    description="Fetch aggregated operational anomaly timeline and event frequency breakdown."
)
def get_anomalies(
    plant_id: Optional[int] = Query(None, description="Optional Plant ID filter"),
    days: int = Query(30, description="Date window filter in days"),
    db: Session = Depends(get_db)
) -> AnomalyAnalyticsResponse:
    """Fetch anomaly analytics."""
    try:
        return AnomalyAnalyticsResponse(**analytics_service.get_anomaly_analytics(db=db, plant_id=plant_id, days=days))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Anomaly Analytics Error: {str(e)}"
        )


@router.get(
    "/optimization-impact",
    response_model=OptimizationImpactResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Optimization Impact Tracking",
    description="Fetch cumulative model-estimated carbon reduction impact from historical optimization runs."
)
def get_optimization_impact(
    plant_id: Optional[int] = Query(None, description="Optional Plant ID filter"),
    db: Session = Depends(get_db)
) -> OptimizationImpactResponse:
    """Fetch optimization impact."""
    try:
        return OptimizationImpactResponse(**analytics_service.get_optimization_impact(db=db, plant_id=plant_id))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Optimization Impact Error: {str(e)}"
        )


@router.get(
    "/insights",
    response_model=List[IndustrialInsightItem],
    status_code=status.HTTP_200_OK,
    summary="Get Rule-Based Industrial Insights",
    description="Fetch deterministic rule-based industrial insights categorized by severity and metric trace."
)
def get_insights(
    plant_id: Optional[int] = Query(None, description="Optional Plant ID filter"),
    days: int = Query(30, description="Date window filter in days"),
    db: Session = Depends(get_db)
) -> List[IndustrialInsightItem]:
    """Fetch industrial insights."""
    try:
        return [IndustrialInsightItem(**i) for i in analytics_service.get_insights(db=db, plant_id=plant_id, days=days)]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Industrial Insights Error: {str(e)}"
        )


@router.get(
    "/plant-comparison",
    response_model=PlantComparisonResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Multi-Plant Comparison & Ranking",
    description="Fetch comparative metrics and ranking across all authorized plants."
)
def get_plant_comparison(
    days: int = Query(30, description="Date window filter in days"),
    db: Session = Depends(get_db)
) -> PlantComparisonResponse:
    """Fetch plant comparison."""
    try:
        return PlantComparisonResponse(**analytics_service.get_plant_comparison(db=db, days=days))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Plant Comparison Error: {str(e)}"
        )
