"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Compass, Globe2, MapPin, Plane, Search, ShieldCheck, Sparkles, Star } from "lucide-react";
import { HotelSearchForm } from "@/components/hotels/HotelSearchForm";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { SITE, whatsappLink } from "@/lib/site";
import type { HotelSearchQuery } from "@/lib/hotels/types";

const TABS = [
  { key: "hotels", label: "Hotels", icon: Globe2, href: "/hotels" },
  { key: "packages", label: "Holiday packages", icon: Compass, href: "/packages" },
  { key: "flights", label: "Flights", icon: Plane, href: "/flights" },
] as const;

export function Hero3D({
  initialQuery,
  images,
  destinationChips,
}: {
  initialQuery: HotelSearchQuery;
  images: { hero: string; cardA: string; cardB: string; cardC: string };
  destinationChips: { name: string; href: string }[];
}) {
  const sceneRef = useRef<HTMLDivElement | null>(null);
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("hotels");
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(prefersReduced.matches);
    if (prefersReduced.matches) return;

    let frame = 0;
    const scroller = () => {
      frame = window.requestAnimationFrame(() => {
        const y = Math.min(window.scrollY, 900);
        sceneRef.current?.style.setProperty("--py", `${y * -0.16}px`);
        sceneRef.current?.style.setProperty("--pz", `${1 + y / 6000}`);
      });
    };
    const pointer = (e: PointerEvent) => {
      if (window.matchMedia("(pointer: coarse)").matches) return;
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      sceneRef.current?.style.setProperty("--ry", `${x * 3.2}`);
      sceneRef.current?.style.setProperty("--rx", `${-y * 2.4}`);
    };

    window.addEventListener("scroll", scroller, { passive: true });
    window.addEventListener("pointermove", pointer, { passive: true });
    prefersReduced.addEventListener("change", (e) => setReduced(e.matches));
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", scroller);
      window.removeEventListener("pointermove", pointer);
    };
  }, []);

  return (
    <section className="relative isolate overflow-hidden bg-ink text-white" aria-labelledby="hero-title">
      {/* Cinematic background: sky, imagery and gold light, layered for depth */}
      <div ref={sceneRef} className="perspective absolute inset-0" aria-hidden="true">
        <div className="parallax-layer absolute inset-0" style={{ "--depth": "0.35", "--pz": "1" } as React.CSSProperties}>
          <Image
            src={images.hero}
            alt=""
            fill
            priority
            sizes="100vw"
            className="scale-110 object-cover opacity-70"
          />
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_-10%,rgba(198,168,102,0.22),transparent_55%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/80 via-ink/55 to-ink" />
        <div className="animate-glow absolute -left-24 top-24 h-72 w-72 rounded-full bg-gold/25 blur-3xl" />
        <div className="animate-glow absolute right-0 top-1/3 h-80 w-80 rounded-full bg-[#2b6cb0]/25 blur-3xl" style={{ animationDelay: "3s" }} />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-ink to-transparent" />
      </div>

      <div className="relative mx-auto max-w-7xl px-5 pb-20 pt-32 sm:px-8 sm:pb-24 sm:pt-36 lg:pb-28 lg:pt-40">
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
          {/* Copy */}
          <div className="depth-scene" style={{ transformStyle: "preserve-3d" }}>
            <p className="animate-fade-up flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.32em] text-gold">
              <span className="h-px w-10 bg-gold" aria-hidden="true" /> Belagavi · India
            </p>
            <h1
              id="hero-title"
              className="animate-fade-up mt-6 font-serif text-5xl font-medium leading-[1.04] tracking-tight sm:text-6xl"
              style={{ animationDelay: "100ms" }}
            >
              Explore The World With <span className="text-gold-gradient italic">PRITIVO</span>
            </h1>
            <p className="animate-fade-up mt-3 font-serif text-2xl italic text-gold sm:text-3xl" style={{ animationDelay: "150ms" }}>
              Your World. Your Way.
            </p>
            <p
              className="animate-fade-up mt-6 max-w-xl text-base leading-7 text-white sm:text-xl"
              style={{ animationDelay: "190ms" }}
            >
              Cinematic journeys, handpicked stays and tailor-made holidays — planned by real people in Belagavi.
              Search live hotel availability, compare transparent prices, and book as a guest with no account.
            </p>

            <div className="animate-fade-up mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center" style={{ animationDelay: "280ms" }}>
              <Link
                href="/packages"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/40 px-7 py-3.5 font-semibold text-white backdrop-blur-sm transition hover:bg-white hover:text-ink"
              >
                Explore packages <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <a
                href={whatsappLink("Hello PRITIVO! I'd like help planning a trip.")}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-1 py-2 text-sm font-medium text-white/65 underline-offset-4 transition hover:text-gold hover:underline"
              >
                <WhatsAppIcon className="h-4 w-4" aria-hidden="true" /> or WhatsApp {SITE.phoneDisplay}
              </a>
            </div>

            <ul className="animate-fade-up mt-9 flex flex-wrap gap-x-6 gap-y-3 text-xs text-white/65" style={{ animationDelay: "360ms" }}>
              {[
                { icon: ShieldCheck, text: "Transparent written quotes" },
                { icon: Sparkles, text: "24/7 WhatsApp support" },
                { icon: MapPin, text: SITE.location },
              ].map((t) => (
                <li key={t.text} className="flex items-center gap-2">
                  <t.icon className="h-3.5 w-3.5 text-gold" aria-hidden="true" /> {t.text}
                </li>
              ))}
            </ul>
          </div>

          {/* 3D card cluster — CSS-only, hidden on small screens to stay fast */}
          <div className="relative hidden h-[26rem] lg:block" style={{ perspective: "1400px" }} aria-hidden="true">
            <div
              className="hero-tilt absolute inset-0"
              style={{ transformStyle: "preserve-3d" }}
            >
              <div
                className="animate-float-slow absolute left-8 top-2 h-64 w-52 overflow-hidden rounded-[1.75rem] border border-white/25 shadow-[0_40px_80px_-40px_rgba(0,0,0,0.8)]"
                style={{ transform: "translateZ(70px) rotateY(-9deg)" }}
              >
                <Image src={images.cardA} alt="" fill sizes="220px" className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-transparent to-transparent" />
                <div className="absolute inset-x-4 bottom-3">
                  <p className="text-xs uppercase tracking-[0.25em] text-gold">India</p>
                  <p className="font-serif text-xl">Goa</p>
                </div>
              </div>

              <div
                className="animate-float absolute right-4 top-16 h-56 w-44 overflow-hidden rounded-[1.75rem] border border-white/25 shadow-[0_40px_80px_-40px_rgba(0,0,0,0.8)]"
                style={{ transform: "translateZ(120px) rotateY(10deg)", animationDelay: "1.2s" }}
              >
                <Image src={images.cardB} alt="" fill sizes="200px" className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-transparent to-transparent" />
                <div className="absolute inset-x-4 bottom-3">
                  <p className="text-xs uppercase tracking-[0.25em] text-gold">Global</p>
                  <p className="font-serif text-xl">Bali</p>
                </div>
              </div>

              <div
                className="glass absolute bottom-0 left-0 w-[19rem] rounded-3xl p-4"
                style={{ transform: "translateZ(150px) rotateX(4deg)" }}
              >
                <p className="text-xs uppercase tracking-[0.24em] text-gold">Curated for you</p>
                <div className="mt-3 flex items-center gap-3">
                  <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl">
                    <Image src={images.cardC} alt="" fill sizes="48px" className="object-cover" />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate font-medium">Dubai waterfront</span>
                    <span className="block text-xs text-white/65">3 nights · flights · transfers</span>
                  </span>
                </div>
                <p className="mt-3 border-t border-white/15 pt-3 text-xs text-white/65">
                  Sample itinerary — quoted in writing for your dates.
                </p>
              </div>

              <div className="absolute bottom-8 right-0 rounded-2xl border border-gold/40 bg-ink/70 px-4 py-3 backdrop-blur-md" style={{ transform: "translateZ(110px) rotateY(-6deg)" }}>
                <p className="text-xs uppercase tracking-[0.24em] text-white/65">Guest booking</p>
                <p className="font-serif text-xl text-white">No account needed</p>
              </div>
            </div>
          </div>
        </div>

        {/* Glassmorphism booking search */}
        <div id="search" className="animate-fade-up mt-12 scroll-mt-28 sm:mt-14" style={{ animationDelay: "420ms" }}>
          <div className="glass rounded-[1.75rem] p-3 sm:p-4">
            <div className="mb-3 flex flex-wrap gap-1.5" role="tablist" aria-label="Search type">
              {TABS.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  role="tab"
                  aria-selected={tab === t.key}
                  onClick={() => setTab(t.key)}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition sm:text-sm ${
                    tab === t.key ? "bg-white text-ink shadow" : "text-white hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <t.icon className="h-3.5 w-3.5" aria-hidden="true" /> {t.label}
                </button>
              ))}
            </div>

            {tab === "hotels" && <HotelSearchForm initial={initialQuery} variant="hero" />}

            {tab === "packages" && (
              <div className="rounded-2xl bg-white p-5 text-ink">
                <p className="font-serif text-2xl">Holiday packages, tailored to you</p>
                <p className="mt-1 text-sm text-neutral-600">
                  Browse suggested itineraries for Goa, Manali, Dubai, Bali, London and more — every one customisable and
                  quoted in writing.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {["Goa", "Manali", "Dubai", "Bali", "London"].map((c) => (
                    <Link key={c} href={`/packages#${c.toLowerCase()}`} className="rounded-full border border-neutral-200 px-4 py-2 text-sm font-medium hover:border-gold">
                      {c}
                    </Link>
                  ))}
                </div>
                <Link href="/packages" className="mt-4 inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white hover:bg-gold hover:text-ink">
                  View all packages <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            )}

            {tab === "flights" && (
              <div className="rounded-2xl bg-white p-5 text-ink">
                <p className="font-serif text-2xl">Flights, planned with you</p>
                <p className="mt-1 text-sm text-neutral-600">
                  Tell us your route and dates and a PRITIVO planner will source fares and options. We don&apos;t show
                  flight prices until they come from an authorised provider, so nothing here is invented.
                </p>
                <Link href="/flights" className="mt-4 inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white hover:bg-gold hover:text-ink">
                  Request flight options <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            )}
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span className="text-xs uppercase tracking-[0.24em] text-white/65">Trending</span>
            {destinationChips.map((d) => (
              <Link
                key={d.name}
                href={d.href}
                aria-label={`Search hotels in ${d.name}`}
                className="group inline-flex min-h-[36px] items-center gap-1.5 rounded-full border border-white/35 bg-white/10 px-4 py-2 text-xs font-semibold text-white backdrop-blur-sm transition hover:border-gold hover:bg-gold hover:text-ink"
              >
                <MapPin className="h-3.5 w-3.5 text-gold transition group-hover:text-ink" aria-hidden="true" />
                {d.name}
                <ArrowRight className="h-3.5 w-3.5 opacity-70 transition group-hover:translate-x-0.5 group-hover:opacity-100" aria-hidden="true" />
              </Link>
            ))}
          </div>
          {reduced && <p className="sr-only">Animations are reduced based on your device settings.</p>}
        </div>
      </div>
    </section>
  );
}
