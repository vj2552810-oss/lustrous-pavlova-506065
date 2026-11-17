import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays, Clock, MapPin, MessageSquareQuote } from "lucide-react";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { whatsappLink } from "@/lib/site";
import { formatINR } from "@/lib/packages";
import { STYLE_LABELS, type TravelStyle } from "@/lib/tours/constants";
import type { TourRecord } from "@/lib/tours/service";

export function TourPrice({ tour, className = "" }: { tour: Pick<TourRecord, "priceVerified" | "priceFromINR">; className?: string }) {
  if (tour.priceVerified && tour.priceFromINR) {
    return (
      <div className={className}>
        <p className="text-xs uppercase tracking-wider text-neutral-500">From, per person</p>
        <p className="font-serif text-2xl font-semibold text-ink">{formatINR(tour.priceFromINR)}</p>
      </div>
    );
  }
  return (
    <div className={className}>
      <p className="text-xs uppercase tracking-wider text-neutral-500">Pricing</p>
      <p className="flex items-center gap-1.5 font-serif text-xl font-semibold text-ink">
        <MessageSquareQuote className="h-4 w-4 text-gold-dark" aria-hidden="true" /> Request a Quote
      </p>
    </div>
  );
}

export function TourCard({ tour, priority = false }: { tour: TourRecord; priority?: boolean }) {
  return (
    <article className="card-3d group flex h-full flex-col overflow-hidden rounded-3xl border border-black/5 bg-white shadow-[0_24px_60px_-45px_rgba(7,22,41,0.5)]">
      <Link href={`/tours/${tour.slug}`} className="relative block aspect-[16/10] overflow-hidden">
        <Image
          src={tour.heroImage}
          alt={tour.heroImageAlt || `${tour.name} tour`}
          fill
          priority={priority}
          sizes="(min-width:1280px) 400px, (min-width:768px) 50vw, 100vw"
          className="object-cover transition duration-[1.1s] group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/15 to-transparent" />
        <div className="absolute left-4 top-4 flex flex-wrap gap-1.5">
          <span className="rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-ink backdrop-blur">
            {tour.type === "domestic" ? "India" : tour.type === "international" ? "International" : "Special"}
          </span>
          {tour.featured && <span className="rounded-full bg-gold px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-ink">Featured</span>}
        </div>
        <div className="absolute inset-x-5 bottom-4 text-white">
          <p className="flex items-center gap-1.5 text-xs text-white">
            <MapPin className="h-3 w-3" aria-hidden="true" /> {tour.city ? `${tour.city} · ` : ""}{tour.country}
          </p>
          <h3 className="mt-1 font-serif text-2xl font-semibold leading-tight">{tour.name}</h3>
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium text-gold-dark">
          <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" aria-hidden="true" /> {tour.durationDays}D / {tour.durationNights}N</span>
          {tour.bestTime && <span className="inline-flex items-center gap-1 text-neutral-500"><CalendarDays className="h-3.5 w-3.5" aria-hidden="true" /> {tour.bestTime.split(";")[0]}</span>}
        </p>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-neutral-600">{tour.summary}</p>
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {tour.styles.slice(0, 3).map((s) => (
            <li key={s} className="rounded-full bg-sand px-2.5 py-1 text-xs font-medium text-neutral-600">
              {STYLE_LABELS[s as TravelStyle] ?? s}
            </li>
          ))}
        </ul>
        <div className="mt-auto border-t border-neutral-100 pt-4">
          <div className="flex items-end justify-between gap-3">
            <TourPrice tour={tour} />
            <a
              href={whatsappLink(`Hello PRITIVO! I'd like a quote for the ${tour.name} tour (${tour.durationDays}D/${tour.durationNights}N).`)}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Enquire about ${tour.name} on WhatsApp`}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-neutral-200 text-[#1da851] transition hover:border-[#25D366] hover:bg-[#25D366] hover:text-white"
            >
              <WhatsAppIcon className="h-4 w-4" />
            </a>
          </div>
          <div className="mt-3 flex gap-2">
            <Link
              href={`/tours/${tour.slug}`}
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full border border-neutral-200 px-4 py-2.5 text-xs font-semibold text-ink transition hover:border-gold"
              aria-label={`View ${tour.name} itinerary`}
            >
              View tour <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
            <Link
              href={`/tours/${tour.slug}#enquire`}
              className="bg-gold-gradient inline-flex flex-1 items-center justify-center gap-1.5 rounded-full px-4 py-2.5 text-xs font-semibold text-ink transition hover:brightness-110"
              aria-label={`Enquire about ${tour.name}`}
            >
              <MessageSquareQuote className="h-3.5 w-3.5" aria-hidden="true" /> Enquire
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
