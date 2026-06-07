from pydantic import BaseModel
from typing import Optional
 
 
class PricePoint(BaseModel):
    """A single data point in a price time series."""
    date: str          # "YYYY-MM-DD"
    average_price: Optional[float] = None
    detached_price: Optional[float] = None
    semi_detached_price: Optional[float] = None
    terraced_price: Optional[float] = None
    flat_price: Optional[float] = None
    sales_volume: Optional[int] = None
 
 
class PriceSeriesResponse(BaseModel):
    """Response wrapper for a price time series query."""
    region: str
    property_type: Optional[str] = None   # None means "all types"
    count: int
    data: list[PricePoint]