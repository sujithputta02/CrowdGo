# Security Notice - Secret Management

## Important: No Real Secrets in Repository

This repository does **NOT** contain any real secrets or credentials. All sensitive information is managed through:

1. **Environment Variables** (`.env.local` - NOT tracked in git)
2. **Google Cloud Secret Manager** (for production)
3. **Local Key Files** (`gcp-key.json` - NOT tracked in git)

## Files in This Repository

### ✅ Safe Files (Templates/Examples)
- `.env.example` - Template with placeholder values
- `gcp-key.json.example` - Template for service account key
- `GOOGLE_AUTH_SETUP.md` - Setup instructions (no real credentials)

### ❌ NOT in Repository (Gitignored)
- `.env.local` - Contains real environment variables
- `gcp-key.json` - Contains real service account credentials
- Any files matching `*-key.json`, `*.key`, `secrets.json`

## GitHub Secret Scanning

If GitHub's secret scanning has flagged this repository:

### Firebase API Keys (NEXT_PUBLIC_FIREBASE_API_KEY)
- **Status:** Public by design
- **Security:** These are meant to be exposed in client-side code
- **Protection:** Secured via Firebase Security Rules and domain restrictions
- **Action Required:** None - this is expected behavior

### Google Maps API Key (NEXT_PUBLIC_GOOGLE_MAPS_API_KEY)
- **Status:** Public by design (used in browser)
- **Security:** Restricted to specific domains in Google Cloud Console
- **Protection:** API key restrictions prevent unauthorized use
- **Action Required:** Ensure domain restrictions are configured

### Service Account Private Keys
- **Status:** NOT in repository
- **Location:** Only in `.env.local` (gitignored) or `gcp-key.json` (gitignored)
- **Action Required:** None - these files are never committed

## For Developers

### Setting Up Your Environment

1. **Copy the example file:**
   ```bash
   cp .env.example .env.local
   ```

2. **Fill in your real values:**
   - Get Firebase config from Firebase Console
   - Get Google Maps API key from Google Cloud Console
   - Create service account and download `gcp-key.json`

3. **Verify gitignore:**
   ```bash
   git status
   # Should NOT show .env.local or gcp-key.json
   ```

### If You Accidentally Commit Secrets

1. **Remove from git history:**
   ```bash
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch .env.local" \
     --prune-empty --tag-name-filter cat -- --all
   ```

2. **Rotate the compromised secrets:**
   - Generate new Firebase API keys
   - Create new service account
   - Update Google Maps API key

3. **Force push (if necessary):**
   ```bash
   git push origin --force --all
   ```

## Security Best Practices

### ✅ DO
- Use `.env.local` for local development
- Use Google Cloud Secret Manager for production
- Restrict API keys to specific domains/IPs
- Rotate secrets regularly
- Use service accounts with minimal permissions

### ❌ DON'T
- Commit `.env.local` or `gcp-key.json` to git
- Share secrets in Slack, email, or other channels
- Use production secrets in development
- Give service accounts more permissions than needed
- Hardcode secrets in source code

## Firebase API Keys - Why They're Public

Firebase API keys are **designed to be public** and included in client-side code:

1. **Not a Security Risk:** Firebase API keys identify your Firebase project, not authenticate users
2. **Real Security:** Comes from Firebase Security Rules and Authentication
3. **Domain Restrictions:** Can be restricted to specific domains in Firebase Console
4. **Expected Behavior:** These keys are meant to be in your JavaScript bundle

**Reference:** [Firebase API Key Security](https://firebase.google.com/docs/projects/api-keys)

## Google Maps API Keys - Public with Restrictions

Google Maps API keys are used in the browser and should be:

1. **Restricted by Domain:** Only allow requests from your domains
2. **Restricted by API:** Only enable required APIs (Maps JavaScript API, etc.)
3. **Monitored:** Set up billing alerts and usage quotas
4. **Rotated:** Regularly rotate keys as a security practice

**Reference:** [API Key Best Practices](https://developers.google.com/maps/api-security-best-practices)

## Reporting Security Issues

If you discover a security vulnerability, please email: security@crowdgo.com

**Do NOT** create a public GitHub issue for security vulnerabilities.

---

**Last Updated:** April 19, 2026  
**Status:** ✅ No real secrets in repository
