# Phase 13 Report: Authentication, Authorization & Role-Based Access Control (RBAC)

## 1. Executive Summary
Phase 13 equips the **Industrial Carbon Emission Prediction System** with multi-user authentication, JWT session management, bcrypt password hashing, Role-Based Access Control (RBAC), plant-level authorization isolation, and system audit logging.

> **Backend Security Boundary Rule:**
> Backend permission checks and JWT claims validation serve as the actual security boundary. Hiding UI elements on the React frontend is strictly a user-experience enhancement. Every protected endpoint enforces token authentication, role permissions, and plant-level access validation.

---

## 2. Role-Based Access Control (RBAC) Permission Matrix

| System Permission | ADMIN | PLANT_MANAGER | ANALYST | OPERATOR |
| :--- | :---: | :---: | :---: | :---: |
| `VIEW_DASHBOARD` | ✅ | ✅ | ✅ | ✅ |
| `RUN_PREDICTION` | ✅ | ✅ | ✅ | ✅ |
| `RUN_WHAT_IF` | ✅ | ✅ | ✅ | ❌ |
| `RUN_OPTIMIZATION` | ✅ | ✅ | ✅ | ❌ |
| `VIEW_ANALYTICS` | ✅ | ✅ | ✅ | ❌ |
| `VIEW_SHAP` | ✅ | ✅ | ✅ | ❌ |
| `VIEW_MONITORING` | ✅ | ✅ | ✅ | ✅ (Basic) |
| `MANAGE_USERS` | ✅ | ❌ | ❌ | ❌ |
| `MANAGE_PLANTS` | ✅ | ❌ | ❌ | ❌ |
| `VIEW_AUDIT_LOGS` | ✅ | ✅ | ❌ | ❌ |

---

## 3. Seed Users & Default Credentials
- **Admin**: `admin@plant.com` (`admin123`) — Role: `ADMIN`
- **Plant Manager**: `manager@plant.com` (`manager123`) — Role: `PLANT_MANAGER` (Plant #1)
- **Senior Analyst**: `analyst@plant.com` (`analyst123`) — Role: `ANALYST` (Plant #1)
- **Plant Operator**: `operator@plant.com` (`operator123`) — Role: `OPERATOR` (Plant #1)

---

## 4. API Endpoints
- `POST /api/auth/login`: Authenticate credentials & issue JWT Bearer access token
- `GET /api/auth/me`: Retrieve current authenticated user profile & permissions
- `POST /api/auth/logout`: Log out action
- `GET /api/users`: Admin-only list all system users
- `POST /api/users`: Admin-only create new user account
- `PUT /api/users/{id}/status`: Admin-only toggle active/inactive status
- `GET /api/audit/logs`: Query audit trail logs (Admin / Manager)
