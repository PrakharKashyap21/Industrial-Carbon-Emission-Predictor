import json
from datetime import datetime
from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey, Boolean, Text
from sqlalchemy.orm import relationship
from app.database.base import Base


class OptimizationRun(Base):
    """SQLAlchemy model representing an Optimization Search Execution Run."""

    __tablename__ = "optimization_runs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    optimization_id = Column(String(50), unique=True, index=True, nullable=False)

    plant_id = Column(Integer, ForeignKey("plants.id"), nullable=False, index=True)
    baseline_id = Column(Integer, ForeignKey("industrial_readings.id"), nullable=True, index=True)

    baseline_prediction = Column(Float, nullable=False)

    constraints_json = Column(Text, nullable=False)
    search_parameters_json = Column(Text, nullable=False)

    candidates_generated = Column(Integer, nullable=False, default=0)
    candidates_evaluated = Column(Integer, nullable=False, default=0)
    candidates_rejected = Column(Integer, nullable=False, default=0)

    recommended_candidate_id = Column(String(50), nullable=True)
    model_version = Column(String(50), default="ensemble_v1", nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    plant = relationship("Plant")
    baseline_reading = relationship("IndustrialReading")
    results = relationship("OptimizationResult", backref="optimization_run", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<OptimizationRun(id='{self.optimization_id}', plant={self.plant_id}, generated={self.candidates_generated})>"


class OptimizationResult(Base):
    """SQLAlchemy model representing evaluated candidate configurations for an Optimization Run audit trail."""

    __tablename__ = "optimization_results"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    optimization_db_id = Column(Integer, ForeignKey("optimization_runs.id"), nullable=False, index=True)
    optimization_id = Column(String(50), nullable=False, index=True)

    candidate_id = Column(String(50), nullable=False, index=True)

    input_values_json = Column(Text, nullable=False)
    change_values_json = Column(Text, nullable=False)

    rf_prediction = Column(Float, nullable=False)
    xgb_prediction = Column(Float, nullable=False)
    ensemble_prediction = Column(Float, nullable=False)

    co2_change = Column(Float, nullable=False)
    co2_change_percentage = Column(Float, nullable=False)

    reliability_status = Column(String(20), default="HIGH", nullable=False)
    feasible = Column(Boolean, default=True, nullable=False)
    rejection_reason = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    def __repr__(self) -> str:
        return f"<OptimizationResult(candidate_id='{self.candidate_id}', change={self.co2_change}, feasible={self.feasible})>"
