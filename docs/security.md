# PRITIVO security hardening report

Implemented and tested in code. Items marked **Action required** need configuration from you.

## 1. Secrets
- All secrets are read server-side only: `DATABASE_URL`, `ADMIN_PASSCODE`, `HOTEL_API_*`, `STRIPE_*`,
  `RESEND_API_KEY`, `GOOGLE_MAPS_SERVER_API_KEY`, `N8N_WEBHOOK_SECRET`, `OPENAI_API_KEY`. Every server module that
  touches them imports `server-only`.
- The only browser-visible value is `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` (public by design) plus
  `NEXT_PUBLIC_SITE_URL` / `NEXT_PUBLIC_GA_MEASUREMENT_ID`. Verified by grepping the production client bundle for a
  placeholder server key: it does not appear in `.next/static`.
- No production credentials exist in this repository; `.env.example` ships empty values.
- Logging redacts secrets: `src/lib/security/log.ts` strips `sk_live_/sk_test_/whsec_/AIza…/postgres://…/Bearer …`
  and any key matching `passcode|password|secret|token|authorization|cookie|card|cvv|api_key|session`. Emails and
  phones are masked in audit detail.

## 2. Admin / staff access
- There are **no customer login, logout or registration screens** (`/login`, `/register`, `/dashboard`, `/profile`
  all return 404).
- `/admin` is protected server-side: passcode gate (`ADMIN_PASSCODE`, ≥12 chars) → random 256-bit token, stored as a
  SHA-256 hash in `admin_sessions`, 12-hour expiry, httpOnly + SameSite=Lax + Secure-on-HTTPS cookie.
  Comparison uses `timingSafeEqual`; 6 attempts per 15 minutes per IP.
- Every `/api/admin/*` handler calls `isAdminAuthenticated()` first — verified to return **401** with no session,
  including after logout. Frontend hiding is never relied upon.
- Unconfigured passcode → dashboard shows a setup notice and all staff APIs return 401 (fail-closed).
- `/admin*` is `noindex`, disallowed in `robots.txt`, and served with `X-Robots-Tag: noindex` + `no-store`.

## 3. Database
- All queries go through Drizzle's parameterised query builder; the only raw SQL is a constant `select 1` health
  check and JSONB operators with bound parameters. No string-concatenated SQL anywhere.
- Server-side validation on every write path (tours, suppliers, quotations, enquiries, bookings, newsletter).
- Guests cannot read or write staff data: no public endpoint exposes tours-admin, suppliers, quotations, customers or
  audit logs. Unpublished tours 404 publicly.
- **Action required (least privilege):** the app connects with the `postgres` superuser in this sandbox. In
  production create a dedicated role limited to the app schema (no `SUPERUSER`, no `CREATEROLE`), e.g.
  `CREATE ROLE pritivo_app LOGIN PASSWORD '…'; GRANT USAGE ON SCHEMA public TO pritivo_app; GRANT SELECT, INSERT,
  UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO pritivo_app; GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO pritivo_app;`
  and put that connection string in `DATABASE_URL`. Keep a separate superuser for migrations.
- Supabase is not used, so Row Level Security does not apply. If you migrate to Supabase later, enable RLS on
  `tours`, `enquiries`, `customers`, `suppliers`, `quotations`, `hotel_bookings` and allow only the service role key
  server-side.
- Enable automated backups/PITR on your Postgres provider.

## 4. Customer enquiries
- Server-side validation of name, email, phone, dates, adults/children/travellers, budget, travel type and hotel
  category (`POST /api/enquiries`), independent of the browser.
- Spam protection: per-IP rate limit (6/minute), hidden honeypot fields, and a 10-minute duplicate guard that returns
  the original enquiry ID instead of creating a second row.
- Enquiries are only readable by authenticated staff. Guest hotel bookings require reference **and** matching email or
  phone; contact details are masked in every guest-facing response.
- Only data needed for a quote is collected (no ID numbers, passports or payment data on the website).

## 5. Booking & payment safety
- Prices and availability always come from the provider adapter on the server; client-supplied amounts are ignored.
  Hotel booking re-checks availability **and** price before payment and refuses to proceed on mismatch.
