"""
UK HPI data loader.

Reads the raw CSV once, cleans it, and caches the result in memory.
Subsequent calls return the cached DataFrame instantly.
"""

from __future__ import annotations

import logging
from functools import lru_cache
from pathlib import Path

import pandas as pd

from app.core.config import settings

logger = logging.getLogger(__name__)

# Columns we actually need from the raw CSV - everything else is dropped
KEEP_COLUMNS = {
    "Date": "date",
    "RegionName": "region_name",
    "AreaCode": "area_code",
    "AveragePrice": "average_price",
    "DetachedPrice": "detached_price",
    "SemiDetachedPrice": "semi_detached_price",
    "TerracedPrice": "terraced_price",
    "FlatPrice": "flat_price",
    "SalesVolume": "sales_volume",
}


@lru_cache(maxsize=1)
def load_hpi_data() -> pd.DataFrame:
    """
    Load, clean and cache the UK HPI dataset.

    lru_cache(maxsize=1) means this function only runs once per process.
    Every subsequent call returns the same DataFrame from memory — no disk I/O.
    """
    path = Path(settings.DATA_PATH)

    if not path.exists():
        raise FileNotFoundError(
            f"UK HPI data file not found at {path}. "
            "Download from https://www.gov.uk/government/collections/uk-house-price-index-reports "
            "and place it at the configured DATA_PATH."
        )

    logger.info(f"Loading UK HPI data from {path}")

    # Read only the columns we need — faster on a 59MB file
    raw_cols = list(KEEP_COLUMNS.keys())
    df = pd.read_csv(path, usecols=raw_cols)

    # Rename to snake_case
    df = df.rename(columns=KEEP_COLUMNS)

    # Parse dates — the CSV uses format "01/01/1995"
    df["date"] = pd.to_datetime(df["date"], dayfirst=True)

    # Drop rows with no region name (malformed rows at end of some CSVs)
    df = df.dropna(subset=["region_name"])

    # Sort chronologically
    df = df.sort_values("date").reset_index(drop=True)

    logger.info(f"Loaded {len(df):,} rows covering {df['date'].min().date()} to {df['date'].max().date()}")

    return df


def get_regions() -> list[str]:
    """Return a sorted list of all unique region names."""
    df = load_hpi_data()
    return sorted(df["region_name"].unique().tolist())