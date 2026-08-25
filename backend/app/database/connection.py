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
    except Exception as e:
        # Fallback to local SQLite file for seamless deployment when PostgreSQL server is offline
        import os
        possible_paths = [
            "industrial_carbon.db",
            "backend/industrial_carbon.db",
            os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "industrial_carbon.db")),
            os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "industrial_carbon.db")),
        ]
        chosen_db = "industrial_carbon.db"
        for p in possible_paths:
            if os.path.exists(p):
                chosen_db = p
                break
        fallback_url = f"sqlite:///{chosen_db}"
        print(f"[DB Connection Warning] Primary DB offline ({e}). Using database engine at {fallback_url}")
        return create_engine(fallback_url, echo=False, connect_args={"check_same_thread": False}, pool_pre_ping=True)

engine = create_db_engine(settings.DATABASE_URL)


def get_engine(db_url: Optional[str] = None):
    """Return SQLAlchemy engine for custom or default database URL."""
    if db_url:
        return create_db_engine(db_url)
    return engine
