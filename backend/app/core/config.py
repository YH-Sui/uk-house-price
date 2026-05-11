from pydantic_settings import BaseSettings, SettingsConfigDict
from pathlib import Path

# Project root is 2 levels up from this file (backend/app/core/config.py)
_PROJECT_ROOT = Path(__file__).resolve().parents[3]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    APP_NAME: str = "UK House Price API"
    DEBUG: bool = False

    # Path to the UK HPI CSV — override via DATA_PATH env var in Docker/Railway
    DATA_PATH: str = str(_PROJECT_ROOT / "data" / "UK-HPI-full-file-2024-11.csv")


settings = Settings()