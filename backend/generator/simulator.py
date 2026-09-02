import requests
import time
import random
from datetime import datetime
from datetime import datetime, timezone

API_URL = "http://localhost:8000/api/events/"

def generate_cascade_failure():
    """Simulates DB -> API -> App -> Support Ticket cascade"""
    print("⚠️ Simulating cascading failure...")
    events = [
        {"source": "database", "event_type": "HIGH_LATENCY", "severity": "medium", "system": "payment-db", "metric_value": random.randint(600, 900), "normal_value": 200, "department": "finance"},
        {"source": "api", "event_type": "SLOW_RESPONSE", "severity": "medium", "system": "payment-api", "metric_value": random.randint(400, 800), "normal_value": 150, "department": "finance"},
        {"source": "app", "event_type": "ERROR_SPIKE", "severity": "high", "system": "payment-service", "metric_value": random.randint(20, 50), "normal_value": 2, "department": "finance"},
        {"source": "helpdesk", "event_type": "TICKET_SPIKE", "severity": "high", "system": "it-support", "metric_value": random.randint(30, 60), "normal_value": 5, "department": "operations"}
    ]
    return events

def generate_normal_traffic():
    return [
        {"source": "server", "event_type": "CPU_USAGE", "severity": "low", "system": "web-server-01", "metric_value": random.randint(30, 55), "normal_value": 40, "department": "it"}
    ]

print("Starting Enterprise Digital Shadow Simulator...")
while True:
    # 20% chance of a cascading failure, 80% normal traffic
    if random.random() < 0.2:
        events = generate_cascade_failure()
    else:
        events = generate_normal_traffic()
        
    for evt in events:
        evt["timestamp"] = datetime.now(timezone.utc).isoformat()
        evt["event_id"] = f"EVT-{random.randint(10000, 99999)}"
        try:
            requests.post(API_URL, json=evt)
        except Exception as e:
            print(f"Failed to send event: {e}")
            
    time.sleep(3) # Send batch every 3 seconds