- Stripe Checkout is created server-side; card data never touches PRITIVO. Webhooks are verified with an HMAC-SHA256
  signature over the raw body (`timingSafeEqual`, 5-minute tolerance) and deduplicated via `payment_events`.
- A booking becomes `paid` only after the server retrieves the session from Stripe and confirms status, reference and
  **exact amount**. It becomes `confirmed` only after a fresh provider re-check and a real provider confirmation
  reference; otherwise a refund is attempted and recorded.
- Demo mode is labelled everywhere and refuses payment and confirmation by design. Test mode (`sk_test_…`) shows a
  clear notice; `stripeMode()` never reports live unless a live key is present.
- Quotations/booking status changes are staff-only, and `confirmed` is rejected unless supplier confirmation **and**
  recorded payment exist. Suppliers must be marked `verified` before they can be the confirming party.

## 6. Web application protection
- `src/middleware.ts` sets, on every response: CSP (no `unsafe-inline` scripts; Maps/script allowances only when a
  browser key exists), `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `frame-ancestors 'none'`,
  `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`, `Cross-Origin-Opener-Policy: same-origin`,
  `X-DNS-Prefetch-Control: on`, HSTS on HTTPS only, and `Cache-Control: no-store` for dynamic pages.
- **CORS**: JSON APIs accept same-origin only; a foreign `Origin` header is rejected with 403. No wildcard.
- **CSRF**: state-changing APIs are JSON POST/PATCH/DELETE with `SameSite=Lax` httpOnly cookies and an origin check,
  so cross-site form posts cannot reach them.
- **XSS**: React escapes by default; the only `dangerouslySetInnerHTML` uses are JSON-LD built from
  `JSON.stringify` and the quotation email body, which HTML-escapes `< > &`. Map info windows escape values explicitly.
- **Open redirect**: `safeNextPath()` accepts only same-site relative paths; off-site `next` values fall back to a
  safe default.
- **Injection**: parameterised ORM queries; admin free-text is length-capped and rendered as text.
- **HTTPS**: production hosts terminate TLS; cookies are `Secure` when the request arrives over HTTPS (detected from
  `x-forwarded-proto`, overridable with `AUTH_COOKIE_SECURE`).

## 7. File uploads
- There is **no file upload endpoint**. Tour and destination images are supplied as remote URLs and rendered through
  `next/image`, restricted to `images.pexels.com` in `next.config.ts`; add your CDN/host to `remotePatterns` when you
  host your own photography. Because nothing is written to disk, no uploaded file can be executed, and there are no
  private file paths to expose. If you later add uploads: validate MIME type and magic bytes, cap size, store outside
  the web root or in object storage with private ACLs, and serve via signed URLs.

## 8. Errors & monitoring
- Guests see generic, actionable messages; stack traces, SQL details and env values are logged server-side only.
- Every security-relevant event writes an `audit_logs` row (`admin.*`, `enquiry.*`, `booking.*`, `webhook.*`,
  `newsletter.*`) with redacted detail.
- `/api/health` reports database connectivity; `/api/hotels/status` and `/api/maps/status` report configuration gaps
  as booleans/messages without exposing values.

## 9. Known limitations & remaining risks
1. **Rate limiting and dedupe are in-process memory.** Correct for a single instance; on multi-instance serverless
   deployments move to Redis/Upstash for accurate limits.
2. **Admin auth is a shared passcode**, not per-staff accounts with MFA. Fine for a small team; upgrade to per-user
   credentials + TOTP if you grow. Rotate it periodically.
3. **Dependency audit**: `npm audit` reports transitive advisories in the template's dev/build toolchain. Run
   `npm audit` and `npm audit fix` (and review `npm audit fix --force` changes) before each deploy; nothing in the
   runtime path handles untrusted input without validation.
4. **Backups/PITR** are not configured by the application — enable them on your database provider.
5. **WhatsApp Business Cloud API automation** needs Meta business verification and approved templates; today's
   integration is click-to-chat plus email, which needs no paid service.
6. **Legal pages are drafts** (privacy, terms, cancellation/refund, cookie) and must be reviewed for your actual
   services and Indian law (DPDP Act 2023, IT Rules) before launch.
7. **CSP `style-src` allows `'unsafe-inline'`** because Tailwind/Google Maps inject styles. Scripts remain strict;
   tightening styles would require nonces and may break Maps.
