# Vercel Deployment - Firebase Fix Guide

## The Problem
Vercel is giving env file errors because:
1. Firebase private key newlines need special formatting
2. Environment variables are not properly escaped
3. The backend and frontend are being deployed separately

## Solution

### Step 1: Frontend Deployment (Vercel)

Vercel will deploy the **frontend only**. Go to your Vercel project settings:

1. **Project Settings → Environment Variables**
2. Add these variables (get values from Firebase Console):

```
VITE_API_URL=https://your-backend-url.com/api
VITE_SOCKET_URL=https://your-backend-url.com

VITE_FIREBASE_API_KEY=YOUR_API_KEY
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890
```

### Step 2: Backend Deployment (Railway/Render)

Deploy the backend separately to Railway or Render:

1. **Get Firebase Service Account JSON** from Firebase Console:
   - Go to Project Settings → Service Accounts
   - Click "Generate new private key"
   - Open the downloaded JSON file

2. **For Railway/Render Environment Variables:**

**Option A: Using JSON file directly**
```
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBA...\n-----END PRIVATE KEY-----\n"
```

**Option B: If Option A doesn't work (newline issue)**

Replace the literal newlines with `\n`:
1. Open your service account JSON file
2. Find the `private_key` value
3. Copy the entire key including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`
4. In your hosting platform, paste it with proper escaping

### Step 3: Fix Firebase Private Key Formatting

The issue is usually the newline character. Here's how to format it:

**From this (raw JSON):**
```
-----BEGIN PRIVATE KEY-----
MIIEvQIBA...
...
-----END PRIVATE KEY-----
```

**To this (escaped for env variables):**
```
-----BEGIN PRIVATE KEY-----\nMIIEvQIBA...\n-----END PRIVATE KEY-----\n
```

### Step 4: Update CORS_ORIGIN

In your backend environment variables, set:
```
CORS_ORIGIN=https://your-vercel-frontend-url.vercel.app
NODE_ENV=production
```

### Step 5: Update Frontend API URLs

Make sure in your Vercel environment, you have:
```
VITE_API_URL=https://your-backend-domain.com/api
VITE_SOCKET_URL=https://your-backend-domain.com
```

## Quick Checklist

- [ ] Frontend env vars added to Vercel
- [ ] Backend env vars added to Railway/Render
- [ ] Firebase private key properly formatted with `\n`
- [ ] CORS_ORIGIN points to your Vercel frontend URL
- [ ] VITE_API_URL points to your backend URL
- [ ] MongoDB connection string added to backend env
- [ ] Redeploy both services

## Testing After Setup

1. Visit your Vercel frontend URL
2. Try signing up with Firebase auth
3. Check browser console for errors
4. Test messaging and listings features
5. Check backend logs for Firebase initialization

## If Still Getting Errors

### Error: "Missing Firebase Admin SDK environment variables"
- Verify all 3 Firebase vars are set: PROJECT_ID, CLIENT_EMAIL, PRIVATE_KEY
- Check for extra spaces or quotes in values

### Error: "CORS policy blocked"
- Update CORS_ORIGIN in backend to match your Vercel frontend URL
- Redeploy backend

### Error: "Firebase authentication failed"
- Ensure frontend Firebase config matches your Firebase project
- Check that client is using correct API key (not admin key)

### Error: "Socket connection refused"
- Verify VITE_SOCKET_URL points to backend domain
- Check backend is running and accessible

## Firebase Private Key Extraction Tool

If you're having trouble with the formatting, use this:

1. Open your service account JSON file
2. Find the `private_key` value
3. It should look like:
```json
"private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBA...\n-----END PRIVATE KEY-----\n"
```

4. Copy everything between the quotes (including the `\n` sequences)
5. Paste into your environment variable

## Environment Variable Names Reference

### Frontend (Vercel)
- `VITE_API_URL` - Backend API base URL
- `VITE_SOCKET_URL` - Backend socket.io URL
- `VITE_FIREBASE_API_KEY` - Public Firebase API key
- `VITE_FIREBASE_AUTH_DOMAIN` - Firebase auth domain
- `VITE_FIREBASE_PROJECT_ID` - Firebase project ID
- `VITE_FIREBASE_STORAGE_BUCKET` - Firebase storage
- `VITE_FIREBASE_MESSAGING_SENDER_ID` - Firebase messaging ID
- `VITE_FIREBASE_APP_ID` - Firebase app ID

### Backend (Railway/Render)
- `MONGODB_URI` - MongoDB connection string
- `FIREBASE_PROJECT_ID` - Firebase project ID
- `FIREBASE_CLIENT_EMAIL` - Service account email
- `FIREBASE_PRIVATE_KEY` - Service account private key
- `CLOUDINARY_CLOUD_NAME` - Cloudinary cloud name
- `CLOUDINARY_API_KEY` - Cloudinary API key
- `CLOUDINARY_API_SECRET` - Cloudinary API secret
- `CORS_ORIGIN` - Frontend URL
- `PORT` - Backend port (usually 4000)
- `NODE_ENV` - Set to "production"

---

Once you've set these up correctly, both services should communicate without Firebase errors!
