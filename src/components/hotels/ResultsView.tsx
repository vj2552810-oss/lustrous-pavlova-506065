"use client";

import { useMemo, useState } from "react";
import { Info, List, Map as MapIcon, SearchX } from "lucide-react";
import { HotelCard } from "./HotelCard";
import { EMPTY_FILTERS, HotelFilters, applyHotelFilters, type HotelFilterState } from "./HotelFilters";
import { MapCanvas, type MapMarker } from "@/components/maps/MapCanvas";
import { formatMoney } from "@/lib/hotels/format";
import { isValidLatLng } from "@/lib/maps/config";
import type { HotelResult, HotelSearchQuery } from "@/lib/hotels/types";

interface Props {
  hotels: HotelResult[];
  query: HotelSearchQuery;
  destinationCentre: { name: string; lat: number; lng: number } | null;
}

export function ResultsView({ hotels, query, destinationCentre }: Props) {
  const [view, setView] = useState<"list" | "map">("list");
  const [filters, setFilters] = useState<HotelFilterState>(EMPTY_FILTERS);

  const amenityOptions = useMemo(
    () => Array.from(new Set(hotels.flatMap((h) => h.amenities))).slice(0, 10),
    [hotels],
  );
  const priceCeiling = useMemo(
    () => Math.max(100000, ...hotels.flatMap((h) => h.rooms.map((r) => r.totalMinor))),
    [hotels],
  );
  const visible = useMemo(() => applyHotelFilters(hotels, filters), [hotels, filters]);

  const params = new URLSearchParams({
    checkIn: query.checkIn,
    checkOut: query.checkOut,
    guests: String(query.guests),
    rooms: String(query.rooms),
  });

  const verifiedMarkers: MapMarker[] = visible
    .filter((h) => h.location.verified && isValidLatLng(h.location.lat, h.location.lng))
    .map((h) => {
      const cheapest = h.rooms[0];
      return {
        id: h.id,
        lat: h.location.lat as number,
        lng: h.location.lng as number,
        title: h.name,
        subtitle: h.location.address ?? `${h.area ? h.area + ", " : ""}${h.city}`,
        priceLabel: cheapest ? `${formatMoney(cheapest.totalMinor, cheapest.currency)} total · ${formatMoney(cheapest.nightlyPriceMinor, cheapest.currency)}/night` : undefined,
        href: `/hotels/${h.id}?${params.toString()}`,
        verified: true,
        kind: "hotel" as const,
      };
    });

  const unverifiedCount = visible.length - verifiedMarkers.length;
  const areaMarker: MapMarker[] =
    verifiedMarkers.length === 0 && destinationCentre
      ? [{
          id: "area-centre",
          lat: destinationCentre.lat,
          lng: destinationCentre.lng,
          title: `${destinationCentre.name} — approximate area`,
          subtitle: "City-centre reference. Individual hotel addresses are not verified, so we don't pin them.",
          verified: false,
          kind: "area" as const,
        }]
      : [];

  return (
    <div>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-full border border-neutral-200 bg-white p-1" role="tablist" aria-label="Results view">
          <button
            type="button"
            role="tab"
            aria-selected={view === "list"}
            onClick={() => setView("list")}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${view === "list" ? "bg-ink text-white" : "text-neutral-600 hover:text-ink"}`}
          >
            <List className="h-4 w-4" aria-hidden="true" /> List view
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={view === "map"}
            onClick={() => setView("map")}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${view === "map" ? "bg-ink text-white" : "text-neutral-600 hover:text-ink"}`}
          >
            <MapIcon className="h-4 w-4" aria-hidden="true" /> Map view
          </button>
        </div>
        <p className="text-xs text-neutral-500">Both views use the same dates, guests and rooms from your search.</p>
      </div>

      <div className="mt-4">
        <HotelFilters
          value={filters}
          onChange={setFilters}
          priceCeiling={priceCeiling}
          amenities={amenityOptions}
          resultCount={visible.length}
          totalCount={hotels.length}
        />
      </div>

      {visible.length === 0 && (
        <div className="mt-5 flex flex-col items-center rounded-3xl border border-dashed border-neutral-300 bg-white px-6 py-12 text-center">
          <SearchX className="h-10 w-10 text-gold" aria-hidden="true" />
          <h3 className="mt-3 font-serif text-2xl">No stays match these filters</h3>
          <p className="mt-2 max-w-md text-sm text-neutral-600">
            Try widening your price range, removing an amenity, or searching different dates.
          </p>
          <button
            type="button"
            onClick={() => setFilters(EMPTY_FILTERS)}
            className="mt-5 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white hover:bg-gold hover:text-ink"
          >
            Clear all filters
          </button>
        </div>
      )}

      {visible.length === 0 ? null : view === "map" ? (
        <div className="mt-5 space-y-5">
          <MapCanvas
            markers={[...verifiedMarkers, ...areaMarker]}
            center={verifiedMarkers[0] ?? (destinationCentre ? { lat: destinationCentre.lat, lng: destinationCentre.lng } : null)}
            zoom={verifiedMarkers.length > 1 ? 12 : 13}
            height={420}
            ariaLabel={`Map of hotels in ${query.destination}`}
            fallbackHint="Add a Google Maps browser key to show hotel markers. Meanwhile, use the list view for full details."
          />

          {(unverifiedCount > 0) && (
            <div className="flex items-start gap-3 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950">
              <Info className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" aria-hidden="true" />
              <p>
                {verifiedMarkers.length === 0
                  ? "None of these properties have verified coordinates, so no hotel pins are shown — only the destination area. "
                  : `${unverifiedCount} of ${visible.length} properties have no verified coordinates and are not pinned. `}
                Verified hotel locations come from our hotel partner; we never guess a hotel&apos;s position.
              </p>
            </div>
          )}

          <ul className="space-y-3">
            {verifiedMarkers.map((m) => {
              const hotel = visible.find((h) => h.id === m.id);
              if (!hotel) return null;
              return (
                <li key={m.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-black/5 bg-white px-5 py-4">
                  <div>
                    <p className="font-medium text-ink">{hotel.name}</p>
                    <p className="text-xs text-neutral-500">{m.subtitle}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="text-sm font-semibold text-ink">{m.priceLabel?.split(" · ")[0]}</p>
                    <a href={m.href} className="rounded-full bg-ink px-4 py-2 text-xs font-semibold text-white hover:bg-gold hover:text-ink">
                      View details
                    </a>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      ) : (
        <ul className="mt-6 space-y-6">
          {hotels.map((hotel) => (
            <li key={hotel.id}>
              <HotelCard hotel={hotel} query={query} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
