# Industrial Carbon Emission Prediction System — Bug Report & Resolution Log (Phase 16)

## Overview
This document records all bugs discovered during the Phase 16 system audit, including root causes, severity classification, reproduction steps, code fixes, and post-fix regression testing status.

---

## Bug Index & Classification Summary

| Bug ID | Description | Severity | Target Module | Status |
|---|---|---|---|---|
| **BUG-001** | Axios CORS Network Error on custom development ports (e.g. `5174`) | **HIGH** | `backend/app/main.py` | **FIXED & VERIFIED** |
| **BUG-002** | `MultipleResultsFound` exception during monitoring alert deduplication | **HIGH** | `backend/app/monitoring/alert_service.py` | **FIXED & VERIFIED** |
| **BUG-003** | Plant ID validation failure when non-numeric strings are passed in query params | **MEDIUM** | `frontend/src/services/dashboardApi.js` | **FIXED & VERIFIED** |

---

## Detailed Bug Reports

### BUG-001: CORS Origin Rejection on Port 5174
- **Severity**: HIGH
- **Module**: `backend/app/main.py`
- **Description**: Frontend running on Vite port `5174` failed to fetch dashboard API responses, triggering an Axios "Network Error" banner.
- **Steps to Reproduce**:
  1. Launch Vite frontend server on secondary port `5174`.
  2. Attempt to fetch `/api/dashboard/overview`.
  3. Observe CORS preflight block in browser console.
- **Root Cause**: `CORSMiddleware` in `main.py` hardcoded `allow_origins=["http://localhost:5173", ...]` without matching port `5174` or dynamic port regex.
- **Fix Applied**: Added `http://localhost:5174`, `http://127.0.0.1:5174` to `allow_origins` and updated `allow_origin_regex=r"http://localhost:\d+|http://127\.0\.0\.1:\d+|https://.*"` in `backend/app/main.py`.
- **Verification**: `curl -i -H "Origin: http://localhost:5174" http://localhost:8000/api/health` returned HTTP 200 with `Access-Control-Allow-Origin: http://localhost:5174`.

---

### BUG-002: Monitoring Alert Deduplication `MultipleResultsFound` Crash
- **Severity**: HIGH
- **Module**: `backend/app/monitoring/alert_service.py`
- **Description**: Running system monitoring cycle via `POST /api/monitoring/run` returned HTTP 500 Internal Server Error when multiple active alerts existed in the database.
- **Steps to Reproduce**:
  1. Trigger monitoring cycle `POST /api/monitoring/run`.
  2. Observe HTTP 500 error when duplicate active alerts exist.
- **Root Cause**: `alert_service.create_alert_if_not_exists()` invoked `.scalar_one_or_none()` on a query returning multiple matching alert records.
- **Fix Applied**: Replaced `.scalar_one_or_none()` with `.scalars().first()` in `alert_service.py`.
- **Verification**: Executed pytest suite `tests/test_monitoring.py::test_1_run_monitoring_cycle` — passed with HTTP 201 Created.

---

### BUG-003: Plant ID String Parameter Parsing Exception
- **Severity**: MEDIUM
- **Module**: `frontend/src/services/dashboardApi.js`
- **Description**: Passing non-integer plant filter values (e.g. `'all'`, `'abc'`) resulted in 422 Unprocessable Entity backend responses.
- **Steps to Reproduce**:
  1. Select `'All Plants'` in Dashboard header filter.
  2. Verify API request params.
- **Root Cause**: Raw string value was attached to `params.plant_id` without validation.
- **Fix Applied**: Implemented integer sanitization `parseInt(plantId, 10)` before populating `params.plant_id`.
- **Verification**: Tested API service payload format — invalid string values correctly fall back to fetching overall multi-plant metrics.
