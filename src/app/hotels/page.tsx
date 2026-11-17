import type { Metadata } from "next";
import Link from "next/link";
import { BedDouble, Compass, Mail, Phone } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { HotelSearchForm } from "@/components/hotels/HotelSearchForm";
import { ResultsView } from "@/components/hotels/ResultsView";
import { ModeBanner } from "@/components/hotels/ModeBanner";
import { HotelEnquiryForm } from "@/components/hotels/HotelEnquiryForm";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { defaultQuery, getHotelProvider, hotelIntegrationState, validateSearchQuery } from "@/lib/hotels/provider";
import { formatStayDate, nightsCount } from "@/lib/hotels/format";
import { SITE, mailtoLink, telLink, whatsappLink } from "@/lib/site";
import type { SearchResponse } from "@/lib/hotels/types";
import { destinationForQuery } from "@/lib/maps/destinations";

export const metadata: Metadata = {
  title: "Hotel Booking — Search Stays in Belagavi, Goa, Coorg & Beyond",
  description:
    "Search hotels by dates, guests and rooms with PRITIVO. Book as a guest with no account needed, then retrieve your booking with a reference. Live availability via our hotel partner; demo mode is clearly labelled until live booking is enabled.",
  alternates: { canonical: "/hotels" },
};

export const dynamic = "force-dynamic";

