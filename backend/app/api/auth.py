from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.schemas.auth import LoginRequest, LoginResponse, UserInfo
from app.auth.authentication import authentication_service
from app.auth.dependencies import get_current_user
from app.models.auth import User
from app.audit.audit_service import audit_service

router = APIRouter(prefix="/auth", tags=["Authentication & Access Tokens"])


@router.post(
    "/login",
    response_model=LoginResponse,
    status_code=status.HTTP_200_OK,
    summary="User Login & JWT Token Issuance",
    description="Authenticate user credentials (email & password) and issue JWT Bearer access token."
)
def login(request_body: LoginRequest, request: Request, db: Session = Depends(get_db)) -> LoginResponse:
    """Authenticate user and return JWT access token."""
    client_ip = request.client.host if request.client else "127.0.0.1"
    user = authentication_service.authenticate_user(
        db=db,
        email=request_body.email,
        password=request_body.password,
    )

    if not user:
        audit_service.log_action(
            db=db,
            action="LOGIN_FAILED",
            resource_type="auth",
            ip_address=client_ip,
            metadata={"email": request_body.email},
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Log successful login
    audit_service.log_action(
        db=db,
        action="LOGIN",
        user_id=user.id,
        resource_type="auth",
        ip_address=client_ip,
    )

    res_data = authentication_service.create_user_token(user)
    return LoginResponse(**res_data)


@router.get(
    "/me",
    response_model=UserInfo,
    status_code=status.HTTP_200_OK,
    summary="Get Current Authenticated User Profile",
    description="Fetch active user profile, assigned role, and plant authorization list."
)
def get_me(current_user: User = Depends(get_current_user)) -> UserInfo:
    """Fetch current user info."""
    role_name = current_user.role.name if current_user.role else "OPERATOR"
    plant_ids = [up.plant_id for up in current_user.plants] if current_user.plants else []

    return UserInfo(
        id=current_user.id,
        name=current_user.name,
        email=current_user.email,
        role=role_name,
        is_active=current_user.is_active,
        plant_ids=plant_ids,
    )


@router.post(
    "/logout",
    status_code=status.HTTP_200_OK,
    summary="User Logout Action",
    description="Record user logout action in audit log."
)
def logout(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> dict:
    """Log user logout action."""
    audit_service.log_action(
        db=db,
        action="LOGOUT",
        user_id=current_user.id,
        resource_type="auth",
    )
    return {"message": "Successfully logged out"}
