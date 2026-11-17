import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, Clock, MapPin } from "lucide-react";
import { WhatsAppIcon } from "./WhatsAppIcon";
import { formatINR, type TourPackage } from "@/lib/packages";
import { whatsappLink } from "@/lib/site";

export function PackageCard({ pkg, priority = false }: { pkg: TourPackage; priority?: boolean }) {
  const waMsg = `Hello PRITIVO! I'm interested in the ${pkg.name} package (${pkg.duration}). Please share a quotation.`;
  return (
    <article
      id={pkg.slug}
      className="group flex h-full scroll-mt-28 flex-col overflow-hidden rounded-3xl border border-black/5 bg-white shadow-[0_20px_50px_-30px_rgba(0,0,0,0.35)] transition duration-500 hover:-translate-y-1.5 hover:shadow-[0_30px_70px_-30px_rgba(0,0,0,0.45)]"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={pkg.image}
          alt={pkg.imageAlt}
          fill
          priority={priority}
          sizes="(min-width: 1280px) 400px, (min-width: 768px) 50vw, 100vw"
          className="object-cover transition duration-[1.2s] group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-ink backdrop-blur">
          {pkg.region === "domestic" ? "India" : "International"}
        </span>
        <div className="absolute inset-x-5 bottom-4 text-white">
          <p className="flex items-center gap-1.5 text-xs text-white">
            <MapPin className="h-3.5 w-3.5" aria-hidden="true" /> {pkg.location}
          </p>
          <h3 className="mt-1 font-serif text-3xl font-semibold">{pkg.name}</h3>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <p className="flex items-center gap-2 text-sm font-medium text-gold-dark">
          <Clock className="h-4 w-4" aria-hidden="true" /> {pkg.duration}
          <span className="text-xs font-normal text-neutral-500">· suggested</span>
        </p>
        <p className="mt-3 text-sm leading-6 text-neutral-600">{pkg.summary}</p>
        <ul className="mt-4 grid grid-cols-1 gap-2 text-sm text-neutral-600 sm:grid-cols-2">
          {pkg.highlights.map((h) => (
            <li key={h} className="flex items-start gap-2">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden="true" /> {h}
            </li>
          ))}
        </ul>

        <div className="mt-auto pt-6">
          <div className="flex items-end justify-between border-t border-neutral-100 pt-5">
            <div>
              {pkg.verifiedPriceINR ? (
                <>
                  <p className="text-xs uppercase tracking-wider text-neutral-500">Indicative, per person</p>
                  <p className="font-serif text-2xl font-semibold text-ink">{formatINR(pkg.verifiedPriceINR)}</p>
                </>
              ) : (
                <>
                  <p className="text-xs uppercase tracking-wider text-neutral-500">Pricing</p>
                  {/* Real link, so the underline is an honest affordance (issue 5). */}
                  <Link
                    href={`/plan-trip?destination=${encodeURIComponent(pkg.name)}`}
                    className="font-serif text-xl font-semibold text-ink underline decoration-gold/60 underline-offset-4 transition hover:decoration-gold"
                  >
                    Request a Quote
                  </Link>
                </>
              )}
            </div>
            <a
              href={whatsappLink(waMsg)}
              target="_blank"
              rel="noopener noreferrer"
              title={`Ask about ${pkg.name} on WhatsApp`}
              aria-label={`Ask about ${pkg.name} on WhatsApp (opens in a new tab)`}
              className="flex h-11 items-center gap-2 rounded-full border border-neutral-200 px-3 text-[#1da851] transition hover:border-[#25D366] hover:bg-[#25D366] hover:text-white sm:px-3.5"
            >
              <WhatsAppIcon className="h-5 w-5" />
              <span className="hidden text-xs font-semibold sm:inline">WhatsApp</span>
            </a>
          </div>
          <Link
            href={`/plan-trip?destination=${encodeURIComponent(pkg.name)}`}
            className="mt-4 flex items-center justify-center gap-2 rounded-full bg-ink py-3 text-sm font-semibold text-white transition hover:bg-gold hover:text-ink"
          >
            Enquire Now <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  );
}
