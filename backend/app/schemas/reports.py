from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class GenerateReportRequest(BaseModel):
    report_type: str = Field("ANALYTICS", example="ANALYTICS")  # PREDICTION, WHAT_IF, OPTIMIZATION, ANALYTICS, MONITORING, EXECUTIVE
    file_format: str = Field("PDF", example="PDF")  # PDF, EXCEL, CSV
    plant_id: Optional[int] = Field(1, example=1)
    period_start: Optional[str] = Field(None, example="2026-08-01")
    period_end: Optional[str] = Field(None, example="2026-08-31")
    resource_id: Optional[int] = Field(None, example=1)


class PreviewReportRequest(BaseModel):
    report_type: str = Field("ANALYTICS", example="ANALYTICS")
    plant_id: Optional[int] = Field(1, example=1)
    period_start: Optional[str] = Field(None, example="2026-08-01")
    period_end: Optional[str] = Field(None, example="2026-08-31")
    resource_id: Optional[int] = Field(None, example=1)


class ReportResponse(BaseModel):
    id: int
    report_type: str
    title: str
    plant_id: Optional[int] = None
    created_by: Optional[int] = None
    period_start: Optional[str] = None
    period_end: Optional[str] = None
    file_format: str
    status: str
    created_at: str
    download_url: str
