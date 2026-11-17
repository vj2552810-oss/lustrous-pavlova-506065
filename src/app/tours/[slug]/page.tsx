import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  Clock,
  Compass,
  ExternalLink,
  Info,
  Mail,
  MapPin,
  MessageSquareQuote,
  Phone,
  Sparkles,
  X,
} from "lucide-react";
import { getTourBySlug, relatedTours, type TourRecord } from "@/lib/tours/service";
import { STYLE_LABELS, TOUR_TYPE_LABELS, type TravelStyle, type TourType } from "@/lib/tours/constants";
import { TourEnquiryForm } from "@/components/tours/TourEnquiryForm";
import { TourPrice } from "@/components/tours/TourCard";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { SITE, mailtoLink, telLink, whatsappLink } from "@/lib/site";

export const dynamic = "force-dynamic";

function TourUnavailable({ slug }: { slug: string }) {
  return (
    <section className="flex min-h-[70vh] items-center bg-ivory px-5 pt-28">
      <div className="mx-auto max-w-lg rounded-3xl border border-black/5 bg-white p-8 text-center">
        <p className="eyebrow text-gold-dark">Temporarily unavailable</p>
        <h1 className="mt-3 font-serif text-3xl">We can&apos;t load this tour right now</h1>
        <p className="mt-3 text-sm leading-6 text-neutral-600">
          The tour catalogue could not be reached (a database connection problem), so we won&apos;t guess at an itinerary
          or a price. Please reload in a moment, or message us and we&apos;ll plan it personally.
        </p>
        <p className="mt-2 font-mono text-xs text-neutral-500">requested: /tours/{slug}</p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <a
            href={whatsappLink("Hello PRITIVO! A tour page wouldn't load — can you help?")}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 py-3 text-sm font-semibold text-white"
          >
            <WhatsAppIcon className="h-4 w-4" /> WhatsApp {SITE.phoneDisplay}
          </a>
          <Link href="/tours" className="rounded-full border border-neutral-300 px-5 py-3 text-sm font-semibold hover:border-ink">
            All tours
          </Link>
        </div>
      </div>
    </section>
  );
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const tour = await getTourBySlug(slug).catch(() => null);
  if (!tour) return { title: "Tour not found" };
  const title = `${tour.name} Tour Package — ${tour.durationDays} Days`;
  const description = `${tour.summary} ${tour.durationDays}D/${tour.durationNights}N ${tour.type === "domestic" ? "India" : "international"} tour planned by PRITIVO, Belagavi. Request a quote.`;
  return {
    title,
    description,
    alternates: { canonical: `/tours/${tour.slug}` },
    openGraph: { title, description, images: [{ url: tour.heroImage }], type: "article" },
  };
}

