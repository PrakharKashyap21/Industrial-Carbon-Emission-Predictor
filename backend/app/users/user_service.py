from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.models.auth import User, Role, UserPlant
from app.auth.password import hash_password


class UserService:
    """User Management Service managing User accounts, Roles, and Plant-level Access assignments."""

    def get_users(self, db: Session) -> List[Dict[str, Any]]:
        """Fetch all registered users with their roles and assigned plants."""
        query = select(User).order_by(User.id.asc())
        users_list = db.execute(query).scalars().all()

        results = []
        for u in users_list:
            role_name = u.role.name if u.role else "OPERATOR"
            plant_ids = [up.plant_id for up in u.plants] if u.plants else []
            results.append({
                "id": u.id,
                "name": u.name,
                "email": u.email,
                "role": role_name,
                "is_active": u.is_active,
                "plant_ids": plant_ids,
                "created_at": u.created_at.isoformat(),
                "last_login": u.last_login.isoformat() if u.last_login else None,
            })
        return results

    def get_user_by_id(self, db: Session, user_id: int) -> Optional[User]:
        """Fetch single user by primary key."""
        query = select(User).where(User.id == user_id)
        return db.execute(query).scalar_one_or_none()

    def create_user(
        self,
        db: Session,
        name: str,
        email: str,
        password: str,
        role_name: str = "OPERATOR",
        plant_ids: Optional[List[int]] = None,
    ) -> Dict[str, Any]:
        """Create a new user account with hashed password and plant assignments."""
        email_clean = email.strip().lower()
        existing = db.execute(select(User).where(User.email == email_clean)).scalar_one_or_none()
        if existing:
            raise ValueError(f"User with email '{email_clean}' already exists")

        # Resolve Role ID
        role_obj = db.execute(select(Role).where(Role.name == role_name.upper())).scalar_one_or_none()
        if not role_obj:
            role_obj = db.execute(select(Role).where(Role.name == "OPERATOR")).scalar_one_or_none()

        pw_hash = hash_password(password)
        new_user = User(
            name=name.strip(),
            email=email_clean,
            password_hash=pw_hash,
            role_id=role_obj.id if role_obj else 4,
            is_active=True,
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        # Assign Plants
        if plant_ids:
            for p_id in plant_ids:
                db.add(UserPlant(user_id=new_user.id, plant_id=p_id))
            db.commit()
            db.refresh(new_user)

        return {
            "id": new_user.id,
            "name": new_user.name,
            "email": new_user.email,
            "role": role_obj.name if role_obj else "OPERATOR",
            "is_active": new_user.is_active,
            "plant_ids": plant_ids or [],
        }

    def update_user_status(self, db: Session, user_id: int, is_active: bool) -> User:
        """Activate or deactivate user account."""
        user = self.get_user_by_id(db, user_id)
        if not user:
            raise ValueError(f"User #{user_id} not found")

        user.is_active = is_active
        db.commit()
        db.refresh(user)
        return user


user_service = UserService()
