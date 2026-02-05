# Quick CSP Debug Guide

If authentication is still not working after the CSP fix, temporarily disable CSP to confirm it's the issue:

## Temporary Disable CSP (for testing only)

1. Open `middleware.ts`
2. Comment out the CSP header line:
   ```typescript
   // response.headers.set('Content-Security-Policy', cspHeader)
   ```
3. Save and test authentication
4. If it works, the CSP was blocking auth
5. Re-enable and adjust CSP rules

## Check Browser Console for CSP Violations

1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for CSP violation errors like:
   ```
   Refused to connect to 'https://...' because it violates the following Content Security Policy directive: "connect-src ..."
   ```

## Current CSP Configuration

The CSP now allows:
- ✅ Firebase authentication domains
- ✅ Google Sign-In popup
- ✅ Firebase API calls
- ✅ Google OAuth domains

If still not working, the issue is likely something else.
