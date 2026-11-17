import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BedDouble, Coffee, MapPin, MapPinOff, ShieldCheck, Star, Users } from "lucide-react";
import { formatMoney, formatStayDateShort } from "@/lib/hotels/format";
import type { HotelResult, HotelSearchQuery } from "@/lib/hotels/types";

export function HotelCard({ hotel, query }: { hotel: HotelResult; query: HotelSearchQuery }) {
  const cheapest = hotel.rooms[0];
  const params = new URLSearchParams({
    checkIn: query.checkIn,
    checkOut: query.checkOut,
    guests: String(query.guests),
    rooms: String(query.rooms),
  });
  const href = `/hotels/${hotel.id}?${params.toString()}`;

  return (
    <article className="overflow-hidden rounded-3xl border border-black/5 bg-white shadow-[0_24px_60px_-40px_rgba(0,0,0,0.4)] transition hover:-translate-y-1 hover:shadow-[0_32px_70px_-40px_rgba(0,0,0,0.45)]">
      <div className="grid lg:grid-cols-[320px_1fr]">
        <div className="relative h-52 lg:h-full">
          <Image
            src={hotel.image}
            alt={hotel.imageAlt}
            fill
            sizes="(min-width:1024px) 320px, 100vw"
            className="object-cover"
          />
          {hotel.starRating > 0 && (
            <span className="absolute left-4 top-4 flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-ink">
              <Star className="h-3.5 w-3.5 fill-gold text-gold" aria-hidden="true" /> {hotel.starRating}-star
            </span>
          )}
        </div>

        <div className="flex flex-col p-6 sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="font-serif text-2xl font-semibold text-ink">{hotel.name}</h3>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-neutral-500">
                <MapPin className="h-4 w-4 text-gold" aria-hidden="true" /> {hotel.area ? `${hotel.area}, ` : ""}
                {hotel.city}, {hotel.country}
              </p>
              <p className={`mt-1 flex items-center gap-1.5 text-xs ${hotel.location.verified ? "text-emerald-700" : "text-neutral-500"}`}>
                {hotel.location.verified ? (
                  <><MapPin className="h-3.5 w-3.5" aria-hidden="true" /> Verified map location</>
                ) : (
                  <><MapPinOff className="h-3.5 w-3.5" aria-hidden="true" /> Map location not verified</>
                )}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase tracking-wider text-neutral-500">From</p>
              <p className="font-serif text-2xl font-semibold text-ink">{cheapest ? formatMoney(cheapest.nightlyPriceMinor) : "—"}</p>
              <p className="text-xs text-neutral-500">per room / night</p>
            </div>
          </div>

          <p className="mt-3 line-clamp-2 text-sm leading-6 text-neutral-600">{hotel.description}</p>

          <ul className="mt-4 flex flex-wrap gap-2">
            {hotel.amenities.slice(0, 5).map((a) => (
              <li key={a} className="rounded-full bg-sand px-3 py-1 text-xs text-neutral-600">{a}</li>
            ))}
          </ul>

          <div className="mt-5 space-y-2">
            {hotel.rooms.slice(0, 2).map((room) => (
              <div key={room.id} className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-neutral-100 bg-ivory/60 px-4 py-3">
                <div className="min-w-0">
                  <p className="flex items-center gap-2 text-sm font-medium text-ink">
                    <BedDouble className="h-4 w-4 text-gold" aria-hidden="true" /> {room.name}
                    <span className="text-xs font-normal text-neutral-500">{room.bedType}</span>
                  </p>
                  <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-500">
                    <span className="inline-flex items-center gap-1"><Users className="h-3.5 w-3.5" aria-hidden="true" /> up to {room.maxGuestsPerRoom}/room</span>
                    <span className={`inline-flex items-center gap-1 ${room.cancellation.refundable ? "text-emerald-700" : "text-neutral-500"}`}>
                      <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" /> {room.cancellation.label}
                    </span>
                    {room.breakfastIncluded && <span className="inline-flex items-center gap-1 text-emerald-700"><Coffee className="h-3.5 w-3.5" aria-hidden="true" /> Breakfast</span>}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-ink">{formatMoney(room.totalMinor)}</p>
                  <p className="text-xs text-neutral-500">total for stay, incl. taxes</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-5">
            <p className="text-xs text-neutral-500">
              {query.guests} guest{query.guests > 1 ? "s" : ""} · {query.rooms} room{query.rooms > 1 ? "s" : ""} ·{" "}
              {formatStayDateShort(query.checkIn)} → {formatStayDateShort(query.checkOut)}
            </p>
            <Link href={href} className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gold hover:text-ink">
              View rooms <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
