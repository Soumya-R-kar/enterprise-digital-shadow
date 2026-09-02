import requests
import random
from datetime import datetime

# Change this to your live Render URL
API_URL = "https://digital-shadow-api.onrender.com"

def send_test_event(event_type, system, metric_value, normal_value, severity="medium"):
    event = {
        "event_id": f"EVT-{random.randint(10000, 99999)}",
        "timestamp": datetime.now().isoformat(),
        "source": "simulator",
        "event_type": event_type,
        "severity": severity,
        "system": system,
        "metric_value": metric_value,
        "normal_value": normal_value,
        "department": "IT"
    }
    
    response = requests.post(f"{API_URL}/api/events/", json=event)
    print(f"✅ Sent {event_type} on {system} - Status: {response.status_code}")

print("🌱 Seeding live database with test events...")

# Send a series of related events to trigger incident creation
send_test_event("CPU_USAGE", "payment-db", 95.0, 40.0, "high")
send_test_event("HIGH_LATENCY", "payment-api", 2500.0, 200.0, "high")
send_test_event("SLOW_RESPONSE", "payment-service", 3500.0, 300.0, "high")
send_test_event("ERROR_SPIKE", "payment-service", 45.0, 2.0, "critical")
send_test_event("TICKET_SPIKE", "it-support", 120.0, 10.0, "high")

print("\n✅ Database seeded! Refresh your Vercel dashboard to see incidents.")