from pydantic import BaseModel, Field


class HealthCheckResponse(BaseModel):
    status: str = Field(
        default="healthy",
        description="Health status of the backend API service",
        json_schema_extra={"example": "healthy"}
    )
    service: str = Field(
        default="industrial-carbon-emission-api",
        description="Identifies the API service name",
        json_schema_extra={"example": "industrial-carbon-emission-api"}
    )
    phase: str = Field(
        default="phase-1",
        description="Current implementation phase of the project",
        json_schema_extra={"example": "phase-1"}
    )


class SystemHealthResponse(BaseModel):
    api_status: str = Field(default="healthy", description="API status")
    database_status: str = Field(default="healthy", description="Database status")
    model_name: str = Field(default="RF + XGBoost Weighted Ensemble", description="ML model architecture name")
    model_status: str = Field(default="available", description="ML model availability status")
    model_version: str = Field(default="v1.2.0-ensemble", description="ML model version")
    total_users: int = Field(default=0, description="Total authorized users")
    total_plants: int = Field(default=0, description="Total active plant facilities")
    active_alerts: int = Field(default=0, description="Total active monitoring alerts")
    total_readings: int = Field(default=0, description="Total historical telemetry readings")
    latest_reading_timestamp: str = Field(default="", description="Latest reading timestamp")
    data_freshness: str = Field(default="Fresh", description="Data freshness indicator")

