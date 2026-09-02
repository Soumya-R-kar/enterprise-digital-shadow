"""
CORRELATION ENGINE - The Brain of Enterprise Digital Shadow
============================================================
This engine analyzes recent events and detects patterns that indicate
a developing problem (emerging incident).

How it works:
1. Fetch all events from the last 10 minutes
2. Group them by system/department
3. Look for known cascade patterns
4. If a pattern is found, create an Incident
5. Send email notification if severity is CRITICAL
"""
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone
from app import models
from app.engines.notifications import notify_critical_incident

# Print this to prove the file is loading correctly
print("✅ Correlation engine module loaded successfully!")

# Known cascade patterns
CASCADE_PATTERNS = {
    "payment": {
        "name": "Payment Service Degradation",
        "trigger_events": ["HIGH_LATENCY", "SLOW_RESPONSE", "ERROR_SPIKE", "TICKET_SPIKE"],
        "systems": ["payment-db", "payment-api", "payment-service", "it-support"],
        "root_cause": "Database resource overload",
        "base_risk": 75
    },
    "authentication": {
        "name": "Authentication System Under Stress",
        "trigger_events": ["FAILED_LOGIN", "SLOW_RESPONSE", "ERROR_SPIKE"],
        "systems": ["auth-db", "auth-api", "auth-service"],
        "root_cause": "Possible brute-force attack or auth service overload",
        "base_risk": 70
    },
    "infrastructure": {
        "name": "Infrastructure Performance Degradation",
        "trigger_events": ["HIGH_CPU", "HIGH_LATENCY", "MEMORY_WARNING"],
        "systems": ["web-server", "app-server"],
        "root_cause": "Server resource exhaustion",
        "base_risk": 65
    }
}

# Email recipients for critical incidents (you can move this to DB or config later)
CRITICAL_NOTIFICATION_RECIPIENTS = [
    "admin@company.com",
    "manager@company.com",
    "oncall@company.com"
]


def run_correlation(db: Session):
    """
    Main function: Analyzes recent events and creates incidents if patterns are found.
    """
    print("🔍 Running correlation engine...")
    
    # Step 1: Get all events from the last 10 minutes
    time_threshold = datetime.now(timezone.utc) - timedelta(minutes=10)
    recent_events = db.query(models.Event).filter(
        models.Event.timestamp >= time_threshold
    ).all()

    if len(recent_events) < 2:
        return None  # Not enough data to correlate

    # Step 2: Check each known pattern
    for pattern_key, pattern in CASCADE_PATTERNS.items():
        # Find events that match this pattern
        matching_events = [
            e for e in recent_events
            if e.event_type in pattern["trigger_events"]
            or e.system in pattern["systems"]
        ]

        # Step 3: If we have 3+ matching events, it's an emerging incident!
        if len(matching_events) >= 3:
            incident = create_incident(db, pattern_key, pattern, matching_events)
            return incident

    return None


def create_incident(db: Session, pattern_key: str, pattern: dict, events: list):
    """
    Creates an Incident record in the database based on detected pattern.
    """
    # Calculate risk score
    base_risk = pattern["base_risk"]
    event_bonus = min(len(events) * 3, 15)
    severity_bonus = min(sum(2 for e in events if e.severity in ["high", "critical"]), 10)
    risk_score = min(base_risk + event_bonus + severity_bonus, 100)
    
    # Determine severity
    if risk_score >= 80:
        severity = "CRITICAL"
    elif risk_score >= 60:
        severity = "HIGH"
    elif risk_score >= 30:
        severity = "MEDIUM"
    else:
        severity = "LOW"

    # Get unique affected systems
    affected_systems = list(set([e.system for e in events]))
    title = f"Emerging: {pattern['name']}"

    # Check if this incident already exists (avoid duplicates)
    existing = db.query(models.Incident).filter(
        models.Incident.title == title,
        models.Incident.status == "OPEN"
    ).first()

    if existing:
        existing.risk_score = risk_score
        existing.severity = severity
        existing.affected_systems = affected_systems
        db.commit()
        print(f"🔄 Updated existing incident: {title} (Risk: {risk_score})")
        return existing

    # Create new incident
    new_incident = models.Incident(
        incident_id=f"INC-{int(datetime.now().timestamp()) % 100000}",
        title=title,
        risk_score=risk_score,
        severity=severity,
        status="OPEN",
        root_cause=pattern["root_cause"],
        affected_systems=affected_systems,
        created_at=datetime.now(timezone.utc)
    )

    db.add(new_incident)
    db.commit()
    db.refresh(new_incident)

    print(f"🚨 NEW INCIDENT CREATED: {title}")
    print(f"   Risk Score: {risk_score}/100 | Severity: {severity}")
    print(f"   Root Cause: {pattern['root_cause']}")
    print(f"   Based on {len(events)} correlated events")

    # 📧 NEW: Send email notification for CRITICAL incidents
    if severity == "CRITICAL":
        print(f"📧 Sending email notifications to {len(CRITICAL_NOTIFICATION_RECIPIENTS)} recipients...")
        try:
            notify_critical_incident({
                "title": new_incident.title,
                "risk_score": new_incident.risk_score,
                "severity": new_incident.severity,
                "root_cause": new_incident.root_cause,
                "affected_systems": new_incident.affected_systems
            }, CRITICAL_NOTIFICATION_RECIPIENTS)
        except Exception as e:
            print(f"⚠️ Email notification failed (non-critical error): {e}")
            # Don't let email failure break the incident creation

    return new_incident