# PocketLawyer - Production Deployment Guide

## 🚀 Quick Deploy

### Vercel (Recommended)

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Deploy:**
   ```bash
   cd ~/PocketLawyer
   vercel --prod
   ```

3. **Configure Environment Variables in Vercel Dashboard:**
   - Go to Project Settings → Environment Variables
   - Add all variables from `.env.production.example`

### Railway

1. **Install Railway CLI:**
   ```bash
   npm i -g @railway/cli
   railway login
   ```

2. **Deploy:**
   ```bash
   cd ~/PocketLawyer
   railway init
   railway up
   ```

3. **Set Environment Variables:**
   ```bash
   railway variables set OPENAI_API_KEY=your_key_here
   # Add all other variables
   ```

### Docker (VPS/Cloud)

1. **Build and Push:**
   ```bash
   docker build -t pocketlawyer:latest .
   docker tag pocketlawyer:latest your-registry/pocketlawyer:latest
   docker push your-registry/pocketlawyer:latest
   ```

2. **Deploy on Server:**
   ```bash
   # Create .env.production with your secrets
   docker pull your-registry/pocketlawyer:latest
   docker run -d \
     --name pocketlawyer \
     -p 3000:3000 \
     --env-file .env.production \
     --restart unless-stopped \
     your-registry/pocketlawyer:latest
   ```

---

## 📋 Pre-Deployment Checklist

### Environment Variables (Required)

Copy `.env.production.example` to `.env.production` and fill in:

#### Firebase
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`

#### Firebase Admin SDK
- `FIREBASE_PROJECT_ID`
- `FIREBASE_PRIVATE_KEY` (wrap in quotes, keep newlines as `\n`)
- `FIREBASE_CLIENT_EMAIL`

#### APIs
- `OPENAI_API_KEY` - Your OpenAI API key
- `POSTMARK_SERVER_TOKEN` - For email sending
- `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` - Google reCAPTCHA site key
- `RECAPTCHA_SECRET_KEY` - Google reCAPTCHA secret

#### Security
- `NEXTAUTH_SECRET` - Generate with: `openssl rand -base64 32`
- `NEXTAUTH_URL` - Your production URL (e.g., `https://pocketlawyer.cm`)
- `ADMIN_SETUP_SECRET` - Secret for admin account creation

#### Optional (Recommended)
- `NEXT_PUBLIC_SENTRY_DSN` - Sentry error tracking
- `SENTRY_AUTH_TOKEN` - For source map uploads
- `SENTRY_ORG` - Your Sentry organization slug
- `SENTRY_PROJECT` - Your Sentry project slug

---

## ✅ Post-Deployment Verification

### 1. Health Check
```bash
curl https://your-domain.com/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2026-02-05T...",
  "responseTime": "100ms",
  "services": {
    "database": "connected",
    "firebase": "connected"
  },
  "version": "0.1.0"
}
```

### 2. Test Authentication
1. Visit `/sign-up`
2. Create a test account
3. Verify email functionality
4. Test sign-in/sign-out

### 3. Test Chat
1. Sign in
2. Navigate to chat interface
3. Send a test message
4. Verify AI response
5. Check rate limiting (try 10+ messages quickly)

### 4. Test Document Upload
1. Upload a test PDF/image
2. Verify OCR processing
3. Check document analysis

### 5. Admin Panel
1. Visit `/admin/setup` with `ADMIN_SETUP_SECRET`
2. Create admin account
3. Test admin features

---

## 🔒 Security Checklist

- [x] CSP headers configured
- [x] Rate limiting enabled on /api/chat
- [x] Firebase session cookies only (Clerk removed)
- [x] Sensitive data not in git
- [x] Error tracking with Sentry
- [x] HTTPS enforced (upgrade-insecure-requests)
- [x] X-Frame-Options: DENY
- [x] X-Content-Type-Options: nosniff
- [x] Firestore security rules in place
- [ ] Review Firebase security rules (test with emulator)
- [ ] Enable Firebase App Check
- [ ] Configure CORS for API routes if needed

---

## 📊 Monitoring Setup

### Sentry (Error Tracking)

1. **Create Sentry Project:**
   - Go to https://sentry.io
   - Create new Next.js project
   - Copy DSN

2. **Configure:**
   ```bash
   export NEXT_PUBLIC_SENTRY_DSN=your_dsn_here
   export SENTRY_AUTH_TOKEN=your_auth_token
   export SENTRY_ORG=your_org_slug
   export SENTRY_PROJECT=your_project_slug
   ```

