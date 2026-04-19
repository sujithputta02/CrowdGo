# Google Authentication Setup Guide

## Issue
"Google sync failed. Manual entry required" error when attempting Google login.

## Root Cause
Google OAuth provider is not configured in Firebase Console for your project.

## Solution

### Step 1: Enable Google Sign-In in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **crowdgo-493512**
3. Navigate to **Authentication** → **Sign-in method**
4. Click on **Google**
5. Toggle **Enable** to ON
6. Select a **Project support email** (your email)
7. Click **Save**

### Step 2: Configure OAuth Consent Screen (Google Cloud Console)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select project: **crowdgo-493512**
3. Navigate to **APIs & Services** → **OAuth consent screen**
4. Select **External** user type
5. Fill in the form:
   - **App name**: CrowdGo
   - **User support email**: your-email@gmail.com
   - **Developer contact**: your-email@gmail.com
6. Click **Save and Continue**
7. On **Scopes** page, add these scopes:
   - `openid`
   - `email`
   - `profile`
8. Click **Save and Continue**
9. On **Test users** page, add your email as a test user
10. Click **Save and Continue**

### Step 3: Configure Authorized Redirect URIs

1. In Google Cloud Console, go to **APIs & Services** → **Credentials**
2. Find your **OAuth 2.0 Client ID** (Web application)
3. Click on it to edit
4. Add these **Authorized redirect URIs**:
   ```
   http://localhost:3000/__/auth/handler
   https://crowdgo-493512.firebaseapp.com/__/auth/handler
   https://your-production-domain.com/__/auth/handler
   ```
5. Click **Save**

### Step 4: Verify Firebase Configuration

Your `.env.local` should have:
```
NEXT_PUBLIC_FIREBASE_API_KEY=YOUR_API_KEY_HERE
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=crowdgo-493512.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=crowdgo-493512
NEXT_PUBLIC_FIREBASE_APP_ID=YOUR_APP_ID_HERE
```

### Step 5: Test Google Login

1. Start your development server: `npm run dev`
2. Go to http://localhost:3000/login
3. Click **Login with Google**
4. You should see the Google sign-in popup
5. Sign in with your test account

## Troubleshooting

### "Popup blocked" error
- Check browser popup settings
- Allow popups for localhost:3000

### "Unauthorized domain" error
- Add your domain to authorized redirect URIs in Google Cloud Console
- Wait 5-10 minutes for changes to propagate

### "Operation not supported in this environment" error
- Ensure you're using HTTPS in production
- Check that Firebase is properly initialized

### Still getting "Google sync failed"?
1. Clear browser cache and cookies
2. Try in an incognito window
3. Check browser console for detailed error messages
4. Verify all Firebase credentials in `.env.local`

## Email Login Fallback

If Google login continues to fail, users can:
1. Use **Email/Password** login
2. Use **Experience Anonymously** option
3. Sign up with email at `/signup`

## Production Deployment

Before deploying to production:

1. Update authorized redirect URIs with your production domain
2. Move OAuth consent screen from **External** to **Internal** (if using company domain)
3. Test Google login on production domain
4. Monitor Firebase Authentication logs for errors

## Support

For Firebase authentication issues:
- [Firebase Auth Documentation](https://firebase.google.com/docs/auth)
- [Google OAuth Setup Guide](https://developers.google.com/identity/protocols/oauth2)
- [Firebase Console](https://console.firebase.google.com/)
