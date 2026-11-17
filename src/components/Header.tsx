"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRight, Menu, Phone, X } from "lucide-react";
import { Logo } from "./Logo";
import { NAV_LINKS, SITE, telLink } from "@/lib/site";

/**
 * Premium navbar.
 *
 * Breakpoints (fixed: the nav used to be hidden below 1280px, which made the
 * Tours link unreachable on most laptop windows):
 *  - < 1024px  hamburger menu (all links, closes on selection)
 *  - ≥ 1024px  full nav in a single row, compact type, phone number hidden
 *  - ≥ 1536px  phone number shown alongside the gold CTA
 * The row never wraps: items are nowrap, the logo tagline collapses, and the
 * phone number is dropped first when space is tight.
 */
export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the mobile menu on navigation and on Escape; lock body scroll while open.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
  const solid = scrolled || open;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        solid
          ? "bg-ink/95 shadow-[0_10px_40px_-20px_rgba(0,0,0,0.8)] backdrop-blur-md"
          : "bg-gradient-to-b from-black/65 to-transparent"
      }`}
    >
      <div
        className={`mx-auto flex max-w-[1400px] flex-nowrap items-center justify-between gap-3 px-4 transition-all duration-500 sm:px-6 lg:px-8 ${
          solid ? "py-2.5" : "py-4"
        }`}
      >
        {/* Logo — left */}
        <div className="shrink-0">
          <Logo compactBelow="xl" />
        </div>

        {/* Primary navigation — single row from lg upward */}
        <nav aria-label="Primary" className="hidden min-w-0 flex-1 justify-center lg:block">
          <ul className="flex flex-nowrap items-center justify-center gap-0.5 xl:gap-1">
            {NAV_LINKS.map((l) => {
              const active = isActive(l.href);
              return (
                <li key={l.href} className="shrink-0">
                  <Link
                    href={l.href}
                    aria-current={active ? "page" : undefined}
                    className={`group relative block whitespace-nowrap rounded-full px-2 py-2 text-[0.8125rem] font-medium tracking-wide transition-colors duration-200 xl:px-2.5 ${
                      active ? "text-gold" : "text-white hover:text-white"
                    }`}
                  >
                    {l.label}
                    {/* Active indicator + hover underline */}
                    <span
                      aria-hidden="true"
                      className={`absolute inset-x-2 bottom-1 h-px origin-left bg-gold transition-transform duration-300 xl:inset-x-3 ${
                        active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                      }`}
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Right cluster — phone (xl+) and gold CTA */}
        <div className="flex shrink-0 items-center gap-2 xl:gap-3">
          <a
            href={telLink}
            className="hidden items-center gap-2 whitespace-nowrap text-[0.8125rem] text-white transition-colors hover:text-gold 2xl:inline-flex"
          >
            <Phone className="h-3.5 w-3.5 text-gold" aria-hidden="true" />
            <span className="sr-only">Call </span>
            {SITE.phoneDisplay}
          </a>
          <Link
            href="/plan-trip"
            className="bg-gold-gradient hidden whitespace-nowrap items-center gap-1.5 rounded-full px-3.5 py-2 text-[0.8125rem] font-semibold text-ink shadow-lg shadow-gold/20 transition hover:brightness-110 sm:inline-flex xl:px-5 xl:py-2.5 xl:text-sm"
          >
            Plan Your Trip <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>

          {/* Hamburger — below lg */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="rounded-full border border-white/20 p-2.5 text-white transition hover:border-gold/60 hover:text-gold lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        id="mobile-menu"
        className={`overflow-hidden border-t border-white/10 bg-ink transition-[max-height,opacity] duration-500 lg:hidden ${
          open ? "max-h-[calc(100dvh-64px)] overflow-y-auto opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <nav aria-label="Mobile" className="px-4 pb-8 pt-4 sm:px-6">
          <ul className="grid grid-cols-2 gap-x-3 gap-y-1">
            {NAV_LINKS.map((l) => {
              const active = isActive(l.href);
              return (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    onClick={() => setOpen(false)}
                    aria-current={active ? "page" : undefined}
                    tabIndex={open ? 0 : -1}
                    className={`flex items-center justify-between gap-2 rounded-2xl px-3 py-3 font-serif text-xl transition ${
                      active ? "bg-white/10 text-gold" : "text-white hover:bg-white/5"
                    }`}
                  >
                    {l.label}
                    {active && <span className="h-1.5 w-1.5 rounded-full bg-gold" aria-hidden="true" />}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="mt-5 grid gap-2.5">
            <Link
              href="/plan-trip"
              onClick={() => setOpen(false)}
              tabIndex={open ? 0 : -1}
              className="bg-gold-gradient flex items-center justify-center gap-2 rounded-full py-3.5 text-center text-sm font-semibold text-ink"
            >
              Plan Your Trip <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <a
              href={telLink}
              tabIndex={open ? 0 : -1}
              className="flex items-center justify-center gap-2 rounded-full border border-white/20 py-3.5 text-sm text-white"
            >
              <Phone className="h-4 w-4 text-gold" aria-hidden="true" /> Call {SITE.phoneDisplay}
            </a>
          </div>
        </nav>
      </div>
    </header>
  );
}
