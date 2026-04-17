#!/bin/bash

# setup-dataflow.sh - Preparation for Cloud Dataflow Submission

# 1. Install required Python libraries
echo "📦 Installing Apache Beam and Cloud dependencies..."
python3 -m pip install apache-beam[gcp] google-cloud-firestore kfp google-cloud-pipeline-components

# 2. Get Project Context
PROJECT_ID=$(gcloud config get-value project)
TOPIC_ID="stadium-events"
BUCKET_NAME="crowdgo-dataflow-temp"

echo "🚀 Configuration Loaded:"
echo "   Project: $PROJECT_ID"
echo "   Topic:   projects/$PROJECT_ID/topics/$TOPIC_ID"
echo "   Bucket:  gs://$BUCKET_NAME"

# 3. Launch Command Guide
echo ""
echo "🔥 TO LAUNCH THE DATAFLOW JOB, RUN THIS COMMAND:"
echo "--------------------------------------------------"
echo "python3 dataflow/process_events.py \\"
echo "  --project_id=$PROJECT_ID \\"
echo "  --input_topic=projects/$PROJECT_ID/topics/$TOPIC_ID \\"
echo "  --runner=DataflowRunner \\"
echo "  --temp_location=gs://$BUCKET_NAME/temp \\"
echo "  --region=us-central1 \\"
echo "  --job_name=crowdgo-surge-detector"
echo "--------------------------------------------------"
echo ""
echo "Note: Ensure you have created the bucket 'gs://$BUCKET_NAME' in your GCP Console first."
