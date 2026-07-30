import os

class Settings:
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./neuro.db")

    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your_secret_key_change_me_in_production_1234567890")
    JWT_SECRET: str = os.getenv("JWT_SECRET") or os.getenv("SECRET_KEY", "your_secret_key_change_me_in_production_1234567890")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))

    # Storage & ML Paths
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", "uploads")
    MODEL_PATH: str = os.getenv("MODEL_PATH", "models")

    # Proctoring Engine Configurations
    PROCTORING_DETECTION_THRESHOLD: float = float(os.getenv("PROCTORING_DETECTION_THRESHOLD", "0.6"))
    PROCTORING_FRAME_RATE_MS: int = int(os.getenv("PROCTORING_FRAME_RATE_MS", "500"))
    PROCTORING_WARNING_TIMEOUT_S: float = float(os.getenv("PROCTORING_WARNING_TIMEOUT_S", "3.0"))
    PROCTORING_PAUSE_TIMEOUT_S: float = float(os.getenv("PROCTORING_PAUSE_TIMEOUT_S", "15.0"))
    PROCTORING_LIGHTING_MIN: float = float(os.getenv("PROCTORING_LIGHTING_MIN", "50.0"))
    PROCTORING_LIGHTING_MAX: float = float(os.getenv("PROCTORING_LIGHTING_MAX", "220.0"))

    # Networking
    ALLOWED_ORIGINS: list = [
        o.strip() for o in os.getenv("ALLOWED_ORIGINS", "*").split(",") if o.strip()
    ]
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:3000")
    BACKEND_URL: str = os.getenv("BACKEND_URL", "http://localhost:8001")
    ENV: str = os.getenv("APP_ENV", "development")

settings = Settings()
