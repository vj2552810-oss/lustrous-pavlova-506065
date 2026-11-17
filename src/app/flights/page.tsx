import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, BadgeCheck, Clock, FileText, Info, Plane, ShieldCheck } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { FlightRequestForm } from "@/components/flights/FlightRequestForm";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { packagesForRegion } from "@/lib/packages";
import { PACKAGES } from "@/lib/packages";
import { SITE, mailtoLink, telLink, whatsappLink } from "@/lib/site";
import { Phone, Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "Flights & Holiday Packages from Belagavi",
  description:
    "Request flight options and holiday packages from PRITIVO, Belagavi. Our planners source fares and itineraries and reply with a written quote — no account needed.",
  alternates: { canonical: "/flights" },
};

const ROUTES = [
  { from: "Belagavi (IXG)", to: "Goa (GOI)", note: "Weekend beach break" },
  { from: "Bengaluru (BLR)", to: "Manali / Chandigarh (IXC)", note: "Himalayan holiday" },
  { from: "Mumbai (BOM)", to: "Dubai (DXB)", note: "Family city break" },
  { from: "Bengaluru (BLR)", to: "London (LHR)", note: "First Europe trip" },
  { from: "Mumbai (BOM)", to: "Bali (DPS)", note: "Honeymoon" },
  { from: "Bengaluru (BLR)", to: "Singapore (SIN)", note: "Family favourite" },
];

const STEPS = [
  { icon: FileText, title: "Share the route", text: "Send your cities, dates and travellers — flexible dates usually unlock better fares." },
  { icon: Clock, title: "We source options", text: "A planner checks airline and consolidator options and sends a written quote." },
  { icon: BadgeCheck, title: "Confirm in writing", text: "Nothing is held or charged until you approve the quote and pay through a secure link." },
];

