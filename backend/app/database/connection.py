from typing import Optional
from sqlalchemy import create_engine
from sqlalchemy.exc import OperationalError
from app.core.config import settings

def create_db_engine(db_url: str):
    """Attempt connection to primary DB (e.g. PostgreSQL), fallback to SQLite if offline."""
    connect_args = {"check_same_thread": False} if db_url.startswith("sqlite") else {}
    eng = create_engine(db_url, echo=False, connect_args=connect_args, pool_pre_ping=True)
    try:
        with eng.connect():
            pass
        return eng
    except OperationalError:
        # Fallback to local SQLite file for seamless local development when PostgreSQL server is offline
        fallback_url = "sqlite:///industrial_carbon.db"
        return create_engine(fallback_url, echo=False, connect_args={"check_same_thread": False}, pool_pre_ping=True)

engine = create_db_engine(settings.DATABASE_URL)


def get_engine(db_url: Optional[str] = None):
    """Return SQLAlchemy engine for custom or default database URL."""
    if db_url:
        return create_db_engine(db_url)
    return engine
