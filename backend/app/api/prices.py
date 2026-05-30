from fastapi import APIRouter, HTTPException, Query

from app.data.loader import load_hpi_data
from app.models.price import PricePoint, PriceSeriesResponse

router = APIRouter()

PROPERTY_TYPE_COLUMNS = {
    "detached": "detached_price",
    "semi_detached": "semi_detached_price",
    "terraced": "terraced_price",
    "flat": "flat_price",
}


@router.get("/", response_model=PriceSeriesResponse)
def get_prices(
    region: str = Query(..., description="Region name, e.g. 'City of London'"),
    property_type: str | None = Query(
        None,
        description="One of: detached, semi_detached, terraced, flat. Omit for all-types average.",
    ),
    date_from: str | None = Query(None, description="Start date inclusive, YYYY-MM-DD"),
    date_to: str | None = Query(None, description="End date inclusive, YYYY-MM-DD"),
):
    if property_type and property_type not in PROPERTY_TYPE_COLUMNS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid property_type '{property_type}'. "
                   f"Choose from: {', '.join(PROPERTY_TYPE_COLUMNS.keys())}",
        )

    df = load_hpi_data()

    mask = df["region_name"].str.lower() == region.strip().lower()
    filtered = df[mask]

    if filtered.empty:
        raise HTTPException(
            status_code=404,
            detail=f"No data found for region '{region}'. "
                   "Use /api/v1/regions to see available regions.",
        )

    if date_from:
        filtered = filtered[filtered["date"] >= date_from]
    if date_to:
        filtered = filtered[filtered["date"] <= date_to]

    if filtered.empty:
        raise HTTPException(
            status_code=404,
            detail="No data found for the given date range.",
        )

    def _safe_float(val):
        try:
            f = float(val)
            return None if (f != f) else round(f, 2)
        except (TypeError, ValueError):
            return None

    def _safe_int(val):
        try:
            f = float(val)
            return None if (f != f) else int(f)
        except (TypeError, ValueError):
            return None

    points = []
    for _, row in filtered.iterrows():
        points.append(
            PricePoint(
                date=str(row["date"])[:10],
                average_price=_safe_float(row.get("average_price")),
                detached_price=_safe_float(row.get("detached_price")),
                semi_detached_price=_safe_float(row.get("semi_detached_price")),
                terraced_price=_safe_float(row.get("terraced_price")),
                flat_price=_safe_float(row.get("flat_price")),
                sales_volume=_safe_int(row.get("sales_volume")),
            )
        )

    return PriceSeriesResponse(
        region=region,
        property_type=property_type,
        data=points,
        count=len(points),
    )