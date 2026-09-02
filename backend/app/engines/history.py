from sqlalchemy.orm import Session
from sqlalchemy import and_
from datetime import datetime, timedelta
from app import models

def find_similar_incidents(db: Session, current_incident: models.Incident, limit: int = 3):
    """Find similar past incidents based on affected systems and root cause."""
    
    # Get all resolved incidents from the last 6 months
    six_months_ago = datetime.utcnow() - timedelta(days=180)
    
    past_incidents = db.query(models.Incident).filter(
        models.Incident.status.in_(["RESOLVED", "CLOSED"]),
        models.Incident.created_at >= six_months_ago,
        models.Incident.id != current_incident.id
    ).all()
    
    similar = []
    
    for past in past_incidents:
        similarity_score = 0
        
        # Check if same systems are affected
        current_systems = set(current_incident.affected_systems or [])
        past_systems = set(past.affected_systems or [])
        
        if current_systems and past_systems:
            overlap = len(current_systems.intersection(past_systems))
            total = len(current_systems.union(past_systems))
            system_similarity = overlap / total if total > 0 else 0
            similarity_score += system_similarity * 50  # 50% weight
        
        # Check if similar root cause
        if current_incident.root_cause and past.root_cause:
            # Simple keyword matching (can be improved with NLP)
            current_words = set(current_incident.root_cause.lower().split())
            past_words = set(past.root_cause.lower().split())
            
            if current_words and past_words:
                overlap = len(current_words.intersection(past_words))
                total = len(current_words.union(past_words))
                cause_similarity = overlap / total if total > 0 else 0
                similarity_score += cause_similarity * 30  # 30% weight
        
        # Check if similar severity
        if current_incident.severity == past.severity:
            similarity_score += 20  # 20% weight
        
        if similarity_score > 40:  # At least 40% similar
            similar.append({
                "incident_id": past.incident_id,
                "title": past.title,
                "similarity_score": round(similarity_score),
                "resolved_at": past.resolved_at.isoformat() if past.resolved_at else None,
                "resolution_notes": past.resolution_notes,
                "root_cause": past.root_cause
            })
    
    # Sort by similarity and return top matches
    similar.sort(key=lambda x: x["similarity_score"], reverse=True)
    return similar[:limit]