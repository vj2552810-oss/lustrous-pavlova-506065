# PRITIVO — Your World. Your Way.

Premium marketing website for **PRITIVO**, an online travel agency in Belagavi, Karnataka.
Built with Next.js (App Router) + React + TypeScript + Tailwind CSS + Lucide icons, with an optional
PostgreSQL (Drizzle ORM) backup log for enquiries.

## Features
- Pages: Home, Tour Packages (search + region + experience filters), Custom Trip Planner, About, FAQ, Contact,
  Privacy Policy, Terms, Cancellation & Refund (draft legal pages clearly marked for review), custom 404.
- WhatsApp-first enquiries: validated forms open a prefilled, URL-encoded WhatsApp message to +91 7892337596.
  Contact form can also send via email (`mailto:`).
- **Guest-only hotel booking** (`/hotels`) with no accounts: search by destination/dates/guests/rooms, room types,
  amenities and cancellation terms, guest details, server-side re-check before payment, Stripe payment, provider
  confirmation, booking reference, email confirmation when configured, and lookup at `/my-booking`.
- No accounts, logins, registrations or private dashboards anywhere on the site.
- Enquiries are additionally stored privately in PostgreSQL via `POST /api/enquiries` (server-validated,
  honeypot + basic rate limit). There is **no** public endpoint that reads enquiries.
- SEO: per-page titles/descriptions, Open Graph/Twitter tags, JSON-LD (TravelAgency + FAQPage),
  `sitemap.xml`, `robots.txt`, semantic HTML, alt text, optimised `next/image`.
- Floating WhatsApp button, mobile hamburger menu, reduced-motion support, accessible form errors.

## Editing content
| What | Where |
| --- | --- |
| Phone, email, social links, site URL | `src/lib/site.ts` (social links appear only when filled in) |
| Packages, images, durations, highlights | `src/lib/packages.ts` |
| Verified prices | set `verifiedPriceINR` on a package (otherwise “Request a Quote” is shown) |
| FAQ | `src/app/faq/page.tsx` |
| Legal drafts | `src/app/privacy-policy`, `src/app/terms`, `src/app/cancellation-refund-policy` |
| Maps config & destinations | `src/lib/maps/config.ts`, `src/lib/maps/destinations.ts`, `src/lib/maps/places.ts` |
| Map components | `src/components/maps/*`, `src/components/hotels/ResultsView.tsx` |
| Demo hotel inventory | `src/lib/hotels/demo-catalog.ts` (replace by enabling the live provider) |
| Hotel booking pages/APIs | `src/app/hotels`, `src/app/my-booking`, `src/app/booking/[reference]`, `src/app/api/hotels/*`, `src/app/api/bookings/*` |

## Local setup
```bash
npm install
cp .env.example .env    # or create .env with DATABASE_URL
npx drizzle-kit push    # creates the `enquiries` table
npm run dev             # http://localhost:3000
```

Environment variables:
- `DATABASE_URL` — PostgreSQL connection string (server-only, never exposed to the browser).
- `NEXT_PUBLIC_SITE_URL` — your live domain, e.g. `https://pritivo.in` (used for sitemap, canonical & OG URLs).

Reading enquiries (privately): `psql "$DATABASE_URL" -c "select * from enquiries order by created_at desc;"`



## Hotel booking (guest-only)

### Current status: DEMO MODE — not live booking
No authorised hotel API credentials or Stripe keys exist in this project, so the booking journey runs on
**clearly labelled demo inventory** (`src/lib/hotels/demo-catalog.ts`): fictional properties with sample prices.
In demo mode:

- the hotel list, hotel pages and booking pages show a permanent “Demo mode — not live availability” notice;
- no payment is taken, no card details are requested, and Stripe is never called;
- the booking is saved with status `demo_request` and the page states it is **not a reservation**;
- the demo provider refuses to confirm bookings by design (`confirm()` always fails).

