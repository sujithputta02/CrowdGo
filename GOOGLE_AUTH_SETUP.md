# Google Cloud Authentication Setup

## Overview
This project requires Google Cloud service account credentials for BigQuery and other GCP services.

## Setup Instructions

### 1. Create Service Account
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to **IAM & Admin** → **Service Accounts**
3. Click **"CREATE SERVICE ACCOUNT"**
4. Fill in:
   - **Service account name**: `crowdgo-service`
   - **Service account ID**: `crowdgo-service`
5. Click **"CREATE AND CONTINUE"**

### 2. Grant Required Roles
Add these roles to your service account:
- `BigQuery User`
- `BigQuery Data Viewer`
- `Service Account Token Creator`

### 3. Create and Download Key
1. Click on your service account
2. Go to **"KEYS"** tab
3. Click **"ADD KEY"** → **"Create new key"**
4. Choose **JSON** format
5. Click **"CREATE"**

### 4. Install Key File
1. Rename the downloaded file to `gcp-key.json`
2. Place it in your project root (same level as `package.json`)
3. **NEVER commit this file to git** - it's already in `.gitignore`

### 5. Verify Setup
The file should look like the example in `gcp-key.json.example` but with your real credentials.

## Security Notes
- The `gcp-key.json` file contains sensitive credentials
- It's automatically ignored by git (see `.gitignore`)
- Never share or commit this file
- Each developer needs their own service account key

## Environment Variables Alternative
Instead of a file, you can also use environment variables:
```bash
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/your/gcp-key.json"
```

## Troubleshooting
- Ensure your service account has the required permissions
- Verify the JSON file is valid
- Check that BigQuery API is enabled in your project