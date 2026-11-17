import Image from "next/image";
import type { ReactNode } from "react";

export function PageHero({
  eyebrow,
  title,
  description,
  image,
  imageAlt = "",
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  description?: string;
  image?: string;
  imageAlt?: string;
  children?: ReactNode;
}) {
  return (
    <section className="relative isolate overflow-hidden bg-ink pb-20 pt-36 text-white sm:pb-24 sm:pt-40">
      {image && (
        <>
          <Image src={image} alt={imageAlt} fill priority sizes="100vw" className="animate-slow-zoom object-cover opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-b from-ink/85 via-ink/60 to-ink" />
        </>
      )}
      {/* Depth accents */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(90%_70%_at_50%_-20%,rgba(198,168,102,0.25),transparent_60%)]" aria-hidden="true" />
      <div className="animate-glow pointer-events-none absolute -left-24 top-10 h-64 w-64 rounded-full bg-gold/20 blur-3xl" aria-hidden="true" />
      <div className="animate-glow pointer-events-none absolute -right-16 top-24 h-72 w-72 rounded-full bg-[#2b6cb0]/25 blur-3xl" style={{ animationDelay: "4s" }} aria-hidden="true" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.6) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage: "radial-gradient(70% 60% at 50% 30%, black, transparent)",
          WebkitMaskImage: "radial-gradient(70% 60% at 50% 30%, black, transparent)",
        }}
        aria-hidden="true"
      />
      <div className="relative mx-auto max-w-5xl px-5 text-center sm:px-8">
        <p className="eyebrow animate-fade-up text-gold">{eyebrow}</p>
        <h1 className="animate-fade-up mt-5 font-serif text-4xl font-medium leading-[1.08] sm:text-6xl" style={{ animationDelay: "120ms" }}>
          {title}
        </h1>
        {description && (
          <p className="animate-fade-up mx-auto mt-6 max-w-2xl text-base leading-7 text-white sm:text-xl" style={{ animationDelay: "240ms" }}>
            {description}
          </p>
        )}
        {children && (
          <div className="animate-fade-up mt-8" style={{ animationDelay: "360ms" }}>
            {children}
          </div>
        )}
      </div>
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  dark = false,
}: {
  eyebrow: string;
  title: ReactNode;
  description?: string;
  align?: "center" | "left";
  dark?: boolean;
}) {
  return (
    <div className={align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <p className={`eyebrow flex items-center gap-3 ${align === "center" ? "justify-center" : ""} ${dark ? "text-gold" : "text-gold-dark"}`}>
        <span className="h-px w-6 bg-gold/70" aria-hidden="true" /> {eyebrow}
      </p>
      <h2 className={`mt-4 font-serif text-4xl font-medium leading-tight sm:text-5xl ${dark ? "text-white" : "text-ink"}`}>{title}</h2>
      {description && <p className={`mt-5 leading-7 ${dark ? "text-white/65" : "text-neutral-600"}`}>{description}</p>}
    </div>
  );
}
