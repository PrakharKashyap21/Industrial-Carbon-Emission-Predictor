from typing import List, Dict, Set

# System Permissions Constants
VIEW_DASHBOARD = "VIEW_DASHBOARD"
RUN_PREDICTION = "RUN_PREDICTION"
RUN_WHAT_IF = "RUN_WHAT_IF"
RUN_OPTIMIZATION = "RUN_OPTIMIZATION"
VIEW_ANALYTICS = "VIEW_ANALYTICS"
VIEW_SHAP = "VIEW_SHAP"
VIEW_MONITORING = "VIEW_MONITORING"
MANAGE_USERS = "MANAGE_USERS"
MANAGE_PLANTS = "MANAGE_PLANTS"
VIEW_AUDIT_LOGS = "VIEW_AUDIT_LOGS"

ALL_PERMISSIONS: Set[str] = {
    VIEW_DASHBOARD,
    RUN_PREDICTION,
    RUN_WHAT_IF,
    RUN_OPTIMIZATION,
    VIEW_ANALYTICS,
    VIEW_SHAP,
    VIEW_MONITORING,
    MANAGE_USERS,
    MANAGE_PLANTS,
    VIEW_AUDIT_LOGS,
}

# Role to Permissions Mapping Matrix
ROLE_PERMISSIONS: Dict[str, Set[str]] = {
    "ADMIN": ALL_PERMISSIONS,
    "PLANT_MANAGER": {
        VIEW_DASHBOARD,
        RUN_PREDICTION,
        RUN_WHAT_IF,
        RUN_OPTIMIZATION,
        VIEW_ANALYTICS,
        VIEW_SHAP,
        VIEW_MONITORING,
        VIEW_AUDIT_LOGS,
    },
    "ANALYST": {
        VIEW_DASHBOARD,
        RUN_PREDICTION,
        RUN_WHAT_IF,
        RUN_OPTIMIZATION,
        VIEW_ANALYTICS,
        VIEW_SHAP,
        VIEW_MONITORING,
    },
    "OPERATOR": {
        VIEW_DASHBOARD,
        RUN_PREDICTION,
        VIEW_MONITORING,
    },
}


def has_permission(role_name: str, permission: str) -> bool:
    """Check whether a given role is granted a specific permission."""
    if not role_name or not permission:
        return False
    granted = ROLE_PERMISSIONS.get(role_name.upper(), set())
    return permission in granted