3. **Verify:**
   - Trigger a test error: Visit `/test-error`
   - Check Sentry dashboard for the error

### Vercel Analytics (If using Vercel)

1. Enable in Vercel Dashboard → Analytics
2. Automatically tracks:
   - Page views
   - Real user monitoring (Core Web Vitals)
   - Audience insights

### Custom Monitoring

Consider adding:
- **Uptime monitoring:** UptimeRobot, Pingdom
- **Performance monitoring:** New Relic, Datadog
- **Log aggregation:** LogRocket, Papertrail

---

## 🔧 Troubleshooting

### Build Fails

```bash
# Clear cache and rebuild
rm -rf .next node_modules
pnpm install
pnpm build
```

### Firebase Connection Issues

1. Verify all Firebase env vars are set
2. Check `FIREBASE_PRIVATE_KEY` has literal `\n` (not actual newlines)
3. Ensure Firebase project has Firestore enabled
4. Check IAM permissions for service account

### Rate Limiting Too Aggressive

Adjust in `lib/rate-limit.ts`:
```typescript
authenticated: {
  interval: 60 * 1000,  // 1 minute
  limit: 30,            // Increase this
}
```

### CSP Blocks Resources

If legitimate resources are blocked:
1. Check browser console for CSP violations
2. Add domains to `middleware.ts` CSP header
3. Redeploy

### Sentry Not Capturing Errors

1. Verify `NEXT_PUBLIC_SENTRY_DSN` is set
2. Check `sentry.*.config.ts` files exist
3. Ensure errors are thrown (not just logged)
4. Test with `/test-error` route

---

## 🎯 Performance Optimization

### After First Deploy

1. **Enable Image Optimization:**
   - Vercel: Automatic
   - Self-hosted: Configure `next.config.mjs` with external image service

2. **CDN Setup:**
   - Use Cloudflare or Vercel Edge Network
   - Cache static assets aggressively

3. **Database Indexing:**
   - Review Firestore queries
   - Add indexes for common queries
   - Check Firebase Console → Firestore → Indexes

4. **Monitor Bundle Size:**
   ```bash
   npx @next/bundle-analyzer
   ```

5. **Lazy Load Components:**
   - Use `next/dynamic` for heavy components
   - Implement code splitting

---

## 📝 Maintenance

### Regular Tasks

**Daily:**
- Monitor error rates in Sentry
- Check uptime monitoring alerts

**Weekly:**
- Review Firebase usage/costs
- Check OpenAI API usage
- Update dependencies: `pnpm update`

**Monthly:**
- Security audit: `pnpm audit`
- Review and rotate API keys
- Backup Firestore data
- Review CSP violations and adjust

### Backup Strategy

**Firestore:**
```bash
# Using Firebase CLI
firebase firestore:export gs://your-bucket/backups/$(date +%Y%m%d)
```

**Environment Variables:**
- Keep encrypted backups of `.env.production`
- Use a password manager or secret management service

---

## 🚨 Incident Response

### If Site Goes Down

1. **Check Status:**
   ```bash
   curl https://your-domain.com/api/health
   ```

2. **Check Logs:**
   - Vercel: Dashboard → Logs
   - Railway: `railway logs`
   - Docker: `docker logs pocketlawyer`

3. **Rollback:**
   - Vercel: Dashboard → Deployments → Promote previous
   - Railway: `railway rollback`
   - Docker: `docker pull previous-tag && docker restart pocketlawyer`

### If Firebase Quota Exceeded

1. Upgrade Firebase plan
2. Optimize Firestore queries
3. Implement caching layer

### If OpenAI Costs Spike

1. Check rate limiting is working
2. Review chat logs for abuse
3. Implement stricter rate limits
4. Add cost alerts in OpenAI dashboard

---

## 📞 Support

- **Documentation:** `~/PocketLawyer/README.md`
- **Audit Report:** `~/.openclaw/workspace/pocketlawyer-deployment-audit.md`
- **Issues:** Review Sentry dashboard
- **Firebase Console:** https://console.firebase.google.com
- **OpenAI Dashboard:** https://platform.openai.com

---

## 🎉 You're Ready to Deploy!

Current status: **Production-ready** (7/10)

**Staging first recommended** — Deploy to a staging environment, test thoroughly, then promote to production.

Good luck! 🚀
