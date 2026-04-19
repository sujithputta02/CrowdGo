# Vertex AI Quick Start Guide

## TL;DR - Get Vertex AI Working in 5 Steps

### Step 1: Prepare Data (5 minutes)
```bash
# Run the setup script to create BigQuery training table
bash scripts/setup-vertex-ai.sh
```

### Step 2: Train Model (1-8 hours)
```bash
# Option A: Using Python script (automated)
pip install google-cloud-aiplatform
python scripts/train-vertex-model.py

# Option B: Manual via Console
# 1. Go to https://console.cloud.google.com/vertex-ai
# 2. Click "Create" → "AutoML Tabular"
# 3. Select dataset: crowdgo-crowd-predictions
# 4. Target: predicted_wait
# 5. Training budget: 1 hour (for testing)
# 6. Click "Train"
```

### Step 3: Deploy Model (5-10 minutes)
```bash
# After training completes:
# 1. Click "Deploy to Endpoint"
# 2. Machine type: n1-standard-2
# 3. Min replicas: 1, Max replicas: 3
# 4. Click "Deploy"
```

### Step 4: Get Endpoint ID
```bash
# Copy the Endpoint ID from the console
# It looks like: 1234567890123456789

# Save it to .env.local
echo "VERTEX_AI_ENDPOINT_ID=YOUR_ENDPOINT_ID" >> .env.local
```

### Step 5: Test It Works
```bash
# Start the app
npm run dev

# In another terminal, test the API
curl -X POST http://localhost:3000/api/v1/predict \
  -H 'Content-Type: application/json' \
  -d '{
    "facilityId": "gate-1",
    "type": "gate",
    "currentWait": 15
  }'

# Expected response:
# {
#   "facilityId": "gate-1",
#   "originalWait": 15,
#   "predictedWait": 18,
#   "confidence": "high",
#   "auraReason": "AI analyzing live crowd trajectory.",
#   "engine": "vertex-ai",
#   "timestamp": "2026-04-19T..."
# }
```

## What's Happening Behind the Scenes?

### Data Flow
```
1. BigQuery (Historical Data)
   └─ stadium_events table with wait times
   
2. Vertex AI Training
   └─ Learns patterns: current_wait + recent_scans → predicted_wait
   
3. Vertex AI Endpoint
   └─ Deployed model ready for predictions
   
4. CrowdGo API
   └─ Calls endpoint with live data
   └─ Returns prediction + confidence
```

### Model Features
- **Input**: current_wait, recent_scans, stadium
- **Output**: predicted_wait (in minutes)
- **Type**: Regression (predicting continuous values)
- **Algorithm**: AutoML (Google chooses best algorithm)

## Troubleshooting

### Problem: "No custom ENDPOINT_ID found"
**Solution**: Endpoint ID not set
```bash
# Check if set
echo $VERTEX_AI_ENDPOINT_ID

# If empty, set it
export VERTEX_AI_ENDPOINT_ID=YOUR_ENDPOINT_ID
```

### Problem: "404 Model not found"
**Solution**: Endpoint ID is wrong or model not deployed
```bash
# List your endpoints
gcloud ai endpoints list --region=us-central1

# Copy the correct ID and update .env.local
```

### Problem: "Permission denied"
**Solution**: Service account doesn't have access
```bash
# Grant permissions
gcloud projects add-iam-policy-binding crowdgo-493512 \
  --member=serviceAccount:YOUR_SERVICE_ACCOUNT@crowdgo-493512.iam.gserviceaccount.com \
  --role=roles/aiplatform.user
```

### Problem: "Timeout - prediction took too long"
**Solution**: Endpoint is overloaded
```bash
# Increase replicas
gcloud ai endpoints update YOUR_ENDPOINT_ID \
  --region=us-central1 \
  --update-max-replica-count=5
```

## Monitoring

### Check Prediction Accuracy
```sql
-- Query recent predictions
SELECT
  DATE(timestamp) as date,
  COUNT(*) as predictions,
  ROUND(AVG(ABS(predicted_wait - actual_wait)), 2) as mean_error
FROM `crowdgo-493512.crowdgo_analytics.prediction_results`
WHERE timestamp > TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 7 DAY)
GROUP BY date
ORDER BY date DESC;
```

### View Logs
```bash
# See prediction logs
gcloud logging read "resource.type=api AND jsonPayload.engine=vertex-ai" \
  --limit 50 \
  --format json
```

## Cost Breakdown

| Component | Cost | Notes |
|-----------|------|-------|
| Training (1 hour) | $6-10 | One-time, can retrain monthly |
| Endpoint hosting | $10-50/month | Depends on traffic |
| Per prediction | $0.0001 | Very cheap |
| BigQuery storage | $6.25/TB/month | Minimal for this data |

**Total**: ~$20-60/month for production setup

## Next Steps

1. **Monitor accuracy**: Track Mean Absolute Error (MAE)
2. **Retrain monthly**: Update model with new data
3. **A/B test**: Compare Vertex AI vs surrogate logic
4. **Optimize features**: Add time-of-day, day-of-week, etc.
5. **Scale up**: Increase replicas as traffic grows

## Advanced: Custom Training

If AutoML doesn't meet your needs, you can:

1. **Use custom code**: Train with TensorFlow/PyTorch
2. **Use pre-built algorithms**: XGBoost, Linear Regression
3. **Use Vertex AI Workbench**: Jupyter notebooks for experimentation

See [VERTEX_AI_SETUP_GUIDE.md](./VERTEX_AI_SETUP_GUIDE.md) for details.

## Support

- **Vertex AI Docs**: https://cloud.google.com/vertex-ai/docs
- **AutoML Guide**: https://cloud.google.com/vertex-ai/docs/tabular-data/regression-classification/overview
- **Pricing**: https://cloud.google.com/vertex-ai/pricing
- **Community**: https://stackoverflow.com/questions/tagged/google-cloud-vertex-ai
