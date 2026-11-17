import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Mail, MapPin, Phone, Plus } from "lucide-react";
import { NewsletterForm } from "./NewsletterForm";
import { Reveal } from "@/components/Reveal";
import { SectionHeading } from "@/components/PageHero";
import { AdvancedEnquiryForm } from "@/components/AdvancedEnquiryForm";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { formatINR } from "@/lib/packages";
import { SITE, mailtoLink, telLink, whatsappLink } from "@/lib/site";
import type { TourRecord } from "@/lib/tours/service";

const FAQ_PREVIEW = [
  {
    q: "Do I need an account to enquire or book?",
    a: "No. PRITIVO is guest-only: there are no customer logins, registrations or passwords. You receive an enquiry ID for trips and a booking reference for hotels, which you can use with your email or phone to retrieve details later.",
  },
  {
    q: "Why do some tours show Request a Quote?",
    a: "We only publish a price once it has been verified with suppliers. Everything else is quoted individually for your dates, hotel category and group size, so you never see an invented number.",
  },
  {
    q: "When is a booking actually confirmed?",
    a: "Only after the supplier confirms in writing and the payment conditions in your quotation are met. Our staff dashboard enforces this rule — an enquiry cannot be moved to Confirmed otherwise.",
  },
  {
    q: "Can I pay online?",
    a: "Online payment is enabled once a gateway is configured and tested. Until then nothing is charged on the website: we share a secure payment link or bank details in writing after you approve a quotation.",
  },
  {
    q: "How do I reach you quickly?",
    a: `WhatsApp ${SITE.phoneDisplay} is fastest. You can also call the same number or email ${SITE.email}.`,
  },
];

const BOOKING_STEPS = [
  { n: "01", t: "Enquire", d: "Send your dates, travellers and budget — no account needed. You receive an enquiry ID instantly." },
  { n: "02", t: "Written quote", d: "A planner replies with a tailored itinerary, exact inclusions, exclusions and pricing." },
  { n: "03", t: "Approve & pay", d: "Once you approve, payment is taken through a secure gateway — only when live payments are enabled." },
  { n: "04", t: "Confirmed", d: "We mark a trip confirmed only after the supplier confirms and payment conditions are met." },
];

export function HomeSections({ dealTours }: { dealTours: TourRecord[] }) {
  return (
    <>
      {/* BEST TRAVEL DEALS + HOW BOOKING WORKS */}
      <section className="bg-ivory py-24 sm:py-28" aria-labelledby="deals-title">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <SectionHeading
              align="left"
              eyebrow="Best travel deals"
              title={<span id="deals-title">Value journeys, honestly priced</span>}
              description="Shorter trips and shoulder-season departures give the best value. We publish a price only once it has been verified with suppliers — everything else is quoted individually."
            />
            <Link href="/tours?budget=under-30k" className="inline-flex items-center gap-2 rounded-full border border-ink/20 px-5 py-2.5 text-sm font-semibold hover:border-ink">
              See value tours <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          {dealTours.length > 0 && (
            <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {dealTours.map((t, i) => (
                <Reveal as="li" key={t.slug} delay={i * 70}>
                  <Link href={`/tours/${t.slug}`} className="card-3d group flex h-full flex-col overflow-hidden rounded-2xl border border-black/5 bg-white">
                    <span className="relative block h-32 overflow-hidden">
                      <Image src={t.heroImage} alt={t.heroImageAlt} fill sizes="(min-width:1024px) 25vw, 50vw" className="object-cover transition duration-[1.1s] group-hover:scale-105" />
                      <span className="absolute inset-0 bg-gradient-to-t from-ink/80 to-transparent" />
                      <span className="absolute inset-x-4 bottom-2 block font-serif text-xl text-white">{t.name}</span>
                    </span>
                    <span className="flex flex-1 flex-col p-4">
                      <span className="text-xs text-neutral-500">{t.durationDays}D / {t.durationNights}N · {t.city.split("·")[0].trim() || t.country}</span>
                      <span className="mt-2 block text-sm font-semibold text-ink">
                        {t.priceVerified && t.priceFromINR ? formatINR(t.priceFromINR) : "Request a Quote"}
                      </span>
                      <span className="mt-auto block pt-3 text-xs text-gold-dark">View itinerary →</span>
                    </span>
                  </Link>
                </Reveal>
              ))}
            </ul>
          )}

          <div className="mt-14">
            <h2 className="font-serif text-3xl sm:text-4xl">How booking works</h2>
            <ol className="mt-6 grid gap-5 md:grid-cols-4">
              {BOOKING_STEPS.map((step, i) => (
                <Reveal as="li" key={step.n} delay={i * 80} className="rounded-3xl border border-black/5 bg-white p-6">
                  <span className="font-serif text-4xl text-gold/50">{step.n}</span>
                  <h3 className="mt-3 font-serif text-xl">{step.t}</h3>
                  <p className="mt-2 text-sm leading-6 text-neutral-600">{step.d}</p>
                </Reveal>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* FAQ PREVIEW */}
      <section className="bg-sand py-24 sm:py-28" aria-labelledby="faq-preview-title">
        <div className="mx-auto max-w-4xl px-5 text-center sm:px-8">
          <SectionHeading eyebrow="Questions" title={<span id="faq-preview-title">Answered before you ask</span>} />
          <div className="mt-10 space-y-3 text-left">
            {FAQ_PREVIEW.map((f) => (
              <details key={f.q} className="group rounded-2xl border border-black/5 bg-white px-5 py-4 [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-serif text-xl text-ink">
                  {f.q}
                  <Plus className="h-5 w-5 shrink-0 text-gold transition-transform duration-300 group-open:rotate-45" aria-hidden="true" />
                </summary>
                <p className="mt-3 text-sm leading-7 text-neutral-600">{f.a}</p>
              </details>
            ))}
          </div>
          <Link href="/faq" className="mt-8 inline-flex items-center gap-2 rounded-full border border-ink px-6 py-3 text-sm font-semibold hover:bg-ink hover:text-white">
            Read all FAQs <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className="relative overflow-hidden bg-ink py-20 text-white sm:py-24" aria-labelledby="newsletter-title">
        <div className="animate-glow pointer-events-none absolute -left-20 top-0 h-72 w-72 rounded-full bg-gold/20 blur-3xl" aria-hidden="true" />
        <div className="relative mx-auto grid max-w-6xl gap-8 px-5 sm:px-8 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="eyebrow text-gold">Stay in the loop</p>
            <h2 id="newsletter-title" className="mt-3 font-serif text-4xl font-medium leading-tight">Travel offers, straight to your inbox</h2>
            <p className="mt-3 max-w-md text-sm leading-6 text-white/65">
              Seasonal departures, shoulder-season value and new destinations. One email at a time — never more.
            </p>
          </div>
          <NewsletterForm />
        </div>
      </section>

      {/* CONTACT */}
      <section className="bg-ivory py-24 sm:py-28" aria-labelledby="contact-preview-title">
        <div className="mx-auto grid max-w-6xl items-start gap-10 px-5 sm:px-8 lg:grid-cols-2">
          <div>
            <SectionHeading
              align="left"
              eyebrow="Contact PRITIVO"
              title={<span id="contact-preview-title">Talk to a real planner in Belagavi</span>}
              description="WhatsApp is fastest. Call, email or send an enquiry and we'll reply with options and a written quote."
            />
            <ul className="mt-7 space-y-3 text-sm">
              <li>
                <a
                  href={whatsappLink("Hello PRITIVO! I'd like help planning a trip.")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-[#25D366]/50 px-5 py-3 font-semibold text-[#1da851] transition hover:bg-[#25D366]/10"
                >
                  <WhatsAppIcon className="h-4 w-4" /> WhatsApp {SITE.phoneDisplay}
                </a>
              </li>
              <li>
                <a href={telLink} className="inline-flex items-center gap-2 rounded-full border border-ink/15 px-5 py-3 font-semibold hover:border-ink">
                  <Phone className="h-4 w-4 text-gold-dark" aria-hidden="true" /> Call {SITE.phoneDisplay}
                </a>
              </li>
              <li>
                <a href={mailtoLink("Travel enquiry")} className="inline-flex items-center gap-2 rounded-full border border-ink/15 px-5 py-3 font-semibold hover:border-ink">
                  <Mail className="h-4 w-4 text-gold-dark" aria-hidden="true" /> {SITE.email}
                </a>
              </li>
              <li className="flex items-center gap-2 text-neutral-600">
                <MapPin className="h-4 w-4 text-gold-dark" aria-hidden="true" /> {SITE.location}
              </li>
            </ul>
          </div>
          <AdvancedEnquiryForm variant="compact" heading="Quick enquiry" subheading="Nine fields, no account. Add dates, children or hotel preferences only if you want to." />
        </div>
      </section>
    </>
  );
}
