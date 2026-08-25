from fastapi import APIRouter, HTTPException, status
from app.ml.what_if.scenario_models import (
    ScenarioAnalysisRequest,
    ScenarioAnalysisResponse,
    BatchScenarioRequest,
    BatchScenarioResponse,
)
from app.ml.what_if.scenario_service import scenario_service

router = APIRouter(prefix="/what-if", tags=["What-if Scenario Analysis"])


@router.post(
    "/analyze",
    response_model=ScenarioAnalysisResponse,
    status_code=status.HTTP_200_OK,
    summary="Analyze Single What-if Scenario",
    description="Compare baseline vs modified scenario operational conditions, computing predicted CO₂ difference, percentage change, intensity metrics, and SHAP attribution changes."
)
def analyze_single_scenario(payload: ScenarioAnalysisRequest) -> ScenarioAnalysisResponse:
    """Run scenario simulation comparing baseline and modified scenario inputs."""
    try:
        baseline_dict = payload.baseline.model_dump()
        scenario_dict = payload.scenario.model_dump()
        result = scenario_service.analyze_scenario(
            baseline_input=baseline_dict,
            scenario_input=scenario_dict,
            scenario_name=payload.name or "Custom Scenario"
        )
        return ScenarioAnalysisResponse(**result)
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Scenario Input Error: {str(ve)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"What-if Scenario Engine Error: {str(e)}"
        )


@router.post(
    "/analyze-batch",
    response_model=BatchScenarioResponse,
    status_code=status.HTTP_200_OK,
    summary="Analyze Batch What-if Scenarios",
    description="Compare multiple operational scenarios against a single baseline and identify the scenario achieving lowest predicted CO₂ emissions."
)
def analyze_batch_scenarios(payload: BatchScenarioRequest) -> BatchScenarioResponse:
    """Run batch scenario simulations across multiple scenario options."""
    try:
        baseline_dict = payload.baseline.model_dump()
        scenarios_list = [
            {"name": item.name, "scenario": item.scenario.model_dump()}
            for item in payload.scenarios
        ]
        result = scenario_service.analyze_batch_scenarios(
            baseline_input=baseline_dict,
            scenarios=scenarios_list
        )
        return BatchScenarioResponse(**result)
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Batch Scenario Input Error: {str(ve)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Batch Scenario Engine Error: {str(e)}"
        )
