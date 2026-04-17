import os
from google.cloud import aiplatform

# --- Configuration ---
PROJECT_ID = "crowdgo-493512"
LOCATION = "us-central1"
MODEL_ID = "surge_prediction_v4_bqml" 
ENDPOINT_NAME = "surge-prediction-endpoint-v4"
GCP_KEY_PATH = "gcp-key.json"

os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = GCP_KEY_PATH

def deploy():
    try:
        aiplatform.init(project=PROJECT_ID, location=LOCATION)
        
        print(f"🔍 Locating model: {MODEL_ID}...")
        # Note: BQML auto-sync ID might be prefixed or use a specific format
        # We search by display name if resource ID is uncertain
        models = aiplatform.Model.list(filter=f'display_name="{MODEL_ID}"')
        
        if not models:
            print(f"❌ Could not find model '{MODEL_ID}'. Is the training finished?")
            return

        model = models[0]
        print(f"✅ Found Model: {model.resource_name}")
        
        print(f"🏗️ Creating Endpoint: {ENDPOINT_NAME}...")
        endpoint = aiplatform.Endpoint.create(display_name=ENDPOINT_NAME)
        
        print(f"🚀 Deploying model to endpoint (this takes ~10-15 mins)...")
        # Deploying with a small machine to keep costs low
        model.deploy(
            endpoint=endpoint,
            machine_type="n1-standard-2",
            min_replica_count=1,
            max_replica_count=1,
            traffic_split={"0": 100}
        )
        
        print("\n" + "="*50)
        print("🔥 MODEL DEPLOYED SUCCESSFULLY!")
        print(f"ENDPOINT_RESOURCE_NAME: {endpoint.resource_name}")
        print("="*50 + "\n")
        
    except Exception as e:
        print(f"❌ Deployment Error: {e}")

if __name__ == "__main__":
    deploy()
