import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays, Clock } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { Reveal } from "@/components/Reveal";
import { DESTINATION_GUIDES } from "@/lib/destinations";
import { formatINR } from "@/lib/packages";

export const metadata: Metadata = {
  title: "Travel Destinations — Domestic & International Guides",
  description:
    "PRITIVO destination guides: Goa, Kerala, Kashmir, Manali, Rajasthan, Coorg, Ooty, Andaman, Dubai, Bali, Thailand, Singapore, Malaysia, Maldives and Europe — with best time to visit, attractions and indicative budgets.",
  alternates: { canonical: "/destinations" },
};

export default function DestinationsIndexPage() {
  const domestic = DESTINATION_GUIDES.filter((d) => d.region === "Domestic");
  const international = DESTINATION_GUIDES.filter((d) => d.region === "International");

  const card = (d: (typeof DESTINATION_GUIDES)[number]) => (
    <Reveal key={d.slug}>
      <Link href={`/destinations/${d.slug}`} className="card-3d group block overflow-hidden rounded-3xl border border-black/5 bg-white">
        <span className="relative block aspect-[16/10] overflow-hidden">
          <Image src={d.image} alt={d.imageAlt} fill sizes="(min-width:1024px) 33vw, 100vw" className="object-cover transition duration-[1.1s] group-hover:scale-105" />
          <span className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/10 to-transparent" />
          <span className="absolute inset-x-5 bottom-4 block text-white">
            <span className="block text-xs uppercase tracking-[0.28em] text-gold">{d.region} · {d.country}</span>
            <span className="mt-1 block font-serif text-3xl font-medium">{d.name}</span>
          </span>
        </span>
        <span className="block p-5">
          <span className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-500">
            <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5 text-gold" aria-hidden="true" /> {d.durations}</span>
            <span className="inline-flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5 text-gold" aria-hidden="true" /> {d.bestTime.split(";")[0]}</span>
          </span>
          <span className="mt-2 block text-sm font-medium text-ink">
            Indicative {formatINR(d.indicativeBudgetINR.from)} – {formatINR(d.indicativeBudgetINR.to)} pp
          </span>
          <span className="mt-1 block text-xs text-neutral-500">Planning range only — your written quote confirms the price.</span>
          <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-gold-dark">
            View destination guide <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" aria-hidden="true" />
          </span>
        </span>
      </Link>
    </Reveal>
  );

  return (
    <>
      <PageHero
        eyebrow="Destinations"
        title={<>Where will you <span className="text-gold-gradient italic">go next?</span></>}
        description="Fifteen destination guides with best time to visit, attractions, indicative planning budgets and matching tours."
      />
      <section className="bg-ivory py-16">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <h2 className="font-serif text-3xl">Domestic destinations</h2>
          <p className="mt-1 text-sm text-neutral-500">Journeys across India, planned from Belagavi.</p>
          <ul className="mt-6 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">{domestic.map(card)}</ul>

          <h2 className="mt-14 font-serif text-3xl">International destinations</h2>
          <p className="mt-1 text-sm text-neutral-500">Worldwide holidays with visa guidance and multi-city routing.</p>
          <ul className="mt-6 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">{international.map(card)}</ul>

          <p className="mt-10 rounded-2xl border border-gold/30 bg-champagne/30 p-5 text-sm leading-6 text-neutral-600">
            <strong>About the budgets shown:</strong> these are indicative planning ranges, not guaranteed prices. Actual
            cost depends on season, hotel category, group size and airfare at the time of booking, and is confirmed only
            in your written quotation. No live availability is claimed on this page.
          </p>
        </div>
      </section>
    </>
  );
}
