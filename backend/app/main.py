from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from dotenv import load_dotenv

load_dotenv()

from app.database import SessionLocal, engine
from app import models, schemas
from app.engines.anomaly import detect_anomaly
from app.engines.correlation import run_correlation
from app.engines.auth import (
    get_password_hash, authenticate_user, create_access_token,
    get_current_user
)

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Enterprise Digital Shadow API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/api/auth/register")
def register_user(user_data: dict, db: Session = Depends(get_db)):
    existing = db.query(models.User).filter(
        (models.User.username == user_data["username"]) | 
        (models.User.email == user_data["email"])
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="User already exists")
    
    new_user = models.User(
        username=user_data["username"],
        email=user_data["email"],
        hashed_password=get_password_hash(user_data["password"]),
        full_name=user_data["full_name"],
        role=user_data.get("role", "engineer"),
        department=user_data.get("department")
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return {"message": "User created successfully", "user_id": new_user.id}

@app.post("/api/auth/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(
        data={"sub": user.username, "role": user.role}
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "username": user.username,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role,
            "department": user.department
        }
    }

@app.get("/api/auth/me")
def get_current_user_info(current_user: models.User = Depends(get_current_user)):
    return {
        "username": current_user.username,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "role": current_user.role,
        "department": current_user.department
    }

@app.post("/api/events/", response_model=schemas.EventResponse)
def ingest_event(event: schemas.EventCreate, db: Session = Depends(get_db)):
    db_event = models.Event(**event.dict())
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    
    is_anomaly, score = detect_anomaly(event.metric_value, event.normal_value)
    if is_anomaly:
        print(f"🚨 ANOMALY DETECTED: {event.event_type} on {event.system} (Score: {score})")
        incident = run_correlation(db)
        if incident:
            print(f"✅ Correlation Engine found: {incident.title}")
        
    return db_event

@app.get("/api/incidents/")
def get_incidents(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    incidents = db.query(models.Incident).order_by(models.Incident.created_at.desc()).offset(skip).limit(limit).all()
    return incidents

@app.get("/api/incidents/{incident_id}")
def get_incident_detail(incident_id: str, db: Session = Depends(get_db)):
    incident = db.query(models.Incident).filter(models.Incident.incident_id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    
    related_events = db.query(models.Event).filter(
        models.Event.system.in_(incident.affected_systems)
    ).order_by(models.Event.timestamp.desc()).limit(15).all()
    
    timeline = []
    for e in related_events:
        time_str = e.timestamp.strftime("%H:%M:%S") if e.timestamp else "Unknown"
        timeline.append({
            "time": time_str,
            "system": e.system,
            "event_type": e.event_type,
            "description": f"{e.event_type} detected (Value: {e.metric_value})",
            "severity": e.severity
        })
    timeline.reverse()
    
    return {
        "incident_id": incident.incident_id,
        "title": incident.title,
        "risk_score": incident.risk_score,
        "severity": incident.severity,
        "status": incident.status,
        "root_cause": incident.root_cause,
        "affected_systems": incident.affected_systems,
        "timeline": timeline,
        "ai_explanation": "AI explanation temporarily disabled.",
        "recommendations": [
            "Check for long-running queries locking the database.",
            "Review current database connection pool limits.",
            "Check for recent deployments to the affected services.",
            "Consider scaling the database vertically if CPU remains high."
        ],
        "similar_incidents": []
    }

DEPENDENCY_GRAPH = {
    "payment-db": {
        "name": "Payment Database",
        "downstream": ["payment-api", "payment-service", "checkout-ui", "customer-app"],
        "affected_users": 1240,
        "affected_departments": ["Finance", "Operations"],
        "business_impact": "HIGH",
        "description": "Core payment transaction database"
    },
    "payment-api": {
        "name": "Payment API",
        "downstream": ["payment-service", "checkout-ui", "customer-app"],
        "affected_users": 1240,
        "affected_departments": ["Finance"],
        "business_impact": "HIGH",
        "description": "Payment processing API gateway"
    },
    "payment-service": {
        "name": "Payment Service",
        "downstream": ["checkout-ui", "customer-app"],
        "affected_users": 1240,
        "affected_departments": ["Finance", "E-commerce"],
        "business_impact": "HIGH",
        "description": "Business logic layer for payments"
    },
    "checkout-ui": {
        "name": "Checkout UI",
        "downstream": ["customer-app"],
        "affected_users": 800,
        "affected_departments": ["E-commerce", "Customer Experience"],
        "business_impact": "MEDIUM",
        "description": "Customer-facing checkout interface"
    },
    "customer-app": {
        "name": "Customer App",
        "downstream": [],
        "affected_users": 2500,
        "affected_departments": ["Customer Experience", "Marketing"],
        "business_impact": "MEDIUM",
        "description": "End-user mobile and web application"
    },
    "auth-db": {
        "name": "Authentication Database",
        "downstream": ["auth-api", "user-portal"],
        "affected_users": 5000,
        "affected_departments": ["IT", "HR", "All Users"],
        "business_impact": "CRITICAL",
        "description": "User credentials and authentication data"
    },
    "auth-api": {
        "name": "Auth API",
        "downstream": ["user-portal", "customer-app", "payment-service"],
        "affected_users": 5000,
        "affected_departments": ["IT", "Security", "All Users"],
        "business_impact": "CRITICAL",
        "description": "Authentication and authorization service"
    },
    "user-portal": {
        "name": "User Portal",
        "downstream": [],
        "affected_users": 3000,
        "affected_departments": ["HR", "Employee Services"],
        "business_impact": "HIGH",
        "description": "Internal employee portal"
    }
}

@app.post("/api/simulate")
def simulate_failure(system_id: str, db: Session = Depends(get_db)):
    if system_id not in DEPENDENCY_GRAPH:
        raise HTTPException(status_code=404, detail="System not found in dependency graph")
    
    system_data = DEPENDENCY_GRAPH[system_id]
    all_affected = [system_id] + system_data["downstream"]
    risk_level = system_data["business_impact"]
    risk_score = 95 if risk_level == "CRITICAL" else (85 if risk_level == "HIGH" else 65)

    return {
        "target_system": system_data["name"],
        "system_description": system_data["description"],
        "affected_services": all_affected,
        "affected_departments": system_data["affected_departments"],
        "estimated_users_impacted": system_data["affected_users"],
        "business_risk": risk_level,
        "risk_score": risk_score,
        "simulation_message": f"If {system_data['name']} fails, it will cascade to {len(system_data['downstream'])} downstream services, impacting approximately {system_data['affected_users']} users."
    }

@app.get("/api/health")
def health_check():
    return {"status": "Digital Shadow is active"}