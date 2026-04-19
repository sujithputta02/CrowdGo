#!/usr/bin/env python3
"""
Generate synthetic training data for Vertex AI model
This creates realistic crowd prediction data based on patterns
"""

import json
from datetime import datetime, timedelta
from google.cloud import bigquery
import random

# Configuration
PROJECT_ID = "crowdgo-493512"
DATASET_ID = "vertex_ai_training"
TABLE_ID = "crowd_predictions_synthetic"

def generate_synthetic_data(num_samples=1000):
    """Generate realistic synthetic training data"""
    data = []
    
    # Simulate different crowd patterns
    patterns = [
        {"name": "morning_rush", "base_wait": 8, "variance": 3, "scans": 150},
        {"name": "midday_calm", "base_wait": 5, "variance": 2, "scans": 80},
        {"name": "afternoon_surge", "base_wait": 20, "variance": 8, "scans": 400},
        {"name": "evening_peak", "base_wait": 25, "variance": 10, "scans": 500},
        {"name": "night_quiet", "base_wait": 3, "variance": 1, "scans": 30},
    ]
    
    for i in range(num_samples):
        # Pick a random pattern
        pattern = random.choice(patterns)
        
        # Generate realistic values
        current_wait = max(1, pattern["base_wait"] + random.randint(-pattern["variance"], pattern["variance"]))
        recent_scans = pattern["scans"] + random.randint(-50, 50)
        
        # Predicted wait is influenced by current wait and scans
        surge_factor = 1 + (recent_scans / 500)
        predicted_wait = max(1, int(current_wait * surge_factor + random.randint(-2, 2)))
        
        data.append({
            "current_wait": current_wait,
            "recent_scans": recent_scans,
            "stadium": "wankhede",
            "predicted_wait": predicted_wait,
            "timestamp": (datetime.now() - timedelta(days=random.randint(0, 90))).isoformat(),
            "venue_id": f"gate-{random.randint(1, 5)}"
        })
    
    return data

def upload_to_bigquery(data):
    """Upload synthetic data to BigQuery"""
    print(f"📊 Uploading {len(data)} synthetic training samples to BigQuery...")
    
    client = bigquery.Client(project=PROJECT_ID)
    
    # Create dataset if not exists
    dataset_id = f"{PROJECT_ID}.{DATASET_ID}"
    dataset = bigquery.Dataset(dataset_id)
    dataset.location = "us-central1"
    
    try:
        dataset = client.create_dataset(dataset, exists_ok=True)
        print(f"✅ Dataset created: {dataset_id}")
    except Exception as e:
        print(f"⚠️  Dataset creation: {e}")
    
    # Create table schema
    schema = [
        bigquery.SchemaField("current_wait", "INTEGER", mode="REQUIRED"),
        bigquery.SchemaField("recent_scans", "INTEGER", mode="REQUIRED"),
        bigquery.SchemaField("stadium", "STRING", mode="REQUIRED"),
        bigquery.SchemaField("predicted_wait", "INTEGER", mode="REQUIRED"),
        bigquery.SchemaField("timestamp", "STRING", mode="REQUIRED"),
        bigquery.SchemaField("venue_id", "STRING", mode="REQUIRED"),
    ]
    
    table_id = f"{PROJECT_ID}.{DATASET_ID}.{TABLE_ID}"
    table = bigquery.Table(table_id, schema=schema)
    table.time_partitioning = bigquery.TimePartitioning(
        type_=bigquery.TimePartitioningType.DAY,
        field="timestamp",
    )
    
    try:
        table = client.create_table(table, exists_ok=True)
        print(f"✅ Table created: {table_id}")
    except Exception as e:
        print(f"⚠️  Table creation: {e}")
    
    # Insert data
    errors = client.insert_rows_json(table_id, data)
    
    if errors:
        print(f"❌ Errors inserting rows: {errors}")
        return False
    else:
        print(f"✅ Successfully inserted {len(data)} rows")
        return True

def verify_data():
    """Verify the data was inserted correctly"""
    print("\n📈 Verifying data quality...")
    
    client = bigquery.Client(project=PROJECT_ID)
    
    query = f"""
    SELECT
      COUNT(*) as total_rows,
      ROUND(AVG(current_wait), 2) as avg_current_wait,
      ROUND(AVG(recent_scans), 2) as avg_recent_scans,
      ROUND(AVG(predicted_wait), 2) as avg_predicted_wait,
      MIN(predicted_wait) as min_predicted_wait,
      MAX(predicted_wait) as max_predicted_wait,
      ROUND(STDDEV(predicted_wait), 2) as stddev_predicted_wait
    FROM `{PROJECT_ID}.{DATASET_ID}.{TABLE_ID}`
    """
    
    results = client.query(query).result()
    
    for row in results:
        print(f"""
✅ Data Quality Check:
   Total rows: {row.total_rows}
   Avg current wait: {row.avg_current_wait} min
   Avg recent scans: {row.avg_recent_scans}
   Avg predicted wait: {row.avg_predicted_wait} min
   Min predicted wait: {row.min_predicted_wait} min
   Max predicted wait: {row.max_predicted_wait} min
   Std dev: {row.stddev_predicted_wait}
        """)
    
    return True

def main():
    """Main pipeline"""
    try:
        print("🚀 Generating Synthetic Training Data for Vertex AI")
        print("=" * 60)
        
        # Step 1: Generate data
        print("\n1️⃣  Generating synthetic data...")
        data = generate_synthetic_data(num_samples=1000)
        print(f"✅ Generated {len(data)} training samples")
        
        # Step 2: Upload to BigQuery
        print("\n2️⃣  Uploading to BigQuery...")
        if not upload_to_bigquery(data):
            print("❌ Failed to upload data")
            return False
        
        # Step 3: Verify
        print("\n3️⃣  Verifying data...")
        if not verify_data():
            print("❌ Data verification failed")
            return False
        
        print("\n" + "=" * 60)
        print("✅ Synthetic training data ready!")
        print("\n📝 Next steps:")
        print("1. Go to: https://console.cloud.google.com/vertex-ai/datasets")
        print("2. Create new dataset: 'crowdgo-crowd-predictions'")
        print(f"3. Import from BigQuery: {PROJECT_ID}.{DATASET_ID}.{TABLE_ID}")
        print("4. Create AutoML Regression model")
        print("5. Target column: predicted_wait")
        print("6. Training budget: 1 hour")
        
        return True
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    main()
