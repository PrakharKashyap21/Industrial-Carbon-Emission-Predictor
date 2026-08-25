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
    rf_weight_used: float = Field(default=0.35, description="Random Forest weight used in ensemble")
