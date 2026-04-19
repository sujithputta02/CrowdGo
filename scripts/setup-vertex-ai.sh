#!/bin/bash

# CrowdGo Vertex AI Setup Script
# This script automates the setup of Vertex AI for crowd predictions

set -e

PROJECT_ID="crowdgo-493512"
LOCATION="us-central1"
DATASET_NAME="vertex_ai_training"
TABLE_NAME="crowd_predictions"
MODEL_NAME="crowdgo-wait-predictor"
ENDPOINT_NAME="crowdgo-predictions"

echo "🚀 CrowdGo Vertex AI Setup"
echo "================================"

# Step 1: Create BigQuery Dataset
echo "📊 Step 1: Creating BigQuery dataset..."
bq mk --dataset \
  --description="Training data for Vertex AI models" \
  --location=$LOCATION \
  $PROJECT_ID:$DATASET_NAME 2>/dev/null || echo "Dataset already exists"

# Step 2: Create Training Table
echo "📋 Step 2: Creating training table..."
bq query --use_legacy_sql=false <<EOF
CREATE OR REPLACE TABLE \`$PROJECT_ID.$DATASET_NAME.$TABLE_NAME\` AS
SELECT
  CAST(JSON_VALUE(payload, '$.wait') AS INT64) as current_wait,
  CAST(JSON_VALUE(payload, '$.recentScans') AS INT64) as recent_scans,
  'wankhede' as stadium,
  CAST(JSON_VALUE(payload, '$.actualWait') AS INT64) as predicted_wait,
  timestamp,
  venue_id
FROM \`$PROJECT_ID.crowdgo_analytics.stadium_events\`
WHERE 
  event_type IN ('GATE_SCAN', 'POS_SALE')
  AND JSON_VALUE(payload, '$.actualWait') IS NOT NULL
  AND timestamp > TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 90 DAY)
ORDER BY timestamp DESC;
EOF

echo "✅ Training table created"

# Step 3: Verify Data
echo "📈 Step 3: Verifying data quality..."
bq query --use_legacy_sql=false --format=pretty <<EOF
SELECT
  COUNT(*) as total_rows,
  ROUND(AVG(current_wait), 2) as avg_current_wait,
  ROUND(AVG(recent_scans), 2) as avg_recent_scans,
  ROUND(AVG(predicted_wait), 2) as avg_predicted_wait,
  MIN(predicted_wait) as min_predicted_wait,
  MAX(predicted_wait) as max_predicted_wait
FROM \`$PROJECT_ID.$DATASET_NAME.$TABLE_NAME\`;
EOF

# Step 4: Create Vertex AI Dataset
echo "🤖 Step 4: Creating Vertex AI dataset..."
echo "⚠️  This requires manual setup in the console:"
echo "   1. Go to https://console.cloud.google.com/vertex-ai"
echo "   2. Click Datasets → Create Dataset"
echo "   3. Name: crowdgo-crowd-predictions"
echo "   4. Type: Tabular"
echo "   5. Objective: Regression"
echo "   6. Import from BigQuery: $PROJECT_ID.$DATASET_NAME.$TABLE_NAME"
echo ""

# Step 5: Create Secret for Endpoint ID
echo "🔐 Step 5: Setting up Secret Manager..."
read -p "Enter your Vertex AI Endpoint ID (or press Enter to skip): " ENDPOINT_ID

if [ ! -z "$ENDPOINT_ID" ]; then
  gcloud secrets create VERTEX_AI_ENDPOINT_ID --data-file=- <<< "$ENDPOINT_ID" 2>/dev/null || \
  gcloud secrets versions add VERTEX_AI_ENDPOINT_ID --data-file=- <<< "$ENDPOINT_ID"
  
  # Grant access to service account
  SERVICE_ACCOUNT=$(gcloud config get-value project)@iam.gserviceaccount.com
  gcloud secrets add-iam-policy-binding VERTEX_AI_ENDPOINT_ID \
    --member=serviceAccount:$SERVICE_ACCOUNT \
    --role=roles/secretmanager.secretAccessor 2>/dev/null || true
  
  echo "✅ Endpoint ID saved to Secret Manager"
else
  echo "⏭️  Skipping Secret Manager setup"
fi

# Step 6: Verify Setup
echo ""
echo "✅ Setup Complete!"
echo ""
echo "📝 Next Steps:"
echo "1. Go to Vertex AI Console: https://console.cloud.google.com/vertex-ai"
echo "2. Create a new AutoML Regression model"
echo "3. Use dataset: crowdgo-crowd-predictions"
echo "4. Target column: predicted_wait"
echo "5. Training budget: 1-8 hours"
echo "6. Deploy to endpoint: $ENDPOINT_NAME"
echo "7. Update VERTEX_AI_ENDPOINT_ID with the endpoint ID"
echo ""
echo "🧪 Test your setup:"
echo "   npm run dev"
echo "   curl -X POST http://localhost:3000/api/v1/predict -H 'Content-Type: application/json' -d '{\"facilityId\": \"gate-1\", \"type\": \"gate\", \"currentWait\": 15}'"
