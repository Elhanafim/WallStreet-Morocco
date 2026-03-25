# Security Policy — WallStreet Morocco

## Responsible Disclosure

If you discover a security vulnerability in WallStreet Morocco, please report it **responsibly**:

**Security Contact:** mohamed345el@gmail.com
**Response Commitment:** We will acknowledge your report within 72 hours and provide a resolution timeline within 14 days.

Please **do not** publicly disclose vulnerabilities before they have been fixed. We appreciate responsible disclosure and will credit researchers who report valid issues.

## What to Report

- Authentication or authorization bypasses
- SQL injection or other injection flaws
- Cross-site scripting (XSS) vulnerabilities
- Cross-site request forgery (CSRF)
- Sensitive data exposure
- Security misconfiguration
- Broken access control

## Out of Scope

- Denial-of-service attacks
- Social engineering
- Physical attacks
- Issues in third-party services (TradingView, ForexFactory)

---

## Environment Variables

### Required — Backend (Next.js)

| Variable | Description | How to Generate |
|----------|-------------|-----------------|
| `NEXTAUTH_SECRET` | JWT signing key for NextAuth.js | `openssl rand -base64 32` |
| `DATABASE_URL` | PostgreSQL connection string | Neon/Supabase dashboard |
| `NEXTAUTH_URL` | Full URL of the app | e.g. `https://wallstreetmorocco.com` |
| `FINNHUB_API_KEY` | Finnhub market data API key | [finnhub.io](https://finnhub.io) |

### Required — Price Service (FastAPI)

| Variable | Description |
|----------|-------------|
| `PORT` | Port to listen on (default: 8001) |
| `ALLOWED_ORIGINS` | Comma-separated allowed CORS origins |
| `FINNHUB_API_KEY` | Same Finnhub API key |
| `CACHE_TTL_SECONDS` | Price cache TTL (default: 60) |

### Safe to Expose (NEXT_PUBLIC_ prefix)

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_PRICE_SERVICE_URL` | URL of the price microservice |
| `NEXT_PUBLIC_APP_NAME` | Application name |

### NEVER in Frontend

- JWT secret keys
- Database credentials
- API keys with billing implications
- Any key prefixed with `VITE_` or `NEXT_PUBLIC_` that is a secret

### Generating a Secure NEXTAUTH_SECRET

```bash
openssl rand -base64 32
# or
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

---

## Security Architecture

### Authentication
- NextAuth.js with JWT strategy
- Passwords hashed with bcrypt (12 rounds)
- Access tokens: server-side session (httpOnly cookie via NextAuth)
- Protected routes: `/dashboard/*`, `/portfolio/*`

### Rate Limiting
- Price proxy routes: 30 requests/minute per IP
- Auth routes: managed by NextAuth with built-in brute-force protection
- Login lockout: 5 failed attempts → 15-minute lockout (client-side)

### Input Validation
- Zod schemas on all API routes
- Ticker symbols: alphanumeric + colon only
- Portfolio notes: max 200 characters, HTML stripped

### HTTPS
- Enforced via HSTS header (max-age=63072000)
- All HTTP requests redirect to HTTPS via Vercel

### Cookie Security
- NextAuth session cookie: httpOnly, secure, sameSite=lax
- Cookie consent: stored in localStorage (non-sensitive metadata only)

---

## Known Limitations & Planned Improvements

| Issue | Severity | Status | Target |
|-------|----------|--------|--------|
| Email verification on signup | Medium | Planned | Q2 2026 |
| Password reset flow | High | Planned | Q2 2026 |
| Two-factor authentication (2FA) | Medium | Planned | Q3 2026 |
| Redis-backed rate limiting | Medium | Planned | Q3 2026 |
| WAF (Cloudflare) | Medium | Planned | Q3 2026 |
| Session management dashboard | Low | Planned | Q4 2026 |

---

## Dependency Vulnerability Management

Run these commands regularly:

```bash
# Frontend
npm audit --audit-level=high
npm audit fix

# Backend
pip install pip-audit
pip-audit -r price_service/requirements.txt
```

Dependabot is configured to auto-create PRs for weekly dependency updates.

---

## Data Protection

- **Personal data:** email, name, hashed password
- **Financial data:** portfolio tickers, prices, quantities (educational only)
- **Data location:** Neon PostgreSQL (EU-West-2 region)
- **Retention:** User data deleted on account deletion within 24 hours
- **Backups:** Managed by Neon (30-day point-in-time recovery)

## Compliance

- **Loi 09-08 (Maroc):** Data processing registered with CNDP
- **GDPR:** Applicable to EU users; right to erasure implemented
- **Privacy Policy:** /confidentialite
- **Terms of Service:** /terms

---

---

## Known Dependency Vulnerabilities (npm audit — 25 March 2026)

| Package | Severity | Advisory | Status | Mitigation |
|---------|----------|----------|--------|------------|
| `next` (14.x) | HIGH | GHSA-ggv3-7p47-pfv8, GHSA-h25m-26qc-wcjf, GHSA-9g9p-9gw9-jx7f, GHSA-3x4c-7xq6-9pq8 | Fix requires breaking upgrade to next@16+ | Monitor Next.js 14 security patches; plan upgrade to Next.js 15 or 16 in Q2 2026 |
| `xlsx` (0.18.x) | HIGH | GHSA-4r6h-8v6p-xvw6, GHSA-5pgg-2g8v-p4x9 | No fix available upstream | xlsx is used server-side only for OPCVM static data (src/lib/data/opcvm-stats.ts). Data is read-only static files from trusted sources — no user-controlled input is parsed. Risk is acceptable in current usage pattern. Evaluate migration to `exceljs` when feasible. |
| `fastify` (via @neondatabase/neon-js) | HIGH | GHSA-mrq3-vjjr-p77c, GHSA-jx2c-rxcm-jvmq | Fix requires breaking upgrade | Fastify is a transitive dependency of @neondatabase/neon-js; update neon-js when a compatible fixed version is available. |

*Last updated: 25 March 2026*
