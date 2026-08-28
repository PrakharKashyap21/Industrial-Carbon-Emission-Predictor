from typing import List, Optional
from pydantic import BaseModel, EmailStr


class LoginRequest(BaseModel):
    email: str
    password: str


class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    role: Optional[str] = "OPERATOR"


class UserInfo(BaseModel):
    id: int
    name: str
    email: str
    role: str
    is_active: bool
    plant_ids: List[int] = []


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserInfo
