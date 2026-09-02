from sqlalchemy import Column, Integer, String, Float, DateTime, JSON, Boolean
from .database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    full_name = Column(String)
    role = Column(String, default="engineer")
    is_active = Column(Boolean, default=True)
    department = Column(String, nullable=True)

class Event(Base):
    __tablename__ = "events"
    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(String, unique=True, index=True)
    timestamp = Column(DateTime)
    source = Column(String)
    event_type = Column(String)
    severity = Column(String)
    system = Column(String)
    metric_value = Column(Float)
    normal_value = Column(Float)
    department = Column(String, nullable=True)

class Incident(Base):
    __tablename__ = "incidents"
    id = Column(Integer, primary_key=True, index=True)
    incident_id = Column(String, unique=True, index=True)
    title = Column(String)
    risk_score = Column(Integer)
    severity = Column(String)
    status = Column(String, default="OPEN")
    root_cause = Column(String, nullable=True)
    affected_systems = Column(JSON)
    created_at = Column(DateTime)
    resolved_at = Column(DateTime, nullable=True)
    resolution_notes = Column(String, nullable=True)
    assigned_to = Column(String, nullable=True)
    similar_incidents = Column(JSON, nullable=True)