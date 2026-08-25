from datetime import datetime
from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database.base import Base


class MonitoringSnapshot(Base):
    """SQLAlchemy model storing overall monitoring execution snapshot."""

    __tablename__ = "monitoring_snapshots"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    plant_id = Column(Integer, nullable=True, index=True)
    monitoring_date = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)

    total_records = Column(Integer, default=0, nullable=False)
    missing_records = Column(Integer, default=0, nullable=False)
    invalid_records = Column(Integer, default=0, nullable=False)
    duplicate_records = Column(Integer, default=0, nullable=False)

    overall_data_quality = Column(String(20), default="good", nullable=False)
    overall_drift_status = Column(String(20), default="low", nullable=False)
    overall_performance_status = Column(String(20), default="stable", nullable=False)
    overall_reliability = Column(String(20), default="high", nullable=False)
    active_alerts_count = Column(Integer, default=0, nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    drift_results = relationship("DriftResult", backref="snapshot", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<MonitoringSnapshot(id={self.id}, date='{self.monitoring_date}', quality='{self.overall_data_quality}', drift='{self.overall_drift_status}')>"


class DriftResult(Base):
    """SQLAlchemy model storing feature-level Population Stability Index (PSI) and KS drift results."""

    __tablename__ = "drift_results"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    monitoring_snapshot_id = Column(Integer, ForeignKey("monitoring_snapshots.id"), nullable=False, index=True)

    feature_name = Column(String(100), nullable=False)
    psi = Column(Float, nullable=False)
    ks_statistic = Column(Float, nullable=False)
    p_value = Column(Float, nullable=False)
    drift_status = Column(String(20), nullable=False)  # low, moderate, high

    baseline_version = Column(String(50), default="training_baseline_v1", nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    def __repr__(self) -> str:
        return f"<DriftResult(feature='{self.feature_name}', psi={self.psi}, status='{self.drift_status}')>"


class MonitoringAlert(Base):
    """SQLAlchemy model storing system monitoring alerts with deduplication and resolution tracking."""

    __tablename__ = "monitoring_alerts"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    plant_id = Column(Integer, nullable=True, index=True)
    alert_type = Column(String(50), nullable=False, index=True)  # DATA_QUALITY, DATA_DRIFT, MODEL_PERFORMANCE, INPUT_OUT_OF_RANGE, PREDICTION_RELIABILITY
    severity = Column(String(20), nullable=False)  # INFO, WARNING, CRITICAL
    feature_name = Column(String(100), nullable=True)
    message = Column(Text, nullable=False)
    status = Column(String(20), default="active", nullable=False, index=True)  # active, resolved

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    resolved_at = Column(DateTime, nullable=True)

    def __repr__(self) -> str:
        return f"<MonitoringAlert(id={self.id}, type='{self.alert_type}', severity='{self.severity}', status='{self.status}')>"
