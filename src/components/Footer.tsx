import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { Logo } from "./Logo";
import { WhatsAppIcon } from "./WhatsAppIcon";
import { HOTEL_LINKS, LEGAL_LINKS, NAV_LINKS, SITE, TOUR_LINKS, mailtoLink, telLink, whatsappLink } from "@/lib/site";

const POPULAR = [
  { name: "Goa", href: "/packages#goa" },
  { name: "Manali", href: "/packages#manali" },
  { name: "London", href: "/packages#london" },
  { name: "Dubai", href: "/packages#dubai" },
  { name: "Bali", href: "/packages#bali" },
];

export function Footer() {
  const socials = Object.entries(SITE.social).filter(([, url]) => url);
  return (
    <footer className="relative overflow-hidden bg-ink text-white/65">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/70 to-transparent" aria-hidden="true" />
      <div className="pointer-events-none absolute -top-40 left-1/2 h-80 w-[60rem] -translate-x-1/2 rounded-full bg-gold/10 blur-3xl" aria-hidden="true" />

      <div className="relative mx-auto max-w-7xl px-5 pt-16 sm:px-8">
        <div className="grid gap-8 py-12 sm:grid-cols-2 lg:grid-cols-12">
          <div className="lg:col-span-3">
            <Logo />
            <p className="mt-5 max-w-sm text-sm leading-7">
              An online travel agency from Belagavi, Karnataka — guest hotel booking with no account needed, plus
              personalised holidays across India and around the world.
            </p>
            <a href={telLink} className="mt-5 inline-flex items-center gap-2 text-sm text-white transition hover:text-gold">
              <Phone className="h-4 w-4 text-gold" aria-hidden="true" /> {SITE.phoneDisplay}
            </a>
            {socials.length > 0 && (
              <ul className="mt-5 flex gap-4 text-sm">
                {socials.map(([name, url]) => (
                  <li key={name}>
                    <a href={url} target="_blank" rel="noopener noreferrer" className="capitalize hover:text-gold">{name}</a>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="lg:col-span-2">
            <h2 className="eyebrow text-gold">Explore</h2>
            <ul className="mt-5 space-y-2.5 text-sm">
              {/* "Plan a Trip" is omitted here: the header CTA and the page-level
                  CTA already carry that action (avoids a third duplicate). */}
              {NAV_LINKS.filter((l) => l.href !== "/plan-trip").map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="transition hover:text-white">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h2 className="eyebrow text-gold">Tours</h2>
            <ul className="mt-5 space-y-2.5 text-sm">
              {TOUR_LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="transition hover:text-white">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h2 className="eyebrow text-gold">Bookings</h2>
            <ul className="mt-5 space-y-2.5 text-sm">
              {HOTEL_LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="transition hover:text-white">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-1">
            <h2 className="eyebrow text-gold">Popular</h2>
            <ul className="mt-5 space-y-2.5 text-sm">
              {POPULAR.map((p) => (
                <li key={p.name}>
                  <Link href={p.href} className="transition hover:text-white">{p.name}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h2 className="eyebrow text-gold">Contact</h2>
            <ul className="mt-5 space-y-3 text-sm">
              <li>
                <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="flex items-start gap-2.5 hover:text-white">
                  <WhatsAppIcon className="mt-0.5 h-4 w-4 shrink-0 text-gold" /> WhatsApp
                </a>
              </li>
              <li>
                <a href={mailtoLink("Travel enquiry")} className="flex items-start gap-2.5 break-all hover:text-white">
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden="true" /> {SITE.email}
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden="true" /> {SITE.location}
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-white/10 py-8 text-xs md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} PRITIVO. All rights reserved. Destination photography via Pexels.</p>
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {LEGAL_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-white">{l.label}</Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
