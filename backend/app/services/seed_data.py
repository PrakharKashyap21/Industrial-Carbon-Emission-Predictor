import csv
import os
from datetime import datetime
from sqlalchemy.orm import Session
from app.database.connection import engine
from app.database.session import SessionLocal
from app.database.base import Base
from app.models.plant import Plant
from app.models.industrial_reading import IndustrialReading

DEFAULT_CSV_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))),
    "data", "sample", "industrial_emissions_sample.csv"
)

INITIAL_PLANTS = [
    {"id": 1, "plant_code": "P001", "plant_name": "Apex Steel Works", "industry_type": "Steel", "location": "Pittsburgh, PA", "production_unit": "Metric Tons"},
    {"id": 2, "plant_code": "P002", "plant_name": "Titan Cement Plant", "industry_type": "Cement", "location": "Birmingham, AL", "production_unit": "Metric Tons"},
    {"id": 3, "plant_code": "P003", "plant_name": "SynthoChem Industries", "industry_type": "Chemical", "location": "Houston, TX", "production_unit": "Liters"},
    {"id": 4, "plant_code": "P004", "plant_name": "Vanguard Textile Mill", "industry_type": "Textile", "location": "Greensboro, NC", "production_unit": "Meters"},
    {"id": 5, "plant_code": "P005", "plant_name": "NutriFood Processing Ltd", "industry_type": "Food Processing", "location": "Des Moines, IA", "production_unit": "Units"},
]


from app.models.auth import Role, User, UserPlant
from app.auth.password import hash_password

INITIAL_ROLES = [
    {"id": 1, "name": "ADMIN", "description": "Full System & User Management Access"},
    {"id": 2, "name": "PLANT_MANAGER", "description": "Plant-Level Operations, What-if, Optimization & Analytics"},
    {"id": 3, "name": "ANALYST", "description": "Predictions, What-if, Optimization, SHAP & Analytics"},
    {"id": 4, "name": "OPERATOR", "description": "Operational Data Entry, Basic Predictions & Monitoring"},
]

INITIAL_USERS = [
    {"name": "System Administrator", "email": "admin@plant.com", "password": "admin123", "role": "ADMIN", "plants": [1, 2]},
    {"name": "Apex Plant Manager", "email": "manager@plant.com", "password": "manager123", "role": "PLANT_MANAGER", "plants": [1]},
    {"name": "Senior Carbon Analyst", "email": "analyst@plant.com", "password": "analyst123", "role": "ANALYST", "plants": [1]},
    {"name": "Plant Operator", "email": "operator@plant.com", "password": "operator123", "role": "OPERATOR", "plants": [1]},
]


