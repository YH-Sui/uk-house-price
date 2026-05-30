"""Tests for the UK House Price API."""
import pandas as pd
import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch

from app.data.loader import load_hpi_data
from app.main import app

client = TestClient(app)

FAKE_DF = pd.DataFrame({
    "date": pd.to_datetime(["2020-01-01", "2020-02-01", "2020-03-01"]),
    "region_name": ["London", "London", "Manchester"],
    "area_code": ["E12000007", "E12000007", "E12000002"],
    "average_price": [500000.0, 510000.0, 220000.0],
    "detached_price": [900000.0, 910000.0, 350000.0],
    "semi_detached_price": [600000.0, 605000.0, 240000.0],
    "terraced_price": [500000.0, 505000.0, 200000.0],
    "flat_price": [400000.0, 405000.0, 180000.0],
    "sales_volume": [5000, 5100, 2000],
})


@pytest.fixture(autouse=True)
def clear_lru_cache():
    load_hpi_data.cache_clear()
    yield
    load_hpi_data.cache_clear()


def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


@patch("app.api.regions.get_regions", return_value=["London", "Manchester"])
def test_regions_returns_sorted_list(mock_regions):
    response = client.get("/api/v1/regions/")
    assert response.status_code == 200
    data = response.json()
    assert data["regions"] == sorted(data["regions"])
    assert "London" in data["regions"]


@patch("app.api.prices.load_hpi_data", return_value=FAKE_DF)
def test_prices_all_types(mock_df):
    response = client.get("/api/v1/prices/?region=London")
    assert response.status_code == 200
    data = response.json()
    assert data["region"] == "London"
    assert data["count"] == 2
    assert data["data"][0]["average_price"] == 500000.0


@patch("app.api.prices.load_hpi_data", return_value=FAKE_DF)
def test_prices_by_property_type(mock_df):
    response = client.get("/api/v1/prices/?region=London&property_type=flat")
    assert response.status_code == 200
    data = response.json()
    assert data["property_type"] == "flat"
    assert data["data"][0]["flat_price"] == 400000.0


@patch("app.api.prices.load_hpi_data", return_value=FAKE_DF)
def test_prices_date_filter(mock_df):
    response = client.get("/api/v1/prices/?region=London&date_from=2020-02-01")
    assert response.status_code == 200
    data = response.json()
    assert data["count"] == 1
    assert data["data"][0]["date"] == "2020-02-01"


@patch("app.api.prices.load_hpi_data", return_value=FAKE_DF)
def test_prices_unknown_region_404(mock_df):
    response = client.get("/api/v1/prices/?region=Narnia")
    assert response.status_code == 404


@patch("app.api.prices.load_hpi_data", return_value=FAKE_DF)
def test_prices_invalid_property_type_400(mock_df):
    response = client.get("/api/v1/prices/?region=London&property_type=castle")
    assert response.status_code == 400
