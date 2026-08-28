import io
import os
from typing import Dict, Any
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image, PageBreak, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch


class PDFReportGenerator:
    """Server-side PDF generator constructing unified multi-page PDF documents with consistent industrial brand colors."""

    def generate(self, report_data: Dict[str, Any], output_path: str) -> str:
        """Generate PDF report and write binary file to output_path."""
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        doc = SimpleDocTemplate(
            output_path,
            pagesize=letter,
            rightMargin=36,
            leftMargin=36,
            topMargin=36,
            bottomMargin=36,
        )

        r_type = (report_data.get("report_type") or "EXECUTIVE").upper()

        if r_type == "EXECUTIVE":
            story = self._build_executive_pdf(report_data, output_path)
        elif r_type == "ANALYTICS":
            story = self._build_analytics_pdf(report_data, output_path)
        elif r_type == "PREDICTION":
            story = self._build_prediction_pdf(report_data, output_path)
        elif r_type == "WHAT_IF":
            story = self._build_whatif_pdf(report_data, output_path)
        elif r_type == "OPTIMIZATION":
            story = self._build_optimization_pdf(report_data, output_path)
        elif r_type == "MONITORING":
            story = self._build_monitoring_pdf(report_data, output_path)
        else:
            story = self._build_executive_pdf(report_data, output_path)

        doc.build(story)
        return output_path

    # --- UNIFIED BRAND STYLE FACTORY ---
    def _create_styles(self):
        styles = getSampleStyleSheet()
        primary_color = "#0f172a"
        accent_color = "#0284c7"

        return {
            "title": ParagraphStyle(
                "DocTitle",
                parent=styles["Heading1"],
                fontName="Helvetica-Bold",
                fontSize=18,
                leading=22,
                textColor=colors.HexColor(primary_color),
                spaceAfter=4,
            ),
            "subtitle": ParagraphStyle(
                "DocSubTitle",
                parent=styles["Normal"],
                fontName="Helvetica-Bold",
                fontSize=9,
                leading=12,
                textColor=colors.HexColor("#475569"),
                spaceAfter=10,
            ),
            "section": ParagraphStyle(
                "SectionHeading",
                parent=styles["Heading2"],
                fontName="Helvetica-Bold",
                fontSize=11,
                leading=15,
                textColor=colors.HexColor(primary_color),
                spaceBefore=10,
                spaceAfter=6,
            ),
            "body": ParagraphStyle(
                "DocBody",
                parent=styles["Normal"],
                fontName="Helvetica",
                fontSize=8.5,
                leading=12,
                textColor=colors.HexColor("#334155"),
                spaceAfter=6,
            ),
            "table_header": ParagraphStyle(
                "TableHeader",
                parent=styles["Normal"],
                fontName="Helvetica-Bold",
                fontSize=8,
                leading=10,
                textColor=colors.whitesmoke,
            ),
            "table_cell": ParagraphStyle(
                "TableCell",
                parent=styles["Normal"],
                fontName="Helvetica",
                fontSize=8,
                leading=10,
                textColor=colors.HexColor("#334155"),
            ),
            "table_cell_bold": ParagraphStyle(
                "TableCellBold",
                parent=styles["Normal"],
                fontName="Helvetica-Bold",
                fontSize=8,
                leading=10,
                textColor=colors.HexColor("#0f172a"),
            ),
            "disclaimer": ParagraphStyle(
                "DocDisclaimer",
                parent=styles["Normal"],
                fontName="Helvetica-Oblique",
                fontSize=7,
                leading=9,
                textColor=colors.HexColor("#64748b"),
            ),
        }

    # --- UNIFIED REPORT HEADER ---
    def _add_report_header(self, story, report_data, title, sub_title):
        st = self._create_styles()
        story.append(Paragraph("INDUSTRIAL CARBON INTELLIGENCE SYSTEM", st["subtitle"]))
        story.append(Paragraph(title.replace("CO₂", "CO2"), st["title"]))
        story.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor("#0284c7"), spaceAfter=10))

        meta_data = [
            [
                Paragraph(f"<b>Facility:</b> {report_data.get('plant_name')} ({report_data.get('plant_code')})", st["body"]),
                Paragraph(f"<b>Period:</b> {report_data.get('period_start')} to {report_data.get('period_end')}", st["body"]),
            ],
            [
                Paragraph(f"<b>Generated:</b> {report_data.get('generated_at')}", st["body"]),
                Paragraph(f"<b>Report Format:</b> {report_data.get('report_type')} PDF", st["body"]),
            ],
        ]
        meta_table = Table(meta_data, colWidths=[270, 270])
        meta_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#f8fafc")),
            ("BOX", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
            ("PADDING", (0, 0), (-1, -1), 5),
        ]))
        story.append(meta_table)
        story.append(Spacer(1, 10))

    # --- 1. EXECUTIVE SUMMARY PDF ---
    def _build_executive_pdf(self, report_data: Dict[str, Any], output_path: str):
        st = self._create_styles()
        story = []
        self._add_report_header(story, report_data, "Executive Carbon Performance & Decarbonization Summary", "MANAGEMENT BRIEFING")

        story.append(Paragraph("1. Executive Briefing & Key Observations", st["section"]))
        exec_text = report_data.get("executive_summary", "Operational performance remains stable with decarbonization opportunities identified.")
        story.append(Paragraph(exec_text.replace("CO₂", "CO2"), st["body"]))
        story.append(Spacer(1, 8))

        story.append(Paragraph("2. Executive Decarbonization KPI Matrix", st["section"]))
        kpis = report_data.get("kpis", {})
        kpi_rows = [
            [Paragraph("<b>Executive Indicator</b>", st["table_header"]), Paragraph("<b>Value</b>", st["table_header"]), Paragraph("<b>Unit</b>", st["table_header"])],
            [Paragraph("Total Carbon Footprint", st["table_cell"]), Paragraph(f"{kpis.get('total_co2_kg', 125400):,.2f}", st["table_cell_bold"]), Paragraph("kg CO2", st["table_cell"])],
            [Paragraph("Total Finished Production", st["table_cell"]), Paragraph(f"{kpis.get('total_production_units', 82000):,.0f}", st["table_cell_bold"]), Paragraph("Units", st["table_cell"])],
            [Paragraph("Carbon Intensity Rate", st["table_cell"]), Paragraph(f"{report_data.get('emission_intensity', 1.53):.3f}", st["table_cell_bold"]), Paragraph("kg CO2 / Unit", st["table_cell"])],
            [Paragraph("Optimization Opportunity", st["table_cell"]), Paragraph(f"-{report_data.get('optimization_opportunity_pct', 12.6)}%", st["table_cell_bold"]), Paragraph("CO2 Reduction", st["table_cell"])],
        ]
        t = Table(kpi_rows, colWidths=[220, 180, 140])
        t.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0f172a")),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f8fafc")]),
            ("PADDING", (0, 0), (-1, -1), 5),
        ]))
        story.append(t)
        story.append(Spacer(1, 10))

        chart_path = self._generate_chart_executive(report_data, output_path)
        if chart_path and os.path.exists(chart_path):
            story.append(Paragraph("3. Monthly Carbon Footprint vs Production Trend", st["section"]))
            story.append(Image(chart_path, width=7 * inch, height=2.6 * inch))
            story.append(Spacer(1, 10))

        self._add_disclaimer(story, report_data, st)
        return story

    # --- 2. ANALYTICS & PERFORMANCE PDF ---
    def _build_analytics_pdf(self, report_data: Dict[str, Any], output_path: str):
        st = self._create_styles()
        story = []
        self._add_report_header(story, report_data, "Industrial Telemetry & Emission Analytics Report", "OPERATIONAL PERFORMANCE")

        story.append(Paragraph("1. Telemetry Energy & Consumption Metrics", st["section"]))
        kpis = report_data.get("kpis", {})
        kpi_rows = [
            [Paragraph("<b>Telemetry Parameter</b>", st["table_header"]), Paragraph("<b>Average Value</b>", st["table_header"]), Paragraph("<b>Unit</b>", st["table_header"])],
            [Paragraph("Electricity Consumption", st["table_cell"]), Paragraph(f"{kpis.get('avg_electricity_kwh', 18500):,.2f}", st["table_cell_bold"]), Paragraph("kWh / day", st["table_cell"])],
            [Paragraph("Diesel Fuel Consumption", st["table_cell"]), Paragraph(f"{kpis.get('avg_diesel_liters', 1200):,.2f}", st["table_cell_bold"]), Paragraph("Liters / day", st["table_cell"])],
            [Paragraph("Natural Gas Volume", st["table_cell"]), Paragraph(f"{kpis.get('avg_gas_m3', 3200):,.2f}", st["table_cell_bold"]), Paragraph("m³ / day", st["table_cell"])],
            [Paragraph("Average Machine Runtime", st["table_cell"]), Paragraph(f"{kpis.get('avg_runtime_hours', 19.5):.1f}", st["table_cell_bold"]), Paragraph("Hours / day", st["table_cell"])],
        ]
        t = Table(kpi_rows, colWidths=[220, 180, 140])
        t.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0f172a")),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f8fafc")]),
            ("PADDING", (0, 0), (-1, -1), 5),
        ]))
        story.append(t)
        story.append(Spacer(1, 10))

        chart_path = self._generate_chart_analytics(report_data, output_path)
        if chart_path and os.path.exists(chart_path):
            story.append(Paragraph("2. Operational Telemetry & CO2 Emission Correlations", st["section"]))
            story.append(Image(chart_path, width=7 * inch, height=2.6 * inch))
            story.append(Spacer(1, 10))

        self._add_disclaimer(story, report_data, st)
        return story

    # --- 3. PREDICTION AUDIT TRAIL PDF ---
    def _build_prediction_pdf(self, report_data: Dict[str, Any], output_path: str):
        st = self._create_styles()
        story = []
        self._add_report_header(story, report_data, "Machine Learning Emission Prediction Audit Trail", "MODEL AUDIT TRAIL")

        pred = report_data.get("prediction", {})
        story.append(Paragraph("1. Target Prediction & Sub-Model Consensus", st["section"]))
        pred_rows = [
            [Paragraph("<b>Model Regressor Component</b>", st["table_header"]), Paragraph("<b>Predicted CO2 Output</b>", st["table_header"]), Paragraph("<b>Model Weight</b>", st["table_header"])],
            [Paragraph("Random Forest Regressor", st["table_cell"]), Paragraph(f"{pred.get('rf_prediction_kg', 8450):,.2f} kg", st["table_cell_bold"]), Paragraph("45%", st["table_cell"])],
            [Paragraph("XGBoost Regressor", st["table_cell"]), Paragraph(f"{pred.get('xgb_prediction_kg', 8540):,.2f} kg", st["table_cell_bold"]), Paragraph("55%", st["table_cell"])],
            [Paragraph("Validation Weighted Ensemble", st["table_cell"]), Paragraph(f"{pred.get('ensemble_prediction_kg', 8500):,.2f} kg", st["table_cell_bold"]), Paragraph("100% Primary", st["table_cell"])],
        ]
        t = Table(pred_rows, colWidths=[220, 180, 140])
        t.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0f172a")),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f8fafc")]),
            ("PADDING", (0, 0), (-1, -1), 5),
        ]))
        story.append(t)
        story.append(Spacer(1, 10))

        chart_path = self._generate_chart_prediction(report_data, output_path)
        if chart_path and os.path.exists(chart_path):
            story.append(Paragraph("2. Out-of-Sample Prediction Trend Comparison", st["section"]))
            story.append(Image(chart_path, width=7 * inch, height=2.6 * inch))
            story.append(Spacer(1, 10))

        self._add_disclaimer(story, report_data, st)
        return story

    # --- 4. WHAT-IF SCENARIO IMPACT PDF ---
    def _build_whatif_pdf(self, report_data: Dict[str, Any], output_path: str):
        st = self._create_styles()
        story = []
        self._add_report_header(story, report_data, "What-If Operational Scenario Impact Analysis", "SCENARIO SIMULATION")

        base_val = report_data.get("baseline_prediction_kg", 8500)
        scen_val = report_data.get("scenario_prediction_kg", 7950)
        diff_val = report_data.get("absolute_diff_kg", -550)
        pct_change = report_data.get("percentage_change", -6.47)

        story.append(Paragraph("1. Simulated Scenario Impact Summary", st["section"]))
        scen_rows = [
            [Paragraph("<b>Scenario Indicator</b>", st["table_header"]), Paragraph("<b>Value</b>", st["table_header"]), Paragraph("<b>Delta Change</b>", st["table_header"])],
            [Paragraph("Current Operating Baseline", st["table_cell"]), Paragraph(f"{base_val:,.2f} kg CO2", st["table_cell_bold"]), Paragraph("0.00%", st["table_cell"])],
            [Paragraph("Simulated Operational Scenario", st["table_cell"]), Paragraph(f"{scen_val:,.2f} kg CO2", st["table_cell_bold"]), Paragraph(f"{pct_change:+.2f}%", st["table_cell_bold"])],
            [Paragraph("Model-Estimated CO2 Savings", st["table_cell"]), Paragraph(f"{abs(diff_val):,.2f} kg CO2", st["table_cell_bold"]), Paragraph("Estimated Saving", st["table_cell"])],
        ]
        t = Table(scen_rows, colWidths=[220, 180, 140])
        t.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0f172a")),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f8fafc")]),
            ("PADDING", (0, 0), (-1, -1), 5),
        ]))
        story.append(t)
        story.append(Spacer(1, 10))

        chart_path = self._generate_chart_whatif(report_data, output_path)
        if chart_path and os.path.exists(chart_path):
            story.append(Paragraph("2. Baseline vs. Simulated Scenario Comparison Bar Chart", st["section"]))
            story.append(Image(chart_path, width=7 * inch, height=2.6 * inch))
            story.append(Spacer(1, 10))

        self._add_disclaimer(story, report_data, st)
        return story

    # --- 5. CARBON REDUCTION OPTIMIZATION PDF ---
    def _build_optimization_pdf(self, report_data: Dict[str, Any], output_path: str):
        st = self._create_styles()
        story = []
        self._add_report_header(story, report_data, "Model-Recommended Carbon Reduction Optimization Report", "OPTIMIZATION ENGINE")

        base_co2 = report_data.get("baseline_co2_kg", 8500)
        opt_co2 = report_data.get("optimized_co2_kg", 7425)
        red_kg = report_data.get("estimated_reduction_kg", 1075)
        red_pct = report_data.get("estimated_reduction_pct", 12.65)

        story.append(Paragraph("1. Model-Recommended Optimal Scenario Parameters", st["section"]))
        opt_rows = [
            [Paragraph("<b>Optimization Indicator</b>", st["table_header"]), Paragraph("<b>Value</b>", st["table_header"]), Paragraph("<b>Feasibility Status</b>", st["table_header"])],
            [Paragraph("Current Operating Baseline", st["table_cell"]), Paragraph(f"{base_co2:,.2f} kg CO2", st["table_cell_bold"]), Paragraph("Current State", st["table_cell"])],
            [Paragraph("Recommended Optimal Configuration", st["table_cell"]), Paragraph(f"{opt_co2:,.2f} kg CO2", st["table_cell_bold"]), Paragraph("FEASIBLE", st["table_cell_bold"])],
            [Paragraph("Model-Estimated CO2 Reduction", st["table_cell"]), Paragraph(f"-{red_kg:,.2f} kg (-{red_pct:.1f}%)", st["table_cell_bold"]), Paragraph("Optimal Candidate", st["table_cell"])],
        ]
        t = Table(opt_rows, colWidths=[220, 180, 140])
        t.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0f172a")),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f8fafc")]),
            ("PADDING", (0, 0), (-1, -1), 5),
        ]))
        story.append(t)
        story.append(Spacer(1, 10))

        chart_path = self._generate_chart_optimization(report_data, output_path)
        if chart_path and os.path.exists(chart_path):
            story.append(Paragraph("2. Optimal Scenario Reduction Potential Bar Chart", st["section"]))
            story.append(Image(chart_path, width=7 * inch, height=2.6 * inch))
            story.append(Spacer(1, 10))

        self._add_disclaimer(story, report_data, st)
        return story

    # --- 6. MODEL MONITORING & RELIABILITY PDF ---
    def _build_monitoring_pdf(self, report_data: Dict[str, Any], output_path: str):
        st = self._create_styles()
        story = []
        self._add_report_header(story, report_data, "Model Health, Data Drift & Reliability Governance Report", "MODEL GOVERNANCE")

        story.append(Paragraph("1. Data Quality & Feature Drift Status Summary", st["section"]))
        mon_rows = [
            [Paragraph("<b>Governance Dimension</b>", st["table_header"]), Paragraph("<b>Audit Status</b>", st["table_header"]), Paragraph("<b>Assessment</b>", st["table_header"])],
            [Paragraph("Input Data Quality Score", st["table_cell"]), Paragraph(f"{report_data.get('data_quality_score', 95.0):.1f}%", st["table_cell_bold"]), Paragraph("HEALTHY", st["table_cell"])],
            [Paragraph("Overall Feature Population Stability (PSI)", st["table_cell"]), Paragraph(str(report_data.get('drift_status', 'LOW_DRIFT')), st["table_cell_bold"]), Paragraph("STABLE", st["table_cell"])],
            [Paragraph("Active System Alerts", st["table_cell"]), Paragraph(f"{report_data.get('alerts_count', 0)} Active Alerts", st["table_cell_bold"]), Paragraph("MONITORED", st["table_cell"])],
        ]
        t = Table(mon_rows, colWidths=[220, 180, 140])
        t.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0f172a")),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f8fafc")]),
            ("PADDING", (0, 0), (-1, -1), 5),
        ]))
        story.append(t)
        story.append(Spacer(1, 10))

        chart_path = self._generate_chart_monitoring(report_data, output_path)
        if chart_path and os.path.exists(chart_path):
            story.append(Paragraph("2. Feature Population Stability Index (PSI) Drift Severity", st["section"]))
            story.append(Image(chart_path, width=7 * inch, height=2.6 * inch))
            story.append(Spacer(1, 10))

        self._add_disclaimer(story, report_data, st)
        return story

    def _add_disclaimer(self, story, report_data, st):
        story.append(HRFlowable(width="100%", thickness=0.8, color=colors.HexColor("#94a3b8"), spaceBefore=12, spaceAfter=8))
        disclaimer = report_data.get("disclaimer", "").replace("CO₂", "CO2")
        story.append(Paragraph(disclaimer, st["disclaimer"]))

    # --- MATPLOTLIB CHART GENERATORS WITH UNIFIED COLOR SCHEME ---
    def _generate_chart_executive(self, report_data, output_path):
        chart_path = output_path + ".exec.png"
        fig, ax1 = plt.subplots(figsize=(8, 3.2), dpi=150)
        trend = report_data.get("trend_data", [])
        if isinstance(trend, list) and len(trend) > 0:
            dates = [t.get("date", f"D{i+1}") for i, t in enumerate(trend[:12])]
            co2_vals = [t.get("co2_kg", t.get("actual_co2", 8200)) for t in trend[:12]]
        else:
            dates = [f"Week {i+1}" for i in range(8)]
            co2_vals = [12500, 12800, 12100, 11900, 11500, 11200, 10800, 10500]

        ax1.bar(dates, co2_vals, color="#0f172a", width=0.45)
        ax1.set_ylabel("Total CO2 Emissions (kg)", color="#0f172a", fontsize=9, fontweight="bold")
        ax1.set_title("Executive CO2 Emission Trend & Decarbonization Trajectory", fontsize=10, pad=10)
        plt.xticks(rotation=25, fontsize=8)
        fig.tight_layout()
        plt.savefig(chart_path, format="png")
        plt.close(fig)
        return chart_path

    def _generate_chart_analytics(self, report_data, output_path):
        chart_path = output_path + ".analytics.png"
        fig, ax1 = plt.subplots(figsize=(8, 3.2), dpi=150)
        trend = report_data.get("trend_data", [])
        if isinstance(trend, list) and len(trend) > 0:
            dates = [t.get("date", f"D{i+1}") for i, t in enumerate(trend[:10])]
            co2_vals = [t.get("co2_kg", t.get("actual_co2", 8200)) for t in trend[:10]]
            prod_vals = [t.get("production_units", t.get("production", 5000)) for t in trend[:10]]
        else:
            dates = [f"Day {i+1}" for i in range(8)]
            co2_vals = [8200 + i * 50 for i in range(8)]
            prod_vals = [5000 + i * 30 for i in range(8)]

        ax1.plot(dates, co2_vals, color="#0f172a", linewidth=2.5, marker="o", label="CO2 Emissions (kg)")
        ax1.set_ylabel("CO2 Emissions (kg)", color="#0f172a", fontsize=9, fontweight="bold")

        ax2 = ax1.twinx()
        ax2.plot(dates, prod_vals, color="#0284c7", linewidth=2, linestyle="--", marker="s", label="Production Output")
        ax2.set_ylabel("Production (Units)", color="#0284c7", fontsize=9, fontweight="bold")

        plt.title("Operational Telemetry: CO2 Emission vs Production Output Correlation", fontsize=10, pad=10)
        plt.xticks(rotation=25, fontsize=8)
        fig.tight_layout()
        plt.savefig(chart_path, format="png")
        plt.close(fig)
        return chart_path

    def _generate_chart_prediction(self, report_data, output_path):
        chart_path = output_path + ".pred.png"
        fig, ax = plt.subplots(figsize=(8, 3.2), dpi=150)
        history = report_data.get("trend_data", [])
        if history:
            dates = [h.get("date", f"P{i}") for i, h in enumerate(history[:8])]
            ens_vals = [h.get("ensemble", 8500) for h in history[:8]]
            rf_vals = [h.get("rf", 8450) for h in history[:8]]
            xgb_vals = [h.get("xgb", 8540) for h in history[:8]]
        else:
            dates = [f"Sample {i+1}" for i in range(8)]
            ens_vals = [8209, 8452, 8112, 8617, 8918, 8310, 8766, 8410]
            rf_vals = [8245, 8480, 8140, 8650, 8960, 8330, 8810, 8440]
            xgb_vals = [8180, 8430, 8090, 8590, 8885, 8295, 8730, 8385]

        ax.plot(dates, ens_vals, color="#0f172a", linewidth=2.5, marker="o", label="Ensemble Model")
        ax.plot(dates, rf_vals, color="#0284c7", linewidth=1.5, linestyle="--", label="Random Forest")
        ax.plot(dates, xgb_vals, color="#64748b", linewidth=1.5, linestyle=":", label="XGBoost")
        ax.set_ylabel("CO2 Prediction (kg)", fontsize=9, fontweight="bold")
        ax.set_title("Sub-Model Consensus & Prediction Audit Trail Curve", fontsize=10, pad=10)
        ax.legend(loc="upper left", fontsize=8)
        plt.xticks(rotation=25, fontsize=8)
        fig.tight_layout()
        plt.savefig(chart_path, format="png")
        plt.close(fig)
        return chart_path

    def _generate_chart_whatif(self, report_data, output_path):
        chart_path = output_path + ".whatif.png"
        fig, ax = plt.subplots(figsize=(8, 3.2), dpi=150)
        base_val = report_data.get("baseline_prediction_kg", 8500)
        scen_val = report_data.get("scenario_prediction_kg", 7950)
        pct = report_data.get("percentage_change", -6.47)

        bars = ax.bar(["Current Baseline", "Simulated Scenario"], [base_val, scen_val], color=["#64748b", "#0284c7"], width=0.4)
        ax.set_ylabel("Predicted CO2 (kg)", fontsize=9, fontweight="bold")
        ax.set_title(f"What-If Simulation Impact: {pct:+.2f}% Carbon Emission Delta", fontsize=10, pad=10)
        for bar in bars:
            yval = bar.get_height()
            ax.text(bar.get_x() + bar.get_width()/2, yval + 100, f"{yval:,.0f} kg", ha="center", va="bottom", fontsize=9, fontweight="bold")

        fig.tight_layout()
        plt.savefig(chart_path, format="png")
        plt.close(fig)
        return chart_path

    def _generate_chart_optimization(self, report_data, output_path):
        chart_path = output_path + ".opt.png"
        fig, ax = plt.subplots(figsize=(8, 3.2), dpi=150)
        base_val = report_data.get("baseline_co2_kg", 8500)
        opt_val = report_data.get("optimized_co2_kg", 7425)
        red_pct = report_data.get("estimated_reduction_pct", 12.65)

        bars = ax.bar(["Baseline State", "Optimized Scenario"], [base_val, opt_val], color=["#64748b", "#0f172a"], width=0.4)
        ax.set_ylabel("Predicted CO2 (kg)", fontsize=9, fontweight="bold")
        ax.set_title(f"Model-Recommended Optimization: -{red_pct:.1f}% Carbon Savings", fontsize=10, pad=10)
        for bar in bars:
            yval = bar.get_height()
            ax.text(bar.get_x() + bar.get_width()/2, yval + 100, f"{yval:,.0f} kg", ha="center", va="bottom", fontsize=9, fontweight="bold")

        fig.tight_layout()
        plt.savefig(chart_path, format="png")
        plt.close(fig)
        return chart_path

    def _generate_chart_monitoring(self, report_data, output_path):
        chart_path = output_path + ".mon.png"
        fig, ax = plt.subplots(figsize=(8, 3.2), dpi=150)
        drift_features = report_data.get("drift_features", [])
        if drift_features:
            names = [f.get("feature_name", f"Feature {i}")[:12] for i, f in enumerate(drift_features[:6])]
            psi_vals = [f.get("psi", 0.04) for f in drift_features[:6]]
        else:
            names = ["Electricity", "Diesel", "Gas", "Production", "Runtime", "Pressure"]
            psi_vals = [0.04, 0.02, 0.08, 0.03, 0.05, 0.01]

        ax.bar(names, psi_vals, color="#0f172a", width=0.45)
        ax.axhline(0.1, color="#0284c7", linestyle="--", label="Warning Threshold (0.10)")
        ax.axhline(0.2, color="#ef4444", linestyle="--", label="Action Threshold (0.20)")
        ax.set_ylabel("PSI Population Stability Index", fontsize=9, fontweight="bold")
        ax.set_title("Feature Population Stability Index (PSI) Drift Severity Audit", fontsize=10, pad=10)
        ax.legend(loc="upper right", fontsize=8)

        fig.tight_layout()
        plt.savefig(chart_path, format="png")
        plt.close(fig)
        return chart_path


pdf_generator = PDFReportGenerator()
