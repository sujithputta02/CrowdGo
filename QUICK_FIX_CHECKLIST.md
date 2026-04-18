# Quick Fix Checklist - Maps API Issue

## ⚠️ Your API Key Expired - Here's What to Do:

### 1️⃣ Get a New Google Maps API Key (5 minutes)

1. Go to: https://console.cloud.google.com/apis/credentials?project=crowdgo-493512
2. Click **"+ CREATE CREDENTIALS"** → **"API Key"**
3. Copy the new key immediately

### 2️⃣ Configure the Key Restrictions

Click **"RESTRICT KEY"** on the key you just created:

**Website restrictions:**
```
http://localhost:3000/*
http://localhost:3001/*
http://127.0.0.1:3000/*
http://127.0.0.1:3001/*
https://crowdgo-493512.web.app/*
https://crowdgo-493512.firebaseapp.com/*
```

**API restrictions** - Select these APIs:
- ✅ Maps JavaScript API
- ✅ Places API (New) ← **IMPORTANT!**
- ✅ Geocoding API
- ✅ Directions API

Click **SAVE**

### 3️⃣ Enable Places API (New)

1. Go to: https://console.cloud.google.com/apis/library?project=crowdgo-493512
2. Search: **"Places API (New)"**
3. Click **ENABLE**

### 4️⃣ Update Your Local Environment

Open `.env.local` and replace the old key:

```bash
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=YOUR_NEW_KEY_HERE
```

### 5️⃣ Rebuild and Test Locally

```bash
# Clear cache
rm -rf .next

# Rebuild
npm run build

# Test locally
npm run dev
```

Visit http://localhost:3000/map and check if the map loads

### 6️⃣ Deploy to Production

```bash
./firebase-deploy.sh
```

## ✅ Service Worker Fixed

I've already fixed the service worker warnings by moving event handlers to the top level.

## 🔒 Security Notes

- Your `.env.local` file is NOT tracked by git (it's in .gitignore)
- API key restrictions prevent unauthorized use
- Never share your API key in screenshots or public repos

## 🆘 Still Having Issues?

Check the browser console for the exact error message and refer to `MAPS_API_FIX_GUIDE.md` for detailed troubleshooting.
