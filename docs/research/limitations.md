# Known Model & System Limitations — Phase 16 Audit

## Overview
This document outlines the known technical, data, and operational limitations of the current implementation.

---

## 1. Machine Learning Limitations
- **Out-of-Distribution (OOD) Inputs**: Inputs exceeding the historical training range (e.g. extreme operational values $> 3 \times \sigma$) require explicit warning notices. The system displays an OOD flag rather than asserting guaranteed prediction precision.
- **Static Ensemble Weights**: Ensemble weights ($0.45 \text{ RF} / 0.55 \text{ XGB}$) are static post-training and require retraining cycles when facility operational dynamics change significantly.

---

## 2. System & Operational Limitations
- **PDF Report Rendering**: ReportLab PDF generation executes synchronously on CPU workers. High-concurrency report requests should be queued via async workers in future phases.
- **Plant Data Isolation**: Currently enforced at application database query level (`authorization_service`). Multi-tenant database schema partitioning can be added in future scalability phases.
