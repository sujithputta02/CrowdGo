#!/usr/bin/env python3
"""
CrowdGo Vertex AI Model Training Script
Trains an AutoML regression model for crowd wait time predictions
"""

import os
import sys
from google.cloud import aiplatform
from google.cloud import bigquery

# Configuration
PROJECT_ID = "crowdgo-493512"
LOCATION = "us-central1"
DATASET_ID = "vertex_ai_training"
TABLE_ID = "crowd_predictions"
MODEL_DISPLAY_NAME = "crowdgo-wait-predictor"
ENDPOINT_DISPLAY_NAME = "crowdgo-predictions"
TRAINING_BUDGET_HOURS = 1  # Start with 1 hour for testing

def create_vertex_dataset():
    """Create a Vertex AI dataset from BigQuery table"""
    print("📊 Creating Vertex AI dataset...")
    
    aiplatform.init(project=PROJECT_ID, location=LOCATION)
    
    # Create dataset
    dataset = aiplatform.TabularDataset.create(
        display_name="crowdgo-crowd-predictions",
        bq_source=f"bq://{PROJECT_ID}.{DATASET_ID}.{TABLE_ID}",
    )
    
    print(f"✅ Dataset created: {dataset.resource_name}")
    return dataset

def train_model(dataset):
    """Train AutoML regression model"""
    print("🤖 Starting model training...")
    print(f"   Training budget: {TRAINING_BUDGET_HOURS} hour(s)")
    
    job = aiplatform.AutoMLTabularTrainingJob(
        display_name=MODEL_DISPLAY_NAME,
        optimization_prediction_type="regression",
        optimization_objective="minimize-rmse",  # Root Mean Squared Error
    )
    
    model = job.run(
        dataset=dataset,
        target_column="predicted_wait",
        training_fraction_split=0.8,
        validation_fraction_split=0.1,
        test_fraction_split=0.1,
        budget_milli_node_hours=TRAINING_BUDGET_HOURS * 1000,
        disable_early_stopping=False,
    )
    
    print(f"✅ Model training started: {model.resource_name}")
    print(f"   Monitor progress at: https://console.cloud.google.com/vertex-ai/models")
    return model

def deploy_model(model):
    """Deploy model to endpoint"""
    print("🚀 Deploying model to endpoint...")
    
    endpoint = model.deploy(
        machine_type="n1-standard-2",
        min_replica_count=1,
        max_replica_count=3,
        traffic_split={"0": 100},
        deployed_model_display_name=MODEL_DISPLAY_NAME,
    )
    
    print(f"✅ Model deployed: {endpoint.resource_name}")
    print(f"   Endpoint ID: {endpoint.name.split('/')[-1]}")
    return endpoint

def test_prediction(endpoint):
    """Test the deployed model with sample data"""
    print("🧪 Testing prediction...")
    
    test_instance = {
        "current_wait": 15,
        "recent_scans": 250,
        "stadium": "wankhede",
    }
    
    prediction = endpoint.predict(instances=[test_instance])
    
    print(f"✅ Prediction successful!")
    print(f"   Input: {test_instance}")
    print(f"   Predicted wait: {prediction.predictions[0]} minutes")
    
    return prediction

def save_endpoint_id(endpoint):
    """Save endpoint ID to environment"""
    endpoint_id = endpoint.name.split('/')[-1]
    
    print(f"\n📝 Saving endpoint ID to Secret Manager...")
    
    # Save to .env.local
    with open(".env.local", "a") as f:
        f.write(f"\nVERTEX_AI_ENDPOINT_ID={endpoint_id}\n")
    
    print(f"✅ Endpoint ID saved: {endpoint_id}")
    print(f"   File: .env.local")
    
    return endpoint_id

def main():
    """Main training pipeline"""
    try:
        print("🚀 CrowdGo Vertex AI Training Pipeline")
        print("=" * 50)
        
        # Step 1: Create dataset
        dataset = create_vertex_dataset()
        
        # Step 2: Train model
        model = train_model(dataset)
        
        # Step 3: Deploy model
        endpoint = deploy_model(model)
        
        # Step 4: Test prediction
        test_prediction(endpoint)
        
        # Step 5: Save endpoint ID
        endpoint_id = save_endpoint_id(endpoint)
        
        print("\n" + "=" * 50)
        print("✅ Training pipeline complete!")
        print(f"\n📊 Model Details:")
        print(f"   Model: {MODEL_DISPLAY_NAME}")
        print(f"   Endpoint: {ENDPOINT_DISPLAY_NAME}")
        print(f"   Endpoint ID: {endpoint_id}")
        print(f"\n🧪 Test the API:")
        print(f"   curl -X POST http://localhost:3000/api/v1/predict \\")
        print(f"     -H 'Content-Type: application/json' \\")
        print(f"     -d '{{\"facilityId\": \"gate-1\", \"type\": \"gate\", \"currentWait\": 15}}'")
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()
