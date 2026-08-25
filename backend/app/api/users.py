from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.schemas.user import CreateUserRequest, UpdateUserStatusRequest, UserResponse
from app.users.user_service import user_service
from app.auth.dependencies import get_current_user, require_permission
from app.auth.permissions import MANAGE_USERS
from app.models.auth import User
from app.audit.audit_service import audit_service

router = APIRouter(prefix="/users", tags=["Admin User Management"])


@router.get(
    "",
    response_model=List[UserResponse],
    status_code=status.HTTP_200_OK,
    summary="List System Users (Admin Only)",
    description="Retrieve all registered users with roles and plant access assignments."
)
def list_users(
    current_user: User = Depends(require_permission(MANAGE_USERS)),
    db: Session = Depends(get_db)
) -> List[UserResponse]:
    """List all registered users."""
    users_list = user_service.get_users(db)
    return [UserResponse(**u) for u in users_list]


@router.post(
    "",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create User Account (Admin Only)",
    description="Admin creates new system user with assigned role and plant authorization list."
)
def create_user(
    request_body: CreateUserRequest,
    current_user: User = Depends(require_permission(MANAGE_USERS)),
    db: Session = Depends(get_db)
) -> UserResponse:
    """Create user account."""
    try:
        new_u = user_service.create_user(
            db=db,
            name=request_body.name,
            email=request_body.email,
            password=request_body.password,
            role_name=request_body.role,
            plant_ids=request_body.plant_ids,
        )

        audit_service.log_action(
            db=db,
            action="USER_CREATED",
            user_id=current_user.id,
            resource_type="user",
            resource_id=new_u["id"],
            metadata={"created_email": new_u["email"], "role": new_u["role"]},
        )

        return UserResponse(**new_u)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.put(
    "/{user_id}/status",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
    summary="Activate / Deactivate User (Admin Only)",
    description="Admin updates user active status."
)
def update_user_status(
    user_id: int,
    request_body: UpdateUserStatusRequest,
    current_user: User = Depends(require_permission(MANAGE_USERS)),
    db: Session = Depends(get_db)
) -> UserResponse:
    """Toggle user active status."""
    try:
        u_obj = user_service.update_user_status(db=db, user_id=user_id, is_active=request_body.is_active)
        role_name = u_obj.role.name if u_obj.role else "OPERATOR"
        plant_ids = [up.plant_id for up in u_obj.plants] if u_obj.plants else []

        audit_service.log_action(
            db=db,
            action="USER_DEACTIVATED" if not request_body.is_active else "USER_UPDATED",
            user_id=current_user.id,
            resource_type="user",
            resource_id=user_id,
            metadata={"is_active": request_body.is_active},
        )

        return UserResponse(
            id=u_obj.id,
            name=u_obj.name,
            email=u_obj.email,
            role=role_name,
            is_active=u_obj.is_active,
            plant_ids=plant_ids,
            created_at=u_obj.created_at.isoformat(),
            last_login=u_obj.last_login.isoformat() if u_obj.last_login else None,
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )
