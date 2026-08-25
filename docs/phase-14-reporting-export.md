# Phase 14 Report: Reporting, Export & Executive Report System

## 1. Executive Summary
Phase 14 transforms the **Industrial Carbon Emission Prediction System** into a management-ready reporting platform. Users can generate, preview, and export structured **PDF**, **Excel (XLSX)**, and **CSV** reports across 6 specialized report types: **Prediction**, **What-if Analysis**, **Optimization**, **Analytics**, **Monitoring**, and **Executive Summary**.

---

## 2. Supported Report Types & Formats

| Report Type | Target Audience | Key Contents | Formats |
| :--- | :--- | :--- | :---: |
| **Prediction Report** | Plant Operations / Engineers | Model inputs, predicted CO₂, RF vs XGB predictions, reliability score, top drivers | PDF, XLSX, CSV |
| **What-if Analysis Report** | Process Engineers / Analysts | Baseline vs modified operational scenario, predicted CO₂ change, % delta, interpretation | PDF, XLSX, CSV |
| **Optimization Report** | Plant Managers / Energy Teams | Baseline vs recommended operational scenario, model-estimated reduction, feasibility status | PDF, XLSX, CSV |
| **Analytics Report** | Environmental Managers | Total & Avg CO₂, production output, emission intensity, anomaly count, insights | PDF, XLSX, CSV |
| **Monitoring Report** | Quality Assurance / System Admins | Data quality score, drift status, model performance indicators, active alerts | PDF, XLSX, CSV |
| **Executive Report** | C-Suite / Senior Leadership | Narrative executive summary, high-level KPIs, MoM intensity trends, key findings, disclaimers | PDF, XLSX, CSV |

---

## 3. Architecture & File Storage
- **Database Storage**: Metadata (report type, title, plant, format, status, timestamps, user ID) is persisted in the PostgreSQL `reports` table.
- **File Storage**: PDF, Excel, and CSV files are stored in `backend/storage/reports/` with unique filenames (`carbon_report_{type}_plant{id}_{timestamp}.{ext}`).
- **Server-Side PDF Rendering**: Generated using ReportLab and server-rendered Matplotlib PNG chart buffers.
- **Multi-sheet Excel Workbook**: Generated using OpenPyXL with stylized headers (`#0F172A`), number formatting (`#,##0.00`), auto-fit column widths, freeze panes, and filters.
- **Audit Logging**: Every report generation logs `REPORT_GENERATED` and every file download logs `REPORT_DOWNLOADED`.

---

## 4. API Specification
- `POST /api/reports/generate`: Generate and store PDF / Excel / CSV report
- `POST /api/reports/preview`: Preview report JSON payload prior to generation
- `GET /api/reports`: List report generation history (filtered by plant, report_type, status)
- `GET /api/reports/{id}`: Fetch single report metadata details
- `GET /api/reports/{id}/download`: Download authorized report binary file
