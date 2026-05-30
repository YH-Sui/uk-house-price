from fastapi import APIRouter
from pydantic import BaseModel

from app.data.loader import get_regions

router = APIRouter()


class RegionsResponse(BaseModel):
    regions: list[str]
    count: int


@router.get("/", response_model=RegionsResponse)
def list_regions():
    """
    Return the sorted list of all unique region names in the dataset.
    Use one of these as the `region` parameter in /api/v1/prices.
    """
    regions = get_regions()
    return RegionsResponse(regions=regions, count=len(regions))