import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "DealFlow360"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./dealflow360.db")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "dev_secret_key_change_in_production_12345")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
