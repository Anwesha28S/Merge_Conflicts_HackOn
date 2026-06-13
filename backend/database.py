from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from sqlalchemy.pool import QueuePool
from .config import settings

# Determine the final database URL
# Priority: constructed_database_url (from components) > database_url (direct string)
final_db_url = settings.constructed_database_url

# Configure engine based on database type
if final_db_url.startswith("sqlite"):
    # SQLite-specific configuration (local development)
    engine = create_engine(
        final_db_url,
        connect_args={"check_same_thread": False}
    )
else:
    # PostgreSQL/MySQL configuration (production RDS)
    engine = create_engine(
        final_db_url,
        poolclass=QueuePool,
        pool_size=5,
        max_overflow=10,
        pool_pre_ping=True,  # Verify connections before using them
        pool_recycle=3600,   # Recycle connections after 1 hour
        echo=False           # Set to True for SQL query debugging
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
