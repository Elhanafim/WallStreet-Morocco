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

Automated checks:

- **Pull requests** — GitHub dependency review blocks changes that add dependencies with known vulnerabilities (moderate and above). See `.github/workflows/security.yml`.
- **Every push to `main` and weekly** — `npm audit`, npm registry signature/provenance verification, and `pip-audit` against the hash-pinned Python lockfiles; CodeQL (`security-extended`) for TypeScript, Python and the workflows themselves (`.github/workflows/codeql.yml`).
- **Dependabot** — weekly grouped updates for npm, pip and GitHub Actions, with a short cooldown before proposing brand-new releases (security updates are never delayed). See `.github/dependabot.yml`.

Supply-chain rules for this repository:

- Python dependencies are declared in `*.in` files and installed only from hash-pinned lockfiles, e.g. `pip install --require-hashes -r price_service/requirements.txt`. To change a dependency, edit the `.in` file and regenerate the lock with `pip-compile --generate-hashes --allow-unsafe --strip-extras <file>.in`.
- JavaScript dependencies are installed from `package-lock.json` (`npm ci`).
- GitHub Actions are pinned to full commit SHAs, and workflow tokens default to no permissions.
- Never install a package at runtime, or because an error message or an AI assistant suggests a name: confirm it is the dependency declared in the requirements/package files and that it exists on the official registry.
- Third-party agent skills or plugins are not committed to this repository.
- Builds never modify the database; schema changes are applied deliberately with `npm run db:push`.

Manual check:

```bash
npm audit
npm audit signatures
pip install --require-hashes -r .github/security/requirements.txt
pip-audit --strict --require-hashes --disable-pip -r price_service/requirements.txt
```

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

## Known Dependency Vulnerabilities

*Status on 13 November 2026: `npm audit` reports 0 vulnerabilities; `pip-audit` reports no known vulnerabilities in `price_service/requirements.txt` and `scripts/requirements.txt`.*

Resolved in the November 2026 security update:

| Package | Previous issue | Resolution |
|---------|----------------|------------|
| `next` 14.2.35 | Critical and high advisories (e.g. GHSA-2464-fhr4-w9xw, GHSA-2xp9-vwfh-vxw4, GHSA-36qx-fr4f-26g5); no 14.x fix | Upgraded to Next.js 16.4.6 with React 19 |
| `next-auth` 4.24.13 | Critical email-normalisation bypass (GHSA-7rqj-j65f-68wh) and others | Upgraded to 4.24.15 |
| `xlsx` 0.18.5 (npm) | Prototype pollution (GHSA-4r6h-8v6p-xvw6) and ReDoS (GHSA-5pgg-2g8v-p4x9); no fix on the npm registry | Replaced with the official SheetJS 0.20.3 build (cdn.sheetjs.com), integrity-pinned in `package-lock.json` |
| `@neondatabase/neon-js` | Unused; pulled in vulnerable `better-auth` and `fastify` | Removed, together with the unused `cheerio`, `node-fetch`, `pdf-parse` and `react-router-dom` |
| `zod` 3.25 | Memory exhaustion (GHSA-mrhx-c7xc-m3w5) | Upgraded to 4.6.7 |
| `starlette` 0.37.2 (via FastAPI 0.111.0) | Multiple advisories | FastAPI 0.162.5 / Starlette 1.10.0, hash-pinned |
| `python-dotenv` 1.0.1 | CVE-2026-28684 | 1.2.4, hash-pinned |

*Last updated: 13 November 2026*
