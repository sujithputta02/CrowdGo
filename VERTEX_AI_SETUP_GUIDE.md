# Vertex AI Setup Guide for CrowdGo

## Overview
This guide explains how to set up Vertex AI for crowd prediction in CrowdGo. The system uses BigQuery data to train a custom model that predicts wait times.

## Architecture

```
BigQuery (Historical Data)
    ↓
Vertex AI AutoML (Train Model)
    ↓
Vertex AI Endpoint (Deploy Model)
    ↓
CrowdGo API (Make Predictions)
```

## Step 1: Prepare Training Data in BigQuery

### 1.1 Create Dataset
```sql
-- Create dataset for training data
CREATE SCHEMA IF NOT EXISTS `crowdgo-493512.vertex_ai_training`
OPTIONS(
  description="Training data for Vertex AI models",
  location="us-central1"
);
```

### 1.2 Create Training Table
```sql
-- Create training table with features and labels
CREATE OR REPLACE TABLE `crowdgo-493512.vertex_ai_training.crowd_predictions` AS
SELECT
  CAST(JSON_VALUE(payload, '$.wait') AS INT64) as current_wait,
  CAST(JSON_VALUE(payload, '$.recentScans') AS INT64) as recent_scans,
  'wankhede' as stadium,
  CAST(JSON_VALUE(payload, '$.actualWait') AS INT64) as predicted_wait,  -- This is your label
  timestamp,
  venue_id
FROM `crowdgo-493512.crowdgo_analytics.stadium_events`
WHERE 
  event_type IN ('GATE_SCAN', 'POS_SALE')
  AND JSON_VALUE(payload, '$.actualWait') IS NOT NULL
  AND timestamp > TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 90 DAY)
ORDER BY timestamp DESC;
```

### 1.3 Verify Data Quality
```sql
-- Check data distribution
SELECT
  COUNT(*) as total_rows,
  AVG(current_wait) as avg_current_wait,
  AVG(recent_scans) as avg_recent_scans,
  AVG(predicted_wait) as avg_predicted_wait,
  MIN(predicted_wait) as min_predicted_wait,
  MAX(predicted_wait) as max_predicted_wait
FROM `crowdgo-493512.vertex_ai_training.crowd_predictions`;
```

## Step 2: Create Vertex AI Dataset

