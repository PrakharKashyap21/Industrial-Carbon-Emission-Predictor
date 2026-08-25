"""Architectural space for future entities (Phase 3+).

Models:
- Prediction (Phase 6)
- WhatIfScenario (Phase 6)
- Alert (Phase 6)
"""
from datetime import datetime
from sqlalchemy import String, Float, DateTime, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column
from app.database.base import Base


class PredictionPlaceholder(Base):
    """Placeholder model structure for future ML predictions (Phase 6)."""
    __tablename__ = "predictions_placeholder"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    plant_id: Mapped[int] = mapped_column(ForeignKey("plants.id", ondelete="CASCADE"), nullable=False)
    prediction_timestamp: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    random_forest_prediction: Mapped[float | None] = mapped_column(Float, nullable=True)
    xgboost_prediction: Mapped[float | None] = mapped_column(Float, nullable=True)
    ensemble_prediction: Mapped[float | None] = mapped_column(Float, nullable=True)
    actual_co2_emission_kg: Mapped[float | None] = mapped_column(Float, nullable=True)
    model_version: Mapped[str] = mapped_column(String(50), default="v1.0")
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())


class WhatIfScenarioPlaceholder(Base):
    """Placeholder model structure for future What-if Analysis (Phase 6)."""
    __tablename__ = "what_if_scenarios_placeholder"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    scenario_name: Mapped[str] = mapped_column(String(255), nullable=False)
    plant_id: Mapped[int] = mapped_column(ForeignKey("plants.id", ondelete="CASCADE"), nullable=False)
    baseline_reading_id: Mapped[int] = mapped_column(ForeignKey("industrial_readings.id"), nullable=False)
    modified_inputs_json: Mapped[str] = mapped_column(String, nullable=False)
    baseline_emission_kg: Mapped[float] = mapped_column(Float, nullable=False)
    projected_emission_kg: Mapped[float] = mapped_column(Float, nullable=False)
    emission_reduction_kg: Mapped[float] = mapped_column(Float, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())


class AlertPlaceholder(Base):
    """Placeholder model structure for future Emission Risk Alerts (Phase 6)."""
    __tablename__ = "alerts_placeholder"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    plant_id: Mapped[int] = mapped_column(ForeignKey("plants.id", ondelete="CASCADE"), nullable=False)
    alert_level: Mapped[str] = mapped_column(String(50), nullable=False)  # LOW, MEDIUM, HIGH, CRITICAL
    message: Mapped[str] = mapped_column(String(500), nullable=False)
    is_resolved: Mapped[bool] = mapped_column(default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
