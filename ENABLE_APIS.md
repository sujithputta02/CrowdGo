# 🔥 Enable Firebase Cloud Functions API

## Quick Steps to Enable APIs

### Option 1: Using Google Cloud Console (Recommended)

1. **Go to Cloud Functions API page:**
   ```
   https://console.cloud.google.com/apis/library/cloudfunctions.googleapis.com?project=crowdgo-493512
   ```

2. **Click "ENABLE" button**

3. **Also enable these APIs:**
   - Cloud Build API: https://console.cloud.google.com/apis/library/cloudbuild.googleapis.com?project=crowdgo-493512
   - Cloud Run Admin API: https://console.cloud.google.com/apis/library/run.googleapis.com?project=crowdgo-493512
   - Artifact Registry API: https://console.cloud.google.com/apis/library/artifactregistry.googleapis.com?project=crowdgo-493512

### Option 2: Using gcloud CLI

If you have gcloud CLI installed and configured:

```bash
# Login to Google Cloud
gcloud auth login

# Set project
gcloud config set project crowdgo-493512

# Enable required APIs
gcloud services enable cloudfunctions.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable artifactregistry.googleapis.com
```

---

## After Enabling APIs

Once the APIs are enabled, run:

```bash
firebase deploy --only hosting
```

Your app will be deployed to:
- https://crowdgo-493512.web.app
- https://crowdgo-493512.firebaseapp.com

---

## Current Status

✅ Project: crowdgo-493512
✅ Blaze Plan: Enabled
✅ Build: Successful
✅ Firebase CLI: Authenticated
⚠️ Cloud Functions API: **Needs to be enabled**

---

## Alternative: Deploy to Vercel (Easier!)

If you want to skip the API enabling process, Vercel is much simpler for Next.js:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy (will prompt for login)
vercel --prod
```

Vercel automatically handles everything without any API configuration needed!
