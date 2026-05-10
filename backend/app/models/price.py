from pydantic import BaseModel


class PricePoint(BaseModel):
    date: str
    average_price: float
    volume: int | None = None


class PriceSeriesResponse(BaseModel):
    region: str
    property_type: str
    series: list[PricePoint]