Nothing on the site claims live booking is operational. `GET /api/hotels/status` reports exactly what is configured
(booleans only) and lists what is missing.

### Files
| Concern | Path |
| --- | --- |
| Provider contract & selection | `src/lib/hotels/types.ts`, `src/lib/hotels/provider.ts` |
| Demo inventory (clearly labelled) | `src/lib/hotels/demo-catalog.ts`, `src/lib/hotels/demo-provider.ts` |
| Live adapter (server-side, keyed) | `src/lib/hotels/live-provider.ts` |
| Prices, validation, formatting | `src/lib/hotels/provider.ts`, `src/lib/hotels/format.ts` |
| Booking pipeline, refunds, access checks | `src/lib/bookings.ts` |
| Stripe (checkout, verification, refund, webhook signatures) | `src/lib/payments/stripe.ts` |
| Pages | `src/app/hotels`, `src/app/hotels/[hotelId]`, `src/app/booking/[reference]`, `src/app/my-booking` |
| APIs | `src/app/api/hotels/*`, `src/app/api/bookings/*`, `src/app/api/webhooks/stripe` |

### Booking states
`demo_request` · `request_received` (live, payment gateway not configured) · `pending_payment` · `paid` ·
`confirmed` · `confirmation_failed` · `refunded` · `cancelled`.
A booking can **only** become `confirmed` inside `confirmBookingAfterPayment()`, which requires:
1. a Stripe session retrieved **server-side** with `payment_status: "paid"`, matching booking reference **and** amount;
2. a fresh provider re-check of availability and price;
3. a provider confirmation reference.

If the room sells out or the price changed after payment, the booking is **not** confirmed; a refund is attempted
and recorded (`refundId` or `confirmation_failed`), with every step written to `hotel_booking_events`.

### Environment variables
| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | Yes | PostgreSQL connection (server-only). |
| `NEXT_PUBLIC_SITE_URL` | Yes in production | Used for Stripe return URLs, emails, sitemap/canonical. |
| `HOTEL_API_BASE_URL` | For live | Base URL of your authorised hotel/aggregator API. |
| `HOTEL_API_KEY` | For live | Sent server-side as `Authorization: Bearer …`. Never exposed to the browser. |
| `HOTEL_API_PROVIDER_NAME` | Optional | Shown in the “Live availability” label. |
| `HOTEL_API_MODE` | For live | Must be exactly `live`. Anything else keeps demo mode even if keys exist. |
| `STRIPE_SECRET_KEY` | For payments | Server-only Stripe secret key (`sk_live_…` / `sk_test_…`). |
| `STRIPE_WEBHOOK_SECRET` | For payments | Endpoint signing secret (`whsec_…`) — webhooks are rejected without it. |
| `RESEND_API_KEY`, `BOOKING_EMAIL_FROM` | Optional | Enables confirmation emails. Without them the confirmation is on screen only and the UI says so. |

Never put any of these in client code. `HOTEL_API_*`, `STRIPE_*` and `RESEND_*` are read only in server modules
(`import "server-only"`).

### Database migration
```bash
npx drizzle-kit push   # creates hotel_bookings, hotel_booking_events, payment_events (+ enquiries)
```

### Enabling LIVE booking — required steps
1. **Hotel API access.** Sign a commercial agreement with a hotel provider/aggregator (for example Hotelbeds, TBO,
   RateHawk or a Duffel Stays account) and obtain their base URL and API key. Live booking must not be enabled
   before commercial approval exists.
