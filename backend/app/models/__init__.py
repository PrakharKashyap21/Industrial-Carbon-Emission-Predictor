"""SQLAlchemy models package."""
from app.models.plant import Plant
from app.models.industrial_reading import IndustrialReading
from app.models.prediction import Prediction
from app.models.monitoring import MonitoringSnapshot, DriftResult, MonitoringAlert
from app.models.scenario import Scenario, ScenarioResult
from app.models.optimization import OptimizationRun, OptimizationResult
from app.models.analytics import AnalyticsSnapshot, IndustrialInsight
from app.models.auth import Role, Permission, RolePermission, User, UserPlant, AuditLog
from app.models.report import Report
from app.models.future import PredictionPlaceholder, WhatIfScenarioPlaceholder, AlertPlaceholder

__all__ = [
    "Plant",
    "IndustrialReading",
    "Prediction",
    "MonitoringSnapshot",
    "DriftResult",
    "MonitoringAlert",
    "Scenario",
    "ScenarioResult",
    "OptimizationRun",
    "OptimizationResult",
    "AnalyticsSnapshot",
    "IndustrialInsight",
    "Role",
    "Permission",
    "RolePermission",
    "User",
    "UserPlant",
    "AuditLog",
    "Report",
    "PredictionPlaceholder",
    "WhatIfScenarioPlaceholder",
    "AlertPlaceholder",
]
