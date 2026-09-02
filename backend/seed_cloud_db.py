import requests
import random
from datetime import datetime

# ⚠️ CHANGE THIS to your live Render URL
API_URL = "https://digital-shadow-api.onrender.com"

def send_event(event_type, system, metric_value, normal_value, severity="medium"):
    event = {
        "event_id": f"EVT-{random.randint(10000, 99999)}-{random.randint(100,999)}",
        "timestamp": datetime.now().isoformat(),
        "source": "cloud-seed",
        "event_type": event_type,
        "severity": severity,
        "system": system,
        "metric_value": metric_value,
        "normal_value": normal_value,
        "department": "IT"
    }
    
    try:
        response = requests.post(f"{API_URL}/api/events/", json=event, timeout=30)
        print(f"✅ {event_type} on {system} → Status: {response.status_code}")
    except Exception as e:
        print(f"❌ Failed: {e}")

print("🌱 Seeding LIVE cloud database...")
print(f"📡 Target: {API_URL}\n")

# Send events that will trigger incident creation
events = [
    ("CPU_USAGE", "payment-db", 95.0, 40.0, "high"),
    ("HIGH_LATENCY", "payment-api", 2500.0, 200.0, "high"),
    ("SLOW_RESPONSE", "payment-service", 3500.0, 300.0, "high"),
    ("ERROR_SPIKE", "payment-service", 45.0, 2.0, "critical"),
    ("TICKET_SPIKE", "it-support", 120.0, 10.0, "high"),
    ("CPU_USAGE", "auth-db", 88.0, 45.0, "high"),
    ("MEMORY_LEAK", "user-portal", 92.0, 60.0, "medium"),
    ("DISK_FULL", "payment-db", 95.0, 70.0, "critical"),
]

for event_type, system, metric, normal, severity in events:
    send_event(event_type, system, metric, normal, severity)

print("\n✅ Cloud database seeded!")
print("📱 Now refresh your mobile browser - you'll see incidents!")