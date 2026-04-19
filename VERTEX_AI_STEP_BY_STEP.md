# Vertex AI - Step by Step Implementation

## Overview
This document provides exact, copy-paste commands to get Vertex AI working with CrowdGo.

---

## STEP 1: Prepare Your Environment (5 minutes)

### 1.1 Install Required Tools
```bash
# Install Google Cloud CLI
curl https://sdk.cloud.google.com | bash
exec -l $SHELL

# Initialize gcloud
gcloud init

# Set project
gcloud config set project crowdgo-493512

# Authenticate
gcloud auth application-default login
```

### 1.2 Install Python Dependencies
```bash
# Install Vertex AI SDK
pip install google-cloud-aiplatform

# Verify installation
python -c "import google.cloud.aiplatform; print('✅ Vertex AI SDK installed')"
```

---

## STEP 2: Create BigQuery Training Data (10 minutes)

### 2.1 Create Dataset
```bash
bq mk --dataset \
  --description="Training data for Vertex AI models" \
  --location=us-central1 \
  crowdgo-493512:vertex_ai_training
```

### 2.2 Create Training Table
```bash
bq query --use_legacy_sql=false <<'EOF'
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
  AND timestamp > TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 90 DAY)
ORDER BY timestamp DESC;
EOF
```

### 2.3 Verify Data
```bash
bq query --use_legacy_sql=false --format=pretty <<'EOF'
SELECT
  COUNT(*) as total_rows,
  ROUND(AVG(current_wait), 2) as avg_current_wait,
  ROUND(AVG(recent_scans), 2) as avg_recent_scans,
  ROUND(AVG(predicted_wait), 2) as avg_predicted_wait,
  MIN(predicted_wait) as min_predicted_wait,
  MAX(predicted_wait) as max_predicted_wait
FROM `crowdgo-493512.vertex_ai_training.crowd_predictions`;
EOF
```

**Expected Output:**
```
+------------+-------------------+-------------------+-------------------+-------------------+-------------------+
| total_rows | avg_current_wait  | avg_recent_scans  | avg_predicted_wait| min_predicted_wait| max_predicted_wait|
+------------+-------------------+-------------------+-------------------+-------------------+-------------------+
|   1234     |      12.45        |      245.67       |      14.23        |        2          |        45         |
+------------+-------------------+-------------------+-------------------+-------------------+-------------------+
```

---

## STEP 3: Create Vertex AI Dataset (5 minutes)

### 3.1 Via Console (Recommended for First Time)
1. Go to: https://console.cloud.google.com/vertex-ai/datasets
2. Click **Create Dataset**
3. Fill in:
   - **Name**: `crowdgo-crowd-predictions`
   - **Data type**: Tabular
   - **Objective**: Regression
   - **Region**: us-central1
4. Click **Create**
5. Click **Import** → **Import from BigQuery**
6. Select: `crowdgo-493512.vertex_ai_training.crowd_predictions`
7. Click **Import**
8. Wait for import (5-15 minutes)

### 3.2 Via Command Line (Alternative)
```bash
python scripts/train-vertex-model.py
```

---

## STEP 4: Train Model (1-8 hours)

### 4.1 Via Console (Recommended)
1. Go to: https://console.cloud.google.com/vertex-ai/datasets
2. Select dataset: `crowdgo-crowd-predictions`
3. Click **Train new model**
4. Configure:
   - **Model name**: `crowdgo-wait-predictor`
   - **Objective**: Regression
   - **Target column**: `predicted_wait`
   - **Training budget**: 1 hour (for testing)
5. Click **Train**
6. Monitor progress (check back in 1-8 hours)

### 4.2 Via Command Line (Alternative)
```bash
python scripts/train-vertex-model.py
```

**What to expect:**
- Training starts immediately
- Progress shown in console
- Takes 1-8 hours depending on budget
- Model evaluation metrics shown when complete

---

## STEP 5: Deploy Model (5-10 minutes)

