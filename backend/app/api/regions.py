from fastapi import APIRouter

router = APIRouter()


@router.get("/")
def list_regions():
    """Return all available regions and sub-regions."""
    return {"regions": []}


@router.get("/london/boroughs")
def list_london_boroughs():
    """Return all London boroughs available in the dataset."""
    return {"boroughs": []}
