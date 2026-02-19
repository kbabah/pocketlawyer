# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev          # Start development server (localhost:3000)
pnpm build        # Production build (memory-optimized via build.js, 4GB heap)
pnpm build:next   # Direct Next.js build without memory optimization
pnpm start        # Start production server
pnpm lint         # Run ESLint
```

**Package manager:** pnpm only. No automated test suite is configured.

## Architecture Overview

PocketLawyer is a Next.js 15 (App Router) + TypeScript application providing AI-powered legal assistance for Cameroonian law. It targets Cameroon's bijural legal system — Common Law (Northwest/Southwest regions) and Civil Law (Francophone regions).

### Backend & Data

- **Firebase Auth** handles authentication (email/password, anonymous). Session is stored in a `firebase-session` cookie. Admin roles are tracked via Firestore + Firebase custom claims.
- **Firestore** is the primary database. Key collections: `users`, `chats` (subcollection of users), `documents`, `lawyers`, `bookings`, `reviews`, `knowledge_base`, `blog-posts`, `email-campaigns`, `subscribers`, `feedback`, `onboarding_progress`.
- **Firebase Admin SDK** (`lib/firebase-admin.ts`, `lib/firebase-admin-server.ts`) is used in API routes for privileged operations.
- **Upstash Redis** provides rate limiting for API routes (see `lib/rate-limit.ts`).
- **Firestore security rules** default to deny-all; public collections are `blog-posts`, `legal`, and `reviews`.

### AI Features

- All AI calls go through OpenAI (GPT-4/GPT-4.1) via the Vercel AI SDK (`@ai-sdk/openai`).
- The main chat endpoint is `app/api/chat/route.ts`, which streams responses using the AI SDK.
- `lib/knowledge-base.ts` contains the embedded Cameroonian law knowledge base (statutes, OHADA acts, procedures, contract templates) — this is loaded at runtime without any external fetch.
- Additional AI endpoints: `app/api/case-review/`, `app/api/draft-contract/`, `app/api/legal-research/`, `app/api/document/`.

### Bilingual Support

All user-facing text **must** be wrapped with the `t()` function from `LanguageContext` (`contexts/language-context.tsx`). Language preference is persisted to Firestore and synced across sessions. Supported languages: `en` (default), `fr`.

### Lawyer Booking System

Full lawyer marketplace: registration with credential documents → admin approval workflow → availability calendar → booking (video/phone/in-person) → payment → review. Lawyer status lifecycle: `pending → approved / rejected / suspended`. The `suspendedReason` field on the `Lawyer` type tracks the reason for suspension. Types are in `types/lawyer.ts`.

### Document Processing

- `pdf-parse` and `pdfjs-dist` extract text from PDFs.
- `Tesseract.js` handles OCR for image-based documents.
- Files are stored in Firebase Storage; metadata in Firestore under `documents`.

### Email

`lib/services/email-service.ts` sends emails via SendGrid (set `EMAIL_SERVICE=sendgrid` + `SENDGRID_API_KEY`). If no provider is configured, emails are silently skipped (logged in dev). The admin dashboard includes full email campaign management (`app/admin/email/`).

### UI Layer

- Components use Radix UI primitives + shadcn/ui conventions (`components/ui/`).
- Path alias `@/` maps to the project root.
- Dark mode is managed by `ThemeProvider` (`components/theme-provider.tsx`) and persisted in localStorage.
- The main chat UI is `components/chat-interface-optimized.tsx`.
- The sidebar is `components/app-sidebar.tsx`.

### Key Environment Variables

```
NEXT_PUBLIC_FIREBASE_*        # Firebase client config
FIREBASE_ADMIN_*              # Firebase Admin SDK credentials
OPENAI_API_KEY
POSTMARK_SERVER_TOKEN
NEXT_PUBLIC_RECAPTCHA_SITE_KEY / RECAPTCHA_SECRET_KEY
UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN
NEXT_PUBLIC_BASE_URL
ADMIN_SETUP_SECRET            # Used for initial admin bootstrap
SENDGRID_API_KEY              # Optional; needed for transactional email
```

### Deployment

- **Vercel** (recommended): configured via `vercel.json`, uses `pnpm build`.
- **Docker**: multi-stage `Dockerfile` using Node 23 Alpine, non-root user.
- **Self-hosted**: PM2 config in `ecosystem.config.js`.
- Health check endpoint: `GET /api/health`.
