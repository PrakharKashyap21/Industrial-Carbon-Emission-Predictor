from typing import Optional, List
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.schemas.optimization import (
    OptimizationRunRequest,
    OptimizationRunResponse,
    OptimizationHistoryItem,
    OptimizationCandidateResponse,
)
from app.optimization.optimization_service import optimization_service

router = APIRouter(prefix="/optimization", tags=["Advanced Optimization & Recommendation Engine"])


@router.post(
    "/run",
    response_model=OptimizationRunResponse,
    status_code=status.HTTP_200_OK,
    summary="Run Automated Constrained Optimization Search & Recommendation",
    description="Automatically search candidate operating configurations using constrained grid search, evaluate ML ensemble predictions, validate feasibility constraints, filter reliability, rank candidates, and generate explainable decision-support recommendations."
)
def run_optimization(
    payload: OptimizationRunRequest,
    db: Session = Depends(get_db)
) -> OptimizationRunResponse:
    """Run optimization."""
    try:
        req_dict = payload.model_dump()
        res = optimization_service.run_optimization(db=db, payload=req_dict)
        return OptimizationRunResponse(**res)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Optimization Run Error: {str(e)}"
        )


@router.get(
    "/history",
    response_model=List[OptimizationHistoryItem],
    status_code=status.HTTP_200_OK,
    summary="Get Optimization History",
    description="Fetch list of saved optimization runs from PostgreSQL database."
)
def get_optimization_history(
    plant_id: Optional[int] = Query(None, description="Optional Plant ID filter"),
    db: Session = Depends(get_db)
) -> List[OptimizationHistoryItem]:
    """Fetch history."""
    try:
        return optimization_service.get_optimization_history(db=db, plant_id=plant_id)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Optimization History Error: {str(e)}"
        )


@router.get(
    "/{optimization_id}/candidates",
    response_model=List[OptimizationCandidateResponse],
    status_code=status.HTTP_200_OK,
    summary="Get Optimization Candidate Results Audit Log",
    description="Fetch detailed audit log of all generated and evaluated candidate configurations for a specific optimization run."
)
def get_optimization_candidates(
    optimization_id: str,
    db: Session = Depends(get_db)
) -> List[OptimizationCandidateResponse]:
    """Fetch candidate audit log."""
    try:
        return optimization_service.get_optimization_candidates(db=db, optimization_id=optimization_id)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Optimization Candidates Error: {str(e)}"
        )