### 5.1 Via Console
1. Go to: https://console.cloud.google.com/vertex-ai/models
2. Select model: `crowdgo-wait-predictor`
3. Click **Deploy to Endpoint**
4. Configure:
   - **Endpoint name**: `crowdgo-predictions`
   - **Machine type**: `n1-standard-2`
   - **Min replicas**: 1
   - **Max replicas**: 3
5. Click **Deploy**
6. Wait for deployment (5-10 minutes)

### 5.2 Via Command Line
```bash
gcloud ai endpoints create crowdgo-predictions \
  --region=us-central1 \
  --display-name="CrowdGo Predictions"

# Get the endpoint ID
ENDPOINT_ID=$(gcloud ai endpoints list --region=us-central1 \
  --filter="displayName:crowdgo-predictions" \
  --format="value(name)" | cut -d'/' -f6)

echo "Endpoint ID: $ENDPOINT_ID"
```

---

## STEP 6: Get Endpoint ID (2 minutes)

### 6.1 Find Your Endpoint ID
```bash
# List all endpoints
gcloud ai endpoints list --region=us-central1

# Get specific endpoint ID
ENDPOINT_ID=$(gcloud ai endpoints list --region=us-central1 \
  --filter="displayName:crowdgo-predictions" \
  --format="value(name)" | cut -d'/' -f6)

echo "Your Endpoint ID: $ENDPOINT_ID"
```

**Output will look like:**
```
Your Endpoint ID: 1234567890123456789
```

---

## STEP 7: Configure CrowdGo (2 minutes)

### 7.1 Save Endpoint ID to .env.local
```bash
# Add to .env.local
echo "VERTEX_AI_ENDPOINT_ID=$ENDPOINT_ID" >> .env.local

# Verify it's set
grep VERTEX_AI_ENDPOINT_ID .env.local
```

### 7.2 Verify Configuration
```bash
# Check if endpoint is accessible
gcloud ai endpoints describe $ENDPOINT_ID --region=us-central1
```

---

## STEP 8: Test Predictions (5 minutes)

### 8.1 Start the Application
```bash
npm run dev
```

### 8.2 Test the API
```bash
# In another terminal
curl -X POST http://localhost:3000/api/v1/predict \
  -H 'Content-Type: application/json' \
  -d '{
    "facilityId": "gate-1",
    "type": "gate",
    "currentWait": 15
  }'
```

### 8.3 Expected Response
```json
{
  "facilityId": "gate-1",
  "originalWait": 15,
  "predictedWait": 18,
  "confidence": "high",
  "auraReason": "AI analyzing live crowd trajectory.",
  "engine": "vertex-ai",
  "timestamp": "2026-04-19T09:30:00.000Z"
}
```

### 8.4 Verify It's Using Vertex AI
- Check `"engine": "vertex-ai"` in response
- If it says `"engine": "surrogate"`, endpoint ID is wrong
- If it says `"engine": "fallback"`, there's a connection issue

---

## STEP 9: Monitor Performance (Ongoing)

### 9.1 Check Prediction Logs
```bash
# View recent predictions
gcloud logging read "resource.type=api" \
  --limit 50 \
  --format json | grep -i "vertex\|predict"
```

### 9.2 Monitor Accuracy
```bash
bq query --use_legacy_sql=false --format=pretty <<'EOF'
SELECT
  DATE(timestamp) as date,
  COUNT(*) as predictions,
  ROUND(AVG(ABS(predicted_wait - actual_wait)), 2) as mean_error
FROM `crowdgo-493512.crowdgo_analytics.prediction_results`
WHERE timestamp > TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 7 DAY)
GROUP BY date
ORDER BY date DESC;
EOF
```

### 9.3 Check Endpoint Health
```bash
gcloud ai endpoints describe $ENDPOINT_ID \
  --region=us-central1 \
  --format="value(deployedModels[0].id)"
```

---

## TROUBLESHOOTING

### Problem: "No custom ENDPOINT_ID found"
```bash
# Check if set
echo $VERTEX_AI_ENDPOINT_ID

# If empty, set it
export VERTEX_AI_ENDPOINT_ID=YOUR_ENDPOINT_ID

# Add to .env.local
echo "VERTEX_AI_ENDPOINT_ID=$VERTEX_AI_ENDPOINT_ID" >> .env.local
```

