from datetime import datetime
from typing import List
from pydantic import BaseModel, Field, field_validator, ConfigDict


class IndustrialReadingBase(BaseModel):
    plant_id: int = Field(..., gt=0, description="Foreign key ID referencing plants.id")
    timestamp: datetime = Field(..., description="Operational recording timestamp (daily resolution)")

    electricity_consumption_kwh: float = Field(..., ge=0.0, description="Electrical energy consumed (kWh)")
    diesel_consumption_liters: float = Field(..., ge=0.0, description="Diesel fuel consumed (Liters)")
    natural_gas_consumption_m3: float = Field(..., ge=0.0, description="Natural gas volume combusted (m³)")

    production_quantity: float = Field(..., ge=0.0, description="Finished goods output volume")
    raw_material_consumption_kg: float = Field(..., ge=0.0, description="Mass of raw materials processed (kg)")

    machine_runtime_hours: float = Field(..., ge=0.0, le=24.0, description="Daily machine operating hours (max 24.0)")

    temperature_c: float = Field(..., description="Ambient or process operating temperature (°C)")
    pressure_bar: float = Field(..., ge=0.0, description="System operating pressure (bar)")

    previous_co2_emission_kg: float = Field(..., ge=0.0, description="CO₂ emission from prior day baseline (kg)")
    actual_co2_emission_kg: float = Field(..., ge=0.0, description="Ground truth target CO₂ emission (kg)")

    @field_validator("machine_runtime_hours")
    @classmethod
    def validate_runtime(cls, v: float) -> float:
        if v < 0.0 or v > 24.0:
            raise ValueError("machine_runtime_hours must be between 0.0 and 24.0 hours for daily records")
        return v


class IndustrialReadingCreate(IndustrialReadingBase):
    pass


class IndustrialReadingResponse(IndustrialReadingBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class IndustrialReadingPagination(BaseModel):
    items: List[IndustrialReadingResponse]
    total: int
    page: int
    page_size: int
    total_pages: int
