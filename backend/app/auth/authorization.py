from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.models.auth import User, UserPlant


class AuthorizationService:
    """Authorization service validating plant-level access and resource boundaries."""

    def is_admin(self, user: User) -> bool:
        """Check whether user holds ADMIN role."""
        return user is not None and user.role is not None and user.role.name == "ADMIN"

    def can_access_plant(self, db: Session, user: User, plant_id: int) -> bool:
        """Validate if user has access authorization to specified plant_id. Admin has unrestricted access."""
        if not user:
            return False

        if self.is_admin(user):
            return True

        if not plant_id:
            return True

        query = select(UserPlant).where(
            UserPlant.user_id == user.id,
            UserPlant.plant_id == plant_id,
        )
        up = db.execute(query).scalar_one_or_none()
        return up is not None

    def get_authorized_plant_ids(self, db: Session, user: User) -> Optional[List[int]]:
        """Return list of authorized plant IDs for user. Returns None for Admin (meaning all plants)."""
        if self.is_admin(user):
            return None  # All plants

        query = select(UserPlant.plant_id).where(UserPlant.user_id == user.id)
        return list(db.execute(query).scalars().all())


authorization_service = AuthorizationService()
