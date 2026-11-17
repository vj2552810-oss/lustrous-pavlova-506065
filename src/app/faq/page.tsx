import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { whatsappLink } from "@/lib/site";

export const metadata: Metadata = {
  title: "FAQ — Trip Quotations, Custom Packages, Payments & Visas",
  description:
    "Answers to common questions about requesting a quotation from PRITIVO, customising packages, hotels and transport, payments and cancellations, and international travel documents.",
  alternates: { canonical: "/faq" },
};

const GROUPS: { title: string; items: { q: string; a: string }[] }[] = [
  {
    title: "Quotations",
    items: [
      { q: "How do I request a trip quotation?", a: "Use our Custom Trip Planner, or message us on WhatsApp at +91 78923 37596. Share your destination, travel dates, number of travellers, departure city and approximate budget. We'll reply with a suggested itinerary and a written quotation." },
      { q: "Why don't packages show fixed prices?", a: "Holiday costs change with dates, season, hotel category, flight fares, group size and availability. To avoid showing inaccurate numbers, we display “Request a Quote” until a price is verified and share exact pricing in your personalised quotation." },
      { q: "Is there any charge for a quotation?", a: "Requesting a quotation is free and without obligation. Nothing is booked until you confirm in writing." },
    ],
  },
  {
    title: "Customisation",
    items: [
      { q: "Can I customise a package?", a: "Yes — every package is a starting point. You can change the duration, hotels, sightseeing, pace, add or remove cities, or combine destinations." },
      { q: "Do you plan trips to destinations not listed?", a: "Yes. Tell us where you'd like to go through the trip planner and we'll let you know if and how we can arrange it." },
      { q: "Can you plan honeymoons, student trips or group tours?", a: "Yes. We plan trips for couples, families, students, solo travellers and groups. Mention any special occasion or requirement in your enquiry." },
    ],
  },
  {
    title: "Hotels & transport",
    items: [
      { q: "How are hotels selected?", a: "We suggest stays based on your budget, preferred category and location. The exact hotels, room types and meal plans are listed in your quotation so you know what you're getting." },
      { q: "Is transport included?", a: "It depends on the itinerary. Your quotation will specify whether flights, trains, airport transfers, private cabs or sightseeing transport are included or excluded." },
    ],
  },
  {
    title: "Payments & cancellations",
    items: [
      { q: "How do payments work?", a: "Payment schedules and accepted methods are shared in your written quotation. Please only make payments to the details provided officially by PRITIVO in writing, and always ask for a receipt." },
      { q: "What is the cancellation policy?", a: "Cancellation and refund terms vary by hotel, airline and service provider, and by how close to departure you cancel. The applicable terms for your trip are confirmed in your written quotation before you pay. See our draft Cancellation & Refund Policy for general information." },
    ],
  },
  {
    title: "Hotel bookings",
    items: [
      { q: "Do I need an account to book a hotel?", a: "No. PRITIVO hotel bookings are guest-only: search, choose a room, enter the lead guest's details and continue. Your booking reference plus your email or phone is all you need to retrieve the booking later." },
      { q: "Are the hotels and prices shown live?", a: "Only when live mode is active. The Hotels page always shows a label: either “Live availability” (rates supplied by our authorised hotel partner for your dates) or “Demo mode — sample hotels, not live availability”. In demo mode the properties and prices are fictional samples, no payment is taken and no reservation is created." },
      { q: "When is my hotel booking confirmed?", a: "Only after two things happen: the payment gateway confirms your payment on our server, and the hotel provider returns a confirmation reference. If the hotel cannot honour the reservation after payment, we start a refund and show the reason on your booking page." },
      { q: "How do I change or cancel a hotel booking?", a: "Use “Find my booking” with your reference and email or phone. Unpaid bookings can be cancelled online. Paid or confirmed bookings follow the hotel's cancellation policy shown on your booking — message us on WhatsApp and we'll handle it with the hotel." },
      { q: "Which payment methods can I use?", a: "When online payment is enabled, payments are processed by Stripe on their secure checkout page; PRITIVO never sees or stores your card details. Until Stripe is configured, the site will not take payment online and will share a secure payment link instead." },
    ],
  },
  {
    title: "Tours & packages",
    items: [
      { q: "How many destinations does PRITIVO cover?", a: "The live tour catalogue currently spans 48 curated journeys across 13 Indian destinations and 23 international ones, plus 12 special packages such as honeymoon, luxury, safari, cruise and northern-lights collections. We can also build itineraries outside the catalogue on request." },
      { q: "Can I customise a published tour?", a: "Yes. Every published itinerary is a starting point: change the duration, hotels, pace or add another city. Send a quotation request from the tour page or message us on WhatsApp and a planner will respond with a tailored written quote." },
      { q: "Why do some tours say “Request a Quote”?", a: "Only prices confirmed with our suppliers are published. Everything else is quoted individually for your dates and party size, so you never see an invented price. Nothing is charged until you approve the written quote." },
      { q: "Can I see where a tour goes on a map?", a: "Yes — each tour page links to its destination on Google Maps, and the hotel pages show verified hotel locations. We only pin locations we can verify; we never guess coordinates." },
    ],
  },
  {
    title: "Flights",
    items: [
      { q: "Why can't I see flight prices on the website?", a: "We haven't connected an authorised live flight API yet, so any fare we displayed would be invented. Instead, the Flights page collects your route, dates and travellers, and a PRITIVO planner replies with real options and a written quote. Nothing is charged or held until you approve that quote." },
      { q: "Can you arrange flights with a holiday package?", a: "Yes. Flights can be combined with any package or hotel booking. Tell us your route in the flight request or on WhatsApp and we'll quote the whole trip together, listing exactly what is included." },
      { q: "Do I need an account to book flights or hotels?", a: "No. PRITIVO is guest-only: there are no accounts, logins or passwords. Hotel bookings give you a reference you can use with your email or phone to retrieve everything later, and flight requests are handled over WhatsApp or email." },
    ],
  },
  {
    title: "International travel",
    items: [
      { q: "What documents do I need for international trips?", a: "Typically a passport valid for at least six months beyond your return date, and a visa or e-visa where required. Requirements depend on your nationality and destination and can change, so always verify with the official embassy or government website." },
      { q: "Do you help with visas?", a: "We can share guidance on the general process and documents usually required. Visa approval is decided solely by the relevant authorities, and we cannot guarantee any outcome." },
      { q: "Is travel insurance recommended?", a: "We strongly recommend comprehensive travel insurance for all trips, especially international ones. Some countries require it for entry." },
    ],
  },
];

