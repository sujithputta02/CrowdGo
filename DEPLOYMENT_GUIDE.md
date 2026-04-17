# CrowdGo Deployment Guide

## 🚀 Recommended: Deploy to Vercel (Easiest)

Vercel is the best platform for Next.js apps with zero configuration needed.

### Steps:

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel --prod
   ```

4. **Set Environment Variables** in Vercel Dashboard:
   - Go to your project settings
   - Add all environment variables from `.env.local`:
     - `NEXT_PUBLIC_FIREBASE_API_KEY`
     - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
     - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
     - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
     - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
     - `NEXT_PUBLIC_FIREBASE_APP_ID`
     - `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
     - `GOOGLE_CLOUD_PROJECT`
     - `FIREBASE_CLIENT_EMAIL`
     - `FIREBASE_PRIVATE_KEY`
     - `PUBSUB_VERIFICATION_TOKEN`

5. **Done!** Your app will be live at `https://your-project.vercel.app`

---

## 🔥 Alternative: Deploy to Firebase Hosting + Cloud Functions

For Firebase deployment, you'll need to use Firebase Functions for the API routes.

### Prerequisites:
```bash
npm install -g firebase-tools
firebase login
```

### Steps:

1. **Initialize Firebase Functions**:
   ```bash
   firebase init functions
   ```
   - Choose TypeScript
   - Install dependencies

2. **Initialize Firebase Hosting**:
   ```bash
   firebase init hosting
   ```
   - Set public directory to `out`
   - Configure as single-page app: Yes
   - Don't overwrite index.html

3. **Update `next.config.mjs`** for static export:
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

4. **Build the app**:
   ```bash
   npm run build
   ```

5. **Deploy**:
   ```bash
   firebase deploy
   ```

**Note:** This approach has limitations:
- No API routes (need to migrate to Cloud Functions)
- No server-side rendering
- No dynamic routes with parameters

---

## 🌐 Alternative: Deploy to Google Cloud Run

For full Next.js support with all features:

### Steps:

1. **Create Dockerfile**:
   ```dockerfile
   FROM node:18-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci
   COPY . .
   RUN npm run build
   EXPOSE 3000
   CMD ["npm", "start"]
   ```

2. **Build and deploy**:
   ```bash
   gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/crowdgo
   gcloud run deploy crowdgo --image gcr.io/YOUR_PROJECT_ID/crowdgo --platform managed
   ```

---

## 📋 Pre-Deployment Checklist

- [ ] All environment variables configured
- [ ] Firebase project created and configured
- [ ] Google Cloud project with APIs enabled:
  - [ ] BigQuery API
  - [ ] Vertex AI API
  - [ ] Maps JavaScript API
  - [ ] Secret Manager API
- [ ] Service account credentials set up
- [ ] All tests passing (`npm test`)
- [ ] Build succeeds (`npm run build`)
- [ ] Type check passes (`npm run type-check`)

---

## 🔒 Security Considerations

1. **Never commit** `.env.local` or credential files
2. **Use Secret Manager** for production credentials
3. **Enable CORS** properly for your domain
4. **Set up rate limiting** in production
5. **Configure Firebase Security Rules**

---

## 📊 Post-Deployment

1. **Monitor Performance**:
   - Check Vercel Analytics
   - Monitor Firebase Usage
   - Review BigQuery costs

2. **Set up Monitoring**:
   - Error tracking (Sentry)
   - Performance monitoring
   - User analytics

3. **Configure Domain** (optional):
   - Add custom domain in Vercel/Firebase
   - Update DNS records
   - Enable SSL (automatic)

---

## 🆘 Troubleshooting

### Build Fails
- Check Node.js version (18+)
- Clear `.next` and `node_modules`
- Run `npm ci` for clean install

### Environment Variables Not Working
- Ensure variables start with `NEXT_PUBLIC_` for client-side
- Restart dev server after changes
- Check Vercel dashboard for correct values

### API Routes Not Working
- Vercel: Should work automatically
- Firebase: Need to migrate to Cloud Functions
- Check CORS configuration

---

## 📞 Support

For deployment issues:
1. Check Next.js deployment docs: https://nextjs.org/docs/deployment
2. Vercel docs: https://vercel.com/docs
3. Firebase docs: https://firebase.google.com/docs/hosting

---

**Recommended:** Use Vercel for the easiest deployment with full Next.js support! 🚀
