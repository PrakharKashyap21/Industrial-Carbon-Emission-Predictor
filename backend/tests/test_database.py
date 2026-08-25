from datetime import datetime
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient

from app.database.base import Base
from app.models.plant import Plant
from app.models.industrial_reading import IndustrialReading
from app.schemas.industrial_reading import IndustrialReadingCreate
from app.services.seed_data import seed_database
from app.main import app
from app.database.session import get_db

# Isolated SQLite in-memory database for testing
TEST_SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    TEST_SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(autouse=True)
def setup_test_db():
    """Create fresh database tables before each test."""
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def db_session():
    """Yield a clean test database session."""
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()


def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


@pytest.fixture(autouse=True)
def override_db():
    app.dependency_overrides[get_db] = override_get_db
    yield
    app.dependency_overrides.clear()


client = TestClient(app)


# Test 1: Database connection works
def test_1_database_connection(db_session):
    """Test 1: Verify database connection works."""
    assert db_session is not None
    result = db_session.execute(Base.metadata.tables["plants"].select()).fetchall()
    assert isinstance(result, list)


# Test 2: Plant insertion
def test_2_plant_insertion(db_session):
    """Test 2: Verify inserting a Plant model works."""
    plant = Plant(
        plant_code="PTEST01",
        plant_name="Test Steel Mill",
        industry_type="Steel",
        location="Chicago, IL",
        production_unit="Metric Tons",
    )
    db_session.add(plant)
    db_session.commit()
    db_session.refresh(plant)

    assert plant.id is not None
    assert plant.plant_code == "PTEST01"
    fetched = db_session.query(Plant).filter(Plant.plant_code == "PTEST01").first()
    assert fetched.plant_name == "Test Steel Mill"


# Test 3: Industrial reading insertion
def test_3_industrial_reading_insertion(db_session):
    """Test 3: Verify inserting an IndustrialReading model works."""
    plant = Plant(
        plant_code="PTEST02",
        plant_name="Test Cement Works",
        industry_type="Cement",
    )
    db_session.add(plant)
    db_session.commit()

    ts = datetime(2026, 1, 1, 0, 0, 0)
    reading = IndustrialReading(
        plant_id=plant.id,
        timestamp=ts,
        electricity_consumption_kwh=10000.0,
        diesel_consumption_liters=500.0,
        natural_gas_consumption_m3=2000.0,
        production_quantity=1500.0,
        raw_material_consumption_kg=4000.0,
        machine_runtime_hours=18.0,
        temperature_c=25.0,
        pressure_bar=6.5,
        previous_co2_emission_kg=8000.0,
        actual_co2_emission_kg=8500.0,
    )
    db_session.add(reading)
    db_session.commit()
    db_session.refresh(reading)

    assert reading.id is not None
    assert reading.plant_id == plant.id
    assert reading.actual_co2_emission_kg == 8500.0


# Test 4: Invalid negative electricity is rejected
def test_4_negative_electricity_rejected():
    """Test 4: Verify negative electricity is rejected by Pydantic validation."""
    with pytest.raises(ValueError):
        IndustrialReadingCreate(
            plant_id=1,
            timestamp=datetime.now(),
            electricity_consumption_kwh=-50.0,  # Invalid
            diesel_consumption_liters=100.0,
            natural_gas_consumption_m3=100.0,
            production_quantity=100.0,
            raw_material_consumption_kg=100.0,
            machine_runtime_hours=10.0,
            temperature_c=20.0,
            pressure_bar=5.0,
            previous_co2_emission_kg=100.0,
            actual_co2_emission_kg=100.0,
        )


# Test 5: Invalid negative fuel is rejected
def test_5_negative_fuel_rejected():
    """Test 5: Verify negative fuel is rejected by Pydantic validation."""
    with pytest.raises(ValueError):
        IndustrialReadingCreate(
            plant_id=1,
            timestamp=datetime.now(),
            electricity_consumption_kwh=100.0,
            diesel_consumption_liters=-20.0,  # Invalid
            natural_gas_consumption_m3=100.0,
            production_quantity=100.0,
            raw_material_consumption_kg=100.0,
            machine_runtime_hours=10.0,
            temperature_c=20.0,
            pressure_bar=5.0,
            previous_co2_emission_kg=100.0,
            actual_co2_emission_kg=100.0,
        )


