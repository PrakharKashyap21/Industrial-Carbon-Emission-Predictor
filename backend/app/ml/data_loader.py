import os
import pandas as pd
from typing import Tuple

REQUIRED_COLUMNS = [
    "id",
    "plant_id",
    "timestamp",
    "electricity_consumption_kwh",
    "diesel_consumption_liters",
    "natural_gas_consumption_m3",
    "production_quantity",
    "raw_material_consumption_kg",
    "machine_runtime_hours",
    "temperature_c",
    "pressure_bar",
    "previous_co2_emission_kg",
    "actual_co2_emission_kg",
]

TARGET_COLUMN = "actual_co2_emission_kg"


def load_raw_data(file_path: str) -> pd.DataFrame:
    """Load raw industrial emission dataset, parse timestamps, and validate schema columns.
    
    Args:
        file_path (str): Path to raw CSV file.
        
    Returns:
        pd.DataFrame: Loaded and timestamp-parsed pandas DataFrame.
        
    Raises:
        FileNotFoundError: If dataset path does not exist.
        ValueError: If mandatory schema columns are missing.
    """
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"Raw data file not found at path: {file_path}")

    df = pd.read_csv(file_path)

    # Validate column schema
    missing_cols = [col for col in REQUIRED_COLUMNS if col not in df.columns]
    if missing_cols:
        raise ValueError(f"Dataset missing required schema columns: {missing_cols}")

    # Parse timestamps
    df["timestamp"] = pd.to_datetime(df["timestamp"], errors="coerce")

    print("=================================")
    print("Dataset Loaded Successfully")
    print(f"File Path: {file_path}")
    print(f"Rows:      {len(df)}")
    print(f"Columns:   {len(df.columns)}")
    print(f"Target:    {TARGET_COLUMN}")
    print("=================================")

    return df
