from datetime import datetime, timezone
from typing import Optional
from sqlalchemy import Integer, Float, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship, Mapped, mapped_column
from app.database.base import Base

def utc_now():
    return datetime.now(timezone.utc).replace(tzinfo=None)


class MonitoringSnapshot(Base):
    """SQLAlchemy model storing overall monitoring execution snapshot."""

    __tablename__ = "monitoring_snapshots"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    plant_id: Mapped[Optional[int]] = mapped_column(Integer, nullable=True, index=True)
    monitoring_date: Mapped[datetime] = mapped_column(DateTime, default=utc_now, nullable=False, index=True)

    total_records: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    missing_records: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    invalid_records: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    duplicate_records: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    overall_data_quality: Mapped[str] = mapped_column(String(20), default="good", nullable=False)
    overall_drift_status: Mapped[str] = mapped_column(String(20), default="low", nullable=False)
    overall_performance_status: Mapped[str] = mapped_column(String(20), default="stable", nullable=False)
    overall_reliability: Mapped[str] = mapped_column(String(20), default="high", nullable=False)
    active_alerts_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=utc_now, nullable=False)

    # Relationships
    drift_results = relationship("DriftResult", backref="snapshot", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<MonitoringSnapshot(id={self.id}, date='{self.monitoring_date}', quality='{self.overall_data_quality}', drift='{self.overall_drift_status}')>"


class DriftResult(Base):
    """SQLAlchemy model storing feature-level Population Stability Index (PSI) and KS drift results."""

    __tablename__ = "drift_results"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    monitoring_snapshot_id: Mapped[int] = mapped_column(Integer, ForeignKey("monitoring_snapshots.id"), nullable=False, index=True)

    feature_name: Mapped[str] = mapped_column(String(100), nullable=False)
    psi: Mapped[float] = mapped_column(Float, nullable=False)
    ks_statistic: Mapped[float] = mapped_column(Float, nullable=False)
    p_value: Mapped[float] = mapped_column(Float, nullable=False)
    drift_status: Mapped[str] = mapped_column(String(20), nullable=False)  # low, moderate, high

    baseline_version: Mapped[str] = mapped_column(String(50), default="training_baseline_v1", nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utc_now, nullable=False)

    def __repr__(self) -> str:
        return f"<DriftResult(feature='{self.feature_name}', psi={self.psi}, status='{self.drift_status}')>"


class MonitoringAlert(Base):
    """SQLAlchemy model storing system monitoring alerts with deduplication and resolution tracking."""

    __tablename__ = "monitoring_alerts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    plant_id: Mapped[Optional[int]] = mapped_column(Integer, nullable=True, index=True)
    alert_type: Mapped[str] = mapped_column(String(50), nullable=False, index=True)  # DATA_QUALITY, DATA_DRIFT, MODEL_PERFORMANCE, INPUT_OUT_OF_RANGE, PREDICTION_RELIABILITY
    severity: Mapped[str] = mapped_column(String(20), nullable=False)  # INFO, WARNING, CRITICAL
    feature_name: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="active", nullable=False, index=True)  # active, resolved

    created_at: Mapped[datetime] = mapped_column(DateTime, default=utc_now, nullable=False)
    resolved_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    def __repr__(self) -> str:
        return f"<MonitoringAlert(id={self.id}, type='{self.alert_type}', severity='{self.severity}', status='{self.status}')>"

