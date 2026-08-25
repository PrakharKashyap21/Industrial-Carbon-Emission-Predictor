from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.logging_middleware import RequestLoggingMiddleware
from app.api.health import router as health_router
from app.api.plants import router as plants_router
from app.api.readings import router as readings_router
from app.api.predictions import router as predictions_router
from app.api.explanations import router as explanations_router
from app.api.what_if import router as legacy_what_if_router
from app.api.whatif import router as p10_whatif_router
from app.api.optimization import router as optimization_router
from app.api.analytics import router as analytics_router
from app.api.dashboard import router as dashboard_router
from app.api.monitoring import router as monitoring_router
from app.api.auth import router as auth_router
from app.api.users import router as users_router
from app.api.audit import router as audit_router
from app.api.reports import router as reports_router
from app.database.connection import engine
from app.database.base import Base


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager to safely initialize database tables on startup."""
    try:
        from app import models as _models  # noqa: F401
        Base.metadata.create_all(bind=engine)
    except Exception as e:
        print(f"[Database Warning] Could not connect to default database engine on startup: {e}")
    yield


app = FastAPI(
    title="Industrial Carbon Emission Prediction API",
    description="Backend API for Industrial Carbon Emission Prediction System — Phase 7 (Industrial Dashboard & Analytics)",
    version="7.0.0",
    openapi_url=f"{settings.API_PREFIX}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# Configure CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
    ],
    allow_origin_regex=r"https://.*\.vercel\.app|https://.*\.onrender\.com|https://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(RequestLoggingMiddleware)

# Include Routers with /api prefix
app.include_router(auth_router, prefix=settings.API_PREFIX)
app.include_router(users_router, prefix=settings.API_PREFIX)
app.include_router(audit_router, prefix=settings.API_PREFIX)
app.include_router(reports_router, prefix=settings.API_PREFIX)
app.include_router(health_router, prefix=settings.API_PREFIX)
app.include_router(plants_router, prefix=settings.API_PREFIX)
app.include_router(readings_router, prefix=settings.API_PREFIX)
app.include_router(predictions_router, prefix=settings.API_PREFIX)
app.include_router(explanations_router, prefix=settings.API_PREFIX)
app.include_router(legacy_what_if_router, prefix=settings.API_PREFIX)
app.include_router(p10_whatif_router, prefix=settings.API_PREFIX)
app.include_router(optimization_router, prefix=settings.API_PREFIX)
app.include_router(analytics_router, prefix=settings.API_PREFIX)
app.include_router(dashboard_router, prefix=settings.API_PREFIX)
app.include_router(monitoring_router, prefix=settings.API_PREFIX)


@app.get("/", include_in_schema=False)
async def root():
    """Root redirect / welcome status."""
    return {
        "message": "Welcome to Industrial Carbon Emission Prediction System API",
        "docs": "/docs",
        "health_check": f"{settings.API_PREFIX}/health",
        "dashboard_overview": f"{settings.API_PREFIX}/dashboard/overview",
        "prediction_preview_endpoint": f"{settings.API_PREFIX}/predictions/preview",
        "explanation_endpoint": f"{settings.API_PREFIX}/explanations/prediction",
        "what_if_analyze_endpoint": f"{settings.API_PREFIX}/what-if/analyze",
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG,
    )
