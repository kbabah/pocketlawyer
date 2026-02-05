# Docker Testing Guide for PocketLawyer

## Prerequisites

1. **Docker Desktop installed and running**
   - macOS: Open Docker Desktop app
   - Check status: `docker ps` (should not error)

2. **Environment file configured**
   - Copy `.env.production.example` to `.env.production`
   - Fill in all required values (especially API keys)

## Quick Test (Local Build)

### 1. Start Docker Desktop
```bash
# Open Docker Desktop application
# Wait for it to fully start (icon in menu bar)
```

### 2. Build the Docker image
```bash
cd ~/PocketLawyer
docker compose build
```

**Expected output:**
```
[+] Building 120.5s (14/14) FINISHED
=> [internal] load build definition from Dockerfile
=> => transferring dockerfile: 1.38kB
=> [internal] load .dockerignore
...
=> => exporting layers
=> => writing image sha256:...
```

### 3. Run the container
```bash
docker compose up
```

**Expected output:**
```
pocketlawyer-app-1  | ▲ Next.js 15.2.4
pocketlawyer-app-1  | - Local:        http://localhost:3000
pocketlawyer-app-1  | - Network:      http://0.0.0.0:3000
pocketlawyer-app-1  | ✓ Ready in 2.5s
```

### 4. Test the application

Open in browser: http://localhost:3000

Test health endpoint:
```bash
curl http://localhost:3000/api/health
```

**Expected response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-02-05T...",
  "responseTime": "45ms",
  "services": {
    "database": "connected",
    "firebase": "connected"
  }
}
```

### 5. Stop the container
```bash
# Press Ctrl+C in the terminal
# Or in another terminal:
docker compose down
```

## Troubleshooting

### Issue: "Cannot connect to Docker daemon"
**Solution:** Start Docker Desktop application

### Issue: "Build failed - MODULE_NOT_FOUND"
**Solution:** 
```bash
# Clean build
docker compose build --no-cache
```

### Issue: "Port 3000 already in use"
**Solution:**
```bash
# Stop local dev server first
lsof -ti:3000 | xargs kill -9

# Or change port in compose.yaml:
# ports:
#   - "3001:3000"
```

### Issue: "Firebase connection failed"
**Solution:** Check that `.env.production` has valid Firebase credentials

### Issue: Build is very slow
**Solution:** 
- First build takes ~2-5 minutes (normal)
- Subsequent builds are cached and faster
- Ensure good internet connection (downloads packages)

## Production Deployment

### 1. Push to Docker Registry

```bash
# Tag the image
docker tag pocketlawyer:latest your-registry/pocketlawyer:latest

# Push
docker push your-registry/pocketlawyer:latest
```

### 2. Deploy to Cloud Provider

#### Vercel (Recommended)
```bash
vercel deploy --prod
```

#### Railway
```bash
railway up
```

#### DigitalOcean/AWS/GCP
Use their Docker container deployment services with the built image.

## Environment Variables for Production

Required environment variables (see `.env.production.example`):

**Public (can be exposed):**
- NEXT_PUBLIC_FIREBASE_* (all Firebase public config)
- NEXT_PUBLIC_RECAPTCHA_SITE_KEY
- NEXT_PUBLIC_BASE_URL

**Secret (must be secure):**
- FIREBASE_ADMIN_PROJECT_ID
- FIREBASE_ADMIN_CLIENT_EMAIL
- FIREBASE_ADMIN_PRIVATE_KEY
- OPENAI_API_KEY
- OCR_API_KEY
- RECAPTCHA_SECRET_KEY
- POSTMARK_SERVER_TOKEN
- ADMIN_SETUP_SECRET

## Next Steps After Docker Test

1. ✅ Verify health check works
2. ✅ Test authentication flow
3. ✅ Test chat endpoint (should be rate-limited)
4. ✅ Test document upload
5. ✅ Check logs for errors
6. ✅ Monitor resource usage (memory, CPU)

## Performance Benchmarks

Expected resource usage:
- **Memory:** ~200-300MB idle, ~500MB under load
- **CPU:** <5% idle, 20-40% under load
- **Startup time:** 2-5 seconds
- **Health check response:** <100ms

If you see higher usage, investigate potential issues in the application code.
