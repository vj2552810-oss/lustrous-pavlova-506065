import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeIndianRupee,
  Compass,
  HeartHandshake,
  MessageSquareQuote,
  PenLine,
  Plane,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
  Check,
} from "lucide-react";
import { PACKAGES, HERO_IMAGE } from "@/lib/packages";
import { Hero3D } from "@/components/home/Hero3D";
import { HomeSections } from "@/components/home/HomeSections";
import { DESTINATIONS } from "@/lib/maps/destinations";
import { TourCard } from "@/components/tours/TourCard";
import { listTours, type TourRecord } from "@/lib/tours/service";
import { STYLE_LABELS } from "@/lib/tours/constants";
import { defaultQuery, hotelIntegrationState } from "@/lib/hotels/provider";
import { PackageCard } from "@/components/PackageCard";
import { Reveal } from "@/components/Reveal";
import { SectionHeading } from "@/components/PageHero";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { whatsappLink } from "@/lib/site";

const highlightSlugs = ["kashmir", "bali", "kerala", "dubai", "rajasthan"];

const POPULAR_SLUGS = ["goa", "manali", "london", "dubai", "bali"];
const POPULAR = POPULAR_SLUGS.map((slug) => DESTINATIONS.find((d) => d.slug === slug)!).filter(Boolean);

const SPECIAL_STYLE_KEYS = [
  "honeymoon",
  "family",
  "luxury",
  "budget",
  "adventure",
  "trekking",
  "wildlife",
  "cruise",
  "northern-lights",
  "spiritual",
  "weekend",
  "private",
] as const;
const specialStyles = SPECIAL_STYLE_KEYS.map((key) => ({ key, label: STYLE_LABELS[key] }));

const WHY = [
  { icon: PenLine, title: "Truly personalised", text: "Every itinerary is built around your dates, pace, budget and interests — never a one-size-fits-all package." },
  { icon: BadgeIndianRupee, title: "Transparent quotations", text: "Clear written quotes that list what's included and what isn't. Final terms are always confirmed in writing." },
  { icon: HeartHandshake, title: "One point of contact", text: "A dedicated planner on WhatsApp from first idea to safe return — no call-centre hand-offs." },
  { icon: Compass, title: "India & worldwide", text: "From weekend getaways near Belagavi to international holidays in Dubai, Bali, Thailand and Singapore." },
  { icon: Users, title: "For every traveller", text: "Families, couples, students, solo explorers and groups — each trip designed for the people taking it." },
  { icon: ShieldCheck, title: "Honest advice", text: "We recommend what genuinely suits you, and we'll tell you upfront about seasons, visas and practicalities." },
];


