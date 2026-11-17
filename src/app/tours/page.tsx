import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Compass, Mail, MapPin, SearchX, Sparkles, Star } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { Reveal } from "@/components/Reveal";
import { TourCard } from "@/components/tours/TourCard";
import { TourFilters, EMPTY_FILTERS, type ActiveFilters } from "@/components/tours/TourFilters";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { listTours, tourFacets } from "@/lib/tours/service";
import { STYLE_LABELS, TOUR_TYPE_LABELS, type TourType } from "@/lib/tours/constants";
import { HERO_IMAGE } from "@/lib/packages";
import { SITE, mailtoLink, whatsappLink } from "@/lib/site";

export const metadata: Metadata = {
  title: "Tours & Holiday Packages — Domestic, International & Special Collections",
  description:
    "Browse PRITIVO's global tour collection: Darjeeling, Kashmir, Ladakh, Goa, Kerala and more across India, plus Switzerland, Japan, Iceland, Greece, Maldives, USA, Canada and beyond. Every price is quoted in writing.",
  alternates: { canonical: "/tours" },
};

export const dynamic = "force-dynamic";

const TYPE_TABS: { key: TourType | "all"; label: string; blurb: string }[] = [
  { key: "all", label: "All tours", blurb: "Every destination in the collection" },
  { key: "domestic", label: "Domestic", blurb: "Journeys across India" },
  { key: "international", label: "International", blurb: "Worldwide holidays" },
  { key: "special", label: "Special packages", blurb: "Honeymoon, luxury, safari & more" },
];

