from typing import Optional
from sqlalchemy import create_engine
from sqlalchemy.exc import OperationalError
from app.core.config import settings

def create_db_engine(db_url: str):
    """Attempt connection to primary DB (e.g. PostgreSQL), fallback to SQLite if offline."""
    import os
    
    # Check for existing SQLite database file
    possible_paths = [
        "industrial_carbon.db",
        "backend/industrial_carbon.db",
        os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "industrial_carbon.db")),
        os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "industrial_carbon.db")),
    ]
    chosen_db = None
    for p in possible_paths:
        if os.path.exists(p):
            chosen_db = p
            break

    # If db_url is default localhost PostgreSQL and local SQLite file exists, use SQLite directly
    if ("localhost" in db_url or "127.0.0.1" in db_url) and chosen_db:
        fallback_url = f"sqlite:///{chosen_db}"
        print(f"[DB Connection] Fast-tracking to SQLite database: {fallback_url}")
        return create_engine(fallback_url, echo=False, connect_args={"check_same_thread": False}, pool_pre_ping=True)

    connect_args = {"check_same_thread": False} if db_url.startswith("sqlite") else {"connect_timeout": 3}
    eng = create_engine(db_url, echo=False, connect_args=connect_args, pool_pre_ping=True)
    try:
        with eng.connect():
            pass
        return eng
    except Exception as e:
        fallback_url = f"sqlite:///{chosen_db or 'industrial_carbon.db'}"
        print(f"[DB Connection Warning] Primary DB offline ({e}). Fallback to {fallback_url}")
        return create_engine(fallback_url, echo=False, connect_args={"check_same_thread": False}, pool_pre_ping=True)

engine = create_db_engine(settings.DATABASE_URL)


def get_engine(db_url: Optional[str] = None):
    """Return SQLAlchemy engine for custom or default database URL."""
    if db_url:
        return create_db_engine(db_url)
    return engine