export default async function HotelsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const pick = (k: string) => (Array.isArray(sp[k]) ? (sp[k] as string[])[0] : (sp[k] as string | undefined));
  const hasQuery = Boolean(pick("destination") || pick("checkIn"));
  const seed = defaultQuery();
  const { query, errors } = validateSearchQuery({
    destination: pick("destination") ?? seed.destination,
    checkIn: pick("checkIn") ?? seed.checkIn,
    checkOut: pick("checkOut") ?? seed.checkOut,
    guests: pick("guests") ?? seed.guests,
    rooms: pick("rooms") ?? seed.rooms,
  });

  const integration = hotelIntegrationState();
  const provider = getHotelProvider();

  let result: SearchResponse | null = null;
  let searchError = "";
  if (Object.keys(errors).length === 0) {
    try {
      result = await provider.search(query);
    } catch (err) {
      console.error("Hotel search failed", err);
      searchError = "Our hotel partner isn't responding right now. Please try again, or message us on WhatsApp and we'll check availability for you.";
    }
  }

  const nights = nightsCount(query.checkIn, query.checkOut);

  return (
    <>
      <PageHero
        eyebrow="Hotels · Guest booking"
        title={<>Find your stay, <span className="text-gold-gradient italic">no account needed.</span></>}
        description="Search by destination and dates, review room types and cancellation terms, and book as a guest."
      >
        <div className="mx-auto max-w-4xl text-left">
          <HotelSearchForm initial={query} variant="hero" />
        </div>
      </PageHero>

      <section className="bg-ivory pb-24 pt-10">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <ModeBanner mode={integration.mode} providerName={integration.providerName ?? undefined} />

          {Object.keys(errors).length > 0 && (
            <div role="alert" className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              Please check your search details: {Object.values(errors).join(" ")}
            </div>
          )}
          {searchError && (
            <div role="alert" className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {searchError}
            </div>
          )}

          {result && (
            <>
              <div className="mt-8 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h2 className="font-serif text-3xl sm:text-4xl">
                    {result.hotels.length > 0
                      ? `${result.hotels.length} stay${result.hotels.length === 1 ? "" : "s"} in ${query.destination}`
                      : `No stays found in ${query.destination}`}
                  </h2>
                  <p className="mt-1 text-sm text-neutral-500">
                    {formatStayDate(query.checkIn)} → {formatStayDate(query.checkOut)} · {nights} night{nights === 1 ? "" : "s"} ·{" "}
                    {query.guests} guest{query.guests > 1 ? "s" : ""} · {query.rooms} room{query.rooms > 1 ? "s" : ""}
                  </p>
                </div>
                <p className="text-xs text-neutral-500">Updated {new Date(result.generatedAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</p>
              </div>

              {result.hotels.length > 0 ? (
                <ResultsView
                  hotels={result.hotels}
                  query={query}
                  destinationCentre={(() => {
                    const d = destinationForQuery(query.destination);
                    return d ? { name: d.name, lat: d.lat, lng: d.lng } : null;
                  })()}
                />
              ) : (
                <div className="mt-6 flex flex-col items-center rounded-3xl border border-dashed border-neutral-300 bg-white px-6 py-16 text-center">
                  <Compass className="h-12 w-12 text-gold" aria-hidden="true" />
                  <h3 className="mt-4 font-serif text-3xl">Nothing matched that search</h3>
                  <p className="mt-3 max-w-md text-sm leading-6 text-neutral-600">
                    {integration.mode === "demo"
                      ? "Demo inventory covers Belagavi, Goa, Coorg, Kerala, Mumbai and Manali. Try one of those cities — or send us a booking enquiry and we'll find a real hotel for you."
                      : "Try nearby dates, fewer rooms, or a wider destination. Our team can also source options not listed online."}
                  </p>
                  <div className="mt-6 flex flex-wrap justify-center gap-3">
                    <Link href="/hotels" className="rounded-full border border-neutral-300 px-5 py-2.5 text-sm font-medium hover:border-ink">
                      Start a new search
                    </Link>
                    <a href={whatsappLink(`Hello PRITIVO! I'm looking for a hotel in ${query.destination} from ${formatStayDate(query.checkIn)}.`)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-2.5 text-sm font-semibold text-white">
                      <WhatsAppIcon className="h-4 w-4" /> Check with us
                    </a>
                  </div>
                </div>
              )}
            </>
          )}

          <div className="mt-16 grid gap-8 lg:grid-cols-2">
            <HotelEnquiryForm defaultDestination={query.destination} />
            <div className="space-y-4">
              <div className="rounded-3xl bg-ink p-7 text-white">
                <BedDouble className="h-7 w-7 text-gold" aria-hidden="true" />
                <h2 className="mt-4 font-serif text-3xl">Prefer to book with a human?</h2>
                <p className="mt-2 text-sm leading-6 text-white/65">
                  Send us your dates and we&apos;ll confirm live availability, room options and cancellation terms with our
                  hotel partners — usually over WhatsApp.
                </p>
                <div className="mt-5 space-y-3">
                  <a href={whatsappLink("Hello PRITIVO! I'd like help with a hotel booking.")} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 py-3 text-sm font-semibold text-white">
                    <WhatsAppIcon className="h-4 w-4" /> WhatsApp {SITE.phoneDisplay}
                  </a>
                  <a href={telLink} className="flex items-center justify-center gap-2 rounded-full border border-white/25 px-5 py-3 text-sm font-semibold hover:bg-white hover:text-ink">
                    <Phone className="h-4 w-4" aria-hidden="true" /> Call us
                  </a>
                  <a href={mailtoLink("Hotel booking enquiry")} className="flex items-center justify-center gap-2 rounded-full border border-white/25 px-5 py-3 text-sm font-semibold hover:bg-white hover:text-ink">
                    <Mail className="h-4 w-4" aria-hidden="true" /> {SITE.email}
                  </a>
                </div>
              </div>
              <div className="rounded-3xl border border-black/5 bg-white p-7">
                <h2 className="font-serif text-2xl">Already booked?</h2>
                <p className="mt-2 text-sm leading-6 text-neutral-600">Retrieve your booking details with your reference and the email or phone used.</p>
                <Link href="/my-booking" className="mt-4 inline-flex rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white hover:bg-gold hover:text-ink">
                  Find my booking
                </Link>
              </div>
            </div>
          </div>

          {hasQuery && (
            <p className="mt-10 text-center text-xs leading-5 text-neutral-500">
              Prices and cancellation terms shown are for the selected dates. Final availability and price are re-checked
              before any payment, and a booking is confirmed only once the hotel provider confirms it.
            </p>
          )}
        </div>
      </section>
    </>
  );
}
