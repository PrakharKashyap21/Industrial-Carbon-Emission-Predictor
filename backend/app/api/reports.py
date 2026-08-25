from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.schemas.reports import GenerateReportRequest, PreviewReportRequest, ReportResponse
from app.reports.report_service import report_service
from app.reports.report_builder import report_builder
from app.auth.dependencies import get_current_user
from app.models.auth import User

router = APIRouter(prefix="/reports", tags=["Reporting & Export Engine"])


def parse_date(d_str: Optional[str]) -> Optional[datetime]:
    if not d_str:
        return None
    try:
        return datetime.strptime(d_str, "%Y-%m-%d")
    except Exception:
        return None


@router.post(
    "/generate",
    response_model=ReportResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Generate & Export PDF / Excel / CSV Report",
    description="Generate executive, analytics, prediction, what-if, optimization, or monitoring reports in PDF, Excel, or CSV formats."
)
def generate_report(
    request_body: GenerateReportRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ReportResponse:
    """Generate report file and record metadata."""
    try:
        p_start = parse_date(request_body.period_start)
        p_end = parse_date(request_body.period_end)

        report = report_service.generate_report(
            db=db,
            user=current_user,
            report_type=request_body.report_type,
            file_format=request_body.file_format,
            plant_id=request_body.plant_id,
            period_start=p_start,
            period_end=p_end,
            resource_id=request_body.resource_id,
        )

        return ReportResponse(
            id=report.id,
            report_type=report.report_type,
            title=report.title,
            plant_id=report.plant_id,
            created_by=report.created_by,
            period_start=report.period_start.strftime("%Y-%m-%d") if report.period_start else None,
            period_end=report.period_end.strftime("%Y-%m-%d") if report.period_end else None,
            file_format=report.file_format,
            status=report.status,
            created_at=report.created_at.isoformat(),
            download_url=f"/api/reports/{report.id}/download",
        )
    except PermissionError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post(
    "/preview",
    status_code=status.HTTP_200_OK,
    summary="Preview Report Content Before Generation",
    description="Fetch structured JSON preview data for report configuration before triggering PDF/Excel rendering."
)
def preview_report(
    request_body: PreviewReportRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict:
    """Preview report content."""
    p_start = parse_date(request_body.period_start)
    p_end = parse_date(request_body.period_end)

    return report_builder.build_report_data(
        db=db,
        report_type=request_body.report_type,
        plant_id=request_body.plant_id,
        period_start=p_start,
        period_end=p_end,
        resource_id=request_body.resource_id,
    )


@router.get(
    "",
    response_model=List[ReportResponse],
    status_code=status.HTTP_200_OK,
    summary="Get Report Generation History",
    description="Retrieve authorized report history list filtered by plant, report type, or status."
)
def list_reports(
    plant_id: Optional[int] = Query(None, description="Optional plant filter"),
    report_type: Optional[str] = Query(None, description="Optional report type filter"),
    status_filter: Optional[str] = Query(None, alias="status", description="Optional status filter"),
    limit: int = Query(50, ge=1, le=200),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> List[ReportResponse]:
    """Fetch report history."""
    reports_list = report_service.list_reports(
        db=db,
        user=current_user,
        plant_id=plant_id,
        report_type=report_type,
        status=status_filter,
        limit=limit,
    )

    return [
        ReportResponse(
            id=r.id,
            report_type=r.report_type,
            title=r.title,
            plant_id=r.plant_id,
            created_by=r.created_by,
            period_start=r.period_start.strftime("%Y-%m-%d") if r.period_start else None,
            period_end=r.period_end.strftime("%Y-%m-%d") if r.period_end else None,
            file_format=r.file_format,
            status=r.status,
            created_at=r.created_at.isoformat(),
            download_url=f"/api/reports/{r.id}/download",
        )
        for r in reports_list
    ]


@router.get(
    "/{report_id}",
    response_model=ReportResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Single Report Details",
    description="Fetch single report metadata by ID."
)
def get_report(
    report_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ReportResponse:
    """Fetch report details."""
    try:
        report = report_service.get_report_by_id(db=db, user=current_user, report_id=report_id)
        return ReportResponse(
            id=report.id,
            report_type=report.report_type,
            title=report.title,
            plant_id=report.plant_id,
            created_by=report.created_by,
            period_start=report.period_start.strftime("%Y-%m-%d") if report.period_start else None,
            period_end=report.period_end.strftime("%Y-%m-%d") if report.period_end else None,
            file_format=report.file_format,
            status=report.status,
            created_at=report.created_at.isoformat(),
            download_url=f"/api/reports/{report.id}/download",
        )
    except PermissionError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.get(
    "/{report_id}/download",
    status_code=status.HTTP_200_OK,
    summary="Download Generated Report File",
    description="Validate authorization and download report binary file (PDF / Excel / CSV)."
)
def download_report(
    report_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Download report file."""
    try:
        file_path, filename, media_type = report_service.download_report(db=db, user=current_user, report_id=report_id)
        return FileResponse(path=file_path, filename=filename, media_type=media_type)
    except PermissionError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))
    except FileNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
