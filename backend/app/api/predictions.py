from typing import Optional
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.schemas.prediction import PredictionPreviewRequest, PredictionPreviewResponse
from app.schemas.prediction_management import (
    PredictionCreate,
    PredictionResponse,
    PredictionPaginationResponse,
    ActualUpdateRequest,
    PredictionAnalyticsResponse,
)
from app.ml.prediction_service import prediction_service
from app.services.prediction_management_service import prediction_management_service

router = APIRouter(prefix="/predictions", tags=["ML Predictions Management"])


@router.post(
    "/preview",
    response_model=PredictionPreviewResponse,
    status_code=status.HTTP_200_OK,
    summary="Preview Single Industrial CO₂ Emission Prediction",
    description="Generate preview prediction without saving database record."
)
def predict_emission_preview(payload: PredictionPreviewRequest) -> PredictionPreviewResponse:
    """Generate quick prediction preview."""
    try:
        input_data = payload.model_dump()
        result = prediction_service.predict(input_data)
        return PredictionPreviewResponse(**result)
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(ve))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Prediction Engine Error: {str(e)}"
        )


@router.post(
    "",
    response_model=PredictionResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Generate & Save Prediction Lifecycle Record",
    description="Generate ML ensemble prediction and persist complete lifecycle record with model versioning to PostgreSQL."
)
def create_prediction_record(
    payload: PredictionCreate,
    db: Session = Depends(get_db)
) -> PredictionResponse:
    """Generate and persist prediction record."""
    try:
        input_dict = payload.model_dump()
        data = prediction_management_service.create_prediction(db=db, payload=input_dict)
        return PredictionResponse(**data)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Prediction Creation Error: {str(e)}"
        )


@router.get(
    "",
    response_model=PredictionPaginationResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Paginated Prediction History",
    description="Fetch paginated prediction history with plant, date, status, model version filters, and sorting."
)
def get_prediction_history(
    plant_id: Optional[int] = Query(None, description="Optional Plant ID filter"),
    days: Optional[int] = Query(None, ge=1, le=365, description="Date filter range in days"),
    status_filter: Optional[str] = Query(None, alias="status", description="Filter by status ('pending_actual', 'evaluated')"),
    model_version: Optional[str] = Query(None, description="Filter by model version (e.g. 'ensemble_v1')"),
    page: int = Query(1, ge=1, description="Page number (1-indexed)"),
    limit: int = Query(20, ge=1, le=100, description="Items per page (max 100)"),
    sort_by: str = Query("newest", description="Sorting ('newest', 'oldest', 'highest_error', 'lowest_error', 'highest_predicted')"),
    db: Session = Depends(get_db)
) -> PredictionPaginationResponse:
    """Retrieve paginated prediction records."""
    try:
        res = prediction_management_service.get_predictions(
            db=db,
            plant_id=plant_id,
            days=days,
            status=status_filter,
            model_version=model_version,
            page=page,
            limit=limit,
            sort_by=sort_by,
        )
        return PredictionPaginationResponse(**res)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Prediction History Error: {str(e)}"
        )


@router.get(
    "/analytics",
    response_model=PredictionAnalyticsResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Historical Operational Prediction Analytics",
    description="Compute historical MAE, RMSE, MAPE, Mean Bias, RF vs XGBoost vs Ensemble metrics, and scatter agreement points."
)
def get_prediction_analytics(
    plant_id: Optional[int] = Query(None, description="Optional Plant ID filter"),
    days: Optional[int] = Query(None, ge=1, le=365, description="Date filter range in days"),
    db: Session = Depends(get_db)
) -> PredictionAnalyticsResponse:
    """Fetch operational analytics for evaluated predictions."""
    try:
        data = prediction_management_service.get_prediction_analytics(db=db, plant_id=plant_id, days=days)
        return PredictionAnalyticsResponse(**data)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Prediction Analytics Error: {str(e)}"
        )


@router.get(
    "/{prediction_id}",
    status_code=status.HTTP_200_OK,
    summary="Get Prediction Detail by ID",
    description="Retrieve single prediction lifecycle record with input conditions and SHAP explanation."
)
def get_prediction_detail(
    prediction_id: int,
    db: Session = Depends(get_db)
):
    """Retrieve prediction detail by ID."""
    res = prediction_management_service.get_prediction_by_id(db=db, prediction_id=prediction_id)
    if not res:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Prediction ID {prediction_id} not found")
    return res


@router.patch(
    "/{prediction_id}/actual",
    response_model=PredictionResponse,
    status_code=status.HTTP_200_OK,
    summary="Update Actual CO₂ Emission & Compute Error Metrics",
    description="Match actual recorded CO₂ emission value to prediction record, calculate signed & absolute errors, and transition status to evaluated."
)
def update_actual_co2(
    prediction_id: int,
    payload: ActualUpdateRequest,
    db: Session = Depends(get_db)
) -> PredictionResponse:
    """Update actual CO₂ emission for prediction record."""
    res = prediction_management_service.update_actual_co2(
        db=db,
        prediction_id=prediction_id,
        actual_co2=payload.actual_co2,
    )
    if not res:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Prediction ID {prediction_id} not found")
    return PredictionResponse(**res)