def seed_database(db: Session, csv_path: str = DEFAULT_CSV_PATH) -> dict:
    """Idempotently seed plants, industrial readings, default roles, and seed users into database."""
    # Ensure tables exist
    Base.metadata.create_all(bind=db.get_bind())

    planted_count = 0
    readings_count = 0

    # 0. Seed Roles
    role_map = {}
    for r_data in INITIAL_ROLES:
        existing_role = db.query(Role).filter(Role.name == r_data["name"]).first()
        if not existing_role:
            role = Role(name=r_data["name"], description=r_data["description"])
            db.add(role)
            db.flush()
            role_map[r_data["name"]] = role.id
        else:
            role_map[r_data["name"]] = existing_role.id

    db.commit()

    # 1. Seed Plants
    plant_id_map = {}
    for p_data in INITIAL_PLANTS:
        existing_plant = db.query(Plant).filter(Plant.plant_code == p_data["plant_code"]).first()
        if not existing_plant:
            plant = Plant(
                plant_code=p_data["plant_code"],
                plant_name=p_data["plant_name"],
                industry_type=p_data["industry_type"],
                location=p_data["location"],
                production_unit=p_data["production_unit"],
            )
            db.add(plant)
            db.flush()
            plant_id_map[p_data["id"]] = plant.id
            planted_count += 1
        else:
            plant_id_map[p_data["id"]] = existing_plant.id

    db.commit()

    # 2. Seed Industrial Readings from CSV
    if os.path.exists(csv_path):
        with open(csv_path, mode="r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                csv_plant_id = int(row["plant_id"])
                actual_plant_id = plant_id_map.get(csv_plant_id, csv_plant_id)

                ts = datetime.strptime(row["timestamp"], "%Y-%m-%d %H:%M:%S")

                # Idempotency check: check if (plant_id, timestamp) exists
                existing_reading = db.query(IndustrialReading).filter(
                    IndustrialReading.plant_id == actual_plant_id,
                    IndustrialReading.timestamp == ts,
                ).first()

                if not existing_reading:
                    reading = IndustrialReading(
                        plant_id=actual_plant_id,
                        timestamp=ts,
                        electricity_consumption_kwh=float(row["electricity_consumption_kwh"]),
                        diesel_consumption_liters=float(row["diesel_consumption_liters"]),
                        natural_gas_consumption_m3=float(row["natural_gas_consumption_m3"]),
                        production_quantity=float(row["production_quantity"]),
                        raw_material_consumption_kg=float(row["raw_material_consumption_kg"]),
                        machine_runtime_hours=float(row["machine_runtime_hours"]),
                        temperature_c=float(row["temperature_c"]),
                        pressure_bar=float(row["pressure_bar"]),
                        previous_co2_emission_kg=float(row["previous_co2_emission_kg"]),
                        actual_co2_emission_kg=float(row["actual_co2_emission_kg"]),
                    )
                    db.add(reading)
                    readings_count += 1

        db.commit()

    # 3. Seed Predictions from Industrial Readings
    predictions_count = 0
    readings = db.query(IndustrialReading).all()
    from app.ml.prediction_service import prediction_service
    from app.models.prediction import Prediction

    for r in readings:
        existing_pred = db.query(Prediction).filter(Prediction.reading_id == r.id).first()
        if not existing_pred:
            raw_features = {
                "plant_id": r.plant_id,
                "electricity_consumption_kwh": r.electricity_consumption_kwh,
                "diesel_consumption_liters": r.diesel_consumption_liters,
                "natural_gas_consumption_m3": r.natural_gas_consumption_m3,
                "production_quantity": r.production_quantity,
                "raw_material_consumption_kg": r.raw_material_consumption_kg,
                "machine_runtime_hours": r.machine_runtime_hours,
                "temperature_c": r.temperature_c,
                "pressure_bar": r.pressure_bar,
                "previous_co2_emission_kg": r.previous_co2_emission_kg,
            }
            pred_res = prediction_service.predict(raw_features)
            act_co2 = r.actual_co2_emission_kg

            signed_err = round(pred_res["ensemble_prediction_kg"] - act_co2, 2) if act_co2 is not None else None
            abs_err = round(abs(act_co2 - pred_res["ensemble_prediction_kg"]), 2) if act_co2 is not None else None
            pct_err = round((abs_err / act_co2) * 100.0, 2) if act_co2 and act_co2 > 0 else None

            rf_val = pred_res.get("random_forest_prediction_kg", pred_res.get("rf_prediction_kg", 0.0))
            xgb_val = pred_res.get("xgboost_prediction_kg", pred_res.get("xgb_prediction_kg", 0.0))
            ens_val = pred_res.get("ensemble_prediction_kg", 0.0)

            pred_record = Prediction(
                plant_id=r.plant_id,
                reading_id=r.id,
                prediction_timestamp=r.timestamp,
                reading_timestamp=r.timestamp,
                rf_prediction=rf_val,
                xgb_prediction=xgb_val,
                ensemble_prediction=ens_val,
                actual_co2=act_co2,
                signed_error=signed_err,
                absolute_error=abs_err,
                percentage_error=pct_err,
                model_version="ensemble_v1",
                model_type="rf_xgb_ensemble",
                feature_pipeline_version="features_v1",
                prediction_horizon="current",
                status="evaluated" if act_co2 is not None else "pending_actual",
            )
            db.add(pred_record)
            predictions_count += 1

    # 4. Seed Default Users & Plant Assignments
    users_seeded = 0
    for u_data in INITIAL_USERS:
        existing_user = db.query(User).filter(User.email == u_data["email"]).first()
        if not existing_user:
            role_obj = db.query(Role).filter(Role.name == u_data["role"]).first()
            user = User(
                name=u_data["name"],
                email=u_data["email"],
                password_hash=hash_password(u_data["password"]),
                role_id=role_obj.id if role_obj else 4,
                is_active=True,
            )
            db.add(user)
            db.flush()

            for p_id in u_data["plants"]:
                db.add(UserPlant(user_id=user.id, plant_id=p_id))
            users_seeded += 1

    db.commit()

    return {"plants_added": planted_count, "readings_added": readings_count, "predictions_added": predictions_count, "users_added": users_seeded}


if __name__ == "__main__":
    db = SessionLocal()
    try:
        res = seed_database(db)
        print(f"Database Seeding Complete! Added {res['plants_added']} plants and {res['readings_added']} readings.")
    finally:
        db.close()
