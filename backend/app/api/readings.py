import math
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import exc

from app.database.session import get_db
from app.models.plant import Plant
from app.models.industrial_reading import IndustrialReading
from app.schemas.industrial_reading import (
    IndustrialReadingCreate,
    IndustrialReadingResponse,
    IndustrialReadingPagination,
)

router = APIRouter(prefix="/readings", tags=["Industrial Readings"])


@router.get("", response_model=IndustrialReadingPagination, summary="List paginated industrial readings")
def get_readings(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    plant_id: Optional[int] = Query(None, description="Optional plant ID filter"),
    db: Session = Depends(get_db)
):
    """Retrieve paginated list of industrial operational readings with optional plant_id filtering."""
    query = db.query(IndustrialReading)
    if plant_id is not None:
        query = query.filter(IndustrialReading.plant_id == plant_id)

    total = query.count()
    total_pages = max(1, math.ceil(total / page_size))
    offset = (page - 1) * page_size

    items = query.order_by(IndustrialReading.timestamp.desc(), IndustrialReading.id.desc()).offset(offset).limit(page_size).all()

    return IndustrialReadingPagination(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.get("/{reading_id}", response_model=IndustrialReadingResponse, summary="Get industrial reading by ID")
def get_reading(reading_id: int, db: Session = Depends(get_db)):
    """Retrieve details for a specific industrial reading record."""
    reading = db.query(IndustrialReading).filter(IndustrialReading.id == reading_id).first()
    if not reading:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Industrial reading with ID {reading_id} not found."
        )
    return reading


@router.post("", response_model=IndustrialReadingResponse, status_code=status.HTTP_201_CREATED, summary="Create a new industrial reading")
def create_reading(reading_in: IndustrialReadingCreate, db: Session = Depends(get_db)):
    """Record a new daily industrial operational reading."""
    # Verify plant exists
    plant = db.query(Plant).filter(Plant.id == reading_in.plant_id).first()
    if not plant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Referenced Plant ID {reading_in.plant_id} does not exist."
        )

    # Check composite uniqueness (plant_id, timestamp)
    existing = db.query(IndustrialReading).filter(
        IndustrialReading.plant_id == reading_in.plant_id,
        IndustrialReading.timestamp == reading_in.timestamp
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"An industrial reading for plant_id {reading_in.plant_id} at timestamp '{reading_in.timestamp}' already exists."
        )

    reading = IndustrialReading(
        plant_id=reading_in.plant_id,
        timestamp=reading_in.timestamp,
        electricity_consumption_kwh=reading_in.electricity_consumption_kwh,
        diesel_consumption_liters=reading_in.diesel_consumption_liters,
        natural_gas_consumption_m3=reading_in.natural_gas_consumption_m3,
        production_quantity=reading_in.production_quantity,
        raw_material_consumption_kg=reading_in.raw_material_consumption_kg,
        machine_runtime_hours=reading_in.machine_runtime_hours,
        temperature_c=reading_in.temperature_c,
        pressure_bar=reading_in.pressure_bar,
        previous_co2_emission_kg=reading_in.previous_co2_emission_kg,
        actual_co2_emission_kg=reading_in.actual_co2_emission_kg,
    )

    try:
        db.add(reading)
        db.commit()
        db.refresh(reading)
        return reading
    except exc.IntegrityError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Database integrity constraint error: {str(e.orig)}"
        )
