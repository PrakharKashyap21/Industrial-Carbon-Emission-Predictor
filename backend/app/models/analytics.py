from datetime import datetime
from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database.base import Base


class AnalyticsSnapshot(Base):
    """SQLAlchemy model representing an aggregated periodic Analytics Snapshot."""

    __tablename__ = "analytics_snapshots"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    plant_id = Column(Integer, ForeignKey("plants.id"), nullable=False, index=True)

    period_start = Column(DateTime, nullable=False)
    period_end = Column(DateTime, nullable=False)

    total_co2 = Column(Float, nullable=False)
    average_co2 = Column(Float, nullable=False)
    total_production = Column(Float, nullable=False)
    emission_intensity = Column(Float, nullable=False)

    anomaly_count = Column(Integer, default=0, nullable=False)
    model_version = Column(String(50), default="ensemble_v1", nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    plant = relationship("Plant")

    def __repr__(self) -> str:
        return f"<AnalyticsSnapshot(plant={self.plant_id}, total_co2={self.total_co2}, intensity={self.emission_intensity})>"


class IndustrialInsight(Base):
    """SQLAlchemy model representing a deterministic rule-based Industrial Insight."""

    __tablename__ = "industrial_insights"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    plant_id = Column(Integer, ForeignKey("plants.id"), nullable=True, index=True)

    insight_type = Column(String(50), nullable=False)  # EMISSION, EFFICIENCY, OPERATIONAL, ANOMALY, OPTIMIZATION, MODEL
    severity = Column(String(20), default="INFO", nullable=False)  # INFO, WARNING, CRITICAL

    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)

    metric_name = Column(String(100), nullable=True)
    metric_value = Column(Float, nullable=True)
    reference_period = Column(String(100), nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    plant = relationship("Plant")

    def __repr__(self) -> str:
        return f"<IndustrialInsight(type='{self.insight_type}', severity='{self.severity}', title='{self.title}')>"
