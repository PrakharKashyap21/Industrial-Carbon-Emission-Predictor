from typing import Optional, List
from fastapi import APIRouter, Depends, Query, HTTPException, status, Response
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.schemas.whatif import (
    ScenarioPredictRequest,
    ScenarioResponse,
    ScenarioCompareRequest,
    ScenarioCompareResponse,
    SensitivityRequest,
    SensitivityResponse,
)
from app.whatif.scenario_service import scenario_service
from app.whatif.scenario_exporter import scenario_exporter, SensitivityExportError

router = APIRouter(prefix="/what-if", tags=["Advanced What-if Analysis & Scenario Simulation Engine"])


# Phase 10 Advanced Scenario Engine Endpoints
@router.post(
    "/predict",
    response_model=ScenarioResponse,
    status_code=status.HTTP_200_OK,
    summary="Simulate Single What-if Scenario against Baseline Reading",
    description="Simulate percentage or absolute parameter changes against baseline reading, compute ML predictions, feasibility constraints, and prediction reliability."
)
def predict_scenario(
    payload: ScenarioPredictRequest,
    db: Session = Depends(get_db)
) -> ScenarioResponse:
    """Predict single scenario."""
    try:
        res = scenario_service.predict_single_scenario(db=db, payload=payload.model_dump())
        return ScenarioResponse(**res)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Scenario Prediction Error: {str(e)}"
        )


@router.post(
    "/compare",
    response_model=ScenarioCompareResponse,
    status_code=status.HTTP_200_OK,
    summary="Batch Compare, Rank, and Recommend Multiple Scenarios",
    description="Batch simulate up to 20 scenarios, compare side-by-side against baseline, filter infeasible options, rank by CO₂ reduction & reliability, and identify top recommendation."
)
def compare_scenarios(
    payload: ScenarioCompareRequest,
    db: Session = Depends(get_db)
) -> ScenarioCompareResponse:
    """Compare multiple scenarios."""
    try:
        res = scenario_service.compare_multiple_scenarios(db=db, payload=payload.model_dump())
        return ScenarioCompareResponse(**res)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Scenario Comparison Error: {str(e)}"
        )


@router.post(
    "/sensitivity",
    response_model=SensitivityResponse,
    status_code=status.HTTP_200_OK,
    summary="Perform Single-Variable Sensitivity Analysis",
    description="Vary a single operational parameter across percentage variation steps while holding other features constant to observe predicted emission curves."
)
def analyze_sensitivity(
    payload: SensitivityRequest,
    db: Session = Depends(get_db)
) -> SensitivityResponse:
    """Run sensitivity analysis."""
    try:
        res = scenario_service.analyze_sensitivity(db=db, payload=payload.model_dump())
        return SensitivityResponse(**res)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Sensitivity Analysis Error: {str(e)}"
        )


@router.post(
    "/sensitivity/export",
    status_code=status.HTTP_200_OK,
    summary="Export Sensitivity Analysis Result to CSV",
    description="Export generated single-variable sensitivity analysis curve data as a downloadable CSV file."
)
def export_sensitivity_csv(
    payload: SensitivityResponse
) -> Response:
    """Export sensitivity analysis result as a downloadable CSV file."""
    try:
        csv_content = scenario_exporter.export_to_csv_string(payload.model_dump())
        feat_slug = payload.feature.replace("_", "-") if payload.feature else "analysis"
        filename = f"sensitivity-{feat_slug}.csv"
        return Response(
            content=csv_content,
            media_type="text/csv",
            headers={"Content-Disposition": f'attachment; filename="{filename}"'}
        )
    except SensitivityExportError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Sensitivity Export Error: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Sensitivity Export Server Error: {str(e)}"
        )


@router.post(
    "/save",
    response_model=ScenarioResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Save Scenario Definition and Simulation Result to Database",
    description="Persist scenario definition and result record to PostgreSQL database for historical auditing."
)
def save_scenario(
    payload: ScenarioPredictRequest,
    db: Session = Depends(get_db)
) -> ScenarioResponse:
    """Save scenario."""
    try:
        res = scenario_service.save_scenario(db=db, payload=payload.model_dump())
        return ScenarioResponse(**res)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Save Scenario Error: {str(e)}"
        )


@router.get(
    "/scenarios",
    status_code=status.HTTP_200_OK,
    summary="Get Saved Scenario History",
    description="Fetch list of saved What-if scenarios from PostgreSQL database."
)
def get_saved_scenarios(
    plant_id: Optional[int] = Query(None, description="Optional Plant ID filter"),
    db: Session = Depends(get_db)
):
    """Fetch saved scenarios."""
    try:
        return scenario_service.get_saved_scenarios(db=db, plant_id=plant_id)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Saved Scenarios Error: {str(e)}"
        )