### Problem: "404 Model not found"
```bash
# Verify endpoint exists
gcloud ai endpoints list --region=us-central1

# Verify endpoint ID is correct
gcloud ai endpoints describe $ENDPOINT_ID --region=us-central1

# Check if model is deployed
gcloud ai endpoints describe $ENDPOINT_ID \
  --region=us-central1 \
  --format="value(deployedModels[*].id)"
```

### Problem: "Permission denied"
```bash
# Grant permissions to service account
gcloud projects add-iam-policy-binding crowdgo-493512 \
  --member=serviceAccount:YOUR_SERVICE_ACCOUNT@crowdgo-493512.iam.gserviceaccount.com \
  --role=roles/aiplatform.user

# Grant Secret Manager access
gcloud secrets add-iam-policy-binding VERTEX_AI_ENDPOINT_ID \
  --member=serviceAccount:YOUR_SERVICE_ACCOUNT@crowdgo-493512.iam.gserviceaccount.com \
  --role=roles/secretmanager.secretAccessor
```

### Problem: "Timeout - prediction took too long"
```bash
# Increase endpoint replicas
gcloud ai endpoints update $ENDPOINT_ID \
  --region=us-central1 \
  --update-max-replica-count=5

# Check current replicas
gcloud ai endpoints describe $ENDPOINT_ID \
  --region=us-central1 \
  --format="value(deployedModels[0].automaticResources)"
```

---

## QUICK REFERENCE

### Key Commands
```bash
# List endpoints
gcloud ai endpoints list --region=us-central1

# Describe endpoint
gcloud ai endpoints describe $ENDPOINT_ID --region=us-central1

# Update endpoint
gcloud ai endpoints update $ENDPOINT_ID --region=us-central1 --update-max-replica-count=5

# View logs
gcloud logging read --limit 50

# Query BigQuery
bq query --use_legacy_sql=false "SELECT * FROM ..."
```

### Key Files
- **Code**: `lib/vertex.ts`
- **API**: `app/api/v1/predict/route.ts`
- **Config**: `.env.local`
- **Setup**: `scripts/setup-vertex-ai.sh`
- **Training**: `scripts/train-vertex-model.py`

### Key URLs
- **Vertex AI Console**: https://console.cloud.google.com/vertex-ai
- **Datasets**: https://console.cloud.google.com/vertex-ai/datasets
- **Models**: https://console.cloud.google.com/vertex-ai/models
- **Endpoints**: https://console.cloud.google.com/vertex-ai/endpoints
- **BigQuery**: https://console.cloud.google.com/bigquery

---

## Timeline

| Step | Time | Status |
|------|------|--------|
| 1. Environment Setup | 5 min | ⏳ |
| 2. BigQuery Data | 10 min | ⏳ |
| 3. Vertex AI Dataset | 5 min | ⏳ |
| 4. Train Model | 1-8 hours | ⏳ |
| 5. Deploy Model | 5-10 min | ⏳ |
| 6. Get Endpoint ID | 2 min | ⏳ |
| 7. Configure CrowdGo | 2 min | ⏳ |
| 8. Test Predictions | 5 min | ⏳ |
| 9. Monitor | Ongoing | ⏳ |
| **Total** | **~2 hours** | ⏳ |

---

## Success Checklist

- [ ] BigQuery training table created
- [ ] Vertex AI dataset imported
- [ ] Model training started
- [ ] Model training completed
- [ ] Model deployed to endpoint
- [ ] Endpoint ID obtained
- [ ] .env.local updated with endpoint ID
- [ ] API test returns "vertex-ai" engine
- [ ] Predictions are accurate (MAE < 5 min)
- [ ] Monitoring dashboard set up

---

## Next Steps

1. ✅ Follow steps 1-8 above
2. ⏳ Monitor accuracy for 1 week
3. ⏳ Retrain model monthly with new data
4. ⏳ Add more features (time-of-day, day-of-week)
5. ⏳ A/B test vs surrogate logic

---

**Ready to deploy? Start with Step 1!** 🚀
