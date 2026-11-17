import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Eye, Globe2, MapPin, Sparkles, Target } from "lucide-react";
import { PageHero, SectionHeading } from "@/components/PageHero";
import { Reveal } from "@/components/Reveal";
import { ABOUT_IMAGE, PACKAGES } from "@/lib/packages";

export const metadata: Metadata = {
  title: "About PRITIVO — Travel Agency from Belagavi, Karnataka",
  description:
    "PRITIVO is an online travel agency from Belagavi on a mission to make travel planning simple, personalised, transparent and memorable — for travellers across India and, in time, the world.",
  alternates: { canonical: "/about" },
};

const VALUES = [
  { title: "Simple", text: "One conversation, one planner, one clear plan. We handle the complexity so you don't have to." },
  { title: "Personalised", text: "Your interests, pace and budget shape every itinerary — not a fixed brochure." },
  { title: "Transparent", text: "Written quotations with clear inclusions, exclusions and terms. No surprises." },
  { title: "Memorable", text: "Thoughtful touches and the right recommendations that turn a trip into a story." },
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About PRITIVO"
        title={<>Born in Belagavi. <span className="text-gold-gradient italic">Built for the world.</span></>}
        description="We started PRITIVO with a simple belief: planning a journey should feel as good as taking it."
        image={ABOUT_IMAGE}
        imageAlt="Calm waters framed by majestic mountains"
      />

      <section className="bg-ivory py-24 sm:py-32">
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 sm:px-8 lg:grid-cols-2">
          <Reveal className="relative aspect-[4/5] overflow-hidden rounded-[2rem]">
            <Image src={PACKAGES[1].image} alt={PACKAGES[1].imageAlt} fill sizes="(min-width:1024px) 50vw, 100vw" className="object-cover" />
            <div className="absolute bottom-6 left-6 right-6 rounded-2xl bg-ink/80 p-5 text-white backdrop-blur">
              <p className="flex items-center gap-2 text-sm text-gold">
                <MapPin className="h-4 w-4" aria-hidden="true" /> Belagavi, Karnataka
              </p>
              <p className="mt-1 font-serif text-xl">Where every PRITIVO journey begins.</p>
            </div>
          </Reveal>
          <div>
            <SectionHeading
              align="left"
              eyebrow="Our story"
              title="A new kind of travel company, rooted at home"
            />
            <div className="mt-6 space-y-5 leading-8 text-neutral-600">
              <p>
                PRITIVO is a newly launched online travel agency based in Belagavi, Karnataka. Perfectly placed between
                Goa&apos;s beaches, the Western Ghats and Karnataka&apos;s heritage, Belagavi is the natural starting point for
                our journeys.
              </p>
              <p>
                We plan holidays for families, couples, students, solo travellers and groups — from easy weekend escapes
                to Coorg and Goa, to grand journeys across Kashmir and Rajasthan, and international holidays to Dubai,
                Thailand, Bali and Singapore.
              </p>
              <p>
                We&apos;re honest about where we are: a young, growing team that would rather earn your trust one well-planned
                trip at a time than make claims we can&apos;t back up.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-ink py-24 text-white sm:py-32">
        <div className="mx-auto grid max-w-7xl gap-6 px-5 sm:px-8 md:grid-cols-3">
          {[
            { icon: Target, t: "Our mission", d: "To make travel planning simple, personalised, transparent and memorable for every traveller who trusts us with their time away." },
            { icon: MapPin, t: "Where we start", d: "Belagavi and North Karnataka — serving travellers from our home region with personal, responsive WhatsApp-first service." },
            { icon: Globe2, t: "Our vision", d: "To grow into a globally recognised travel brand that serves travellers worldwide, while keeping the personal touch we began with." },
          ].map((c, i) => (
            <Reveal key={c.t} delay={i * 100} className="rounded-3xl border border-white/10 bg-ink-2 p-9">
              <c.icon className="h-9 w-9 text-gold" strokeWidth={1.4} aria-hidden="true" />
              <h2 className="mt-6 font-serif text-3xl">{c.t}</h2>
              <p className="mt-4 text-sm leading-7 text-white/65">{c.d}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="bg-sand py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <SectionHeading eyebrow="What we stand for" title="Four promises in every trip" />
          <ul className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map((v, i) => (
              <Reveal as="li" key={v.title} delay={i * 90} className="rounded-3xl bg-white p-8">
                <Sparkles className="h-6 w-6 text-gold" aria-hidden="true" />
                <h3 className="mt-5 font-serif text-2xl">{v.title}</h3>
                <p className="mt-3 text-sm leading-6 text-neutral-600">{v.text}</p>
              </Reveal>
            ))}
          </ul>
          <div className="mx-auto mt-16 flex max-w-3xl flex-col items-center rounded-3xl border border-gold/30 bg-white p-10 text-center">
            <Eye className="h-8 w-8 text-gold" aria-hidden="true" />
            <p className="mt-4 font-serif text-2xl leading-snug sm:text-3xl">
              &ldquo;Your World. Your Way.&rdquo; — isn&apos;t just a tagline. It&apos;s how we plan every trip.
            </p>
            <Link href="/plan-trip" className="bg-gold-gradient mt-8 inline-flex items-center gap-2 rounded-full px-7 py-3.5 font-semibold text-ink">
              Start planning <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
