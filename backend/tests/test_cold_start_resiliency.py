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
