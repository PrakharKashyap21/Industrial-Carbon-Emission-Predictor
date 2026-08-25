import json
from datetime import datetime
from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey, Boolean, Text
from sqlalchemy.orm import relationship
from app.database.base import Base


class Scenario(Base):
    """SQLAlchemy model representing a What-if Simulation Scenario definition."""

    __tablename__ = "scenarios"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    scenario_id = Column(String(50), unique=True, index=True, nullable=False)
    scenario_name = Column(String(150), nullable=False)

    baseline_id = Column(Integer, ForeignKey("industrial_readings.id"), nullable=True, index=True)
    plant_id = Column(Integer, ForeignKey("plants.id"), nullable=False, index=True)

    scenario_type = Column(String(50), default="custom", nullable=False)
    change_type = Column(String(20), default="percentage", nullable=False)

    input_values_json = Column(Text, nullable=False)
    change_values_json = Column(Text, nullable=False)

    is_saved = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    plant = relationship("Plant")
    baseline_reading = relationship("IndustrialReading")
    results = relationship("ScenarioResult", backref="scenario", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<Scenario(id='{self.scenario_id}', name='{self.scenario_name}', type='{self.scenario_type}')>"


class ScenarioResult(Base):
    """SQLAlchemy model representing simulation calculation outputs for a What-if scenario."""

    __tablename__ = "scenario_results"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    scenario_db_id = Column(Integer, ForeignKey("scenarios.id"), nullable=False, index=True)
    scenario_id = Column(String(50), nullable=False, index=True)

    rf_prediction = Column(Float, nullable=False)
    xgb_prediction = Column(Float, nullable=False)
    ensemble_prediction = Column(Float, nullable=False)
    baseline_prediction = Column(Float, nullable=False)

    co2_change = Column(Float, nullable=False)  # ensemble_prediction - baseline_prediction
    co2_change_percentage = Column(Float, nullable=False)
    interpretation = Column(String(50), default="CO2 reduction", nullable=False)

    reliability_status = Column(String(20), default="HIGH", nullable=False)
    feasible = Column(Boolean, default=True, nullable=False)

    violations_json = Column(Text, nullable=True)
    warnings_json = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    def __repr__(self) -> str:
        return f"<ScenarioResult(scenario_id='{self.scenario_id}', change={self.co2_change}, pct={self.co2_change_percentage}%)>"
