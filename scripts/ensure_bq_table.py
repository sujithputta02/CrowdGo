import os
from google.cloud import bigquery

# --- Configuration ---
PROJECT_ID = "crowdgo-493512"
DATASET_ID = "crowdgo_analytics"
TABLE_ID = "stadium_events"
GCP_KEY_PATH = "gcp-key.json"

os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = GCP_KEY_PATH

def ensure_table():
    client = bigquery.Client(project=PROJECT_ID)
    
    # 1. Ensure Dataset Exists
    dataset_id = f"{PROJECT_ID}.{DATASET_ID}"
    dataset = bigquery.Dataset(dataset_id)
    dataset.location = "us-central1"
    
    try:
        client.get_dataset(dataset_id)
        print(f"✅ Dataset {DATASET_ID} exists.")
    except Exception:
        print(f"🏗️ Creating dataset {DATASET_ID}...")
        client.create_dataset(dataset, timeout=30)
    
    # 2. Define Schema
    schema = [
        bigquery.SchemaField("event_type", "STRING", mode="REQUIRED"),
        bigquery.SchemaField("payload", "STRING", mode="NULLABLE"),
        bigquery.SchemaField("timestamp", "TIMESTAMP", mode="REQUIRED"),
        bigquery.SchemaField("venue_id", "STRING", mode="NULLABLE"),
        bigquery.SchemaField("wait_time_minutes", "FLOAT", mode="NULLABLE"),
        bigquery.SchemaField("processed_at", "TIMESTAMP", mode="NULLABLE"),
    ]
    
    table_id = f"{PROJECT_ID}.{DATASET_ID}.{TABLE_ID}"
    table = bigquery.Table(table_id, schema=schema)
    
    try:
        client.get_table(table_id)
        print(f"✅ Table {TABLE_ID} exists.")
    except Exception:
        print(f"🏗️ Creating table {TABLE_ID}...")
        client.create_table(table)
        print(f"🚀 Table {TABLE_ID} created successfully.")

if __name__ == "__main__":
    try:
        ensure_table()
    except Exception as e:
        print(f"❌ Error: {e}")
