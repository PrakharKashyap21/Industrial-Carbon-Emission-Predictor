from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict


class PlantBase(BaseModel):
    plant_code: str = Field(..., min_length=2, max_length=50, description="Unique identifier code for the plant", json_schema_extra={"example": "P001"})
    plant_name: str = Field(..., min_length=2, max_length=255, description="Full descriptive name of the facility", json_schema_extra={"example": "Apex Steel Works"})
    industry_type: str = Field(..., min_length=2, max_length=100, description="Sector/Industry classification", json_schema_extra={"example": "Steel"})
    location: str | None = Field(default=None, max_length=255, description="Geographic location of facility", json_schema_extra={"example": "Pittsburgh, PA"})
    production_unit: str | None = Field(default="Metric Tons", max_length=50, description="Unit of measure for production output", json_schema_extra={"example": "Metric Tons"})


class PlantCreate(PlantBase):
    pass


class PlantUpdate(BaseModel):
    plant_name: str | None = None
    industry_type: str | None = None
    location: str | None = None
    production_unit: str | None = None


class PlantResponse(PlantBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
