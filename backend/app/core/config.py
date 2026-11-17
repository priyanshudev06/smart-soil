import os
from pydantic import BaseModel

class Settings(BaseModel):
    PROJECT_NAME: str = "Smart Soil Health & Farming Assistant API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./smart_soil.db")
    
    # CORS
    FRONTEND_ORIGIN: str = os.getenv("FRONTEND_ORIGIN", "*")
    
    # Security
    JWT_SECRET: str = os.getenv("JWT_SECRET", "smart-soil-secret-key-development-2026")
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    
    # Environment
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")

settings = Settings()
