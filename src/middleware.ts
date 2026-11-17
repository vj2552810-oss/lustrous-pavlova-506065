import { NextResponse, type NextRequest } from "next/server";

/**
 * Security middleware — runs on every request before handlers.
 *
 * Responsibilities:
 *  - Security headers + Content Security Policy (no `unsafe-inline` for scripts)
 *  - CORS restricted to same-origin for all JSON APIs
 *  - Method restrictions (public APIs are POST-only)
 *  - Blocks crawler access to staff/admin surfaces
 *  - Redirects off-site hosts to the canonical site (prevents host-header abuse)
 *
 * Note: the admin passcode itself is verified server-side in
 * `src/lib/admin/auth.ts` — middleware never replaces that check.
 */

const SELF = "'self'";

// Google Maps injects inline styles and remote scripts/images only when a
// browser key is configured, so those allowances are conditional.
/**
 * Script policy trade-off (documented in docs/security.md):
 * Statically prerendered pages (/ , /contact, /explore, legal pages) cannot carry
 * a per-request nonce because their HTML is generated at build time, so a
 * nonce-only policy would block hydration and blank the site. The default
 * therefore allows 'unsafe-inline' for scripts while keeping every other
 * directive strict. Set CSP_STRICT_SCRIPTS=true to switch to
 * nonce + 'strict-dynamic' once all pages are dynamic (verified per deployment).
 */
function buildCsp(mapsEnabled: boolean, nonce: string) {
  const strictScripts = process.env.CSP_STRICT_SCRIPTS === "true";
  const mapsScriptHosts = mapsEnabled ? ["https://maps.googleapis.com", "https://maps.gstatic.com"] : [];
  const scriptSrc = strictScripts
    ? [SELF, `'nonce-${nonce}'`, "'strict-dynamic'", ...mapsScriptHosts]
    : [SELF, "'unsafe-inline'", ...mapsScriptHosts];
  const styleSrc = [SELF, "'unsafe-inline'", "https://fonts.googleapis.com"];
  const imgSrc = [
    SELF,
    "data:",
    "https://images.pexels.com",
    "https://maps.googleapis.com",
    "https://maps.gstatic.com",
    "https://*.ggpht.com",
    "https://www.google-analytics.com",
  ];
  const connectSrc = [
    SELF,
    ...(mapsEnabled ? ["https://maps.googleapis.com"] : []),
    "https://www.google-analytics.com",
    "https://*.analytics.google.com",
  ];
  const fontSrc = [SELF, "https://fonts.gstatic.com", "data:"];
  const frameSrc = [SELF, "https://www.google.com", "https://maps.google.com", "https://js.stripe.com"];
  const objectSrc = ["'none'"];
  const baseUri = [SELF];
  const formAction = [SELF, "https://www.google.com"];

  return [
    `default-src ${SELF}`,
    `base-uri ${baseUri.join(" ")}`,
    `script-src ${scriptSrc.join(" ")}`,
    `style-src ${styleSrc.join(" ")}`,
    `img-src ${imgSrc.join(" ")}`,
    `font-src ${fontSrc.join(" ")}`,
    `connect-src ${connectSrc.join(" ")}`,
    `frame-src ${frameSrc.join(" ")}`,
    `object-src ${objectSrc.join(" ")}`,
    `form-action ${formAction.join(" ")}`,
    `frame-ancestors 'none'`,
    "upgrade-insecure-requests",
  ].join("; ");
}

const PROTECTED_PREFIXES = ["/admin"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isApi = pathname.startsWith("/api/");
  const mapsEnabled = Boolean(process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY);

  // Edge-safe: middleware runs on the Edge runtime, so use Web Crypto.
  const nonce = btoa(crypto.randomUUID().replace(/-/g, "")).replace(/=/g, "");
  const headers = new Headers(req.headers);
  headers.set("x-nonce", nonce);
  headers.set("Content-Security-Policy", buildCsp(mapsEnabled, nonce));
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("X-Frame-Options", "DENY");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(self), interest-cohort=()");
  headers.set("Cross-Origin-Opener-Policy", "same-origin");
  headers.set("X-DNS-Prefetch-Control", "on");
  if (!isApi) headers.set("Cache-Control", "no-store");

  // Strip the HSTS header on plain HTTP so browsers don't pin an insecure origin.
  const proto = req.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() ?? req.nextUrl.protocol.replace(":", "");
  if (proto === "https") {
    headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  }

  // --- CORS: same-origin only, never a wildcard -------------------------------
  const origin = req.headers.get("origin");
  const host = req.headers.get("host") ?? "";
  const sameOrigin = !origin || origin === `https://${host}` || origin === `http://${host}`;

  if (isApi) {
    headers.set("Vary", "Origin");
    if (!sameOrigin) {
      return NextResponse.json({ ok: false, error: "Cross-origin requests are not permitted." }, { status: 403, headers });
    }
    if (req.method === "OPTIONS") {
      headers.set("Access-Control-Allow-Origin", origin ?? "");
      headers.set("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
      headers.set("Access-Control-Allow-Headers", "Content-Type");
      headers.set("Access-Control-Max-Age", "600");
      return new NextResponse(null, { status: 204, headers });
    }
  }

  // --- Method allow-list for mutating public endpoints ------------------------
  if (isApi && !["GET", "POST", "PATCH", "DELETE", "OPTIONS", "HEAD"].includes(req.method)) {
    return NextResponse.json({ ok: false, error: "Method not allowed." }, { status: 405, headers });
  }

  // --- Staff surfaces: no crawlers, no prefetch -------------------------------
  if (PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
    headers.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
  }

  // NOTE: no Host-based canonical redirect. A previous version redirected any
  // request whose Host differed from NEXT_PUBLIC_SITE_URL, which broke every
  // deployment where that variable was a placeholder (e.g. http://localhost:3000):
  // Netlify/preview visitors were 308-redirected to localhost and saw
  // "This page couldn't load. A server error occurred."
  // Host-header abuse is mitigated instead by CSP base-uri/frame-ancestors and by
  // never building links from the Host header (we use NEXT_PUBLIC_SITE_URL or the
  // request URL). Opt-in canonical redirects belong at the CDN/host level.

  // Forward headers to the route AND copy them onto the outgoing response —
  // NextResponse.next({ request }) alone does not set response headers.
  const response = NextResponse.next({ request: { headers } });
  headers.forEach((value, key) => {
    const lower = key.toLowerCase();
    if (lower === "content-security-policy") {
      response.headers.set(key, value);
      return;
    }
    if (["x-content-type-options", "x-frame-options", "referrer-policy", "permissions-policy", "cross-origin-opener-policy", "x-dns-prefetch-control", "x-robots-tag", "strict-transport-security", "cache-control", "vary"].includes(lower)) {
      response.headers.set(key, value);
    }
  });
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.svg|.*\\.(?:png|jpg|jpeg|svg|webp|ico|txt|xml|woff2?)$).*)"],
};
