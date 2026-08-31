from pydantic import BaseModel, Field, field_validator


class PredictionPreviewRequest(BaseModel):
    plant_id: int = Field(default=1, gt=0, description="Industrial plant ID")
    electricity_consumption_kwh: float = Field(..., ge=0.0, description="Electrical energy consumed (kWh)")
    diesel_consumption_liters: float = Field(..., ge=0.0, description="Diesel fuel consumed (Liters)")
    natural_gas_consumption_m3: float = Field(..., ge=0.0, description="Natural gas volume combusted (m³)")

    production_quantity: float = Field(..., ge=0.0, description="Finished goods output volume")
    raw_material_consumption_kg: float = Field(..., ge=0.0, description="Mass of raw materials processed (kg)")

    machine_runtime_hours: float = Field(..., ge=0.0, le=24.0, description="Daily machine operating hours (max 24.0)")
    temperature_c: float = Field(..., description="Ambient or process operating temperature (°C)")
    pressure_bar: float = Field(..., ge=0.0, description="System operating pressure (bar)")

    previous_co2_emission_kg: float = Field(..., ge=0.0, description="Prior day CO₂ emission baseline (kg)")

    @field_validator("machine_runtime_hours")
    @classmethod
    def validate_runtime(cls, v: float) -> float:
        if v < 0.0 or v > 24.0:
            raise ValueError("machine_runtime_hours must be between 0.0 and 24.0 hours for daily records")
        return v


class PredictionPreviewResponse(BaseModel):
    random_forest_prediction_kg: float = Field(..., description="Random Forest model prediction (kg CO₂)")
    xgboost_prediction_kg: float = Field(..., description="XGBoost model prediction (kg CO₂)")
    ensemble_prediction_kg: float = Field(..., description="Weighted ensemble model prediction (kg CO₂)")
    selected_model: str = Field(..., description="Currently selected production model winner")
    model_version: str = Field(..., description="Model artifact version tag")
    rf_weight_used: float = Field(default=0.45, description="Random Forest weight used in ensemble")
    xgb_weight_used: float = Field(default=0.55, description="XGBoost weight used in ensemble")
    ensemble_disagreement_kg: float = Field(default=0.0, description="Absolute difference between RF and XGB predictions")
    ensemble_disagreement_pct: float = Field(default=0.0, description="Percentage difference between RF and XGB predictions")
    reliability_status: str = Field(default="HIGH", description="Model applicability & reliability indicator ('HIGH', 'MODERATE', 'LOW')")
    reliability_score: float = Field(default=100.0, description="Numeric reliability score (0-100)")
    reliability_reasons: list[str] = Field(default_factory=list, description="Defensible technical reasons for reliability score")
    out_of_bounds_features: list = Field(default_factory=list, description="List of features exceeding historical training bounds")
    validation_metrics: dict = Field(default_factory=dict, description="Historical model validation metrics (R², MAE, RMSE, MAPE)")
    input_summary: dict = Field(default_factory=dict, description="Submitted input parameters summary")

