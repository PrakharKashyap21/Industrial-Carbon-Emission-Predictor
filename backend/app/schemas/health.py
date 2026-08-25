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

