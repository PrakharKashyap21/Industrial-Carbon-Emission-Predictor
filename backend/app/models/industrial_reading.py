from datetime import datetime
from typing import TYPE_CHECKING
from sqlalchemy import Float, DateTime, ForeignKey, UniqueConstraint, CheckConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base

if TYPE_CHECKING:
    from app.models.plant import Plant


class IndustrialReading(Base):
    """SQLAlchemy model representing daily industrial operational readings."""
    __tablename__ = "industrial_readings"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    plant_id: Mapped[int] = mapped_column(
        ForeignKey("plants.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    timestamp: Mapped[datetime] = mapped_column(DateTime, index=True, nullable=False)

    # Operational features
    electricity_consumption_kwh: Mapped[float] = mapped_column(Float, nullable=False)
    diesel_consumption_liters: Mapped[float] = mapped_column(Float, nullable=False)
    natural_gas_consumption_m3: Mapped[float] = mapped_column(Float, nullable=False)
    production_quantity: Mapped[float] = mapped_column(Float, nullable=False)
    raw_material_consumption_kg: Mapped[float] = mapped_column(Float, nullable=False)
    machine_runtime_hours: Mapped[float] = mapped_column(Float, nullable=False)
    temperature_c: Mapped[float] = mapped_column(Float, nullable=False)
    pressure_bar: Mapped[float] = mapped_column(Float, nullable=False)
    previous_co2_emission_kg: Mapped[float] = mapped_column(Float, nullable=False)

    # Ground truth target variable
    actual_co2_emission_kg: Mapped[float] = mapped_column(Float, nullable=False)

    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), nullable=False)

    # N:1 Relationship to Plant
    plant: Mapped["Plant"] = relationship("Plant", back_populates="readings")

    __table_args__ = (
        UniqueConstraint("plant_id", "timestamp", name="uix_plant_timestamp"),
        CheckConstraint("electricity_consumption_kwh >= 0", name="chk_elec_nonneg"),
        CheckConstraint("diesel_consumption_liters >= 0", name="chk_diesel_nonneg"),
        CheckConstraint("natural_gas_consumption_m3 >= 0", name="chk_gas_nonneg"),
        CheckConstraint("production_quantity >= 0", name="chk_prod_nonneg"),
        CheckConstraint("raw_material_consumption_kg >= 0", name="chk_raw_mat_nonneg"),
        CheckConstraint("machine_runtime_hours >= 0 AND machine_runtime_hours <= 24", name="chk_runtime_valid"),
        CheckConstraint("pressure_bar >= 0", name="chk_pressure_nonneg"),
        CheckConstraint("previous_co2_emission_kg >= 0", name="chk_prev_co2_nonneg"),
        CheckConstraint("actual_co2_emission_kg >= 0", name="chk_actual_co2_nonneg"),
    )