# Test 6: Machine runtime greater than 24 hours is rejected
def test_6_runtime_over_24_rejected():
    """Test 6: Verify machine runtime > 24 hours is rejected."""
    with pytest.raises(ValueError):
        IndustrialReadingCreate(
            plant_id=1,
            timestamp=datetime.now(),
            electricity_consumption_kwh=100.0,
            diesel_consumption_liters=100.0,
            natural_gas_consumption_m3=100.0,
            production_quantity=100.0,
            raw_material_consumption_kg=100.0,
            machine_runtime_hours=26.5,  # Invalid (> 24)
            temperature_c=20.0,
            pressure_bar=5.0,
            previous_co2_emission_kg=100.0,
            actual_co2_emission_kg=100.0,
        )


# Test 7: Duplicate (plant_id + timestamp) is rejected
def test_7_duplicate_plant_timestamp_rejected(db_session):
    """Test 7: Verify duplicate plant_id and timestamp is rejected."""
    plant = Plant(plant_code="PTEST03", plant_name="Test Chemical Plant", industry_type="Chemical")
    db_session.add(plant)
    db_session.commit()

    ts = datetime(2026, 1, 1, 0, 0, 0)
    reading1 = IndustrialReading(
        plant_id=plant.id,
        timestamp=ts,
        electricity_consumption_kwh=1000.0,
        diesel_consumption_liters=100.0,
        natural_gas_consumption_m3=100.0,
        production_quantity=100.0,
        raw_material_consumption_kg=100.0,
        machine_runtime_hours=10.0,
        temperature_c=20.0,
        pressure_bar=5.0,
        previous_co2_emission_kg=100.0,
        actual_co2_emission_kg=100.0,
    )
    db_session.add(reading1)
    db_session.commit()

    # Attempt to insert duplicate reading for same plant & timestamp
    reading2 = IndustrialReading(
        plant_id=plant.id,
        timestamp=ts,
        electricity_consumption_kwh=2000.0,
        diesel_consumption_liters=200.0,
        natural_gas_consumption_m3=200.0,
        production_quantity=200.0,
        raw_material_consumption_kg=200.0,
        machine_runtime_hours=12.0,
        temperature_c=22.0,
        pressure_bar=5.5,
        previous_co2_emission_kg=200.0,
        actual_co2_emission_kg=200.0,
    )
    db_session.add(reading2)

    with pytest.raises(Exception):
        db_session.commit()


# Test 8: Foreign key relationship works
def test_8_foreign_key_relationship(db_session):
    """Test 8: Verify Plant <-> IndustrialReading foreign key relationship."""
    plant = Plant(plant_code="PTEST04", plant_name="Test Textile Factory", industry_type="Textile")
    db_session.add(plant)
    db_session.commit()

    reading = IndustrialReading(
        plant_id=plant.id,
        timestamp=datetime(2026, 1, 2, 0, 0, 0),
        electricity_consumption_kwh=5000.0,
        diesel_consumption_liters=200.0,
        natural_gas_consumption_m3=1000.0,
        production_quantity=800.0,
        raw_material_consumption_kg=2000.0,
        machine_runtime_hours=14.0,
        temperature_c=22.0,
        pressure_bar=4.5,
        previous_co2_emission_kg=4000.0,
        actual_co2_emission_kg=4200.0,
    )
    db_session.add(reading)
    db_session.commit()

    # Query plant and check associated readings relationship
    fetched_plant = db_session.query(Plant).filter(Plant.id == plant.id).first()
    assert len(fetched_plant.readings) == 1
    assert fetched_plant.readings[0].actual_co2_emission_kg == 4200.0


# Test 9: Sample dataset can be seeded successfully
def test_9_seed_dataset_script(db_session):
    """Test 9: Verify seeding dataset loads sample records idempotently."""
    res = seed_database(db_session)
    assert res["plants_added"] >= 5
    assert res["readings_added"] >= 100

    plant_count = db_session.query(Plant).count()
    reading_count = db_session.query(IndustrialReading).count()
    assert plant_count >= 5
    assert reading_count >= 100

    # Test idempotency (re-run seed)
    res_rerun = seed_database(db_session)
    assert res_rerun["plants_added"] == 0
    assert res_rerun["readings_added"] == 0
