import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { Reveal } from "@/components/Reveal";
import { SERVICES } from "@/lib/services";

export const metadata: Metadata = {
  title: "Travel Services — Tours, Hotels, Flights, Car Rental & More",
  description:
    "PRITIVO travel services from Belagavi: domestic and international tour packages, hotel reservations, flight and train assistance, car rental, group tours, family holidays, honeymoons and customised planning.",
  alternates: { canonical: "/services" },
};

export default function ServicesPage() {
  return (
    <>
      <PageHero
        eyebrow="Our services"
        title={<>Everything a trip needs, <span className="text-gold-gradient italic">from one team.</span></>}
        description="Ten services, one planner. Tell us the trip and we coordinate the details — with written quotes and no invented prices."
      />
      <section className="bg-ivory py-16">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <ul className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map((s, i) => (
              <Reveal as="li" key={s.slug} delay={(i % 3) * 80}>
                <Link href={`/services/${s.slug}`} className="card-3d group flex h-full flex-col overflow-hidden rounded-3xl border border-black/5 bg-white">
                  <span className="relative block h-40 overflow-hidden">
                    <Image src={s.image} alt={s.imageAlt} fill sizes="(min-width:1024px) 33vw, 100vw" className="object-cover transition duration-[1.1s] group-hover:scale-105" />
                    <span className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/20 to-transparent" />
                    <span className="absolute inset-x-5 bottom-3 block font-serif text-2xl text-white">{s.name}</span>
                  </span>
                  <span className="flex flex-1 flex-col p-5">
                    <span className="block text-sm font-medium text-gold-dark">{s.tagline}</span>
                    <span className="mt-2 line-clamp-3 block text-sm leading-6 text-neutral-600">{s.description}</span>
                    <span className="mt-auto inline-flex items-center gap-1.5 pt-4 text-sm font-semibold text-ink">
                      Explore service <ArrowRight className="h-4 w-4 text-gold-dark transition group-hover:translate-x-1" aria-hidden="true" />
                    </span>
                  </span>
                </Link>
              </Reveal>
            ))}
          </ul>
          <p className="mt-10 rounded-2xl border border-gold/30 bg-champagne/30 p-5 text-sm leading-6 text-neutral-600">
            <strong>How we work:</strong> every service starts with an enquiry and ends with a written quotation listing
            inclusions, exclusions, prices and cancellation terms. Nothing is booked or charged until you approve it.
            Hotel availability and flight fares are confirmed with suppliers — we never display invented prices or claim
            live availability that isn&apos;t connected.
          </p>
        </div>
      </section>
    </>
  );
}
