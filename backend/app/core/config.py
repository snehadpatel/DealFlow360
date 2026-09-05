import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "DealFlow360"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./dealflow360.db")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "dev_secret_key_change_in_production_12345")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

    # --- AI / LLM narration layer ---
    # The glass-box AI computes every number in pure Python; the LLM only
    # narrates. These control the (optional) Gemini narration path.
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")
    LLM_TIMEOUT_SECONDS: float = float(os.getenv("LLM_TIMEOUT_SECONDS", "8"))
    AI_CACHE_SIZE: int = int(os.getenv("AI_CACHE_SIZE", "256"))

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
