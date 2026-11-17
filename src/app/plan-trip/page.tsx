import type { Metadata } from "next";
import { Clock, FileText, MessageCircle, ShieldCheck } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { AdvancedEnquiryForm } from "@/components/AdvancedEnquiryForm";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { SITE, whatsappLink } from "@/lib/site";
import { PACKAGES } from "@/lib/packages";

export const metadata: Metadata = {
  title: "Custom Trip Planner — Get a Personalised Holiday Quote",
  description:
    "Plan a custom holiday with PRITIVO, Belagavi. Share your destination, dates, travellers and budget to receive a personalised written quotation over WhatsApp.",
  alternates: { canonical: "/plan-trip" },
};

export default async function PlanTripPage({
  searchParams,
}: {
  searchParams: Promise<{ destination?: string | string[] }>;
}) {
  const sp = await searchParams;
  const destination = (Array.isArray(sp.destination) ? sp.destination[0] : sp.destination)?.slice(0, 120) ?? "";

  return (
    <>
      <PageHero
        eyebrow="Custom trip planner"
        title={<>Design your journey, <span className="text-gold-gradient italic">your way.</span></>}
        description="Tell us a little about your trip. We'll reply with a personalised itinerary and a transparent written quotation."
        image={PACKAGES[8].image}
        imageAlt="Balinese temple amid rice terraces"
      />
      <section className="bg-ivory pb-24 pt-16">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-8 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <AdvancedEnquiryForm key={destination} defaultDestination={destination} heading="Tell us about your dream trip" />
          </div>
          <aside className="space-y-6 lg:col-span-4">
            <div className="rounded-3xl bg-ink p-8 text-white">
              <h2 className="font-serif text-2xl">What happens next?</h2>
              <ul className="mt-6 space-y-5 text-sm text-white">
                <li className="flex gap-3">
                  <MessageCircle className="h-5 w-5 shrink-0 text-gold" aria-hidden="true" />
                  WhatsApp opens with your trip details prefilled. Just press send.
                </li>
                <li className="flex gap-3">
                  <Clock className="h-5 w-5 shrink-0 text-gold" aria-hidden="true" />
                  A PRITIVO planner reviews your request and may ask a few questions.
                </li>
                <li className="flex gap-3">
                  <FileText className="h-5 w-5 shrink-0 text-gold" aria-hidden="true" />
                  You receive a written quotation with itinerary, inclusions, exclusions and terms.
                </li>
                <li className="flex gap-3">
                  <ShieldCheck className="h-5 w-5 shrink-0 text-gold" aria-hidden="true" />
                  No obligation — nothing is booked until you confirm in writing.
                </li>
              </ul>
            </div>
            <div className="rounded-3xl border border-black/5 bg-white p-8">
              <h2 className="font-serif text-2xl">Prefer to chat?</h2>
              <p className="mt-3 text-sm leading-6 text-neutral-600">Message us directly and we&apos;ll take it from there.</p>
              <a
                href={whatsappLink("Hello PRITIVO! I'd like help planning a trip.")}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] py-3.5 font-semibold text-white"
              >
                <WhatsAppIcon /> {SITE.phoneDisplay}
              </a>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
