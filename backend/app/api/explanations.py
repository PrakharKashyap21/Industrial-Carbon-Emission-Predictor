from fastapi import APIRouter, HTTPException, status
from app.schemas.explanation import ExplanationRequest, ExplanationResponse
from app.ml.explainability.explanation_service import explanation_service

router = APIRouter(prefix="/explanations", tags=["Explainable AI (SHAP)"])


@router.post(
    "/prediction",
    response_model=ExplanationResponse,
    status_code=status.HTTP_200_OK,
    summary="Explain Industrial CO₂ Emission Prediction (SHAP)",
    description="Generate mathematical feature contributions (SHAP values) decomposing predicted CO₂ emissions into positive and negative drivers relative to baseline."
)
def explain_co2_prediction(payload: ExplanationRequest) -> ExplanationResponse:
    """Generate SHAP additive explanation for a set of industrial operational inputs."""
    try:
        raw_features = payload.model_dump()
        result = explanation_service.explain_prediction(raw_features)
        return ExplanationResponse(**result)
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Explanation Input Error: {str(ve)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"SHAP Explanation Engine Error: {str(e)}"
        )


@router.get(
    "/global",
    status_code=status.HTTP_200_OK,
    summary="Get Global SHAP Feature Importance",
    description="Retrieve mean absolute SHAP values across representative training data."
)
def get_global_shap_importance():
    """Retrieve global SHAP importance rankings."""
    try:
        return explanation_service.generate_global_importance()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Global SHAP Error: {str(e)}"
        )
