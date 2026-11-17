import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Check, Mail, MapPin, Phone, ShieldCheck, Star } from "lucide-react";
import { BookingPanel } from "@/components/hotels/BookingPanel";
import { ModeBanner } from "@/components/hotels/ModeBanner";
import { HotelSearchForm } from "@/components/hotels/HotelSearchForm";
import { HotelMapPanel } from "@/components/maps/HotelMapPanel";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { getHotelProvider, hotelIntegrationState, validateSearchQuery, defaultQuery } from "@/lib/hotels/provider";
import { formatStayDate, nightsCount } from "@/lib/hotels/format";
import { stripeConfigured } from "@/lib/payments/stripe";
import { placesConfigured } from "@/lib/maps/places";
import { destinationForQuery } from "@/lib/maps/destinations";
import { SITE, mailtoLink, telLink, whatsappLink } from "@/lib/site";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ hotelId: string }> }): Promise<Metadata> {
  const { hotelId } = await params;
  return {
    title: "Hotel details & rooms",
    description: `Check rooms, prices and cancellation terms, then book as a guest with PRITIVO. Reference ${hotelId.slice(0, 20)}.`,
    robots: { index: false, follow: true },
  };
}

export default async function HotelDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ hotelId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { hotelId } = await params;
  const sp = await searchParams;
  const pick = (k: string) => (Array.isArray(sp[k]) ? (sp[k] as string[])[0] : (sp[k] as string | undefined));
  const seed = defaultQuery();

  const { query, errors } = validateSearchQuery({
    destination: pick("destination") ?? seed.destination,
    checkIn: pick("checkIn") ?? seed.checkIn,
    checkOut: pick("checkOut") ?? seed.checkOut,
    guests: pick("guests") ?? seed.guests,
    rooms: pick("rooms") ?? seed.rooms,
  });
  if (Object.keys(errors).length) notFound();

  const provider = getHotelProvider();
  const integration = hotelIntegrationState();
  let hotel = null;
  try {
    hotel = await provider.getHotel(hotelId, query);
  } catch (err) {
    console.error("Hotel detail failed", err);
  }
  if (!hotel) notFound();

  const nights = nightsCount(query.checkIn, query.checkOut);
  const paymentConfigured = stripeConfigured();
  const destinationHit = destinationForQuery(hotel.city) ?? destinationForQuery(query.destination);
  const destinationCentre = destinationHit ? { name: destinationHit.name, lat: destinationHit.lat, lng: destinationHit.lng } : null;

  return (
    <>
      <section className="relative bg-ink pb-16 pt-32 text-white">
        <Image src={hotel.image} alt={hotel.imageAlt} fill priority sizes="100vw" className="object-cover opacity-35" />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/80 via-ink/60 to-ink" />
        <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
          <Link href={`/hotels?destination=${encodeURIComponent(hotel.city)}&checkIn=${query.checkIn}&checkOut=${query.checkOut}&guests=${query.guests}&rooms=${query.rooms}`} className="inline-flex items-center gap-2 text-sm text-white/65 hover:text-gold">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to search
          </Link>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            {hotel.starRating > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-gold">
                <Star className="h-3.5 w-3.5 fill-gold text-gold" aria-hidden="true" /> {hotel.starRating}-star
              </span>
            )}
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs">
              {nights} night{nights === 1 ? "" : "s"} · {query.guests} guest{query.guests > 1 ? "s" : ""}
            </span>
          </div>
          <h1 className="mt-4 font-serif text-4xl font-medium sm:text-6xl">{hotel.name}</h1>
          <p className="mt-2 flex items-center gap-2 text-white">
            <MapPin className="h-4 w-4 text-gold" aria-hidden="true" /> {hotel.area ? `${hotel.area}, ` : ""}{hotel.city}, {hotel.country}
          </p>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-white/65">{hotel.description}</p>
          <p className="mt-4 text-sm text-gold">
            {formatStayDate(query.checkIn)} → {formatStayDate(query.checkOut)}
          </p>
        </div>
      </section>

      <section className="bg-ivory py-12">
        <div className="mx-auto max-w-6xl space-y-8 px-5 sm:px-8">
          <ModeBanner mode={integration.mode} providerName={integration.providerName ?? undefined} compact />

          <div className="grid gap-8 lg:grid-cols-12">
            <div className="space-y-8 lg:col-span-7">
              <div className="rounded-3xl border border-black/5 bg-white p-6 sm:p-7">
                <h2 className="font-serif text-2xl">About this stay</h2>
                <p className="mt-3 text-sm leading-7 text-neutral-600">{hotel.description}</p>
                <h3 className="mt-6 text-sm font-semibold uppercase tracking-wider text-neutral-500">Amenities</h3>
                <ul className="mt-3 grid grid-cols-2 gap-2 text-sm text-neutral-600">
                  {hotel.amenities.map((a) => (
                    <li key={a} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden="true" /> {a}
                    </li>
                  ))}
                </ul>
              </div>

              <HotelMapPanel
                hotelName={hotel.name}
                hotelArea={hotel.area}
                hotelCity={hotel.city}
                location={hotel.location}
                destinationCentre={destinationCentre}
                nearbyAvailable={placesConfigured()}
              />

              <div className="rounded-3xl border border-black/5 bg-white p-6 sm:p-7">
                <h2 className="flex items-center gap-2 font-serif text-2xl">
                  <ShieldCheck className="h-5 w-5 text-gold" aria-hidden="true" /> Cancellation &amp; payment
                </h2>
                <ul className="mt-3 space-y-2 text-sm leading-6 text-neutral-600">
                  <li>Each room shows its own cancellation terms before you continue.</li>
                  <li>Availability and the total price are re-checked on our server before payment.</li>
                  <li>
                    {integration.mode === "demo"
                      ? "Demo mode: no payment is collected and no reservation is created."
                      : paymentConfigured
                        ? "Payment is handled securely by Stripe; card details never touch PRITIVO servers."
                        : "Online payment is not enabled yet — send a request and we'll share a secure payment link."}
                  </li>
                  <li>A booking is confirmed only after our hotel provider confirms it. If the hotel cannot confirm after payment, a refund is started automatically.</li>
                </ul>
              </div>

              <div className="rounded-3xl border border-black/5 bg-white p-6 sm:p-7">
                <h2 className="font-serif text-2xl">Change your dates</h2>
                <div className="mt-4">
                  <HotelSearchForm initial={{ ...query, destination: hotel.city }} />
                </div>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="lg:sticky lg:top-24">
                <BookingPanel hotel={hotel} query={query} mode={integration.mode} paymentConfigured={paymentConfigured && integration.mode === "live"} />
                <div className="mt-4 rounded-3xl border border-black/5 bg-white p-5">
                  <p className="text-sm font-medium text-ink">Questions about this hotel?</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <a href={whatsappLink(`Hello PRITIVO! I have a question about ${hotel.name} in ${hotel.city} (${formatStayDate(query.checkIn)} – ${formatStayDate(query.checkOut)}).`)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-2 text-xs font-semibold text-white">
                      <WhatsAppIcon className="h-3.5 w-3.5" /> WhatsApp
                    </a>
                    <a href={telLink} className="inline-flex items-center gap-2 rounded-full border border-neutral-200 px-4 py-2 text-xs font-medium">
                      <Phone className="h-3.5 w-3.5" aria-hidden="true" /> {SITE.phoneDisplay}
                    </a>
                    <a href={mailtoLink(`Hotel question — ${hotel.name}`)} className="inline-flex items-center gap-2 rounded-full border border-neutral-200 px-4 py-2 text-xs font-medium">
                      <Mail className="h-3.5 w-3.5" aria-hidden="true" /> Email
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
