#!/usr/bin/env python3
"""
Create Vertex AI dataset from existing BigQuery data (1000 records)
"""

from google.cloud import aiplatform
from google.cloud import bigquery

PROJECT_ID = "crowdgo-493512"
LOCATION = "us-central1"
BQ_TABLE = "crowdgo-493512.crowdgo_analytics.stadium_events"

def create_training_table():
    """Create training table from existing stadium_events"""
    print("📊 Creating training table from existing BigQuery data...")
    
    client = bigquery.Client(project=PROJECT_ID)
    
    query = """
    CREATE OR REPLACE TABLE `crowdgo-493512.vertex_ai_training.crowd_predictions` AS
    SELECT
      CAST(JSON_VALUE(payload, '$.wait') AS INT64) as current_wait,
      CAST(JSON_VALUE(payload, '$.recentScans') AS INT64) as recent_scans,
      'wankhede' as stadium,
      CAST(JSON_VALUE(payload, '$.actualWait') AS INT64) as predicted_wait,
      timestamp,
      venue_id
    FROM `crowdgo-493512.crowdgo_analytics.stadium_events`
    WHERE 
      event_type IN ('GATE_SCAN', 'POS_SALE')
      AND JSON_VALUE(payload, '$.actualWait') IS NOT NULL
    LIMIT 1000;
    """
    
    job = client.query(query)
    job.result()
    print("✅ Training table created with 1000 records")

def create_vertex_dataset():
    """Create Vertex AI dataset"""
    print("🤖 Creating Vertex AI dataset...")
    
    aiplatform.init(project=PROJECT_ID, location=LOCATION)
    
    dataset = aiplatform.TabularDataset.create(
        display_name="crowdgo-crowd-predictions",
        bq_source=f"bq://crowdgo-493512.vertex_ai_training.crowd_predictions",
    )
    
    print(f"✅ Dataset created: {dataset.resource_name}")
    return dataset

def main():
    try:
        print("🚀 Setting up Vertex AI with existing BigQuery data")
        print("=" * 60)
        
        # Step 1: Create training table
        create_training_table()
        
        # Step 2: Create Vertex AI dataset
        create_vertex_dataset()
        
        print("\n" + "=" * 60)
        print("✅ Ready for training!")
        print("\n📝 Next steps:")
        print("1. Go to: https://console.cloud.google.com/vertex-ai/datasets")
        print("2. Select: crowdgo-crowd-predictions")
        print("3. Click: Train new model")
        print("4. Objective: Regression")
        print("5. Target: predicted_wait")
        print("6. Budget: 1 hour")
        print("7. Click: Train")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
