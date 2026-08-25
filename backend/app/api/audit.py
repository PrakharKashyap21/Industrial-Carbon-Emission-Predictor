from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.schemas.audit import AuditLogItem
from app.audit.audit_service import audit_service
from app.auth.dependencies import require_permission
from app.auth.permissions import VIEW_AUDIT_LOGS
from app.models.auth import User

router = APIRouter(prefix="/audit", tags=["Audit Logging & System Traceability"])


@router.get(
    "/logs",
    response_model=List[AuditLogItem],
    status_code=status.HTTP_200_OK,
    summary="Get System Audit Logs (Admin / Plant Manager)",
    description="Fetch queryable audit logs tracking authentication, user management, predictions, and optimization runs."
)
def get_audit_logs(
    user_id: Optional[int] = Query(None, description="Optional User ID filter"),
    action: Optional[str] = Query(None, description="Optional Action filter"),
    limit: int = Query(50, ge=1, le=200, description="Max logs limit"),
    current_user: User = Depends(require_permission(VIEW_AUDIT_LOGS)),
    db: Session = Depends(get_db)
) -> List[AuditLogItem]:
    """Fetch audit logs."""
    logs_list = audit_service.get_logs(db=db, user_id=user_id, action=action, limit=limit)
    return [AuditLogItem(**l) for l in logs_list]
