from typing import Optional, Dict, Any
from pydantic import BaseModel


class AuditLogItem(BaseModel):
    id: int
    user_id: Optional[int] = None
    user_email: str
    action: str
    resource_type: Optional[str] = None
    resource_id: Optional[str] = None
    ip_address: Optional[str] = None
    timestamp: str
    metadata: Optional[Dict[str, Any]] = None
