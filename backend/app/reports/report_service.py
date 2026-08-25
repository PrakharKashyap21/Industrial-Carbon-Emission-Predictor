import os
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import select, desc

from app.models.report import Report
from app.models.auth import User
from app.auth.authorization import authorization_service
from app.reports.report_builder import report_builder
from app.reports.pdf_generator import pdf_generator
from app.reports.excel_generator import excel_generator
from app.reports.csv_generator import csv_generator
from app.audit.audit_service import audit_service

STORAGE_DIR = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
    "storage", "reports"
)


class ReportService:
    """Master Report Service handling generation orchestration, storage, DB metadata persistence, and audit logs."""

    def generate_report(
        self,
        db: Session,
        user: User,
        report_type: str,
        file_format: str,
        plant_id: Optional[int] = 1,
        period_start: Optional[datetime] = None,
        period_end: Optional[datetime] = None,
        resource_id: Optional[int] = None,
    ) -> Report:
        """Validate plant access, gather report data, render PDF/Excel/CSV binary, save file, and store report record."""
        # 1. Authorization check
        if plant_id and not authorization_service.can_access_plant(db, user, plant_id):
            raise PermissionError(f"User does not have authorization for Plant #{plant_id}")

        r_type = report_type.upper()
        f_fmt = file_format.upper()

        if f_fmt not in ["PDF", "EXCEL", "XLSX", "CSV"]:
            raise ValueError(f"Unsupported file format '{file_format}'. Must be PDF, EXCEL, or CSV.")

        # Standardize format naming
        ext = "pdf"
        if f_fmt in ["EXCEL", "XLSX"]:
            f_fmt = "EXCEL"
            ext = "xlsx"
        elif f_fmt == "CSV":
            ext = "csv"

        # 2. Gather Report Data
        report_data = report_builder.build_report_data(
            db=db,
            report_type=r_type,
            plant_id=plant_id,
            period_start=period_start,
            period_end=period_end,
            resource_id=resource_id,
        )

        # 3. Create Storage Filepath
        timestamp_str = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
        filename = f"carbon_report_{r_type.lower()}_plant{plant_id or 'all'}_{timestamp_str}.{ext}"
        os.makedirs(STORAGE_DIR, exist_ok=True)
        file_path = os.path.join(STORAGE_DIR, filename)

        # 4. Render File
        if f_fmt == "PDF":
            pdf_generator.generate(report_data, file_path)
        elif f_fmt == "EXCEL":
            excel_generator.generate(report_data, file_path)
        elif f_fmt == "CSV":
            csv_generator.generate(report_data, file_path)

        # 5. Persist DB Metadata
        report_record = Report(
            report_type=r_type,
            title=report_data.get("title", f"{r_type} Report"),
            plant_id=plant_id,
            created_by=user.id,
            period_start=period_start,
            period_end=period_end,
            file_format=f_fmt,
            file_path=file_path,
            status="COMPLETED",
            created_at=datetime.utcnow(),
            completed_at=datetime.utcnow(),
        )
        db.add(report_record)
        db.commit()
        db.refresh(report_record)

        # 6. Audit Logging
        audit_service.log_action(
            db=db,
            action="REPORT_GENERATED",
            user_id=user.id,
            resource_type="report",
            resource_id=str(report_record.id),
            metadata={"report_type": r_type, "file_format": f_fmt, "plant_id": plant_id},
        )

        return report_record

    def list_reports(
        self,
        db: Session,
        user: User,
        plant_id: Optional[int] = None,
        report_type: Optional[str] = None,
        status: Optional[str] = None,
        limit: int = 50,
    ) -> List[Report]:
        """Fetch report history list filtered by user's authorized plants."""
        query = select(Report)

        # Plant-level authorization filter
        if not authorization_service.is_admin(user):
            auth_plants = authorization_service.get_authorized_plant_ids(db, user)
            if auth_plants:
                query = query.where(Report.plant_id.in_(auth_plants))

        if plant_id:
            query = query.where(Report.plant_id == plant_id)
        if report_type:
            query = query.where(Report.report_type == report_type.upper())
        if status:
            query = query.where(Report.status == status.upper())

        query = query.order_by(desc(Report.created_at)).limit(limit)
        return list(db.execute(query).scalars().all())

    def get_report_by_id(self, db: Session, user: User, report_id: int) -> Report:
        """Fetch single report by ID, verifying user authorization."""
        query = select(Report).where(Report.id == report_id)
        report = db.execute(query).scalar_one_or_none()

        if not report:
            raise ValueError(f"Report #{report_id} not found")

        if report.plant_id and not authorization_service.can_access_plant(db, user, report.plant_id):
            raise PermissionError(f"Access Denied: User cannot access Report #{report_id} for Plant #{report.plant_id}")

        return report

    def download_report(self, db: Session, user: User, report_id: int) -> Tuple[str, str, str]:
        """Verify authorization and return (file_path, filename, media_type) for download response."""
        report = self.get_report_by_id(db, user, report_id)

        if not report.file_path or not os.path.exists(report.file_path):
            raise FileNotFoundError(f"Report file for Report #{report_id} no longer exists on disk")

        # Determine media type
        media_type = "application/pdf"
        if report.file_format == "EXCEL":
            media_type = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        elif report.file_format == "CSV":
            media_type = "text/csv"

        filename = os.path.basename(report.file_path)

        # Audit download action
        audit_service.log_action(
            db=db,
            action="REPORT_DOWNLOADED",
            user_id=user.id,
            resource_type="report",
            resource_id=str(report.id),
            metadata={"filename": filename, "format": report.file_format},
        )

        return report.file_path, filename, media_type


report_service = ReportService()
