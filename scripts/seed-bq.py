import os
import random
import time
from datetime import datetime, timedelta
from google.cloud import bigquery

# --- Configuration ---
PROJECT_ID = "crowdgo-493512"
DATASET_ID = "crowdgo_analytics"
TABLE_ID = "stadium_events"
GCP_KEY_PATH = "gcp-key.json"

os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = GCP_KEY_PATH

def seed_bq():
    client = bigquery.Client(project=PROJECT_ID)
    table_id = f"{PROJECT_ID}.{DATASET_ID}.{TABLE_ID}"
    
    print(f"🌱 Generating synthetic data for {table_id}...")
    
    rows = []
    base_time = datetime.utcnow()
    
    for i in range(200):
        # Create some patterns:
        # 1. Evening rush (Hour 18-20)
        # 2. Gate scans have higher wait during rush
        event_time = base_time - timedelta(minutes=random.randint(0, 1000))
        hour = event_time.hour
        
        event_type = random.choice(['GATE_SCAN', 'POS_SALE'])
        
        # Simple Logic: Rush hours or Gate scans = higher wait
        base_wait = 5
        if 18 <= hour <= 21:
            base_wait += 15
        if event_type == 'GATE_SCAN':
            base_wait += random.randint(5, 15)
        
        wait_time = base_wait + random.randint(-2, 5)
        
        rows.append({
            "event_type": event_type,
            "payload": '{"seeded": true}',
            "timestamp": event_time.isoformat(),
            "venue_id": "wankhede",
            "wait_time_minutes": float(wait_time),
            "processed_at": datetime.utcnow().isoformat()
        })
    
    errors = client.insert_rows_json(table_id, rows)
    if not errors:
        print(f"✅ Successfully seeded {len(rows)} rows into BigQuery.")
    else:
        print(f"❌ Errors while seeding: {errors}")

if __name__ == "__main__":
    seed_bq()
