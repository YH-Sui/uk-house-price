from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import prices, regions, health
from app.core.config import settings

app = FastAPI(
    title="UK House Prices API",
    description="Historical UK house price data by region and property type.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, tags=["health"])
app.include_router(prices.router, prefix="/api/v1/prices", tags=["prices"])
app.include_router(regions.router, prefix="/api/v1/regions", tags=["regions"])
