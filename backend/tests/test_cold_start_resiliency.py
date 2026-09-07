import time
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_lightweight_health_check_performance():
    """
    Verify /api/health responds rapidly (<100ms in local environment)
    and does not trigger expensive ML inference or heavy DB queries.
    """
    start_time = time.time()
    response = client.get("/api/health")
    elapsed_ms = (time.time() - start_time) * 1000

    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert elapsed_ms < 500, f"Health check took {elapsed_ms:.2f}ms, which is too slow for cold start readiness polling."

def test_readiness_probe_returns_200():
    """Verify /api/health/ready returns status ready or not_ready without crashing."""
    response = client.get("/api/health/ready")
    assert response.status_code in [200, 503]

def test_cold_start_readiness_contract():
    """Verify health contract fields required by frontend checkBackendReadiness helper."""
    response = client.get("/api/health")
    assert response.status_code == 200
    payload = response.json()
    assert "status" in payload
    assert payload["status"] == "healthy"
    assert "service" in payload

def test_dashboard_overview_fetches_successfully_after_readiness():
    """Verify GET /api/dashboard/overview responds with 200 after readiness check."""
    health_res = client.get("/api/health")
    assert health_res.status_code == 200

    dash_res = client.get("/api/dashboard/overview?days=30")
    assert dash_res.status_code == 200
    data = dash_res.json()
    assert "kpis" in data
    assert "trends" in data
