from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

class EventCreate(BaseModel):
    event_id: str
    timestamp: datetime
    source: str
    event_type: str
    severity: str
    system: str
    metric_value: float
    normal_value: float
    department: Optional[str] = None

class EventResponse(EventCreate):
    id: int
    class Config:
        from_attributes = True  # Updated for Pydantic V2 compatibility

class IncidentResponse(BaseModel):
    incident_id: str
    title: str
    risk_score: int
    severity: str
    status: str
    root_cause: Optional[str]
    affected_systems: List[str]