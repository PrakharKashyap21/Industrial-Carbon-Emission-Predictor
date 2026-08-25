"""API endpoints package."""
from app.api.health import router as health_router
from app.api.plants import router as plants_router
from app.api.readings import router as readings_router
from app.api.predictions import router as predictions_router
from app.api.explanations import router as explanations_router
from app.api.what_if import router as what_if_router
from app.api.dashboard import router as dashboard_router

__all__ = [
    "health_router",
    "plants_router",
    "readings_router",
    "predictions_router",
    "explanations_router",
    "what_if_router",
    "dashboard_router",
]
