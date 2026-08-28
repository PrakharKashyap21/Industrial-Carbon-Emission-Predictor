from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import select, and_

from app.models.monitoring import MonitoringAlert


class AlertService:
    """Service managing system monitoring alert creation, deduplication, and resolution."""

    def create_alert_if_not_exists(
        self,
        db: Session,
        alert_type: str,
        severity: str,
        message: str,
        plant_id: Optional[int] = None,
        feature_name: Optional[str] = None,
    ) -> Optional[MonitoringAlert]:
        """Create a monitoring alert only if an identical active alert does not already exist."""
        query = select(MonitoringAlert).where(
            and_(
                MonitoringAlert.status == "active",
                MonitoringAlert.alert_type == alert_type,
            )
        )
        if plant_id is not None:
            query = query.where(MonitoringAlert.plant_id == plant_id)
        if feature_name is not None:
            query = query.where(MonitoringAlert.feature_name == feature_name)

        existing = db.execute(query).scalars().first()
        if existing:
            return None  # Deduplicated

        new_alert = MonitoringAlert(
            plant_id=plant_id,
            alert_type=alert_type,
            severity=severity,
            feature_name=feature_name,
            message=message,
            status="active",
            created_at=datetime.now(timezone.utc).replace(tzinfo=None),
        )

        db.add(new_alert)
        db.commit()
        db.refresh(new_alert)

        return new_alert

    def resolve_alert(self, db: Session, alert_id: int) -> Optional[MonitoringAlert]:
        """Resolve an active monitoring alert."""
        alert = db.execute(select(MonitoringAlert).where(MonitoringAlert.id == alert_id)).scalar_one_or_none()
        if not alert:
            return None

        alert.status = "resolved"
        alert.resolved_at = datetime.now(timezone.utc).replace(tzinfo=None)
        db.commit()
        db.refresh(alert)

        return alert

    def get_alerts(self, db: Session, plant_id: Optional[int] = None, status: Optional[str] = "active") -> List[Dict[str, Any]]:
        """Fetch system monitoring alerts."""
        query = select(MonitoringAlert)
        if plant_id:
            query = query.where(MonitoringAlert.plant_id == plant_id)
        if status:
            query = query.where(MonitoringAlert.status == status)

        query = query.order_by(MonitoringAlert.created_at.desc())
        alerts = db.execute(query).scalars().all()

        return [
            {
                "id": a.id,
                "plant_id": a.plant_id,
                "alert_type": a.alert_type,
                "severity": a.severity,
                "feature_name": a.feature_name,
                "message": a.message,
                "status": a.status,
                "created_at": a.created_at.isoformat() if a.created_at else "",
                "resolved_at": a.resolved_at.isoformat() if a.resolved_at else None,
            }
            for a in alerts
        ]


alert_service = AlertService()