export default function FaqPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: GROUPS.flatMap((g) =>
      g.items.map((i) => ({ "@type": "Question", name: i.q, acceptedAnswer: { "@type": "Answer", text: i.a } })),
    ),
  };

  return (
    <>
      <PageHero
        eyebrow="Frequently asked questions"
        title={<>Good questions, <span className="text-gold-gradient italic">clear answers.</span></>}
        description="Everything you need to know before planning with PRITIVO."
      />
      <section className="bg-ivory py-20">
        <div className="mx-auto max-w-4xl px-5 sm:px-8">
          <p className="rounded-2xl border border-gold/30 bg-champagne/40 p-5 text-sm leading-6 text-neutral-600">
            <strong>Please note:</strong> These answers are general guidance. Final prices, inclusions, payment schedules and
            cancellation terms for your trip are always confirmed in your written quotation.
          </p>
          {GROUPS.map((g) => (
            <div key={g.title} className="mt-12">
              <h2 className="eyebrow text-gold-dark">{g.title}</h2>
              <div className="mt-4 divide-y divide-neutral-200 rounded-3xl border border-black/5 bg-white">
                {g.items.map((i) => (
                  <details key={i.q} className="group px-6 py-1 sm:px-8 [&_summary::-webkit-details-marker]:hidden">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 font-serif text-xl text-ink">
                      {i.q}
                      <Plus className="h-5 w-5 shrink-0 text-gold transition-transform duration-300 group-open:rotate-45" aria-hidden="true" />
                    </summary>
                    <p className="pb-6 leading-7 text-neutral-600">{i.a}</p>
                  </details>
                ))}
              </div>
            </div>
          ))}
          <div className="mt-16 rounded-3xl bg-ink p-10 text-center text-white">
            <h2 className="font-serif text-3xl">Still have a question?</h2>
            <p className="mt-3 text-white/65">We&apos;re happy to help — just ask.</p>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <a href={whatsappLink("Hello PRITIVO! I have a question.")} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-3 font-semibold">
                <WhatsAppIcon /> Ask on WhatsApp
              </a>
              <Link href="/contact" className="rounded-full border border-white/30 px-6 py-3 font-semibold hover:bg-white hover:text-ink">
                Contact page
              </Link>
            </div>
          </div>
        </div>
      </section>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
}
