# Vertex AI Implementation Summary

## Current Status

✅ **Code is ready** - CrowdGo API supports Vertex AI predictions  
⏳ **Waiting for**: Model training and endpoint deployment

## How It Works

### Architecture Diagram
```
┌─────────────────────────────────────────────────────────────┐
│                    CrowdGo Application                       │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  POST /api/v1/predict                                        │
│  {                                                            │
│    "facilityId": "gate-1",                                   │
│    "type": "gate",                                           │
│    "currentWait": 15                                         │
│  }                                                            │
│         ↓                                                     │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ Prediction Service (lib/vertex.ts)                  │    │
│  │                                                      │    │
│  │ 1. Check if Vertex AI endpoint is configured        │    │
│  │ 2. If yes → Call Vertex AI endpoint                 │    │
│  │ 3. If no → Use BigQuery surrogate logic             │    │
│  │ 4. Generate Aura reasoning (Gemini)                 │    │
│  │ 5. Return prediction with confidence                │    │
│  └─────────────────────────────────────────────────────┘    │
│         ↓                                                     │
│  Response:                                                    │
│  {                                                            │
│    "predictedWait": 18,                                      │
│    "confidence": "high",                                     │
│    "auraReason": "AI analyzing live crowd trajectory",       │
│    "engine": "vertex-ai"                                     │
│  }                                                            │
│                                                               │
└─────────────────────────────────────────────────────────────┘
         ↓
    ┌────────────────────────────────────────────────┐
    │         Google Cloud Vertex AI                 │
    ├────────────────────────────────────────────────┤
    │                                                 │
    │  Trained Model (crowdgo-wait-predictor)        │
    │  ├─ Input: current_wait, recent_scans, stadium │
    │  └─ Output: predicted_wait (minutes)           │
    │                                                 │
    │  Deployed on Endpoint                          │
    │  ├─ Machine: n1-standard-2                     │
    │  ├─ Min replicas: 1                            │
    │  └─ Max replicas: 3 (auto-scaling)             │
    │                                                 │
    └────────────────────────────────────────────────┘
         ↓
    ┌────────────────────────────────────────────────┐
    │         BigQuery (Training Data)               │
    ├────────────────────────────────────────────────┤
    │                                                 │
    │  Dataset: vertex_ai_training                   │
    │  Table: crowd_predictions                      │
    │  ├─ current_wait (feature)                     │
    │  ├─ recent_scans (feature)                     │
    │  ├─ stadium (feature)                          │
    │  └─ predicted_wait (label)                     │
    │                                                 │
    │  ~1000+ training examples                      │
    │  90 days of historical data                    │
    │                                                 │
    └────────────────────────────────────────────────┘
```

## Implementation Timeline

### Phase 1: Setup (Today - 30 minutes)
- ✅ Code is ready (lib/vertex.ts)
- ✅ API endpoint configured (app/api/v1/predict/route.ts)
- ✅ BigQuery data available (crowdgo_analytics.stadium_events)
- ⏳ **TODO**: Run setup script

### Phase 2: Training (1-8 hours)
- ⏳ Create BigQuery training table
- ⏳ Create Vertex AI dataset
- ⏳ Train AutoML model
- ⏳ Deploy to endpoint

### Phase 3: Integration (30 minutes)
- ⏳ Set VERTEX_AI_ENDPOINT_ID
- ⏳ Test predictions
- ⏳ Monitor accuracy

### Phase 4: Optimization (Ongoing)
- ⏳ Monitor prediction accuracy
- ⏳ Retrain monthly with new data
- ⏳ Add more features (time-of-day, day-of-week)
- ⏳ A/B test vs surrogate logic

## Quick Start Commands

### 1. Prepare Data
```bash
bash scripts/setup-vertex-ai.sh
```

### 2. Train Model (Option A: Automated)
```bash
pip install google-cloud-aiplatform
python scripts/train-vertex-model.py
```

### 2. Train Model (Option B: Manual)
1. Go to https://console.cloud.google.com/vertex-ai
2. Create AutoML Tabular Regression model
3. Use dataset: crowdgo-crowd-predictions
4. Target: predicted_wait
5. Training budget: 1 hour

### 3. Deploy Model
1. After training, click "Deploy to Endpoint"
2. Machine type: n1-standard-2
3. Min replicas: 1, Max replicas: 3
4. Click "Deploy"

