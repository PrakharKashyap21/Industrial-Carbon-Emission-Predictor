from datetime import datetime
from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database.base import Base


class Prediction(Base):
    """SQLAlchemy model representing a saved ML carbon emission prediction lifecycle record."""

    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    plant_id = Column(Integer, ForeignKey("plants.id"), nullable=False, index=True)
    reading_id = Column(Integer, ForeignKey("industrial_readings.id"), nullable=True, index=True)

    prediction_timestamp = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    reading_timestamp = Column(DateTime, nullable=True)

    rf_prediction = Column(Float, nullable=False)
    xgb_prediction = Column(Float, nullable=False)
    ensemble_prediction = Column(Float, nullable=False)

    actual_co2 = Column(Float, nullable=True)
    signed_error = Column(Float, nullable=True)  # ensemble_prediction - actual_co2
    absolute_error = Column(Float, nullable=True)  # abs(actual_co2 - ensemble_prediction)
    percentage_error = Column(Float, nullable=True)  # abs(actual - pred)/actual * 100

    model_version = Column(String(50), default="ensemble_v1", nullable=False, index=True)
    model_type = Column(String(50), default="rf_xgb_ensemble", nullable=False)
    feature_pipeline_version = Column(String(50), default="features_v1", nullable=False)
    prediction_horizon = Column(String(20), default="current", nullable=False)

    status = Column(String(20), default="pending_actual", nullable=False, index=True)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    plant = relationship("Plant", backref="predictions")
    reading = relationship("IndustrialReading", backref="predictions")

    def __repr__(self) -> str:
        return (
            f"<Prediction(id={self.id}, plant_id={self.plant_id}, "
            f"ensemble={self.ensemble_prediction}, actual={self.actual_co2}, status='{self.status}')>"
        )
