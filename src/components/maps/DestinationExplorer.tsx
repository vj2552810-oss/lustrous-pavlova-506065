"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ExternalLink, Info, MapPin, Navigation } from "lucide-react";
import { MapCanvas, type MapMarker } from "./MapCanvas";
import { directionsUrl } from "@/lib/maps/config";
import { todayISO } from "@/lib/hotels/format";
import type { Destination } from "@/lib/maps/destinations";

const REGIONS = ["All", "India", "International"] as const;

export function DestinationExplorer({ destinations, nearbyAvailable }: { destinations: Destination[]; nearbyAvailable: boolean }) {
  const [region, setRegion] = useState<(typeof REGIONS)[number]>("All");
  const [selectedSlug, setSelectedSlug] = useState(destinations[0]?.slug ?? "");

  const filtered = useMemo(
    () => (region === "All" ? destinations : destinations.filter((d) => d.region === region)),
    [destinations, region],
  );
  const selected = destinations.find((d) => d.slug === selectedSlug) ?? filtered[0] ?? null;

  const markers: MapMarker[] = filtered.map((d) => ({
    id: d.slug,
    lat: d.lat,
    lng: d.lng,
    title: d.name,
    subtitle: `${d.region} · ${d.referencePoint} (approximate city centre)`,
    verified: false,
    kind: "destination",
  }));

  const checkIn = todayISO(7);
  const checkOut = todayISO(10);
  const hotelHref = (d: Destination) =>
    `/hotels?destination=${encodeURIComponent(d.hotelQuery)}&checkIn=${checkIn}&checkOut=${checkOut}&guests=2&rooms=1`;

  return (
    <div className="grid gap-8 lg:grid-cols-12">
      <div className="lg:col-span-7">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter destinations by region">
          {REGIONS.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRegion(r)}
              aria-pressed={region === r}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                region === r ? "border-ink bg-ink text-white" : "border-neutral-200 bg-white text-neutral-600 hover:border-gold"
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        <div className="mt-5">
          <MapCanvas
            markers={markers}
            center={selected ? { lat: selected.lat, lng: selected.lng } : null}
            zoom={selected && filtered.length === 1 ? 11 : 4}
            height={420}
            ariaLabel="Map of PRITIVO destinations"
            fallbackHint="Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to explore destinations on an interactive map."
          />
        </div>

        <p className="mt-3 flex items-start gap-2 rounded-2xl bg-ivory px-4 py-3 text-xs leading-5 text-neutral-600">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold-dark" aria-hidden="true" />
          Pins mark each destination&apos;s approximate city centre so you can orient yourself. They are not hotel
          locations — exact hotel addresses and prices always come from our hotel partner.{" "}
          {nearbyAvailable ? "Nearby places are loaded from Google Places when you open a hotel." : "Enable the Places API to add verified nearby attractions."}
        </p>

        <ul className="mt-6 grid gap-4 sm:grid-cols-2">
          {filtered.map((d) => (
            <li key={d.slug}>
              <button
                type="button"
                onClick={() => setSelectedSlug(d.slug)}
                aria-pressed={selected?.slug === d.slug}
                className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition ${
                  selected?.slug === d.slug ? "border-gold bg-champagne/40" : "border-black/5 bg-white hover:border-gold/60"
                }`}
              >
                <span className="relative h-14 w-16 shrink-0 overflow-hidden rounded-xl">
                  <Image src={d.image} alt={d.imageAlt} fill sizes="64px" className="object-cover" />
                </span>
                <span className="min-w-0">
                  <span className="block font-medium text-ink">{d.name}</span>
                  <span className="block truncate text-xs text-neutral-500">{d.region} · {d.bestFor.join(" · ")}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <aside className="lg:col-span-5">
        {selected ? (
          <div className="overflow-hidden rounded-3xl border border-black/5 bg-white lg:sticky lg:top-24">
            <div className="relative h-44">
              <Image src={selected.image} alt={selected.imageAlt} fill sizes="(min-width:1024px) 420px, 100vw" className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <div className="absolute inset-x-5 bottom-4 text-white">
                <p className="text-xs uppercase tracking-[0.25em] text-gold">{selected.region}</p>
                <h3 className="font-serif text-3xl">{selected.name}</h3>
              </div>
            </div>
            <div className="p-6">
              <p className="text-sm leading-6 text-neutral-600">{selected.blurb}</p>
              <p className="mt-3 flex items-start gap-2 text-xs text-neutral-500">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold" aria-hidden="true" />
                {selected.referencePoint} · approximate city centre
              </p>
              <div className="mt-5 flex flex-col gap-2">
                <Link href={hotelHref(selected)} className="inline-flex items-center justify-between gap-2 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-gold hover:text-ink">
                  Search hotels in {selected.name} <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <a
                  href={directionsUrl({ lat: selected.lat, lng: selected.lng })}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-neutral-300 px-5 py-3 text-sm font-semibold hover:border-gold"
                >
                  <Navigation className="h-4 w-4" aria-hidden="true" /> Directions to {selected.name}
                </a>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selected.name)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-neutral-200 px-5 py-2.5 text-xs font-medium text-neutral-600 hover:border-gold"
                >
                  Explore on Google Maps <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              </div>
              <p className="mt-4 text-xs leading-5 text-neutral-500">
                Hotel availability and prices for {selected.name} are checked with our hotel provider — not with Google
                Maps.
              </p>
            </div>
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-neutral-300 bg-white p-8 text-center text-sm text-neutral-500">
            Select a destination to see hotel results.
          </div>
        )}
      </aside>
    </div>
  );
}
