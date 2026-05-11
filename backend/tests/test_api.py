import pytest
import pandas as pd
from app.data.loader import load_hpi_data, get_regions


def test_load_hpi_data_returns_dataframe():
    df = load_hpi_data()
    assert isinstance(df, pd.DataFrame)


def test_load_hpi_data_has_expected_columns():
    df = load_hpi_data()
    expected = {"date", "region_name", "area_code", "average_price"}
    assert expected.issubset(df.columns)


def test_load_hpi_data_date_column_is_datetime():
    df = load_hpi_data()
    assert pd.api.types.is_datetime64_any_dtype(df["date"])


def test_load_hpi_data_no_null_regions():
    df = load_hpi_data()
    assert df["region_name"].isna().sum() == 0


def test_load_hpi_data_sorted_by_date():
    df = load_hpi_data()
    assert df["date"].is_monotonic_increasing


def test_get_regions_returns_list_of_strings():
    regions = get_regions()
    assert isinstance(regions, list)
    assert len(regions) > 0
    assert all(isinstance(r, str) for r in regions)


def test_get_regions_includes_london():
    regions = get_regions()
    assert any("London" in r for r in regions)