export default async function TourDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  let tour: TourRecord | null = null;
  let lookupFailed = false;
  try {
    tour = await getTourBySlug(slug);
  } catch (err) {
    console.error("Tour lookup failed", err instanceof Error ? err.message : "");
    lookupFailed = true;
  }

  if (!tour) {
    if (lookupFailed) return <TourUnavailable slug={slug} />;
    notFound();
  }

  const related = await relatedTours(tour, 3).catch(() => []);
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(tour.city || tour.country)}`;
  const waMessage = `Hello PRITIVO! I'd like a quote for the ${tour.name} tour (${tour.durationDays}D/${tour.durationNights}N).`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    name: `${tour.name} tour — PRITIVO`,
    description: tour.summary,
    touristType: tour.styles.map((s) => STYLE_LABELS[s as TravelStyle] ?? s),
    itinerary: {
      "@type": "ItemList",
      itemListElement: tour.itinerary.map((d) => ({ "@type": "ListItem", position: d.day, name: d.title })),
    },
    ...(tour.priceVerified && tour.priceFromINR
      ? { offers: { "@type": "Offer", price: tour.priceFromINR, priceCurrency: "INR", availability: "https://schema.org/InStock" } }
      : {}),
    provider: { "@type": "TravelAgency", name: "PRITIVO", telephone: SITE.phoneE164, email: SITE.email },
  };

  return (
    <>
      {/* HERO */}
      <section className="relative isolate overflow-hidden bg-ink pb-14 pt-32 text-white sm:pt-36">
        <Image src={tour.heroImage} alt={tour.heroImageAlt || `${tour.name} tour`} fill priority sizes="100vw" className="object-cover opacity-45" />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/85 via-ink/65 to-ink" />
        <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
          <nav aria-label="Breadcrumb" className="text-xs text-white/65">
            <ol className="flex flex-wrap items-center gap-2">
              <li><Link href="/" className="hover:text-gold">Home</Link></li>
              <li aria-hidden="true">/</li>
              <li><Link href="/tours" className="hover:text-gold">Tours</Link></li>
              <li aria-hidden="true">/</li>
              <li><Link href={`/tours?type=${tour.type}`} className="hover:text-gold">{TOUR_TYPE_LABELS[tour.type as TourType]}</Link></li>
              <li aria-hidden="true">/</li>
              <li className="text-white">{tour.name}</li>
            </ol>
          </nav>

          <div className="mt-6 flex flex-wrap gap-2">
            <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-gold backdrop-blur">
              {TOUR_TYPE_LABELS[tour.type as TourType]}
            </span>
            {tour.styles.slice(0, 3).map((s) => (
              <Link key={s} href={`/tours?style=${s}`} className="rounded-full bg-white/10 px-3 py-1 text-xs text-white backdrop-blur hover:text-gold">
                {STYLE_LABELS[s as TravelStyle] ?? s}
              </Link>
            ))}
          </div>

          <h1 className="mt-4 max-w-3xl font-serif text-4xl font-medium leading-[1.08] sm:text-6xl">{tour.name}</h1>
          <p className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-white">
            <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4 text-gold" aria-hidden="true" /> {tour.city ? `${tour.city} · ` : ""}{tour.country}</span>
            <span className="inline-flex items-center gap-1.5"><Clock className="h-4 w-4 text-gold" aria-hidden="true" /> {tour.durationDays} days / {tour.durationNights} nights</span>
            {tour.bestTime && <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-4 w-4 text-gold" aria-hidden="true" /> {tour.bestTime}</span>}
          </p>
          <p className="mt-5 max-w-2xl text-base leading-7 text-white">{tour.summary}</p>

          <div className="mt-7 flex flex-wrap gap-3">
            <a href="#enquire" className="bg-gold-gradient inline-flex items-center gap-2 rounded-full px-6 py-3.5 font-semibold text-ink">
              <MessageSquareQuote className="h-4 w-4" aria-hidden="true" /> Request a quote
            </a>
            <a href={whatsappLink(waMessage)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-6 py-3.5 font-semibold text-white">
              <WhatsAppIcon className="h-4 w-4" /> WhatsApp us
            </a>
            <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full border border-white/35 px-6 py-3.5 font-semibold text-white hover:bg-white hover:text-ink">
              <ExternalLink className="h-4 w-4" aria-hidden="true" /> View destination
            </a>
          </div>
        </div>
      </section>

      <section className="bg-ivory py-14">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 sm:px-8 lg:grid-cols-12">
          {/* MAIN */}
          <div className="space-y-8 lg:col-span-8">
            <div className="rounded-3xl border border-black/5 bg-white p-6 sm:p-8">
              <h2 className="font-serif text-2xl sm:text-3xl">About this journey</h2>
              <p className="mt-3 leading-7 text-neutral-600">{tour.description}</p>

              <h3 className="mt-7 flex items-center gap-2 font-serif text-2xl">
                <Sparkles className="h-5 w-5 text-gold" aria-hidden="true" /> Highlights
              </h3>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {tour.highlights.map((h) => (
                  <li key={h} className="flex items-start gap-2 rounded-2xl bg-ivory/70 px-4 py-2.5 text-sm text-neutral-600">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden="true" /> {h}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-3xl border border-black/5 bg-white p-6 sm:p-8">
              <h2 className="font-serif text-3xl">Suggested itinerary</h2>
              <p className="mt-1 text-sm text-neutral-500">
                A {tour.durationDays}-day outline. Final day-by-day timings are adjusted to your dates and confirmed in
                your written quotation.
              </p>
              <ol className="mt-6 space-y-0">
                {tour.itinerary.map((day, i) => (
                  <li key={day.day} className="relative flex gap-4 pb-6 last:pb-0">
                    {i < tour.itinerary.length - 1 && <span className="absolute left-[1.15rem] top-10 h-full w-px bg-neutral-200" aria-hidden="true" />}
                    <span className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink text-xs font-bold text-gold">
                      {day.day}
                    </span>
                    <div className="min-w-0 pt-1">
                      <h3 className="font-medium text-ink">{day.title}</h3>
                      <p className="mt-1 text-sm leading-6 text-neutral-600">{day.description}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="rounded-3xl border border-black/5 bg-white p-6">
                <h2 className="flex items-center gap-2 font-serif text-xl">
                  <Check className="h-5 w-5 text-emerald-600" aria-hidden="true" /> Inclusions
                </h2>
                <ul className="mt-3 space-y-2 text-sm leading-6 text-neutral-600">
                  {tour.inclusions.map((i) => (
                    <li key={i} className="flex items-start gap-2"><Check className="mt-1 h-3.5 w-3.5 shrink-0 text-emerald-600" aria-hidden="true" /> {i}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-3xl border border-black/5 bg-white p-6">
                <h2 className="flex items-center gap-2 font-serif text-xl">
                  <X className="h-5 w-5 text-red-500" aria-hidden="true" /> Exclusions
                </h2>
                <ul className="mt-3 space-y-2 text-sm leading-6 text-neutral-600">
                  {tour.exclusions.map((i) => (
                    <li key={i} className="flex items-start gap-2"><X className="mt-1 h-3.5 w-3.5 shrink-0 text-red-400" aria-hidden="true" /> {i}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="rounded-3xl border border-gold/30 bg-champagne/30 p-6 sm:p-8">
              <h2 className="flex items-center gap-2 font-serif text-2xl">
                <Info className="h-5 w-5 text-gold-dark" aria-hidden="true" /> Travel tips
              </h2>
              <ul className="mt-3 space-y-2.5 text-sm leading-6 text-neutral-600">
                {tour.travelTips.map((t) => (
                  <li key={t} className="flex items-start gap-2"><Compass className="mt-1 h-4 w-4 shrink-0 text-gold-dark" aria-hidden="true" /> {t}</li>
                ))}
              </ul>
            </div>

            {related.length > 0 && (
              <div className="rounded-3xl border border-black/5 bg-white p-6 sm:p-8">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="font-serif text-2xl">Similar journeys</h2>
                  <Link href="/tours" className="inline-flex items-center gap-1.5 text-sm font-medium text-gold-dark hover:underline">
                    All tours <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </div>
                <ul className="mt-4 grid gap-4 sm:grid-cols-3">
                  {related.map((r) => (
                    <li key={r.slug}>
                      <Link href={`/tours/${r.slug}`} className="group block overflow-hidden rounded-2xl border border-neutral-100">
                        <span className="relative block h-28 overflow-hidden">
                          <Image src={r.heroImage} alt={r.heroImageAlt} fill sizes="240px" className="object-cover transition group-hover:scale-105" />
                          <span className="absolute inset-0 bg-gradient-to-t from-ink/80 to-transparent" />
                          <span className="absolute inset-x-3 bottom-2 font-serif text-xl text-white">{r.name}</span>
                        </span>
                        <span className="flex items-center justify-between px-3 py-2 text-xs text-neutral-500">
                          {r.durationDays}D / {r.durationNights}N <ArrowRight className="h-3.5 w-3.5 text-gold-dark" aria-hidden="true" />
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* SIDEBAR */}
          <aside className="lg:col-span-4">
            <div className="space-y-4 lg:sticky lg:top-24">
              <div className="rounded-3xl border border-black/5 bg-white p-6">
                <TourPrice tour={tour} />
                <p className="mt-3 flex items-start gap-2 rounded-2xl bg-ivory px-3 py-2.5 text-xs leading-5 text-neutral-600">
                  <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold-dark" aria-hidden="true" />
                  {tour.priceVerified && tour.priceFromINR
                    ? "Indicative starting price per person. Final pricing depends on dates, hotel category and group size, and is confirmed in writing."
                    : "No verified price is published for this tour yet, so we quote it individually. Nothing is charged until you approve the written quote."}
                </p>
                <dl className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between gap-3"><dt className="text-neutral-500">Duration</dt><dd className="font-medium text-ink">{tour.durationDays}D / {tour.durationNights}N</dd></div>
                  <div className="flex justify-between gap-3"><dt className="text-neutral-500">Destination</dt><dd className="text-right font-medium text-ink">{tour.city || tour.country}</dd></div>
                  <div className="flex justify-between gap-3"><dt className="text-neutral-500">Best time</dt><dd className="text-right font-medium text-ink">{tour.bestTime || "Year-round"}</dd></div>
                  <div className="flex justify-between gap-3"><dt className="text-neutral-500">Style</dt><dd className="text-right font-medium text-ink">{tour.styles.map((s) => STYLE_LABELS[s as TravelStyle] ?? s).slice(0, 2).join(", ")}</dd></div>
                </dl>
                <div className="mt-4 grid gap-2">
                  <a href={whatsappLink(waMessage)} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-sm font-semibold text-white">
                    <WhatsAppIcon className="h-4 w-4" /> {SITE.phoneDisplay}
                  </a>
                  <a href={mailtoLink(`Quotation request — ${tour.name}`, waMessage)} className="flex items-center justify-center gap-2 rounded-full border border-neutral-200 px-4 py-2.5 text-xs font-medium hover:border-gold">
                    <Mail className="h-3.5 w-3.5" aria-hidden="true" /> {SITE.email}
                  </a>
                  <a href={telLink} className="flex items-center justify-center gap-2 rounded-full border border-neutral-200 px-4 py-2.5 text-xs font-medium hover:border-gold">
                    <Phone className="h-3.5 w-3.5" aria-hidden="true" /> Call a planner
                  </a>
                </div>
              </div>

              <div id="enquire" className="scroll-mt-28">
                <TourEnquiryForm tourName={tour.name} tourSlug={tour.slug} />
              </div>

              <div className="rounded-3xl bg-ink p-6 text-white">
                <h2 className="font-serif text-xl">Prefer to explore first?</h2>
                <p className="mt-2 text-sm text-white/65">See hotel availability for this destination, or browse the map explorer.</p>
                <div className="mt-4 grid gap-2">
                  <Link href={`/hotels?destination=${encodeURIComponent(tour.city || tour.country)}&checkIn=${new Date(Date.now() + 7 * 864e5).toISOString().slice(0, 10)}&checkOut=${new Date(Date.now() + 10 * 864e5).toISOString().slice(0, 10)}&guests=2&rooms=1`} className="flex items-center justify-between gap-2 rounded-full bg-white/10 px-4 py-2.5 text-sm hover:bg-white hover:text-ink">
                    Check hotels <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                  <Link href="/explore" className="flex items-center justify-between gap-2 rounded-full bg-white/10 px-4 py-2.5 text-sm hover:bg-white hover:text-ink">
                    Explore on the map <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </div>
              </div>

              <Link href="/tours" className="inline-flex items-center gap-2 text-sm font-medium text-gold-dark hover:underline">
                <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to all tours
              </Link>
            </div>
          </aside>
        </div>
      </section>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
}
