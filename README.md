# Aleva Studios Backend

Backend foundation for Aleva Studios by Kamdi. This repository serves the public website, client portal, and admin dashboard through backend APIs; it does not contain frontend code.

## Requirements

- Node.js 20 or later and npm.
- A Supabase project URL and server-side service-role key for the configured database client and readiness check.

No Cloudinary, Paystack, or Resend credentials are needed by the Phase 2 foundation. Configure those when their integration phases begin. Supabase Auth email delivery is configured separately from application email delivery through Resend.

## Local setup

1. Install dependencies: `npm ci` (use `npm install` once if no lockfile has been generated yet).
2. Copy `.env.example` to `.env` and set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` from the Supabase project. Keep `.env` private; it is ignored by Git.
3. Start development mode with `npm run dev`.

The application validates its environment at startup and exits with a configuration error if required values are missing or malformed.

## Build and production startup

- Type-check: `npm run typecheck`
- Build: `npm run build`
- Run checks: `npm test`
- Production-style startup: `npm start` (build first). Set `NODE_ENV=production` and provide the required environment variables.

The server listens on `PORT` (default `3000`). JSON request bodies are limited to 1 MB and URL-encoded bodies to 16 KB. The `/api` rate limit defaults to 120 requests per 15 minutes per client IP; tune it using environment variables to match deployment traffic and proxy behavior.

## Health checks

- `GET /health/live` reports that the process is running.
- `GET /health/ready` checks that the configured Supabase REST API is reachable. It returns `503` if the check fails.

Both endpoints return JSON. Every response includes an `X-Request-Id` for support correlation.

## Environment variables

See `.env.example` for all Phase 2 variables. `SUPABASE_SERVICE_ROLE_KEY` is privileged server-side configuration and must never be sent to the public website or client portal. `CORS_ORIGINS` is a comma-separated allowlist. Wildcard origin is rejected in production.

## Project structure

```text
src/
  app.ts                 Express middleware and route composition
  server.ts              Environment setup, Supabase client, listener, shutdown
  config/                Environment, logger, Supabase configuration
  middleware/            Request IDs, validation, not-found, error handling
  routes/                Health/readiness routes
  types/                 Express request typing
  utils/                 Shared error type
tests/                   Node built-in test runner checks
```

Business modules, authentication/authorization, and business database migrations are intentionally reserved for later phases.

## Render deployment

The included `render.yaml` defines a Node web service using `npm ci`, `npm run build`, and `npm start`, with `/health/ready` as its health check. Set `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and production `CORS_ORIGINS` as private environment values in Render. No provider credentials are assumed to exist.
