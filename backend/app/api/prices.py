from fastapi import APIRouter, Query
from typing import Literal

from app.models.price import PriceSeriesResponse

router = APIRouter()

PropertyType = Literal["flat", "terraced", "semi_detached", "detached", "all"]


@router.get("/", response_model=PriceSeriesResponse)
def get_prices(
    region: str = Query(..., description="Region or sub-region name, e.g. 'London'"),
    property_type: PropertyType = Query("all", description="Property type filter"),
    date_from: str = Query("1995-01", description="Start date (YYYY-MM)"),
    date_to: str = Query(None, description="End date (YYYY-MM), defaults to latest"),
    indexed: bool = Query(False, description="Return index (base=100 at date_from)"),
):
    """Return monthly average house prices for a given region and property type."""
    # TODO: wire up data layer
    return PriceSeriesResponse(region=region, property_type=property_type, series=[])
