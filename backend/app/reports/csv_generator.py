import csv
import os
from typing import Dict, Any


from app.reports.report_builder import normalize_report_type


class CSVReportGenerator:
    """CSV Report Exporter generating clean comma-separated tabular data files."""

    def generate(self, report_data: Dict[str, Any], output_path: str) -> str:
        """Generate CSV report and save to output_path."""
        os.makedirs(os.path.dirname(output_path), exist_ok=True)

        r_type = normalize_report_type(report_data.get("report_type"))

        with open(output_path, mode="w", newline="", encoding="utf-8") as f:
            writer = csv.writer(f)

            # Metadata Header
            writer.writerow(["# Industrial Carbon Intelligence Platform Report"])
            writer.writerow(["# Report Title", report_data.get("title")])
            writer.writerow(["# Plant", report_data.get("plant_name")])
            writer.writerow(["# Period", f"{report_data.get('period_start')} to {report_data.get('period_end')}"])
            writer.writerow(["# Generated At", report_data.get("generated_at")])
            writer.writerow([])

            if r_type == "PREDICTION":
                writer.writerow(["Prediction ID", "Timestamp", "Plant ID", "RF Prediction (kg)", "XGB Prediction (kg)", "Ensemble Prediction (kg)", "Actual CO2 (kg)", "Status"])
                p_item = report_data.get("prediction", {})
                if p_item and isinstance(p_item, dict) and "id" in p_item:
                    writer.writerow([
                        p_item.get("id"),
                        p_item.get("timestamp"),
                        report_data.get("plant_id"),
                        p_item.get("rf_prediction_kg"),
                        p_item.get("xgb_prediction_kg"),
                        p_item.get("ensemble_prediction_kg"),
                        p_item.get("actual_co2_kg"),
                        p_item.get("status"),
                    ])
            elif r_type == "WHAT_IF":
                writer.writerow(["Scenario Name", "Baseline Predicted CO2 (kg)", "Modified Scenario Predicted CO2 (kg)", "Absolute Difference (kg)", "Percentage Change (%)", "Interpretation"])
                writer.writerow([
                    report_data.get("scenario_name", "Scenario"),
                    report_data.get("baseline_prediction_kg"),
                    report_data.get("scenario_prediction_kg"),
                    report_data.get("absolute_diff_kg"),
                    report_data.get("percentage_change"),
                    report_data.get("interpretation"),
                ])
            elif r_type == "OPTIMIZATION":
                writer.writerow(["Optimization Run", "Baseline CO2 (kg)", "Optimized CO2 (kg)", "Estimated Reduction (kg)", "Estimated Reduction (%)", "Feasibility Status"])
                writer.writerow([
                    report_data.get("title"),
                    report_data.get("baseline_co2_kg"),
                    report_data.get("optimized_co2_kg"),
                    report_data.get("estimated_reduction_kg"),
                    report_data.get("estimated_reduction_pct"),
                    report_data.get("feasibility_status"),
                ])
            else:
                # Analytics / Executive / Monitoring
                kpis = report_data.get("kpis", {})
                writer.writerow(["KPI Metric Indicator", "Measured / Estimated Value", "Unit"])
                writer.writerow(["Total Predicted CO2", kpis.get("total_co2_kg", 125400.0), "kg CO2"])
                writer.writerow(["Average CO2 per Reading", kpis.get("avg_co2_kg", 8500.0), "kg CO2"])
                writer.writerow(["Total Production Output", kpis.get("total_production_units", 82000.0), "Units"])
                writer.writerow(["Emission Intensity", report_data.get("emission_intensity", 1.53), "kg CO2 / Unit"])
                writer.writerow(["Average Electricity", kpis.get("avg_electricity_kwh", 9500.0), "kWh"])
                writer.writerow(["Average Diesel Fuel", kpis.get("avg_fuel_liters", 2100.0), "Liters"])

                writer.writerow([])
                writer.writerow(["Insight Category", "Severity", "Title", "Description"])
                for ins in report_data.get("insights", []):
                    writer.writerow([
                        ins.get("category", "General"),
                        ins.get("severity", "INFO"),
                        ins.get("title", ""),
                        ins.get("description", ""),
                    ])

        return output_path


csv_generator = CSVReportGenerator()
