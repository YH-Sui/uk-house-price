from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    ENV: str = "development"
    DATA_DIR: str = "./data"
    ALLOWED_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
    ]
    ANTHROPIC_API_KEY: str = ""

    class Config:
        env_file = ".env"


settings = Settings()
