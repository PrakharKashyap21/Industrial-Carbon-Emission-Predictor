from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.plant import Plant
from app.schemas.plant import PlantCreate, PlantResponse

router = APIRouter(prefix="/plants", tags=["Plants"])


@router.get("", response_model=List[PlantResponse], summary="List all industrial plants")
def get_plants(db: Session = Depends(get_db)):
    """Retrieve list of all registered industrial facilities."""
    plants = db.query(Plant).order_by(Plant.id).all()
    return plants


@router.get("/{plant_id}", response_model=PlantResponse, summary="Get industrial plant by ID")
def get_plant(plant_id: int, db: Session = Depends(get_db)):
    """Retrieve details for a specific industrial plant."""
    plant = db.query(Plant).filter(Plant.id == plant_id).first()
    if not plant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Plant with ID {plant_id} not found."
        )
    return plant


@router.post("", response_model=PlantResponse, status_code=status.HTTP_201_CREATED, summary="Create a new industrial plant")
def create_plant(plant_in: PlantCreate, db: Session = Depends(get_db)):
    """Register a new industrial plant facility."""
    existing = db.query(Plant).filter(Plant.plant_code == plant_in.plant_code).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Plant with code '{plant_in.plant_code}' already exists."
        )

    plant = Plant(
        plant_code=plant_in.plant_code,
        plant_name=plant_in.plant_name,
        industry_type=plant_in.industry_type,
        location=plant_in.location,
        production_unit=plant_in.production_unit,
    )
    db.add(plant)
    db.commit()
    db.refresh(plant)
    return plant
