"""
Unit and Integration Tests for What-If Sensitivity Exporter & CSV Export Endpoint.
"""

import csv
import io
import pytest
from fastapi.testclient import TestClient

from app.whatif.scenario_exporter import scenario_exporter, SensitivityExportError, CSV_FIELD_NAMES
from app.main import app

client = TestClient(app)


@pytest.fixture
def sample_sensitivity_data():
    return {
        "baseline_id": 1,
        "feature": "electricity_consumption_kwh",
        "baseline_prediction": 20836.15,
        "points": [
            {
                "change_percentage": -20.0,
                "input_value": 18564.88,
                "predicted_co2": 20747.47,
                "co2_change": -88.68,
                "co2_change_percentage": -0.43,
                "reliability_status": "HIGH",
            },
            {
                "change_percentage": -10.0,
                "input_value": 20885.49,
                "predicted_co2": 20792.51,
                "co2_change": -43.64,
                "co2_change_percentage": -0.21,
                "reliability_status": "HIGH",
            },
            {
                "change_percentage": 0.0,
                "input_value": 23206.10,
                "predicted_co2": 20836.15,
                "co2_change": 0.0,
                "co2_change_percentage": 0.0,
                "reliability_status": "HIGH",
            },
            {
                "change_percentage": 10.0,
                "input_value": 25526.71,
                "predicted_co2": 20837.33,
                "co2_change": 1.18,
                "co2_change_percentage": 0.01,
                "reliability_status": "HIGH",
            },
        ],
    }


# Test 1: Normal sensitivity result conversion
def test_1_normal_conversion(sample_sensitivity_data):
    rows = scenario_exporter.normalize_sensitivity_points(sample_sensitivity_data)
    assert len(rows) == 4
    assert rows[0]["Feature Key"] == "electricity_consumption_kwh"
    assert rows[0]["Feature Label"] == "Electricity Consumption (kWh)"


# Test 2: Correct CSV column ordering
def test_2_column_ordering(sample_sensitivity_data):
    csv_str = scenario_exporter.export_to_csv_string(sample_sensitivity_data)
    lines = csv_str.strip().split("\n")
    header = lines[0].split(",")
    assert header == CSV_FIELD_NAMES


# Test 3: Preservation of variation percentages
def test_3_variation_percentages(sample_sensitivity_data):
    rows = scenario_exporter.normalize_sensitivity_points(sample_sensitivity_data)
    pcts = [r["Variation Percentage (%)"] for r in rows]
    assert pcts == [-20.0, -10.0, 0.0, 10.0]


# Test 4: Correct predicted emission values
def test_4_predicted_emissions(sample_sensitivity_data):
    rows = scenario_exporter.normalize_sensitivity_points(sample_sensitivity_data)
    preds = [r["Predicted CO2 (kg)"] for r in rows]
    assert preds == [20747.47, 20792.51, 20836.15, 20837.33]


# Test 5: Baseline and change calculations
def test_5_baseline_and_change_calculations(sample_sensitivity_data):
    rows = scenario_exporter.normalize_sensitivity_points(sample_sensitivity_data)
    for r in rows:
        assert r["Baseline Prediction (kg)"] == 20836.15
        assert isinstance(r["CO2 Change (kg)"], float)
        assert isinstance(r["CO2 Change (%)"], float)
    assert rows[0]["CO2 Change (kg)"] == -88.68
    assert rows[0]["CO2 Change (%)"] == -0.43


# Test 6: Empty sensitivity points handling
def test_6_empty_points_handling():
    empty_data = {
        "baseline_id": 1,
        "feature": "diesel_consumption_liters",
        "baseline_prediction": 15000.0,
        "points": [],
    }
    rows = scenario_exporter.normalize_sensitivity_points(empty_data)
    assert len(rows) == 0
    csv_str = scenario_exporter.export_to_csv_string(empty_data)
    assert CSV_FIELD_NAMES[0] in csv_str


# Test 7: Invalid and missing sensitivity data handling
def test_7_invalid_data_handling():
    with pytest.raises(SensitivityExportError):
        scenario_exporter.normalize_sensitivity_points("invalid_string")

    with pytest.raises(SensitivityExportError):
        scenario_exporter.normalize_sensitivity_points({})

    with pytest.raises(SensitivityExportError):
        scenario_exporter.normalize_sensitivity_points({"points": "not_a_list"})


# Test 8: CSV output is parseable by standard csv module
def test_8_csv_parseable(sample_sensitivity_data):
    csv_str = scenario_exporter.export_to_csv_string(sample_sensitivity_data)
    reader = csv.DictReader(io.StringIO(csv_str))
    parsed_rows = list(reader)
    assert len(parsed_rows) == 4
    assert parsed_rows[0]["Feature Key"] == "electricity_consumption_kwh"
    assert float(parsed_rows[0]["Variation Percentage (%)"]) == -20.0


# Test 9: API export endpoint POST /api/what-if/sensitivity/export
def test_9_api_export_endpoint(sample_sensitivity_data):
    response = client.post("/api/what-if/sensitivity/export", json=sample_sensitivity_data)
    assert response.status_code == 200
    assert "text/csv" in response.headers.get("content-type", "")
    assert "attachment" in response.headers.get("content-disposition", "")
    content = response.text
    assert "Feature Key" in content
    assert "electricity_consumption_kwh" in content
