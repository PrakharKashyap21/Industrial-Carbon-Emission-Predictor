from datetime import datetime
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.models.auth import User, Role, UserPlant
from app.auth.password import verify_password
from app.auth.jwt import create_access_token


class AuthenticationService:
    """User authentication service verifying credentials and generating JWT access tokens."""

    def authenticate_user(self, db: Session, email: str, password: str) -> Optional[User]:
        """Verify user credentials by email and password hash. Returns User if valid, None otherwise."""
        if not email or not password:
            return None

        query = select(User).where(User.email == email.strip().lower())
        user = db.execute(query).scalar_one_or_none()

        if not user or not user.is_active:
            return None

        if not verify_password(password, user.password_hash):
            return None

        # Update last login timestamp
        user.last_login = datetime.utcnow()
        db.commit()
        db.refresh(user)

        return user

    def create_user_token(self, user: User) -> Dict[str, Any]:
        """Generate JWT access token and user metadata dict for authentication response."""
        role_name = user.role.name if user.role else "OPERATOR"
        plant_ids = [up.plant_id for up in user.plants] if user.plants else []

        payload = {
            "sub": str(user.id),
            "user_id": user.id,
            "email": user.email,
            "name": user.name,
            "role": role_name,
            "plant_ids": plant_ids,
        }

        token = create_access_token(data=payload)

        return {
            "access_token": token,
            "token_type": "bearer",
            "user": {
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "role": role_name,
                "is_active": user.is_active,
                "plant_ids": plant_ids,
            },
        }


authentication_service = AuthenticationService()
