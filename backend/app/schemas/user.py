from typing import List, Optional
from pydantic import BaseModel, EmailStr


class CreateUserRequest(BaseModel):
    name: str
    email: str
    password: str
    role: str = "OPERATOR"  # ADMIN, PLANT_MANAGER, ANALYST, OPERATOR
    plant_ids: Optional[List[int]] = []


class UpdateUserStatusRequest(BaseModel):
    is_active: bool


class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    role: str
    is_active: bool
    plant_ids: List[int] = []
    created_at: Optional[str] = None
    last_login: Optional[str] = None
