import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CalendarDays, Check, Clock, Compass, ExternalLink, Info, MapPin, MessageSquareQuote, X } from "lucide-react";
import { AdvancedEnquiryForm } from "@/components/AdvancedEnquiryForm";
import { TourCard } from "@/components/tours/TourCard";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { DESTINATION_GUIDES, findDestinationGuide } from "@/lib/destinations";
import { listTours } from "@/lib/tours/service";
import { formatINR } from "@/lib/packages";
import { SITE, mailtoLink, telLink, whatsappLink } from "@/lib/site";

export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  return DESTINATION_GUIDES.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const d = findDestinationGuide(slug);
  if (!d) return { title: "Destination not found" };
  const title = `${d.name} Tour Packages — Best Time, Attractions & Budget`;
  return {
    title,
    description: `${d.name} travel guide from PRITIVO: ${d.overview.slice(0, 140)}… Best time ${d.bestTime.split(";")[0]}. Request a written quote.`,
    alternates: { canonical: `/destinations/${d.slug}` },
    openGraph: { title, description: d.overview.slice(0, 160), images: [{ url: d.image }] },
  };
}

export default async function DestinationPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const destination = findDestinationGuide(slug);
  if (!destination) notFound();

  const all = await listTours({}).catch(() => []);
  const keys = destination.tourMatches.map((k) => k.toLowerCase());
  const matching = all.filter((t) => {
    const hay = `${t.slug} ${t.name} ${t.city} ${t.country}`.toLowerCase();
    return keys.some((k) => hay.includes(k));
  });

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${destination.name}, ${destination.country}`)}`;
  const waMsg = `Hello PRITIVO! I'd like to plan a trip to ${destination.name}.`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TouristDestination",
    name: destination.name,
    description: destination.overview,
    touristType: destination.region === "Domestic" ? "Domestic travel" : "International travel",
    includesAttraction: destination.attractions.map((a) => ({ "@type": "TouristAttraction", name: a })),
    provider: { "@type": "TravelAgency", name: "PRITIVO", telephone: SITE.phoneE164, email: SITE.email },
  };

  return (
    <>
      <section className="relative isolate overflow-hidden bg-ink pb-16 pt-32 text-white">
        <Image src={destination.image} alt={destination.imageAlt} fill priority sizes="100vw" className="object-cover opacity-45" />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/85 via-ink/60 to-ink" />
        <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
          <nav aria-label="Breadcrumb" className="text-xs text-white/65">
            <ol className="flex flex-wrap items-center gap-2">
              <li><Link href="/" className="hover:text-gold">Home</Link></li><li aria-hidden="true">/</li>
              <li><Link href="/destinations" className="hover:text-gold">Destinations</Link></li><li aria-hidden="true">/</li>
              <li className="text-white">{destination.name}</li>
            </ol>
          </nav>
          <p className="eyebrow mt-6 text-gold">{destination.region} · {destination.country}</p>
          <h1 className="mt-3 font-serif text-5xl font-medium sm:text-6xl">{destination.name}</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-white">{destination.overview}</p>
          <p className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-white">
            <span className="inline-flex items-center gap-1.5"><Clock className="h-4 w-4 text-gold" aria-hidden="true" /> {destination.durations}</span>
            <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-4 w-4 text-gold" aria-hidden="true" /> Best time: {destination.bestTime}</span>
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <a href="#enquire" className="bg-gold-gradient inline-flex items-center gap-2 rounded-full px-6 py-3.5 font-semibold text-ink">
              <MessageSquareQuote className="h-4 w-4" aria-hidden="true" /> Enquire about {destination.name}
            </a>
            <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full border border-white/35 px-6 py-3.5 font-semibold hover:bg-white hover:text-ink">
              <MapPin className="h-4 w-4" aria-hidden="true" /> View on Google Maps <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
            <a href={whatsappLink(waMsg)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-6 py-3.5 font-semibold text-white">
              <WhatsAppIcon className="h-4 w-4" /> WhatsApp us
            </a>
          </div>
        </div>
      </section>

      <section className="bg-ivory py-14">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 sm:px-8 lg:grid-cols-12">
          <div className="space-y-8 lg:col-span-8">
            <div className="rounded-3xl border border-black/5 bg-white p-6 sm:p-8">
              <h2 className="font-serif text-3xl">Popular attractions</h2>
              <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                {destination.attractions.map((a) => (
                  <li key={a} className="flex items-start gap-2 rounded-2xl bg-ivory/70 px-4 py-2.5 text-sm text-neutral-600">
                    <Compass className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden="true" /> {a}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-3xl border border-black/5 bg-white p-6 sm:p-8">
              <h2 className="font-serif text-3xl">Indicative budget &amp; duration</h2>
              <p className="mt-3 font-serif text-3xl text-ink">
                {formatINR(destination.indicativeBudgetINR.from)} – {formatINR(destination.indicativeBudgetINR.to)}
                <span className="ml-2 text-sm font-sans font-normal text-neutral-500">per person, indicative</span>
              </p>
              <div className="mt-4 flex items-start gap-3 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-950">
                <Info className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" aria-hidden="true" />
                <p><strong>Pricing conditions:</strong> {destination.budgetNote}</p>
              </div>
              <dl className="mt-5 grid gap-4 sm:grid-cols-2">
                <div><dt className="text-xs uppercase tracking-wider text-neutral-500">Typical duration</dt><dd className="text-sm font-medium text-ink">{destination.durations}</dd></div>
                <div><dt className="text-xs uppercase tracking-wider text-neutral-500">Best time to visit</dt><dd className="text-sm font-medium text-ink">{destination.bestTime}</dd></div>
              </dl>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="rounded-3xl border border-black/5 bg-white p-6">
                <h2 className="flex items-center gap-2 font-serif text-xl"><Check className="h-5 w-5 text-emerald-600" aria-hidden="true" /> Typically included</h2>
                <ul className="mt-3 space-y-2 text-sm leading-6 text-neutral-600">
                  {destination.included.map((i) => <li key={i} className="flex items-start gap-2"><Check className="mt-1 h-3.5 w-3.5 shrink-0 text-emerald-600" aria-hidden="true" /> {i}</li>)}
                </ul>
              </div>
              <div className="rounded-3xl border border-black/5 bg-white p-6">
                <h2 className="flex items-center gap-2 font-serif text-xl"><X className="h-5 w-5 text-red-500" aria-hidden="true" /> Typically excluded</h2>
                <ul className="mt-3 space-y-2 text-sm leading-6 text-neutral-600">
                  {destination.excluded.map((i) => <li key={i} className="flex items-start gap-2"><X className="mt-1 h-3.5 w-3.5 shrink-0 text-red-400" aria-hidden="true" /> {i}</li>)}
                </ul>
              </div>
            </div>

            <div className="rounded-3xl border border-gold/30 bg-champagne/30 p-6 sm:p-8">
              <h2 className="font-serif text-2xl">Travel tips for {destination.name}</h2>
              <ul className="mt-3 space-y-2.5 text-sm leading-6 text-neutral-600">
                {destination.tips.map((t) => <li key={t} className="flex items-start gap-2"><Info className="mt-1 h-4 w-4 shrink-0 text-gold-dark" aria-hidden="true" /> {t}</li>)}
              </ul>
            </div>

            {matching.length > 0 && (
              <div>
                <h2 className="font-serif text-3xl">Available packages for {destination.name}</h2>
                <p className="mt-1 text-sm text-neutral-500">From our live tour catalogue. Every itinerary can be customised.</p>
                <ul className="mt-5 grid gap-6 sm:grid-cols-2">
                  {matching.slice(0, 4).map((t) => <li key={t.slug}><TourCard tour={t} /></li>)}
                </ul>
                <Link href={`/tours?q=${encodeURIComponent(destination.name)}`} className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-gold-dark hover:underline">
                  See all {destination.name} tours <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            )}
          </div>

          <aside className="lg:col-span-4">
            <div id="enquire" className="scroll-mt-28 space-y-4 lg:sticky lg:top-24">
              <AdvancedEnquiryForm
                defaultDestination={destination.name}
                heading={`Enquire about ${destination.name}`}
                subheading="No account needed. You'll receive an enquiry ID and a written quotation."
              />
              <div className="rounded-3xl bg-ink p-6 text-white">
                <h2 className="font-serif text-2xl">Talk to a planner</h2>
                <p className="mt-2 text-sm text-white/65">We reply from Belagavi, usually the same day.</p>
                <div className="mt-4 space-y-2">
                  <a href={whatsappLink(waMsg)} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-sm font-semibold text-white"><WhatsAppIcon className="h-4 w-4" /> {SITE.phoneDisplay}</a>
                  <a href={mailtoLink(`${destination.name} enquiry`)} className="flex items-center justify-center gap-2 rounded-full border border-white/25 px-4 py-3 text-sm font-semibold hover:bg-white hover:text-ink"><MessageSquareQuote className="h-4 w-4" aria-hidden="true" /> {SITE.email}</a>
                  <a href={telLink} className="flex items-center justify-center gap-2 rounded-full border border-white/25 px-4 py-3 text-sm font-semibold hover:bg-white hover:text-ink">Call us</a>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
}
