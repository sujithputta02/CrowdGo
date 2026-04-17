import os
from google.cloud import bigquery

# --- Configuration ---
PROJECT_ID = "crowdgo-493512"
DATASET_ID = "crowdgo_analytics"
MODEL_NAME = "surge_prediction_bqml"
GCP_KEY_PATH = "gcp-key.json"

# Set credentials
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = GCP_KEY_PATH

def train_model():
    client = bigquery.Client(project=PROJECT_ID)
    
    # BQML Linear Regression SQL
    # Faster training (seconds) and works with your current wait_time_minutes data
    sql = f"""
    CREATE OR REPLACE MODEL `{PROJECT_ID}.{DATASET_ID}.{MODEL_NAME}`
    OPTIONS(
      MODEL_TYPE='LINEAR_REG',
      INPUT_LABEL_COLS=['wait_time_minutes'],
      MODEL_REGISTRY='VERTEX_AI',
      VERTEX_AI_MODEL_ID='surge_prediction_v4_bqml'
    ) AS
    SELECT 
        event_type,
        wait_time_minutes,
        EXTRACT(HOUR FROM timestamp) as hour_of_day,
        EXTRACT(DAYOFWEEK FROM timestamp) as day_of_week
    FROM 
        `{PROJECT_ID}.{DATASET_ID}.stadium_events`
    WHERE 
        wait_time_minutes IS NOT NULL
    """
    
    print(f"🚀 Starting BigQuery ML Linear Regression Training...")
    print(f"📊 Model: {PROJECT_ID}.{DATASET_ID}.{MODEL_NAME}")
    
    query_job = client.query(sql, location="us-central1")
    
    print(f"📡 Query submitted. Job ID: {query_job.job_id}")
    print(f"⏳ Training usually takes 1-2 minutes...")
    
    # Wait for completion
    query_job.result()
    
    print("\n" + "="*50)
    print("🔥 MODEL TRAINED AND SYNCED SUCCESSFULLY!")
    print(f"🔗 Check Vertex AI Model Registry: https://console.cloud.google.com/vertex-ai/models?project={PROJECT_ID}")
    print("="*50 + "\n")

if __name__ == "__main__":
    try:
        train_model()
    except Exception as e:
        print(f"❌ Error training BQML model: {e}")

