from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_prices_requires_region():
    response = client.get("/api/v1/prices/")
    assert response.status_code == 422


def test_prices_returns_series():
    response = client.get("/api/v1/prices/?region=London")
    assert response.status_code == 200
    body = response.json()
    assert "series" in body
    assert body["region"] == "London"