### 2.1 Via Google Cloud Console
1. Go to [Vertex AI Console](https://console.cloud.google.com/vertex-ai)
2. Click **Datasets** → **Create Dataset**
3. Name: `crowdgo-crowd-predictions`
4. Data type: **Tabular**
5. Objective: **Regression** (predicting wait times)
6. Region: **us-central1**

### 2.2 Import Data from BigQuery
1. Click **Import** → **Import from BigQuery**
2. Select table: `crowdgo-493512.vertex_ai_training.crowd_predictions`
3. Click **Import**
4. Wait for import to complete (5-15 minutes)

## Step 3: Train AutoML Model

### 3.1 Create Training Job
1. In Vertex AI Console, click **Models** → **Create**
2. Select **AutoML** → **Tabular Regression**
3. Configure:
   - **Model name**: `crowdgo-wait-predictor`
   - **Dataset**: Select the dataset you created
   - **Target column**: `predicted_wait`
   - **Training budget**: 1-8 hours (start with 1 hour for testing)

### 3.2 Configure Features
- **Input features**: `current_wait`, `recent_scans`, `stadium`
- **Target**: `predicted_wait`
- **Test/Train split**: 80/20 (automatic)

### 3.3 Start Training
1. Click **Train**
2. Wait for training to complete (1-8 hours depending on budget)
3. Monitor progress in the console

## Step 4: Deploy Model to Endpoint

### 4.1 Create Endpoint
1. After training completes, click **Deploy to Endpoint**
2. Configure:
   - **Endpoint name**: `crowdgo-predictions`
   - **Machine type**: `n1-standard-2` (cost-effective)
   - **Min replicas**: 1
   - **Max replicas**: 3 (auto-scaling)

### 4.2 Deploy
1. Click **Deploy**
2. Wait for deployment (5-10 minutes)
3. Note the **Endpoint ID** (you'll need this)

## Step 5: Configure CrowdGo

### 5.1 Set Environment Variables

**Option A: Using Secret Manager (Recommended)**
```bash
# Create secret in GCP Secret Manager
gcloud secrets create VERTEX_AI_ENDPOINT_ID --data-file=- <<< "YOUR_ENDPOINT_ID"

# Grant access to your service account
gcloud secrets add-iam-policy-binding VERTEX_AI_ENDPOINT_ID \
  --member=serviceAccount:YOUR_SERVICE_ACCOUNT@crowdgo-493512.iam.gserviceaccount.com \
  --role=roles/secretmanager.secretAccessor
```

**Option B: Using Environment Variables**
```bash
# In .env.local or deployment config
VERTEX_AI_ENDPOINT_ID=YOUR_ENDPOINT_ID
VERTEX_AI_LOCATION=us-central1
```

### 5.2 Verify Configuration
```bash
# Test the endpoint
curl -X POST https://us-central1-aiplatform.googleapis.com/v1/projects/crowdgo-493512/locations/us-central1/endpoints/YOUR_ENDPOINT_ID:predict \
  -H "Authorization: Bearer $(gcloud auth print-access-token)" \
  -H "Content-Type: application/json" \
  -d '{
    "instances": [{
      "current_wait": 15,
      "recent_scans": 250,
      "stadium": "wankhede"
    }]
  }'
```

## Step 6: Monitor Predictions

### 6.1 Check Logs
```bash
# View prediction logs
gcloud logging read "resource.type=api" --limit 50 --format json | grep -i "vertex\|predict"
```

### 6.2 Monitor Performance
```sql
-- Query prediction accuracy
SELECT
  DATE(timestamp) as date,
  COUNT(*) as predictions,
  AVG(ABS(predicted_wait - actual_wait)) as mean_absolute_error,
  STDDEV(ABS(predicted_wait - actual_wait)) as error_stddev
FROM `crowdgo-493512.crowdgo_analytics.prediction_results`
GROUP BY date
ORDER BY date DESC;
```

## Troubleshooting

### Issue: 404 Model Not Found
**Solution**: Verify endpoint ID is correct
```bash
gcloud ai endpoints list --region=us-central1
```

### Issue: Permission Denied
**Solution**: Grant IAM permissions
```bash
gcloud projects add-iam-policy-binding crowdgo-493512 \
  --member=serviceAccount:YOUR_SERVICE_ACCOUNT@crowdgo-493512.iam.gserviceaccount.com \
  --role=roles/aiplatform.user
```

### Issue: Slow Predictions
**Solution**: Increase endpoint replicas
```bash
gcloud ai endpoints update YOUR_ENDPOINT_ID \
  --region=us-central1 \
  --update-machine-type=n1-standard-4 \
  --update-min-replica-count=2 \
  --update-max-replica-count=5
```

## Cost Optimization

### Training Costs
- AutoML training: ~$6-20 per hour
- Recommended: Start with 1 hour budget for testing

### Prediction Costs
- Per prediction: ~$0.0001 (very cheap)
- Endpoint hosting: ~$10-50/month depending on traffic

### Reduce Costs
1. Use smaller machine types (`n1-standard-2`)
2. Set min replicas to 1, max to 3
3. Use batch predictions for non-real-time use cases
4. Cache predictions when possible

## Next Steps

1. **Collect more data**: Ensure you have at least 1000 training examples
2. **Monitor accuracy**: Track MAE (Mean Absolute Error) < 5 minutes
3. **Retrain monthly**: Update model with new data
4. **A/B test**: Compare Vertex AI vs surrogate logic
5. **Optimize features**: Add more relevant features (time of day, day of week, etc.)

## API Integration

The CrowdGo API automatically uses Vertex AI when:
1. Endpoint ID is configured
2. Model is deployed and healthy
3. Prediction completes within timeout (3 seconds)

If Vertex AI fails, the system automatically falls back to surrogate logic (rule-based predictions using BigQuery data).

## Support

For issues:
1. Check [Vertex AI Documentation](https://cloud.google.com/vertex-ai/docs)
2. Review [AutoML Regression Guide](https://cloud.google.com/vertex-ai/docs/tabular-data/regression-classification/overview)
3. Check GCP logs: `gcloud logging read --limit 50`
