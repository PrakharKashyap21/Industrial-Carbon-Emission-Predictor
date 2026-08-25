import json
from datetime import datetime
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import select, desc

from app.models.auth import AuditLog


class AuditService:
    """System Audit Service recording security, user management, and operational action trails."""

    def log_action(
        self,
        db: Session,
        action: str,
        user_id: Optional[int] = None,
        resource_type: Optional[str] = None,
        resource_id: Optional[str] = None,
        ip_address: Optional[str] = "127.0.0.1",
        metadata: Optional[Dict[str, Any]] = None,
    ) -> AuditLog:
        """Create and persist an audit trail log entry."""
        meta_str = json.dumps(metadata) if metadata else None
        audit = AuditLog(
            user_id=user_id,
            action=action.upper(),
            resource_type=resource_type,
            resource_id=str(resource_id) if resource_id else None,
            ip_address=ip_address,
            timestamp=datetime.utcnow(),
            metadata_json=meta_str,
        )
        db.add(audit)
        db.commit()
        db.refresh(audit)
        return audit

    def get_logs(
        self,
        db: Session,
        user_id: Optional[int] = None,
        action: Optional[str] = None,
        limit: int = 50,
    ) -> List[Dict[str, Any]]:
        """Fetch audit log records ordered by timestamp descending."""
        query = select(AuditLog)
        if user_id:
            query = query.where(AuditLog.user_id == user_id)
        if action:
            query = query.where(AuditLog.action == action.upper())

        query = query.order_by(desc(AuditLog.timestamp)).limit(limit)
        objs = db.execute(query).scalars().all()

        logs = []
        for a in objs:
            user_email = a.user.email if a.user else "Anonymous / System"
            meta_dict = None
            if a.metadata_json:
                try:
                    meta_dict = json.loads(a.metadata_json)
                except Exception:
                    meta_dict = {"raw": a.metadata_json}

            logs.append({
                "id": a.id,
                "user_id": a.user_id,
                "user_email": user_email,
                "action": a.action,
                "resource_type": a.resource_type,
                "resource_id": a.resource_id,
                "ip_address": a.ip_address,
                "timestamp": a.timestamp.isoformat(),
                "metadata": meta_dict,
            })
        return logs


audit_service = AuditService()
