from datetime import datetime
from typing import List, TYPE_CHECKING
from sqlalchemy import String, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base

if TYPE_CHECKING:
    from app.models.industrial_reading import IndustrialReading


class Plant(Base):
    """SQLAlchemy model representing industrial plants."""
    __tablename__ = "plants"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    plant_code: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    plant_name: Mapped[str] = mapped_column(String(255), nullable=False)
    industry_type: Mapped[str] = mapped_column(String(100), nullable=False)
    location: Mapped[str | None] = mapped_column(String(255), nullable=True)
    production_unit: Mapped[str | None] = mapped_column(String(50), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)

    # 1:N Relationship to Industrial Readings
    readings: Mapped[List["IndustrialReading"]] = relationship(
        "IndustrialReading",
        back_populates="plant",
        cascade="all, delete-orphan",
    )
