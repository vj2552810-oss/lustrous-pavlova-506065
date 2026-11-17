import Link from "next/link";
import { useId } from "react";

export function LogoMark({ className = "h-10 w-10" }: { className?: string }) {
  // The logo renders more than once per page (desktop + mobile menu), so the
  // gradient id must be unique to keep the DOM valid and avoid console warnings.
  const uid = useId().replace(/:/g, "");
  const gradientId = `pv-gold-${uid}`;
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true" fill="none">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#F1E2B8" />
          <stop offset="0.5" stopColor="#C6A866" />
          <stop offset="1" stopColor="#9A7A3C" />
        </linearGradient>
      </defs>
      <circle cx="24" cy="24" r="22.5" stroke={`url(#${gradientId})`} strokeWidth="1.2" />
      <circle cx="24" cy="24" r="18.5" stroke={`url(#${gradientId})`} strokeWidth="0.5" strokeDasharray="1 2.4" opacity="0.7" />
      {/* Monogram P — stem is a journey line, bowl is a horizon arc */}
      <path d="M18 35V13h7.5a7 7 0 0 1 0 14H18" stroke={`url(#${gradientId})`} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      {/* Compass star */}
      <path d="M34 9.5l1.2 3.3 3.3 1.2-3.3 1.2-1.2 3.3-1.2-3.3-3.3-1.2 3.3-1.2z" fill={`url(#${gradientId})`} />
      <path d="M14 38.5c6 2.6 14 2.6 20 0" stroke={`url(#${gradientId})`} strokeWidth="0.9" strokeLinecap="round" opacity="0.8" />
    </svg>
  );
}

export function Logo({
  light = true,
  className = "",
  compactBelow,
}: {
  light?: boolean;
  className?: string;
  /** Hide the tagline below this breakpoint so a full navbar fits on one row. */
  compactBelow?: "lg" | "xl" | "2xl";
}) {
  const taglineHidden =
    compactBelow === "lg" ? "hidden lg:block" : compactBelow === "xl" ? "hidden xl:block" : compactBelow === "2xl" ? "hidden 2xl:block" : "";
  const markSize = compactBelow ? "h-9 w-9 xl:h-10 xl:w-10" : "h-10 w-10";
  const wordSize = compactBelow ? "text-xl xl:text-2xl" : "text-2xl";

  return (
    <Link
      href="/"
      className={`group inline-flex items-center gap-2.5 xl:gap-3 ${className}`}
      aria-label="PRITIVO — home"
    >
      <LogoMark className={`${markSize} transition-transform duration-500 group-hover:rotate-[8deg]`} />
      <span className="flex flex-col leading-none">
        <span className={`font-serif font-semibold tracking-[0.24em] xl:tracking-[0.28em] ${wordSize} ${light ? "text-white" : "text-ink"}`}>
          PRITIVO
        </span>
        <span className={`mt-1 text-xs font-medium tracking-[0.08em] text-gold ${taglineHidden}`}>
          Your World. Your Way.
        </span>
      </span>
    </Link>
  );
}