export default async function FlightsPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string | string[]; to?: string | string[] }>;
}) {
  const sp = await searchParams;
  const pick = (k: keyof typeof sp) => (Array.isArray(sp[k]) ? (sp[k] as string[])[0] : ((sp[k] as string | undefined) ?? ""));
  const initialFrom = pick("from").slice(0, 60);
  const initialTo = pick("to").slice(0, 60);
  const international = packagesForRegion("international");

  return (
    <>
      <PageHero
        eyebrow="Flights & fares"
        title={<>Flight options, <span className="text-gold-gradient italic">sourced by people.</span></>}
        description="We don't pretend to have live fares. Tell us your route and a PRITIVO planner will come back with real options and a written quote."
        image={PACKAGES[6].image}
        imageAlt="City skyline at dusk — international flight planning"
      >
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a href="#request" className="bg-gold-gradient inline-flex items-center gap-2 rounded-full px-7 py-3.5 font-semibold text-ink">
            <Plane className="h-4 w-4" aria-hidden="true" /> Request flight options
          </a>
          <a
            href={whatsappLink("Hello PRITIVO! I'd like help with flights.")}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-white/40 px-7 py-3.5 font-semibold text-white transition hover:bg-white hover:text-ink"
          >
            <WhatsAppIcon className="h-4 w-4" /> WhatsApp {SITE.phoneDisplay}
          </a>
        </div>
      </PageHero>

      <section className="bg-ivory pb-24 pt-12">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="flex items-start gap-3 rounded-2xl border border-gold/40 bg-champagne/40 p-5 text-sm leading-6 text-neutral-600">
            <Info className="mt-0.5 h-5 w-5 shrink-0 text-gold-dark" aria-hidden="true" />
            <p>
              <strong>Why there are no prices on this page:</strong> we haven&apos;t connected an authorised live flight
              API to this site yet, so any fare we displayed would be invented. Instead every request goes to a planner
              who replies with real availability and a written quote. Your request is not a booking and no payment is
              taken here.
            </p>
          </div>

          <div id="request" className="mt-10 grid gap-8 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <FlightRequestForm initialFrom={initialFrom} initialTo={initialTo} />
            </div>

            <aside className="space-y-6 lg:col-span-5">
              <div className="rounded-3xl border border-black/5 bg-white p-6">
                <h2 className="font-serif text-2xl">Routes travellers ask us for</h2>
                <p className="mt-1 text-sm text-neutral-500">Tap a route to start a request — no prices are implied.</p>
                <ul className="mt-4 space-y-2">
                  {ROUTES.map((r) => (
                    <li key={`${r.from}-${r.to}`}>
                      <Link
                        href={`/flights?from=${encodeURIComponent(r.from)}&to=${encodeURIComponent(r.to)}#request`}
                        className="flex items-center justify-between gap-3 rounded-2xl border border-neutral-100 bg-ivory/60 px-4 py-3 text-sm transition hover:border-gold"
                      >
                        <span className="min-w-0">
                          <span className="block font-medium text-ink">{r.from} → {r.to}</span>
                          <span className="block text-xs text-neutral-500">{r.note}</span>
                        </span>
                        <ArrowRight className="h-4 w-4 shrink-0 text-gold-dark" aria-hidden="true" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-3xl bg-ink p-6 text-white">
                <h2 className="font-serif text-2xl">Prefer to talk it through?</h2>
                <p className="mt-2 text-sm text-white/65">Group bookings, student fares and multi-city routings are easier on a call.</p>
                <div className="mt-4 space-y-2">
                  <a href={whatsappLink("Hello PRITIVO! I'd like help with flights.")} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-sm font-semibold text-white">
                    <WhatsAppIcon className="h-4 w-4" /> WhatsApp
                  </a>
                  <a href={telLink} className="flex items-center justify-center gap-2 rounded-full border border-white/25 px-4 py-3 text-sm font-semibold hover:bg-white hover:text-ink">
                    <Phone className="h-4 w-4" aria-hidden="true" /> {SITE.phoneDisplay}
                  </a>
                  <a href={mailtoLink("Flight planning")} className="flex items-center justify-center gap-2 rounded-full border border-white/25 px-4 py-3 text-sm font-semibold hover:bg-white hover:text-ink">
                    <Mail className="h-4 w-4" aria-hidden="true" /> {SITE.email}
                  </a>
                </div>
              </div>

              <div className="rounded-3xl border border-black/5 bg-white p-6">
                <h2 className="flex items-center gap-2 font-serif text-2xl">
                  <ShieldCheck className="h-5 w-5 text-gold" aria-hidden="true" /> Documents &amp; visas
                </h2>
                <p className="mt-2 text-sm leading-6 text-neutral-600">
                  For international flights we&apos;ll flag passport validity, visa or e-visa needs and transit rules for
                  your nationality. Approval always rests with the authorities — we&apos;ll never guarantee a visa.
                </p>
                <Link href="/faq" className="mt-3 inline-flex text-sm font-medium text-gold-dark hover:underline">Read travel FAQs</Link>
              </div>
            </aside>
          </div>

          <div className="mt-16">
            <h2 className="font-serif text-3xl sm:text-4xl">How flight planning works</h2>
            <ol className="mt-6 grid gap-5 md:grid-cols-3">
              {STEPS.map((s, i) => (
                <li key={s.title} className="rounded-3xl border border-black/5 bg-white p-6">
                  <div className="flex items-center justify-between">
                    <s.icon className="h-6 w-6 text-gold" aria-hidden="true" />
                    <span className="font-serif text-3xl text-gold/50">0{i + 1}</span>
                  </div>
                  <h3 className="mt-4 font-serif text-xl">{s.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-neutral-600">{s.text}</p>
                </li>
              ))}
            </ol>
          </div>

          <div className="mt-16">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="eyebrow text-gold-dark">Pair flights with a package</p>
                <h2 className="mt-3 font-serif text-3xl sm:text-4xl">International holidays, quoted in writing</h2>
              </div>
              <Link href="/packages" className="inline-flex items-center gap-2 rounded-full border border-ink/20 px-5 py-2.5 text-sm font-semibold hover:border-ink">
                All packages <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
            <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {international.map((p) => (
                <li key={p.slug} className="card-3d overflow-hidden rounded-3xl border border-black/5 bg-white">
                  <div className="relative h-40">
                    <Image src={p.image} alt={p.imageAlt} fill sizes="(min-width:1024px) 33vw, 100vw" className="object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/80 to-transparent" />
                    <div className="absolute inset-x-5 bottom-3 text-white">
                      <p className="text-xs uppercase tracking-[0.25em] text-gold">{p.duration}</p>
                      <h3 className="font-serif text-2xl">{p.name}</h3>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-2 p-4">
                    <span className="text-xs text-neutral-500">Request a quote</span>
                    <Link href={`/packages#${p.slug}`} className="text-sm font-semibold text-gold-dark hover:underline">View itinerary</Link>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