export default async function ToursPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const pick = (k: string) => (Array.isArray(sp[k]) ? (sp[k] as string[])[0] : ((sp[k] as string | undefined) ?? ""));
  const requestedType = pick("type");
  const filters: ActiveFilters = {
    q: pick("q").slice(0, 80),
    type: (Object.keys(TOUR_TYPE_LABELS) as string[]).includes(requestedType) ? (requestedType as TourType) : "all",
    country: pick("country").slice(0, 80),
    continent: pick("continent").slice(0, 80),
    style: pick("style").slice(0, 40),
    duration: pick("duration").slice(0, 20),
    budget: pick("budget").slice(0, 20),
  };

  let results: Awaited<ReturnType<typeof listTours>> = [];
  let facets = { countries: [] as string[], continents: [] as string[], totals: {} as Record<string, number>, total: 0 };
  let catalogueError = "";
  try {
    [results, facets] = await Promise.all([listTours(filters), tourFacets()]);
  } catch (err) {
    // Never render invented tours: report the outage honestly and offer support.
    console.error("Tour catalogue unavailable", err instanceof Error ? err.message : "");
    catalogueError =
      "The tour catalogue is temporarily unavailable (database connection problem). Nothing has been booked or charged. Please reload in a moment, or message us on WhatsApp and we'll plan your trip personally.";
  }
  const activeTab = TYPE_TABS.find((t) => t.key === filters.type) ?? TYPE_TABS[0];
  const href = (patch: Record<string, string>) => {
    const params = new URLSearchParams();
    Object.entries({ ...filters, type: filters.type === "all" ? "" : filters.type, ...patch }).forEach(([k, v]) => {
      if (v && v !== "all") params.set(k, v);
    });
    return `/tours${params.toString() ? `?${params}` : ""}#results`;
  };

  return (
    <>
      <PageHero
        eyebrow="Global tour collection"
        title={<>The world, <span className="text-gold-gradient italic">thoughtfully planned.</span></>}
        description="Domestic escapes, international journeys and special collections — every itinerary is tailored and quoted in writing by a PRITIVO planner."
        image={HERO_IMAGE}
        imageAlt="Mountain lake at sunrise"
      >
        <div className="flex flex-wrap items-center justify-center gap-2">
          {(Object.keys(TOUR_TYPE_LABELS) as TourType[]).map((t) => (
            <Link
              key={t}
              href={href({ type: t })}
              className="rounded-full border border-white/35 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition hover:bg-white hover:text-ink"
            >
              {TOUR_TYPE_LABELS[t]} <span className="text-xs text-white/65">{facets.totals[t] ?? 0}</span>
            </Link>
          ))}
        </div>
      </PageHero>

      <section className="bg-ivory pb-24 pt-10" id="results">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="flex flex-wrap items-center gap-2" role="tablist" aria-label="Tour collections">
            {TYPE_TABS.map((tab) => (
              <Link
                key={tab.key}
                href={href({ type: tab.key })}
                role="tab"
                aria-selected={filters.type === tab.key}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                  filters.type === tab.key ? "border-ink bg-ink text-white" : "border-neutral-200 bg-white text-neutral-600 hover:border-gold"
                }`}
              >
                {tab.label}
              </Link>
            ))}
            <span className="ml-auto text-xs text-neutral-500">{activeTab.blurb}</span>
          </div>

          {catalogueError && (
            <div role="alert" className="mt-6 flex flex-col items-start gap-4 rounded-3xl border border-red-200 bg-red-50 p-6 sm:flex-row sm:items-center">
              <p className="flex-1 text-sm leading-6 text-red-800">{catalogueError}</p>
              <a
                href={whatsappLink("Hello PRITIVO! Your tours page showed an error — can you help me plan a trip?")}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[#25D366] px-5 py-2.5 text-sm font-semibold text-white"
              >
                <WhatsAppIcon className="h-4 w-4" /> WhatsApp us
              </a>
            </div>
          )}

          <div className="mt-5">
            <TourFilters value={filters} countries={facets.countries} continents={facets.continents} total={facets.total} shown={results.length} />
          </div>

          {/* Special packages strip */}
          <div className="mt-8 rounded-3xl border border-gold/30 bg-champagne/30 p-5 sm:p-6">
            <p className="flex items-center gap-2 text-sm font-semibold text-ink">
              <Sparkles className="h-4 w-4 text-gold-dark" aria-hidden="true" /> Special packages by travel style
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {Object.entries(STYLE_LABELS).map(([key, label]) => (
                <Link
                  key={key}
                  href={href({ style: filters.style === key ? "" : key, type: "special" })}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                    filters.style === key ? "border-ink bg-ink text-white" : "border-neutral-300 bg-white text-neutral-600 hover:border-gold"
                  }`}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {catalogueError ? null : results.length > 0 ? (
            <ul className="mt-8 grid gap-7 sm:grid-cols-2 xl:grid-cols-3">
              {results.map((tour, i) => (
                <Reveal as="li" key={tour.slug} delay={(i % 3) * 80}>
                  <TourCard tour={tour} priority={i < 3} />
                </Reveal>
              ))}
            </ul>
          ) : (
            <div className="mt-8 flex flex-col items-center rounded-3xl border border-dashed border-neutral-300 bg-white px-6 py-16 text-center">
              <SearchX className="h-12 w-12 text-gold" aria-hidden="true" />
              <h2 className="mt-4 font-serif text-3xl">No tours match those filters</h2>
              <p className="mt-3 max-w-md text-sm leading-6 text-neutral-600">
                We plan custom trips to many more places than we list. Clear the filters, or tell us your destination and
                dates and we&apos;ll build the itinerary.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Link href="/tours" className="rounded-full border border-neutral-300 px-5 py-2.5 text-sm font-medium hover:border-ink">Clear filters</Link>
                <Link href="/plan-trip" className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white hover:bg-gold hover:text-ink">Plan a custom trip</Link>
              </div>
            </div>
          )}

          <div className="mt-14 grid gap-6 rounded-3xl bg-ink p-8 text-white sm:p-10 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="eyebrow text-gold">Not sure which tour fits?</p>
              <h2 className="mt-3 font-serif text-3xl sm:text-4xl">Tell us the trip you imagine. We&apos;ll shape it.</h2>
              <p className="mt-3 text-sm leading-6 text-white/65">
                Share your dates, travellers, budget and the kind of holiday you want. A Belagavi-based planner replies
                with a tailored itinerary and a transparent written quote.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
              <a href={whatsappLink("Hello PRITIVO! I'd like help choosing a tour.")} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-3.5 text-sm font-semibold text-white">
                <WhatsAppIcon className="h-4 w-4" /> WhatsApp {SITE.phoneDisplay}
              </a>
              <a href={mailtoLink("Tour enquiry")} className="inline-flex items-center justify-center gap-2 rounded-full border border-white/30 px-6 py-3.5 text-sm font-semibold hover:bg-white hover:text-ink">
                <Mail className="h-4 w-4" aria-hidden="true" /> {SITE.email}
              </a>
            </div>
          </div>

          <p className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-center text-xs text-neutral-500">
            <span className="inline-flex items-center gap-1.5"><Star className="h-3.5 w-3.5 text-gold" aria-hidden="true" /> Unverified prices always show “Request a Quote”</span>
            <span className="inline-flex items-center gap-1.5"><Compass className="h-3.5 w-3.5 text-gold" aria-hidden="true" /> {facets.total} tours across {facets.countries.length} countries</span>
            <span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-gold" aria-hidden="true" /> Planning from {SITE.location}</span>
          </p>
        </div>
      </section>
    </>
  );
}
