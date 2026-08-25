from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from app.database.base import Base


class Report(Base):
    """SQLAlchemy model representing generated report metadata and file records."""

    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    report_type = Column(String(50), nullable=False, index=True)  # PREDICTION, WHAT_IF, OPTIMIZATION, ANALYTICS, MONITORING, EXECUTIVE
    title = Column(String(255), nullable=False)
    plant_id = Column(Integer, ForeignKey("plants.id"), nullable=True, index=True)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)

    period_start = Column(DateTime, nullable=True)
    period_end = Column(DateTime, nullable=True)

    file_format = Column(String(20), nullable=False)  # PDF, EXCEL, CSV
    file_path = Column(String(500), nullable=True)
    status = Column(String(30), nullable=False, default="COMPLETED")  # PENDING, GENERATING, COMPLETED, FAILED

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    completed_at = Column(DateTime, nullable=True)

    # Relationships
    plant = relationship("Plant", backref="reports")
    creator = relationship("User", backref="reports")

    def __repr__(self):
        return f"<Report(id={self.id}, type='{self.report_type}', format='{self.file_format}', status='{self.status}')>"