// Rendered per request: the tour counts and cards are database-backed, and a
// build-time render with no database access would bake a wrong count into the
// static HTML (this is what produced "Explore all 0+ tours" in production).
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const highlights = highlightSlugs.map((s) => PACKAGES.find((p) => p.slug === s)!);

  let featuredTours: TourRecord[] = [];
  let dealTours: TourRecord[] = [];
  let tourTotal = 0;
  // True only when the catalogue was actually read — so we never print a
  // fabricated "0+ tours" count when the database is unreachable.
  let toursAvailable = false;
  try {
    const all = await listTours({});
    toursAvailable = true;
    tourTotal = all.length;
    featuredTours = all.filter((t) => t.featured).slice(0, 6);
    if (featuredTours.length === 0) featuredTours = all.slice(0, 6);
    dealTours = all.filter((t) => t.durationDays <= 6).sort((a, b) => a.durationDays - b.durationDays).slice(0, 4);
    if (dealTours.length === 0) dealTours = all.slice(0, 4);
  } catch (err) {
    console.error("Home tours query failed", err);
  }

  return (
    <>
      <Hero3D
        initialQuery={defaultQuery()}
        images={{
          hero: HERO_IMAGE,
          cardA: PACKAGES[0].image,
          cardB: PACKAGES[8].image,
          cardC: PACKAGES[6].image,
        }}
        destinationChips={["Goa", "Manali", "London", "Dubai", "Bali"].map((name) => ({
          name,
          href: `/hotels?destination=${encodeURIComponent(name)}&checkIn=${defaultQuery().checkIn}&checkOut=${defaultQuery().checkOut}&guests=2&rooms=1`,
        }))}
      />

      {/* HOTELS — guest booking (no second search widget: the hero owns search) */}
      <section className="relative bg-sand py-20 sm:py-24" aria-labelledby="hotel-search-title">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="grid items-center gap-8 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <p className="eyebrow text-gold-dark">Hotels · Guest booking</p>
              <h2 id="hotel-search-title" className="mt-4 font-serif text-4xl font-medium leading-tight sm:text-5xl">
                Book a stay with <span className="text-gold-gradient italic">no account.</span>
              </h2>
              <p className="mt-4 max-w-xl leading-7 text-neutral-600">
                Use the search above, or open the hotels page to compare room types, amenities and cancellation terms.
                You&apos;ll get a booking reference to retrieve everything later — no sign-up, no password.
              </p>
              {hotelIntegrationState().mode === "demo" && (
                <p className="mt-5 max-w-xl rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-900">
                  <strong>Demo mode:</strong> sample hotels and prices are shown so you can try the guest booking flow. No
                  payment is taken and no reservation is confirmed until our hotel partner and payment gateway are live.
                </p>
              )}
            </div>
            <div className="lg:col-span-5">
              <div className="rounded-3xl border border-black/5 bg-white p-6">
                <p className="font-serif text-2xl">Two ways to continue</p>
                <div className="mt-4 grid gap-2.5">
                  <Link
                    href="/hotels"
                    className="bg-gold-gradient inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-ink transition hover:brightness-110"
                  >
                    Search hotels <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                  <Link
                    href="/my-booking"
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-neutral-300 px-5 py-3 text-sm font-semibold transition hover:border-ink"
                  >
                    Find my booking
                  </Link>
                  <a
                    href="#search"
                    className="inline-flex items-center justify-center gap-2 px-5 py-2 text-sm font-medium text-gold-dark underline-offset-4 hover:underline"
                  >
                    Back to the search above
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DESTINATION HIGHLIGHTS */}
      <section className="bg-ivory py-24 sm:py-32" aria-labelledby="dest-title">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="max-w-2xl">
            <SectionHeading
              align="left"
              eyebrow="Inspiration"
              title={<span id="dest-title">Places that stay with you</span>}
              description="Hand-picked destinations across India and abroad — each one fully customisable to your style of travel."
            />
            {/* Kept directly under the heading so the title and its "see more"
                action read as one group instead of being split across the row. */}
            <Link
              href="/packages"
              className="group mt-5 inline-flex items-center gap-2 rounded-full border border-ink/15 px-5 py-2.5 font-semibold text-ink transition hover:border-gold hover:bg-champagne/40"
            >
              View all destinations <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" aria-hidden="true" />
            </Link>
          </div>

          <div className="mt-14 grid auto-rows-[220px] gap-5 sm:grid-cols-2 lg:auto-rows-[260px] lg:grid-cols-4">
            {highlights.map((p, i) => (
              <Reveal
                key={p.slug}
                delay={i * 90}
                className={i === 0 ? "sm:col-span-2 sm:row-span-2" : ""}
              >
                <Link href={`/packages#${p.slug}`} className="group relative block h-full overflow-hidden rounded-3xl">
                  <Image src={p.image} alt={p.imageAlt} fill sizes="(min-width:1024px) 50vw, 100vw" className="object-cover transition duration-[1.4s] group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                  <div className="absolute inset-x-6 bottom-6 flex items-end justify-between text-white">
                    <div>
                      <p className="text-xs uppercase tracking-[0.25em] text-gold">{p.location}</p>
                      <h3 className={`mt-1 font-serif font-medium ${i === 0 ? "text-5xl" : "text-3xl"}`}>{p.name}</h3>
                    </div>
                    <span className="flex h-11 w-11 items-center justify-center rounded-full border border-white/40 transition group-hover:border-gold group-hover:bg-gold group-hover:text-ink">
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* POPULAR DESTINATIONS */}
      <section className="relative overflow-hidden bg-ink py-24 text-white sm:py-28" aria-labelledby="popular-dest-title">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_60%_at_20%_0%,rgba(198,168,102,0.18),transparent_60%)]" />
        <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
          <div className="max-w-2xl">
            <SectionHeading
              dark
              align="left"
              eyebrow="Popular right now"
              title={<span id="popular-dest-title">Where travellers are headed</span>}
              description="Five favourites to start with — beach, mountains, city lights and everything in between."
            />
            <Link
              href="/explore"
              className="group mt-5 inline-flex items-center gap-2 rounded-full border border-white/30 px-5 py-2.5 font-semibold text-white transition hover:border-gold hover:text-gold"
            >
              Open the map explorer <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" aria-hidden="true" />
            </Link>
          </div>

          <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {POPULAR.map((d, i) => (
              <Reveal
                as="li"
                key={d.slug}
                delay={i * 80}
                className={i === 0 ? "sm:col-span-2 lg:col-span-1 lg:row-span-2" : ""}
              >
                <article className={`media-zoom group relative overflow-hidden rounded-3xl ${i === 0 ? "h-full min-h-[22rem]" : "min-h-[15rem]"}`}>
                  <Image src={d.image} alt={d.imageAlt} fill sizes="(min-width:1024px) 33vw, 100vw" className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/35 to-transparent opacity-90" />
                  <div className="relative flex h-full flex-col justify-end p-6">
                    <p className="text-xs uppercase tracking-[0.28em] text-gold">{d.region} · {d.bestFor[0]}</p>
                    <h3 className={`mt-1 font-serif font-medium ${i === 0 ? "text-4xl" : "text-2xl"}`}>{d.name}</h3>
                    <p className="mt-2 line-clamp-2 text-sm text-white/65">{d.blurb}</p>
                    <div className="mt-4 flex flex-wrap gap-2.5">
                      <Link
                        href={`/hotels?destination=${encodeURIComponent(d.hotelQuery)}&checkIn=${defaultQuery().checkIn}&checkOut=${defaultQuery().checkOut}&guests=2&rooms=1`}
                        aria-label={`Search hotels in ${d.name}`}
                        className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-white/95 px-5 py-3 text-sm font-semibold text-ink transition hover:bg-gold"
                      >
                        Search hotels <ArrowRight className="h-4 w-4" aria-hidden="true" />
                      </Link>
                      <Link
                        href={`/packages#${d.slug}`}
                        aria-label={`See holiday packages for ${d.name}`}
                        className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-white/40 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white hover:text-ink"
                      >
                        See packages <ArrowRight className="h-4 w-4" aria-hidden="true" />
                      </Link>
                    </div>
                  </div>
                </article>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* GLOBAL TOURS */}
      <section className="bg-ivory py-24 sm:py-28" aria-labelledby="tour-title">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="max-w-2xl">
            <SectionHeading
              align="left"
              eyebrow="Global tour collection"
              title={<span id="tour-title">Domestic, international &amp; special journeys</span>}
              description="Every destination is tailored to your dates, pace and budget — and quoted in writing before anything is booked."
            />
            {/* Kept with the heading, and the count is only shown when the
                catalogue was really read (no more "0+ tours"). */}
            <Link
              href="/tours"
              className="group mt-5 inline-flex items-center gap-2 rounded-full border border-ink/15 px-5 py-2.5 font-semibold text-ink transition hover:border-gold hover:bg-champagne/40"
            >
              {toursAvailable && tourTotal > 0 ? `Explore all ${tourTotal} tours` : "Explore the tour collection"}
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" aria-hidden="true" />
            </Link>
          </div>

          {featuredTours.length > 0 ? (
            <ul className="mt-12 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
              {featuredTours.map((t, i) => (
                <Reveal as="li" key={t.slug} delay={(i % 3) * 80}>
                  <TourCard tour={t} />
                </Reveal>
              ))}
            </ul>
          ) : (
            <div className="mt-10 rounded-3xl border border-dashed border-neutral-300 bg-white px-6 py-10 text-center">
              <p className="font-serif text-2xl">The tour catalogue isn&apos;t loading right now</p>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-neutral-600">
                We won&apos;t guess at destinations or prices. Open the full collection to retry, or message us and a
                planner will send options by hand.
              </p>
              <div className="mt-5 flex flex-wrap justify-center gap-3">
                <Link href="/tours" className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gold hover:text-ink">
                  Open the tour collection
                </Link>
                <a
                  href={whatsappLink("Hello PRITIVO! The tours section wouldn't load — can you send me some options?")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-neutral-300 px-5 py-2.5 text-sm font-semibold hover:border-gold"
                >
                  <WhatsAppIcon className="h-4 w-4" /> WhatsApp us
                </a>
              </div>
            </div>
          )}

          <div className="mt-10 flex flex-wrap justify-center gap-3">
            {["Domestic tours", "International tours", "Special packages"].map((label, i) => (
              <Link
                key={label}
                href={["/tours?type=domestic", "/tours?type=international", "/tours?type=special"][i]}
                className="rounded-full border border-ink/15 bg-white px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-gold hover:bg-champagne/40"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* SPECIAL PACKAGES */}
      <section className="bg-sand py-24 sm:py-28" aria-labelledby="special-title">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <SectionHeading
            eyebrow="Special packages"
            title={<span id="special-title">Built around a kind of trip</span>}
            description="Honeymoons, family holidays, luxury, safaris, cruises, northern lights and more — pick a style and we shape the itinerary."
          />
          <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {specialStyles.map((s, i) => (
              <Reveal as="li" key={s.key} delay={(i % 4) * 60}>
                <Link
                  href={`/tours?type=special&style=${s.key}`}
                  className="group flex h-full items-center justify-between gap-3 rounded-2xl border border-black/5 bg-white px-4 py-3.5 text-sm font-medium text-ink transition hover:-translate-y-0.5 hover:border-gold hover:shadow-lg"
                >
                  {s.label}
                  <ArrowRight className="h-4 w-4 shrink-0 text-gold-dark transition group-hover:translate-x-0.5" aria-hidden="true" />
                </Link>
              </Reveal>
            ))}
          </ul>
          <div className="mt-10 text-center">
            <Link href="/tours?type=special" className="inline-flex items-center gap-2 rounded-full bg-ink px-7 py-3.5 font-semibold text-white transition hover:bg-gold hover:text-ink">
              See all special packages <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section className="relative overflow-hidden bg-ink py-24 text-white sm:py-32" aria-labelledby="why-title">
        <div className="pointer-events-none absolute -left-40 top-20 h-96 w-96 rounded-full bg-gold/10 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
          <SectionHeading
            dark
            eyebrow="Why PRITIVO"
            title={<span id="why-title">Travel planning, the way it should feel</span>}
            description="Simple, personal and transparent — so you can spend less time arranging and more time looking forward to the trip."
          />
          <ul className="mt-16 grid gap-px overflow-hidden rounded-3xl border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-3">
            {WHY.map((w, i) => (
              <Reveal as="li" key={w.title} delay={(i % 3) * 90} className="bg-ink p-8 transition hover:bg-ink-2 sm:p-10">
                <w.icon className="h-9 w-9 text-gold" strokeWidth={1.4} aria-hidden="true" />
                <h3 className="mt-6 font-serif text-2xl">{w.title}</h3>
                <p className="mt-3 text-sm leading-7 text-white/65">{w.text}</p>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* TESTIMONIALS — honest, no invented reviews */}
      <section className="bg-sand py-24 sm:py-32" aria-labelledby="stories-title">
        <div className="mx-auto max-w-5xl px-5 text-center sm:px-8">
          <MessageSquareQuote className="mx-auto h-12 w-12 text-gold" strokeWidth={1.3} aria-hidden="true" />
          <p className="eyebrow mt-6 text-gold-dark">Traveller stories</p>
          <h2 id="stories-title" className="mt-4 font-serif text-4xl font-medium sm:text-5xl">
            Our first chapters are being written
          </h2>
          <p className="mx-auto mt-6 max-w-2xl leading-8 text-neutral-600">
            PRITIVO is newly launched in Belagavi. Rather than display stock testimonials, we&apos;ll share genuine reviews
            from real travellers here after their journeys. Travel with us and your story could be the first.
          </p>
          <div className="mt-12 grid gap-6 text-left md:grid-cols-3">
            {[
              { icon: Sparkles, t: "Real reviews only", d: "Every story published here will come from a verified PRITIVO traveller." },
              { icon: Plane, t: "Share your journey", d: "After your trip, we'll invite you to share honest feedback — good or constructive." },
              { icon: HeartHandshake, t: "Listening first", d: "Your feedback directly shapes how we plan the next traveller's trip." },
            ].map((c, i) => (
              <Reveal key={c.t} delay={i * 100} className="rounded-3xl bg-white p-7">
                <c.icon className="h-7 w-7 text-gold" strokeWidth={1.5} aria-hidden="true" />
                <h3 className="mt-4 font-serif text-xl">{c.t}</h3>
                <p className="mt-2 text-sm leading-6 text-neutral-600">{c.d}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* FLIGHTS + PACKAGES */}
      <section className="bg-sand py-24 sm:py-28" aria-labelledby="flights-title">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 sm:px-8 lg:grid-cols-2">
          <div>
            <SectionHeading
              align="left"
              eyebrow="Flights & packages"
              title={<span id="flights-title">Fares and itineraries, sourced honestly</span>}
              description="Holiday packages are quoted in writing. For flights, our planners source fares after you share your route — we never display invented prices or live-looking fares without an authorised provider."
            />
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/flights" className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3.5 font-semibold text-white transition hover:bg-gold hover:text-ink">
                <Plane className="h-4 w-4" aria-hidden="true" /> Request flight options
              </Link>
              <Link href="/packages" className="inline-flex items-center gap-2 rounded-full border border-ink/20 px-6 py-3.5 font-semibold transition hover:border-ink">
                Browse holiday packages <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
            <ul className="mt-7 grid gap-3 text-sm text-neutral-600 sm:grid-cols-2">
              {["Return & multi-city planning", "Student and group fares", "Visa & document guidance", "Airport transfers arranged"].map((t) => (
                <li key={t} className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden="true" /> {t}</li>
              ))}
            </ul>
          </div>
          <ul className="grid gap-4 sm:grid-cols-2">
            {POPULAR.slice(0, 4).map((d) => (
              <li key={d.slug}>
                <Link href={`/packages#${d.slug}`} className="group flex items-center gap-3 overflow-hidden rounded-2xl border border-black/5 bg-white p-3 transition hover:-translate-y-0.5 hover:border-gold hover:shadow-lg">
                  <span className="relative h-16 w-20 shrink-0 overflow-hidden rounded-xl">
                    <Image src={d.image} alt={d.imageAlt} fill sizes="80px" className="object-cover transition duration-700 group-hover:scale-105" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-serif text-xl text-ink">{d.name}</span>
                    <span className="block text-xs text-neutral-500">{d.region} · request a quote</span>
                  </span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-gold-dark transition group-hover:translate-x-0.5" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <HomeSections dealTours={dealTours} />

      {/* CTA */}
      <section className="relative overflow-hidden bg-ink py-24 text-white">
        <Image src={PACKAGES[8].image} alt="" fill sizes="100vw" className="object-cover opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/80 to-ink/40" />
        <div className="relative mx-auto flex max-w-7xl flex-col items-start justify-between gap-10 px-5 sm:px-8 lg:flex-row lg:items-center">
          <div className="max-w-2xl">
            <p className="eyebrow text-gold">Ready when you are</p>
            <h2 className="mt-4 font-serif text-4xl font-medium leading-tight sm:text-6xl">
              Let&apos;s design a trip that&apos;s <span className="text-gold-gradient italic">unmistakably yours.</span>
            </h2>
          </div>
          <div className="flex w-full flex-col gap-4 sm:w-auto sm:flex-row">
            <Link href="/plan-trip" className="bg-gold-gradient inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 font-semibold text-ink">
              Plan Your Trip <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </Link>
            <a
              href={whatsappLink("Hello PRITIVO! I'd like help planning a trip.")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/40 px-8 py-4 font-semibold transition hover:bg-white hover:text-ink"
            >
              <WhatsAppIcon /> WhatsApp Us
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
