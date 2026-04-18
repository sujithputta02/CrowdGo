# Google Maps API Key Fix Guide

## Issues Detected

1. **API Key Expired Error** - Your Maps API key is showing as expired
2. **Service Worker Event Handlers** - Push notification handlers need to be registered at top level
3. **Places API 400 Error** - Invalid API key for Places API

## Step 1: Fix Your Google Maps API Key

### Go to Google Cloud Console
1. Visit: https://console.cloud.google.com/apis/credentials
2. Select project: `crowdgo-493512`

### Create a NEW API Key (or regenerate existing)
1. Click "Create Credentials" → "API Key"
2. Copy the new key (you'll need it in Step 2)

### Configure API Key Restrictions

#### Application Restrictions
- Select: **HTTP referrers (web sites)**
- Add these referrers:
  ```
  http://localhost:3000/*
  http://localhost:3001/*
  http://127.0.0.1:3000/*
  http://127.0.0.1:3001/*
  https://crowdgo-493512.web.app/*
  https://crowdgo-493512.firebaseapp.com/*
  ```

#### API Restrictions
- Select: **Restrict key**
- Enable these APIs:
  - ✅ Maps JavaScript API
  - ✅ Places API (New)
  - ✅ Geocoding API
  - ✅ Directions API
  - ✅ Distance Matrix API

### Enable Required APIs
Make sure these are enabled in your project:
1. Go to: https://console.cloud.google.com/apis/library
2. Search and enable:
   - Maps JavaScript API
   - Places API (New) ← **This is critical!**
   - Geocoding API
   - Directions API

## Step 2: Update Your Local Environment

1. Open `.env.local` file
2. Replace the `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` value with your NEW key
3. **DO NOT commit this file to git** (it's already in .gitignore)

## Step 3: Update Firebase Environment

You need to set the environment variable in Firebase:

```bash
# Set the new API key in Firebase
firebase functions:config:set maps.api_key="YOUR_NEW_API_KEY_HERE"

# Deploy the config
firebase deploy --only functions
```

Or add it to your Firebase Hosting environment in the console:
1. Go to: https://console.firebase.google.com/project/crowdgo-493512/settings/general
2. Scroll to "Your apps" → Web app
3. Add environment variable: `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`

## Step 4: Fix Service Worker Issues

The service worker warnings are non-critical but can be fixed by ensuring event handlers are at the top level.

## Step 5: Rebuild and Redeploy

```bash
# Clear Next.js cache
rm -rf .next

# Rebuild
npm run build

# Redeploy
firebase deploy --only hosting
```

## Verification Checklist

After completing the steps above:

- [ ] New API key created in Google Cloud Console
- [ ] HTTP referrers configured (localhost + production URLs)
- [ ] Places API (New) is enabled
- [ ] API restrictions set to required APIs only
- [ ] `.env.local` updated with new key
- [ ] Firebase environment variables updated
- [ ] Application rebuilt and redeployed
- [ ] Map loads without errors on https://crowdgo-493512.web.app

## Common Issues

### "API key expired"
- The key is actually expired or disabled
- Solution: Create a new key

### "INVALID_ARGUMENT" 
- Places API (New) is not enabled
- Solution: Enable it in API Library

### "RefererNotAllowedMapError"
- Your domain isn't in the allowed referrers list
- Solution: Add the exact URL pattern with `/*`

### Map loads but Places don't show
- Places API restrictions not set correctly
- Solution: Make sure "Places API (New)" is in the API restrictions list

## Security Notes

- ✅ `.env.local` is in `.gitignore` - secrets won't be committed
- ✅ API key has HTTP referrer restrictions - can only be used from your domains
- ✅ API key has API restrictions - can only call specific Google APIs
- ⚠️  Never commit API keys to git
- ⚠️  Never share API keys in screenshots or logs

## Need Help?

If you're still seeing errors after following these steps:
1. Check browser console for specific error messages
2. Verify the API key is active in Google Cloud Console
3. Wait 5 minutes after making changes (propagation time)
4. Clear browser cache and hard reload (Cmd+Shift+R)