2. **Map the provider to the adapter contract.** The live adapter in `src/lib/hotels/live-provider.ts` calls:
   - `POST {base}/search` → `{ hotels: [{ id, name, city, area, country, star_rating, description, image, amenities[], rooms[] }] }`
   - `GET {base}/hotels/:id?check_in=&check_out=&guests=&rooms=` → `{ hotel: {...} }`
   - `POST {base}/recheck` → `{ quote: { id, name, nightly_price_minor, subtotal_minor, taxes_minor, total_minor, currency, rooms_available, max_guests, cancellation: { policy, refundable, deadline } } }`
   - `POST {base}/bookings` → `{ bookingId, confirmationCode, status }`
   Amounts are **minor units** (paise). If your provider uses a different shape (Hotelbeds uses `occupancies` and
   signed headers; Duffel uses `/stays/search` + quotes + `actions`), keep the transformation inside this one file —
   the rest of the app depends only on the normalised types in `src/lib/hotels/types.ts`.
3. **Test against the provider sandbox** with real test bookings, including sold-out and price-change cases, before
   setting `HOTEL_API_MODE=live`.
4. **Stripe.** Add `STRIPE_SECRET_KEY` and register the webhook endpoint `https://your-domain/api/webhooks/stripe`
   for `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.expired` and
   `charge.refunded`. Put the signing secret in `STRIPE_WEBHOOK_SECRET`.
   Locally: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`.
5. **Email (optional).** Verify a sending domain with Resend and set `RESEND_API_KEY` + `BOOKING_EMAIL_FROM`.
6. **Confirm the switch.** `GET /api/hotels/status` should report `bookingEnabled: true`, hotel mode `live`, no
   payment problems, then place a small live test booking followed by a refund.

### Guest access, cancellation and refunds
- No accounts. `/my-booking` requires the reference **plus** the email or phone on the booking; full contact details
  are masked on screen. Lookups are rate limited and give a generic message on mismatch.
- Unpaid bookings can be cancelled by the guest from `/booking/[reference]` (contact check required). Paid or
  confirmed bookings are never auto-cancelled — the hotel's policy applies and support is offered on WhatsApp.
- After a payment where the hotel cannot confirm, the server calls Stripe refunds, records the refund id, and marks
  the booking `refunded` (or `confirmation_failed` if the refund call failed, for manual follow-up).

### What has been verified
Search, demo booking creation, demo-mode refusal to confirm or charge, booking page states, lookup (correct/incorrect
contact), cancellation of unpaid bookings, rate limiting, webhook signature rejection with a wrong secret, and
webhook idempotency. **Live provider booking, live Stripe payment and confirmation emails cannot be tested until the
credentials above are configured** — treat them as unverified until you complete the steps above.



## Global Tour Management System

A single reusable system drives every destination page: domestic tours, international tours and special packages.

| Piece | Location |
| --- | --- |
| Data model (`tours`, `admin_sessions`) + enquiry workflow fields | `src/db/schema.ts` |
| Curated catalogue (48 journeys) & content builder | `src/lib/tours/catalog.ts` |
| Client-safe labels, durations, budgets, styles | `src/lib/tours/constants.ts` |
| Filtering, seeding, CRUD, enquiry queries | `src/lib/tours/service.ts` |
| Admin form validation (shared by create/update) | `src/lib/tours/form.ts` |
| Public hub with search/filters | `src/app/tours/page.tsx` |
| Dynamic destination template | `src/app/tours/[slug]/page.tsx` |
| Staff tour manager | `src/app/admin` (`/admin`, `/admin/tours/new`, `/admin/tours/[id]`) |
| Staff APIs | `src/app/api/admin/*` |
| Quotation form + API | `src/components/tours/TourEnquiryForm.tsx`, `POST /api/enquiries` with `kind: "tour"` |

**Collections currently seeded:** 13 domestic (Darjeeling, Kashmir, Goa, Manali, Sikkim, Meghalaya, Ladakh, Kerala,
Karnataka, Rajasthan, Andaman, Uttarakhand, Coorg), 23 international (Switzerland, Scotland, Italy, France, Greece,
Norway, Iceland, Japan, South Korea, Bali, Maldives, Dubai, Türkiye, Egypt, South Africa, Australia, New Zealand, USA,
Canada, London, Thailand, Singapore, Vietnam) and 12 special packages (honeymoon, family, luxury, budget, adventure,
trekking, wildlife safari, cruise, northern lights, spiritual, weekend, custom private).

### Seeding
`ensureToursSeeded()` runs automatically on the first catalogue request and inserts the starter tours with
`ON CONFLICT DO NOTHING`, so it is safe on a fresh database and never overwrites staff edits. Notes:
- Run `npx drizzle-kit push` first to create the `tours` table.
- If you delete **every** tour, a later request re-seeds the starter catalogue (guard against an empty public site).
  To hide tours, use **Unpublish** rather than deleting them.
- Editing a tour in the manager updates the live page immediately.

### Search & filters
`/tours` filters server-side on: free text (destination, city, country, continent, summary, styles), collection,
country, continent, travel style, duration band and budget band. Budget filtering matches **verified** prices only —
tours marked “Request a Quote” stay visible rather than being filtered out on a guessed price. Empty results show a
clear state with links to clear filters or request a custom trip.

### Staff access (not a customer account)
- `/admin` is a **staff-only** tour manager. It unlocks with `ADMIN_PASSCODE` (minimum 12 characters) held only in
  server environment variables; sessions are random tokens stored hashed in `admin_sessions` with a 12-hour expiry,
  an httpOnly/SameSite cookie, and constant-time passcode comparison plus 6 attempts per 15 minutes per IP.
- If `ADMIN_PASSCODE` is unset, the manager shows a setup notice and **all staff APIs return 401** — it is never
  open by default.
- `/admin` and `/admin/*` are `noindex` and disallowed in `robots.txt`. Unpublished tours return 404 publicly.
- There are **no customer login, registration or logout screens** anywhere; guests book hotels and request quotes
  without an account. The only sign-in surface is this staff gate.

### Enquiry workflow
`POST /api/enquiries` accepts `kind: "tour"` from the tour template and stores name, email, phone, dates, travellers,
budget, travel style, preferences and the originating `tourSlug`. In `/admin?tab=enquiries` staff can change status
(new → contacted → quoted → closed), add internal notes, and open WhatsApp/email/call actions. Guests get WhatsApp
support at +91 7892337596 and email at vj2552810@gmail.com.


## Travel agency management platform (staff modules)

Everything below is staff-only except the public pages listed first. **There are no customer accounts, logins,
registrations or logout screens anywhere on the site.**

| Module | Public / staff | Where |
| --- | --- | --- |
| Tours hub with search + filters | Public | `/tours` |
| Dynamic tour template (itinerary, inclusions, exclusions, tips, quote form) | Public | `/tours/[slug]` |
| Destination guides (15) with indicative budget + pricing conditions | Public | `/destinations`, `/destinations/[slug]` |
| Services (10) | Public | `/services`, `/services/[slug]` |
| Advanced enquiry form → unique enquiry ID (`PVH-ENQ-…`) | Public | `src/components/AdvancedEnquiryForm.tsx` |
| Guest hotel booking + reference lookup | Public | `/hotels`, `/booking/[reference]`, `/my-booking` |
| AI travel assistant (catalogue-grounded) | Public | widget on every page, `POST /api/assistant` |
| Dashboard: metrics, pipeline, CRM, suppliers, quotations, tours | Staff | `/admin?tab=overview|enquiries|customers|suppliers|quotations|tours` |
| Quotation generator + print/PDF document | Staff | `/admin/quotations/new`, `/admin/quotations/[code]` |
| Automation webhook (n8n) | Machine | `POST /api/webhooks/n8n/{workflow}` — see `docs/n8n-workflows.md` |
| Security hardening report | Docs | `docs/security.md` |

### Booking pipeline (enquiries table)
`new_enquiry → contacted/quotation_sent → awaiting_approval → awaiting_payment → awaiting_supplier_confirmation →
confirmed → completed` (plus `cancelled`). Transitions are validated server-side: an enquiry **cannot** be moved to
`confirmed` unless `supplier_confirmed = true` **and** `payment_status = 'paid'`, and a supplier must be marked
`verified` before it can be recorded as the confirming party. Quotation generation moves a linked enquiry to
`quotation_sent` automatically.

### Admin setup (required)
1. `ADMIN_PASSCODE` — at least 12 characters. Until it is set, `/admin` shows a setup notice and every `/api/admin/*`
   route returns **401** (fail-closed).
2. `npx drizzle-kit push` to create `customers`, `suppliers`, `quotations`, `audit_logs`, `newsletter_subscribers`
   and the new enquiry columns.
3. Optional: `N8N_WEBHOOK_SECRET` (signed automation webhooks), `NEXT_PUBLIC_GA_MEASUREMENT_ID` (analytics),
   `OPENAI_API_KEY` (assistant can be extended; without it the assistant answers only from our own catalogue),
   `CSP_STRICT_SCRIPTS=true` (nonce-only CSP — see `docs/security.md` before enabling).

### No paid services needed to preview
The site is fully usable with only `DATABASE_URL`: tours, destinations, services, enquiries, quotations, CRM,
suppliers, the assistant and guest hotel demo mode all work. Hotel live availability, card payments, Google Maps and
transactional email stay clearly disabled/labelled until you add those keys.

### Netlify / Vercel deployment
- **Vercel**: import the repo, add the env vars above, deploy, then run `npx drizzle-kit push` once against the
  production `DATABASE_URL`. Add your domain under Settings → Domains and set `NEXT_PUBLIC_SITE_URL` to it.
- **Netlify**: import the repo (Next.js runtime is applied automatically), add the same env vars under Site
  configuration → Environment variables, deploy, then run the migration locally against production.
- Middleware security headers work on both platforms. If you deploy behind another proxy, make sure it forwards
  `x-forwarded-proto` so cookies are marked `Secure` on HTTPS.

## Google Maps integration

### What it does
| Feature | Where |
| --- | --- |
| Hotel location map, verified address, “Get directions”, nearby attractions/restaurants/airports/transport | `/hotels/[hotelId]` → **Location & map** (client component `src/components/maps/HotelMapPanel.tsx`) |
| “Map view” toggle beside search results, markers with provider price + details link | `/hotels` → `src/components/hotels/ResultsView.tsx` |
| Destination explorer (India + worldwide) with hotel-search deep links and directions | `/explore` → `src/components/maps/DestinationExplorer.tsx` |
| Directions / place links (no API key needed) | `directionsUrl()` / `placeUrl()` in `src/lib/maps/config.ts` |
| Nearby places proxy (server key stays secret) | `GET /api/places/nearby?lat=&lng=&category=attraction|restaurant|airport|transit` |
| Configuration diagnostics | `GET /api/maps/status` (also included in `/api/hotels/status`) |

### Honesty rules built into the integration
- **No invented hotel coordinates.** `HotelResult.location` carries `verified: false` unless the hotel provider
  returns `latitude`/`longitude`. Demo hotels are fictional, so they have no address or coordinates and the map
  shows a clearly labelled *approximate area* pin instead of a hotel pin. The hotel card and map panel say
  “Map location not verified”.
- **Destinations are city-centre references.** `/explore` pins approximate city centres (labelled as such) purely to
  orient the map. They are not hotel locations.
- **Nearby places only come from Google.** `src/lib/maps/places.ts` returns `configured: false` when no server key
  exists and the UI then says nearby data is unavailable — no place names, ratings or “walking distance” claims are
  generated locally.
- **Prices stay with the hotel provider.** Marker price labels and detail links use `RoomOffer` data from our hotel
  API. Google Maps is never a source of price or availability, and the map footer says so.
- **Live booking is still not operational** until `HOTEL_API_*` and `STRIPE_*` are configured and tested; maps do
  not change that.

### Lazy loading & performance
`MapCanvas` only requests the Maps JavaScript SDK after the map element scrolls into view (`IntersectionObserver`),
loads the SDK once per session, and the Map View toggle means no map is requested unless the guest asks for it.
If the key is missing, the script fails, or Google rejects the key (`gm_authFailure`), a fallback panel explains the
problem and the directions links keep working. Reduced-motion users are unaffected; the map has no animations beyond
panning. The map is styled dark/champagne to match the PRITIVO palette and is responsive at every breakpoint.

### Environment variables
| Variable | Where | Exposure | Restrict it to |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Browser (Maps JavaScript API) | Public by design — inlined into the client bundle | Your website origins (HTTP referrers) **and** the Maps JavaScript API only |
| `GOOGLE_MAPS_SERVER_API_KEY` | Server only (Places API proxy) | Never sent to the browser | Places API (and server IPs where available) |

Never place the Places/server key in `NEXT_PUBLIC_*`, and never put hotel-provider or Stripe secrets in either key's
configuration.

### Google Cloud setup (step by step)
1. **Create a project.** Sign in at <https://console.cloud.google.com>, create a project (e.g. `pritivo-maps`), and
   select it.
2. **Enable billing.** Maps Platform requires a billing account. Google's published pricing includes a recurring
   usage credit and free tiers, but rates and credits change — check the current
   [Maps Platform pricing page](https://mapsplatform.google.com/pricing/) before launch and set budget alerts.
3. **Enable the APIs** (APIs & Services → Library):
   - **Maps JavaScript API** (required for the interactive maps)
   - **Places API** (required for nearby attractions/restaurants/airports/transport)
   - Optionally **Geocoding API** if you later want to geocode your own hotel addresses.
4. **Create the browser key** (APIs & Services → Credentials → Create credentials → API key):
   - Application restrictions → **Websites (HTTP referrers)**: add your production origin exactly, e.g.
     `https://pritivo.in/*` and `https://www.pritivo.in/*`, plus `http://localhost:3000/*` only if you need local
     development.
   - API restrictions → **Maps JavaScript API** only.
   - Copy into `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`.
5. **Create the server key**: same flow, but API restrictions → **Places API** only, and an IP restriction if your
   hosting provides static egress IPs (Vercel/Netlify need serverless-friendly settings — leave IP restrictions off
   only if you accept the risk and keep the key server-side). Copy into `GOOGLE_MAPS_SERVER_API_KEY`.
6. **Redeploy / restart** so environment variables are picked up.
7. **Verify** `GET /api/maps/status` reports `browserKeyConfigured: true` and `placesConfigured: true`, open
   `/hotels/demo-cormorant-house` and `/explore`, and confirm markers, “Get directions” and nearby places work on a
   phone and a desktop.

### Mapping a live hotel provider's coordinates
In `src/lib/hotels/live-provider.ts`, `toLocation()` reads `latitude`, `longitude` and `address` from the provider's
hotel payload. If your provider nests them (e.g. `coordinates: { lat, lng }` or `location.latitude`), map those fields
there. Once values are valid the marker becomes verified automatically; if they are missing, no hotel pin is drawn and
guests see the approximate-area notice.

### Privacy / compliance
Add a cookie/consent notice if your jurisdiction requires one before Google Maps sets cookies. The privacy policy
already discloses Google Maps/Places usage. Maps are not loaded on the home, list, contact, FAQ or legal pages.


## Design system (navy + gold, cinematic 3D)

| Element | Where |
| --- | --- |
| Palette tokens (`ink` = deep navy `#071629`, champagne gold `#c6a866`) | `src/app/globals.css` (`@theme`) |
| Cinematic layered hero, parallax, 3D card cluster, glassmorphism search | `src/components/home/Hero3D.tsx` |
| Depth utilities (`.perspective`, `.parallax-layer`, `.hero-tilt`, `.glass`, `.card-3d`) | `src/app/globals.css` |
| Shared page hero with gold glow, grid and floating light | `src/components/PageHero.tsx` |
| Premium footer with popular destinations + booking links | `src/components/Footer.tsx` |
| Hotel results filters (price, stars, amenities, cancellation, breakfast) synced with the map | `src/components/hotels/HotelFilters.tsx`, `ResultsView.tsx` |
| Flights & fares request flow (no invented fares) | `src/app/flights`, `src/components/flights/FlightRequestForm.tsx` |
| Route loading skeletons | `loading.tsx` beside hotels, hotel detail, explore, flights, packages, booking |

**Performance / accessibility notes**
- 3D is CSS-only (`transform`, `perspective`, `backdrop-filter`) — no WebGL or heavy libraries, so there is no impact
  on the JS budget.
- The mouse-tilt parallax is skipped on coarse pointers, and every animation is disabled under
  `prefers-reduced-motion`. Blur is reduced on small screens.
- Maps only load when scrolled into view (see the Google Maps section), and the hero image is the only priority image.
- All interactive elements keep visible focus rings, labelled inputs, `aria-pressed`/`aria-selected` states and
  live regions for loading and result counts.

## Flights & holiday packages
- `/flights` collects trip type, route, dates, travellers, cabin, flexible dates and contact details, and saves the
  request through `POST /api/enquiries` (`kind: "flight"`).
- **No flight prices or availability are displayed anywhere**, because no authorised flight API is configured. The page
  explains this and routes guests to a written quote instead.
- Holiday packages (`/packages`) now include London alongside Goa, Manali, Dubai, Bali and the rest; all package prices
  remain **“Request a Quote”** until a verified price exists.

## Payment mode
`src/lib/payments/stripe.ts` exposes `stripeMode()` → `unconfigured | test | live` based on the secret key prefix, and
`stripeModeNotice()` surfaces a banner in the booking actions and on `/booking/[reference]`. With a `sk_test_…` key the
site states clearly that **test mode** is active, no real money is charged and a test card is required. Test-mode
checkout can be exercised with Stripe test cards; live payments are enabled only after approval and live keys.
`/api/hotels/status` reports `payments.mode` for verification.

## Deploying on Vercel (recommended, free tier)
1. Push this project to a GitHub repository.
2. On vercel.com → **Add New → Project** → import the repo (framework auto-detected as Next.js).
3. Add environment variables `DATABASE_URL` and `NEXT_PUBLIC_SITE_URL`.
   A free Postgres can be created from Vercel **Storage → Neon** (or neon.tech / supabase.com free tiers).
4. Deploy. Run `npx drizzle-kit push` once locally with the production `DATABASE_URL` to create the table.
5. Add your custom domain under **Project → Settings → Domains**.

## Deploying on Netlify
1. Push to GitHub, then **Add new site → Import an existing project**.
2. Netlify detects Next.js and applies its Next.js runtime automatically (build command `npm run build`).
3. Add the same environment variables under **Site configuration → Environment variables**, then deploy.

> No database? The site still works: WhatsApp/email enquiries are the primary channel. The backup save simply
> fails gracefully and the user is told to press send in WhatsApp.

## Before launch checklist
- Set `ADMIN_PASSCODE` (12+ characters) to enable the staff tour manager, and keep it out of version control.
- Add Google Maps keys and verify `/api/maps/status` shows both keys configured.
- Decide on flight fulfilment: until an authorised flight API is connected, `/flights` only produces enquiry
  requests. If you add a provider, do not show fares until they come from that provider.
- Complete the “Enabling LIVE booking” steps; until then keep `HOTEL_API_MODE=demo` so guests always see the demo label.
- Register the Stripe webhook and set `STRIPE_WEBHOOK_SECRET` — without it, payments are refused rather than
  taken without automatic confirmation.
- Have the legal drafts reviewed and remove the “DRAFT” banners in `src/components/LegalPage.tsx`.
- Replace stock photography (Pexels) with your own as the business grows.
- Add real social profile URLs and genuine traveller reviews only when available.
