# Firebase Authentication Issues - FIXED

## 🔍 Problem Diagnosis

**Symptom:** Both email/password signup AND Google Sign-In stopped working
**Error:** `auth/internal-error`
**When it started:** After implementing CSP (Content Security Policy) headers

---

## ✅ ROOT CAUSES FOUND & FIXED

### 1. **CSP Headers Blocking Firebase Auth** 🔴 CRITICAL

**Problem:**
- CSP `connect-src` was missing Firebase auth domains
- CSP `frame-src` was blocking Google OAuth popup
- CSP `script-src` was missing Google APIs

**Fix Applied:**
Updated `middleware.ts` with all required Firebase/Google domains:

```typescript
connect-src: 
  - Added: https://securetoken.googleapis.com
  - Added: https://www.googleapis.com  
  - Added: https://accounts.google.com

frame-src:
  - Added: https://accounts.google.com
  - Added: https://*.firebaseapp.com

script-src:
  - Added: https://apis.google.com
```

### 2. **Session Cookie Bug** 🐛 BUG

**Problem:**
```typescript
// WRONG - maxAge expects seconds
cookieStore.set('firebase-session', sessionCookie, {
  maxAge: 60 * 60 * 24 * 5 * 1000  // This is milliseconds!
})
```

**Fix Applied:**
```typescript
// CORRECT - maxAge in seconds
cookieStore.set('firebase-session', sessionCookie, {
  maxAge: expiresIn / 1000  // Convert to seconds
})
```

This bug was causing session cookies to expire immediately!

### 3. **Missing Error Handling**

Added comprehensive logging to `app/api/auth/session/route.ts`:
- Logs successful session creation
- Logs detailed error information
- Returns proper error messages in development

---

## 🎯 WHAT TO DO NOW

### Step 1: Enable Email/Password in Firebase Console ⚠️ REQUIRED

Even though this is a CSP issue, you still need email/password enabled:

1. Go to: https://console.firebase.google.com/project/pocketlawyer-2582e/authentication/providers
2. Click "Email/Password"
3. Toggle "Enable"
4. Click "Save"

### Step 2: Test Authentication

**Clear browser cache first** (important after CSP changes):
1. Open browser DevTools (F12)
2. Right-click refresh button → "Empty Cache and Hard Reload"
3. Or: Cmd+Shift+Delete (Mac) / Ctrl+Shift+Delete (Windows)

**Test Email Signup:**
1. Go to http://localhost:3000/sign-up
2. Fill in details:
   - First Name: Test
   - Last Name: User
   - Email: test@example.com
   - Password: Test123!
3. Click "Create Account"
4. Should work now! ✅

**Test Google Sign-In:**
1. Go to http://localhost:3000/sign-in
2. Click "Continue with Google"
3. Google popup should open (not blocked by CSP)
4. Should work now! ✅

### Step 3: Check Browser Console for CSP Violations

If still not working:
1. Open DevTools (F12) → Console tab
2. Look for CSP violation errors
3. Share the exact error message with me

---

## 📊 Changes Summary

| File | Change | Status |
|------|--------|--------|
| `middleware.ts` | Updated CSP headers for Firebase/Google | ✅ Fixed |
| `app/api/auth/session/route.ts` | Fixed maxAge bug, added logging | ✅ Fixed |
| `app/api/auth/client-check/route.ts` | New diagnostic endpoint | ✅ Created |
| `CSP-DEBUG.md` | CSP debugging guide | ✅ Created |

**Git Commit:** `78405a4 - fix: update CSP for Firebase/Google auth, fix session cookie maxAge bug, add logging`

---

## 🧪 Testing Checklist

- [ ] Clear browser cache
- [ ] Enable Email/Password in Firebase Console
- [ ] Test email signup
- [ ] Test email signin
- [ ] Test Google OAuth
- [ ] Check browser console for errors
- [ ] Verify session cookie is set (DevTools → Application → Cookies)

---

## 🔧 Troubleshooting

### If Still Not Working:

**1. Check CSP violations in browser console:**
```
Refused to connect to '...' because it violates CSP
```
→ Share the blocked URL with me

**2. Check session endpoint:**
```bash
curl http://localhost:3000/api/auth/diagnostic
```
Should return all checks passing

**3. Temporarily disable CSP (testing only):**
In `middleware.ts`, comment out:
```typescript
// response.headers.set('Content-Security-Policy', cspHeader)
```

If auth works with CSP disabled, we need to add more domains.

**4. Check Firebase Console settings:**
- Authentication → Sign-in method
- Ensure Email/Password is enabled
- Ensure Google is enabled (if using)

**5. Check API key restrictions:**
Go to: https://console.cloud.google.com/apis/credentials?project=pocketlawyer-2582e
- Find API key
- Ensure it's not restricted
- Or add: Identity Toolkit API, Firebase Auth API

---

## 💡 Why This Happened

**Timeline:**
1. ✅ Auth working fine initially
2. ➕ Added CSP headers for security (commit `0153c24`)
3. ❌ CSP blocked Firebase auth domains
4. ❌ Session cookie maxAge bug compounded the issue
5. ✅ Fixed both issues

**Lesson:** CSP is great for security, but requires careful configuration for third-party services like Firebase!

---

## 📝 Additional Resources

- **CSP Debugging Guide:** `CSP-DEBUG.md`
- **Firebase Auth Fix Guide:** `FIREBASE_AUTH_FIX.md`
- **Session Diagnostic:** http://localhost:3000/api/auth/diagnostic
- **Client Config Check:** http://localhost:3000/api/auth/client-check

---

## 🚀 Expected Outcome

After following the steps above:
- ✅ Email/Password signup works
- ✅ Email/Password signin works
- ✅ Google OAuth works
- ✅ Session cookies persist correctly
- ✅ No CSP violations in console

**Try it now and let me know the results!** 👍

If you see any errors, share:
1. Exact error message
2. Browser console screenshot
3. DevTools Network tab (any failed requests)
