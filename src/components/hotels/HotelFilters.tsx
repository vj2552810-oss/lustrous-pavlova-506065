"use client";

import { Filter, RotateCcw, SlidersHorizontal } from "lucide-react";
import { useState } from "react";

export interface HotelFilterState {
  maxTotal: number | null;
  minStars: number;
  amenities: string[];
  freeCancellationOnly: boolean;
  breakfastOnly: boolean;
}

export const EMPTY_FILTERS: HotelFilterState = {
  maxTotal: null,
  minStars: 0,
  amenities: [],
  freeCancellationOnly: false,
  breakfastOnly: false,
};

export function filterCount(f: HotelFilterState) {
  return (
    (f.maxTotal !== null ? 1 : 0) + (f.minStars > 0 ? 1 : 0) + f.amenities.length + (f.freeCancellationOnly ? 1 : 0) + (f.breakfastOnly ? 1 : 0)
  );
}

export function HotelFilters({
  value,
  onChange,
  priceCeiling,
  amenities,
  resultCount,
  totalCount,
}: {
  value: HotelFilterState;
  onChange: (next: HotelFilterState) => void;
  priceCeiling: number;
  amenities: string[];
  resultCount: number;
  totalCount: number;
}) {
  const [open, setOpen] = useState(false);
  const activeCount = filterCount(value);
  const set = <K extends keyof HotelFilterState>(key: K, next: HotelFilterState[K]) => onChange({ ...value, [key]: next });
  const toggleAmenity = (name: string) =>
    onChange({ ...value, amenities: value.amenities.includes(name) ? value.amenities.filter((a) => a !== name) : [...value.amenities, name] });

  return (
    <div className="rounded-3xl border border-black/5 bg-white p-4 shadow-[0_20px_50px_-40px_rgba(7,22,41,0.5)] sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls="hotel-filters"
          className="inline-flex items-center gap-2 rounded-full border border-neutral-200 px-4 py-2 text-sm font-semibold text-ink transition hover:border-gold"
        >
          <SlidersHorizontal className="h-4 w-4 text-gold-dark" aria-hidden="true" /> Filters
          {activeCount > 0 && <span className="rounded-full bg-gold px-2 py-0.5 text-xs font-bold text-ink">{activeCount}</span>}
        </button>
        <p className="text-xs text-neutral-500" aria-live="polite">
          Showing <strong className="text-ink">{resultCount}</strong> of {totalCount} stays
        </p>
        {activeCount > 0 && (
          <button type="button" onClick={() => onChange(EMPTY_FILTERS)} className="inline-flex items-center gap-1.5 text-xs font-medium text-gold-dark hover:underline">
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" /> Reset filters
          </button>
        )}
      </div>

      <div id="hotel-filters" className={`${open ? "mt-4 block" : "hidden"} border-t border-neutral-100 pt-4`}>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label htmlFor="filter-price" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-neutral-500">
              Max total price
            </label>
            <input
              id="filter-price"
              type="range"
              min={0}
              max={Math.max(priceCeiling, 1)}
              step={10000}
              value={value.maxTotal ?? Math.max(priceCeiling, 1)}
              onChange={(e) => {
                const n = Number(e.target.value);
                set("maxTotal", n >= priceCeiling ? null : n);
              }}
              className="w-full accent-[#c6a866]"
            />
            <p className="mt-1 text-xs text-neutral-500">
              {value.maxTotal === null ? "Any price" : `Up to ₹${Math.round(value.maxTotal / 100).toLocaleString("en-IN")}`}
            </p>
          </div>

          <div>
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-neutral-500">Star rating</span>
            <div className="flex flex-wrap gap-1.5">
              {[0, 3, 4, 5].map((stars) => (
                <button
                  key={stars}
                  type="button"
                  aria-pressed={value.minStars === stars}
                  onClick={() => set("minStars", stars)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${value.minStars === stars ? "border-ink bg-ink text-white" : "border-neutral-200 hover:border-gold"}`}
                >
                  {stars === 0 ? "Any" : `${stars}+`}
                </button>
              ))}
            </div>
          </div>

          <div className="sm:col-span-2">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-neutral-500">Room &amp; stay options</span>
            <div className="flex flex-wrap gap-3">
              <label className="inline-flex items-center gap-2 text-sm text-neutral-600">
                <input type="checkbox" checked={value.freeCancellationOnly} onChange={(e) => set("freeCancellationOnly", e.target.checked)} className="h-4 w-4 accent-[#c6a866]" />
                Free cancellation
              </label>
              <label className="inline-flex items-center gap-2 text-sm text-neutral-600">
                <input type="checkbox" checked={value.breakfastOnly} onChange={(e) => set("breakfastOnly", e.target.checked)} className="h-4 w-4 accent-[#c6a866]" />
                Breakfast included
              </label>
            </div>
          </div>

          {amenities.length > 0 && (
            <div className="sm:col-span-2 lg:col-span-4">
              <span className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                <Filter className="h-3.5 w-3.5" aria-hidden="true" /> Amenities
              </span>
              <div className="flex flex-wrap gap-2">
                {amenities.map((a) => {
                  const active = value.amenities.includes(a);
                  return (
                    <button
                      key={a}
                      type="button"
                      aria-pressed={active}
                      onClick={() => toggleAmenity(a)}
                      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${active ? "border-gold bg-champagne/60 text-ink" : "border-neutral-200 text-neutral-600 hover:border-gold"}`}
                    >
                      {a}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function applyHotelFilters<T extends { starRating: number; amenities: string[]; rooms: { totalMinor: number; breakfastIncluded: boolean; cancellation: { refundable: boolean } }[] }>(
  hotels: T[],
  filters: HotelFilterState,
): T[] {
  return hotels.filter((h) => {
    if (filters.minStars > 0 && h.starRating < filters.minStars) return false;
    if (filters.amenities.length && !filters.amenities.every((a) => h.amenities.includes(a))) return false;

    let rooms = h.rooms;
    if (filters.freeCancellationOnly) rooms = rooms.filter((r) => r.cancellation.refundable);
    if (filters.breakfastOnly) rooms = rooms.filter((r) => r.breakfastIncluded);
    if (filters.maxTotal !== null) rooms = rooms.filter((r) => r.totalMinor <= filters.maxTotal!);
    if (rooms.length === 0) return false;
    return true;
  });
}