### 4. Configure Endpoint
```bash
# Copy endpoint ID from console
export VERTEX_AI_ENDPOINT_ID=YOUR_ENDPOINT_ID

# Add to .env.local
echo "VERTEX_AI_ENDPOINT_ID=$VERTEX_AI_ENDPOINT_ID" >> .env.local
```

### 5. Test
```bash
npm run dev

# In another terminal
curl -X POST http://localhost:3000/api/v1/predict \
  -H 'Content-Type: application/json' \
  -d '{
    "facilityId": "gate-1",
    "type": "gate",
    "currentWait": 15
  }'
```

## What Happens If Vertex AI Fails?

The system has **automatic fallback logic**:

```
1. Try Vertex AI endpoint
   ↓ (if fails or timeout)
2. Use BigQuery surrogate logic
   ├─ Calculate surge multiplier from recent scans
   ├─ Apply to current wait time
   └─ Return prediction with "medium" confidence
   ↓ (if fails)
3. Use basic fallback
   └─ Return current wait + 3 minutes buffer
```

**Result**: Predictions always work, even if Vertex AI is down!

## Monitoring & Metrics

### Key Metrics to Track
```sql
-- Prediction accuracy
SELECT
  DATE(timestamp) as date,
  COUNT(*) as predictions,
  ROUND(AVG(ABS(predicted_wait - actual_wait)), 2) as mean_error,
  ROUND(STDDEV(ABS(predicted_wait - actual_wait)), 2) as error_stddev
FROM `crowdgo-493512.crowdgo_analytics.prediction_results`
GROUP BY date
ORDER BY date DESC;

-- Engine usage
SELECT
  engine,
  COUNT(*) as count,
  ROUND(100 * COUNT(*) / SUM(COUNT(*)) OVER (), 2) as percentage
FROM `crowdgo-493512.crowdgo_analytics.prediction_results`
GROUP BY engine;

-- Confidence distribution
SELECT
  confidence,
  COUNT(*) as count,
  ROUND(100 * COUNT(*) / SUM(COUNT(*)) OVER (), 2) as percentage
FROM `crowdgo-493512.crowdgo_analytics.prediction_results`
GROUP BY confidence;
```

## Cost Analysis

### One-Time Costs
| Item | Cost | Notes |
|------|------|-------|
| Model Training (1 hour) | $6-10 | Can retrain monthly |
| Initial Setup | $0 | Using existing GCP project |

### Monthly Recurring Costs
| Item | Cost | Notes |
|------|------|-------|
| Endpoint Hosting | $10-50 | Depends on traffic |
| Predictions | $0.01-1 | ~$0.0001 per prediction |
| BigQuery Storage | $6.25/TB | Minimal for this data |
| **Total** | **~$20-60** | Very cost-effective |

### Cost Optimization Tips
1. Use smaller machine types (n1-standard-2)
2. Set min replicas to 1, max to 3
3. Use batch predictions for non-real-time use cases
4. Cache predictions when possible
5. Monitor and adjust based on actual usage

## Success Criteria

✅ **Model is trained** - Mean Absolute Error < 5 minutes  
✅ **Endpoint is deployed** - Predictions complete in < 3 seconds  
✅ **API integration works** - Returns "vertex-ai" engine  
✅ **Fallback works** - Returns "surrogate" if Vertex AI fails  
✅ **Monitoring active** - Tracking accuracy and performance  

## Next Steps

1. **This week**: Run setup script and start training
2. **Next week**: Deploy model and test predictions
3. **Week 3**: Monitor accuracy and optimize
4. **Week 4**: A/B test vs surrogate logic
5. **Ongoing**: Retrain monthly with new data

## Documentation

- 📖 **Quick Start**: [VERTEX_AI_QUICK_START.md](./VERTEX_AI_QUICK_START.md)
- 📖 **Detailed Setup**: [VERTEX_AI_SETUP_GUIDE.md](./VERTEX_AI_SETUP_GUIDE.md)
- 📖 **Code**: [lib/vertex.ts](./lib/vertex.ts)
- 📖 **API**: [app/api/v1/predict/route.ts](./app/api/v1/predict/route.ts)

## Support

For issues or questions:
1. Check the troubleshooting section in VERTEX_AI_QUICK_START.md
2. Review GCP logs: `gcloud logging read --limit 50`
3. Check Vertex AI console: https://console.cloud.google.com/vertex-ai
4. Read official docs: https://cloud.google.com/vertex-ai/docs

---

**Status**: Ready to deploy 🚀  
**Last Updated**: 2026-04-19  
**Next Review**: After model training completes
