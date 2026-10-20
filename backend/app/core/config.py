from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str
    timezone: str = "Asia/Kolkata"
    report_period_days: int = 30
    trend_days: int = 7
    recent_activity_limit: int = 5


settings = Settings()
