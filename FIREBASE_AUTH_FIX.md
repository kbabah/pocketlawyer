# Firebase Authentication Error Fix

## Problem
Users are getting `auth/internal-error` when trying to sign up.

## Root Causes

The `auth/internal-error` in Firebase typically occurs due to:

1. **Email/Password authentication not enabled** in Firebase Console
2. **API key restrictions** blocking authentication requests
3. **Missing Firebase configuration**

## Solution

### Step 1: Enable Email/Password Authentication

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **pocketlawyer-2582e**
3. Navigate to **Authentication** → **Sign-in method**
4. Enable **Email/Password** provider:
   - Click on "Email/Password"
   - Toggle "Enable"
   - Click "Save"

### Step 2: Check API Key Restrictions

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select project: **pocketlawyer-2582e**
3. Navigate to **APIs & Services** → **Credentials**
4. Find your API key: `AIzaSyC7JsTZnr3y6IdrTRZUl2g-PhXVjd3iZ2c`
5. Click on it to edit
6. Under **API restrictions**:
   - Choose "Don't restrict key" (for development)
   - OR add these APIs:
     - Identity Toolkit API
     - Firebase Authentication API
     - Cloud Firestore API
7. Under **Application restrictions**:
   - For development: Choose "None"
   - For production: Add your domain
8. Click "Save"

### Step 3: Verify Identity Toolkit API is Enabled

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** → **Library**
3. Search for **Identity Toolkit API**
4. Click on it and ensure it's **ENABLED**
5. If not enabled, click "ENABLE"

### Step 4: Test the Fix

Run the diagnostic:
```bash
curl http://localhost:3001/api/auth/diagnostic
```

Try signing up with a test account in the browser:
- Email: `test@example.com`
- Password: `Test123!`

## Additional Debugging

If the issue persists, check browser console for more details:

1. Open browser DevTools (F12)
2. Go to Console tab
3. Try signing up
4. Look for detailed Firebase error messages

The error might also show:
- `auth/operation-not-allowed` - Email/Password not enabled
- `auth/api-key-not-valid` - API key restrictions
- Network errors - CORS or connectivity issues

## Quick Fix Script

Run this to verify Firebase Console settings:

```javascript
// In browser console on your app
import { auth } from '@/lib/firebase';
console.log('Auth app name:', auth.app.name);
console.log('Auth settings:', auth.app.options);
```

## Files Modified

- Created: `app/api/auth/diagnostic/route.ts` - Diagnostic endpoint
- This guide: `FIREBASE_AUTH_FIX.md`

## Status

✅ Firebase Admin SDK: Working
✅ Environment variables: Configured
⏳ Firebase Console: **Needs manual verification**

**Action Required:** Check Firebase Console settings above.
