import os
from pydantic_settings import BaseSettings

current_dir = os.path.dirname(os.path.abspath(__file__))
env_path = os.path.join(current_dir, ".env")


class Settings(BaseSettings):
    # AWS Credentials
    aws_access_key_id: str = ""
    aws_secret_access_key: str = ""
    aws_region: str = "us-east-1"
    
    # JWT Settings
    secret_key: str = "change-this-secret-key-in-production-make-it-very-long-and-random"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 1440
    
    # Database Settings
    # For local development: sqlite:///./quickcommerce.db
    # For production RDS: postgresql://username:password@endpoint:5432/dbname
    database_url: str = "sqlite:///./quickcommerce.db"
    
    # RDS-specific settings (optional, for explicit configuration)
    db_host: str = ""
    db_port: int = 5432
    db_name: str = "quickcommerce"
    db_user: str = ""
    db_password: str = ""
    
    # Environment flag
    environment: str = "development"  # or "production"

    class Config:
        env_file = env_path
        extra = "ignore"
    
    @property
    def is_production(self) -> bool:
        return self.environment.lower() == "production"
    
    @property
    def constructed_database_url(self) -> str:
        """
        Constructs DATABASE_URL from individual components if provided.
        Useful when RDS credentials are managed separately.
        """
        if self.db_host and self.db_user and self.db_password:
            return f"postgresql://{self.db_user}:{self.db_password}@{self.db_host}:{self.db_port}/{self.db_name}"
        return self.database_url


settings = Settings()
