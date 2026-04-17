# 🔥 Firebase Deployment Steps for CrowdGo

## Current Status
- ✅ Build successful (`npm run build`)
- ✅ Firebase CLI installed (v15.14.0)
- ✅ Web frameworks experiment enabled
- ⚠️ Cloud Functions needs to be enabled in Firebase Console

---

## Step-by-Step Deployment

### 1. Enable Required APIs in Google Cloud Console

Go to: https://console.cloud.google.com/apis/library?project=crowdgo-493512

Enable these APIs:
- ✅ Cloud Functions API
- ✅ Cloud Build API
- ✅ Cloud Run Admin API
- ✅ Artifact Registry API

### 2. Enable Billing (Required for Cloud Functions)

Cloud Functions requires a billing account:
1. Go to: https://console.firebase.google.com/project/crowdgo-493512/overview
2. Click "Upgrade" to Blaze (Pay as you go) plan
3. Note: Firebase has generous free tier, you likely won't be charged

### 3. Deploy to Firebase

Once APIs are enabled and billing is set up:

```bash
# Deploy to Firebase Hosting with Cloud Functions
firebase deploy --only hosting

# Or deploy everything
firebase deploy
```

---

## Alternative: Quick Static Deployment (No API Routes)

If you want to deploy quickly without Cloud Functions (static pages only):

### 1. Update `next.config.mjs`:
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
```

### 2. Update `firebase.json`:
```json
{
  "hosting": {
    "public": "out",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

### 3. Build and deploy:
```bash
npm run build
firebase deploy --only hosting
```

**Note:** This approach won't support:
- API routes (`/api/*`)
- Server-side rendering
- Middleware

---

## Recommended: Deploy to Vercel Instead

Since you have API routes and middleware, **Vercel is much easier**:

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

Vercel automatically handles:
- ✅ Next.js API routes
- ✅ Server-side rendering
- ✅ Middleware
- ✅ Environment variables
- ✅ Automatic HTTPS
- ✅ Global CDN

---

## Current Firebase Configuration

**Project ID:** `crowdgo-493512`
**Project Name:** CrowdGo

**Files Created:**
- `firebase.json` - Firebase Hosting configuration
- `.firebaserc` - Firebase project configuration
- `firebase-deploy.sh` - Deployment script

---

## Troubleshooting

### Error: "Failed to list functions"
**Solution:** Enable Cloud Functions API in Google Cloud Console

### Error: "Billing account required"
**Solution:** Upgrade to Blaze plan in Firebase Console

### Error: "Node version mismatch"
**Solution:** This is just a warning, deployment should still work

---

## What's Next?

1. **Enable Cloud Functions** in Firebase Console
2. **Run:** `firebase deploy --only hosting`
3. **Your app will be live at:**
   - https://crowdgo-493512.web.app
   - https://crowdgo-493512.firebaseapp.com

---

## Need Help?

- Firebase Hosting Docs: https://firebase.google.com/docs/hosting
- Next.js on Firebase: https://firebase.google.com/docs/hosting/frameworks/nextjs
- Firebase Support: https://firebase.google.com/support

**Recommendation:** Use Vercel for the easiest deployment! 🚀
