"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { RotateCcw, Search, SlidersHorizontal } from "lucide-react";
import { BUDGET_BANDS, DURATION_BANDS, STYLE_LABELS, TOUR_TYPE_LABELS, type TourType } from "@/lib/tours/constants";

export interface ActiveFilters {
  q: string;
  type: TourType | "all";
  country: string;
  continent: string;
  style: string;
  duration: string;
  budget: string;
}

export const EMPTY_FILTERS: ActiveFilters = { q: "", type: "all", country: "", continent: "", style: "", duration: "", budget: "" };

export function activeFilterCount(f: ActiveFilters) {
  return [f.type !== "all", f.country, f.continent, f.style, f.duration, f.budget, f.q].filter(Boolean).length;
}

export function TourFilters({
  value,
  countries,
  continents,
  total,
  shown,
}: {
  value: ActiveFilters;
  countries: string[];
  continents: string[];
  total: number;
  shown: number;
}) {
  const router = useRouter();
  const [form, setForm] = useState<ActiveFilters>(value);
  const count = activeFilterCount(value);

  function push(next: ActiveFilters) {
    const params = new URLSearchParams();
    Object.entries(next).forEach(([k, v]) => {
      if (v && v !== "all") params.set(k, String(v));
    });
    router.push(`/tours${params.toString() ? `?${params}` : ""}#results`);
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    push(form);
  }

  const select =
    "w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm text-ink focus:border-gold focus:outline-none focus:ring-4 focus:ring-gold/15";
  const label = "mb-1.5 block text-xs font-semibold uppercase tracking-wider text-neutral-500";

  return (
    <div className="rounded-3xl border border-black/5 bg-white p-5 shadow-[0_24px_60px_-45px_rgba(7,22,41,0.5)] sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="flex items-center gap-2 text-sm font-semibold text-ink">
          <SlidersHorizontal className="h-4 w-4 text-gold-dark" aria-hidden="true" /> Find your tour
          {count > 0 && <span className="rounded-full bg-gold px-2 py-0.5 text-xs font-bold text-ink">{count}</span>}
        </p>
        <p className="text-xs text-neutral-500" aria-live="polite">
          Showing <strong className="text-ink">{shown}</strong> of {total} tours
        </p>
      </div>

      <form onSubmit={onSubmit} className="mt-4 grid gap-4 lg:grid-cols-12" role="search" aria-label="Filter tours">
        <div className="lg:col-span-4">
          <label htmlFor="tour-q" className={label}>Destination, country or style</label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" aria-hidden="true" />
            <input
              id="tour-q"
              value={form.q}
              onChange={(e) => setForm((f) => ({ ...f, q: e.target.value }))}
              placeholder="e.g. Iceland, honeymoon, Kashmir"
              className={`${select} pl-9`}
            />
          </div>
        </div>

        <div className="sm:col-span-2 lg:col-span-2">
          <label htmlFor="tour-type" className={label}>Collection</label>
          <select id="tour-type" value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as ActiveFilters["type"] }))} className={select}>
            <option value="all">All tours</option>
            {(Object.keys(TOUR_TYPE_LABELS) as TourType[]).map((t) => (
              <option key={t} value={t}>{TOUR_TYPE_LABELS[t]}</option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2 lg:col-span-2">
          <label htmlFor="tour-country" className={label}>Country</label>
          <select id="tour-country" value={form.country} onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))} className={select}>
            <option value="">Any country</option>
            {countries.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="sm:col-span-2 lg:col-span-2">
          <label htmlFor="tour-continent" className={label}>Continent</label>
          <select id="tour-continent" value={form.continent} onChange={(e) => setForm((f) => ({ ...f, continent: e.target.value }))} className={select}>
            <option value="">Anywhere</option>
            {continents.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="sm:col-span-2 lg:col-span-2">
          <label htmlFor="tour-style" className={label}>Travel style</label>
          <select id="tour-style" value={form.style} onChange={(e) => setForm((f) => ({ ...f, style: e.target.value }))} className={select}>
            <option value="">Any style</option>
            {Object.entries(STYLE_LABELS).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
          </select>
        </div>

        <div className="sm:col-span-2 lg:col-span-3">
          <label htmlFor="tour-duration" className={label}>Duration</label>
          <select id="tour-duration" value={form.duration} onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))} className={select}>
            <option value="">Any duration</option>
            {DURATION_BANDS.map((b) => <option key={b.key} value={b.key}>{b.label}</option>)}
          </select>
        </div>

        <div className="sm:col-span-2 lg:col-span-3">
          <label htmlFor="tour-budget" className={label}>Budget preference</label>
          <select id="tour-budget" value={form.budget} onChange={(e) => setForm((f) => ({ ...f, budget: e.target.value }))} className={select}>
            <option value="">Any budget</option>
            {BUDGET_BANDS.map((b) => <option key={b.key} value={b.key}>{b.label}</option>)}
          </select>
        </div>

        <div className="flex items-end gap-2 lg:col-span-6">
          <button type="submit" className="bg-gold-gradient inline-flex flex-1 items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-ink transition hover:brightness-110 sm:flex-none">
            <Search className="h-4 w-4" aria-hidden="true" /> Show tours
          </button>
          {count > 0 && (
            <button
              type="button"
              onClick={() => { setForm(EMPTY_FILTERS); push(EMPTY_FILTERS); }}
              className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 px-4 py-3 text-sm font-medium text-neutral-600 hover:border-gold"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" /> Reset
            </button>
          )}
        </div>
      </form>
      <p className="mt-3 text-xs leading-5 text-neutral-500">
        Budget filters apply to tours with a verified price. Tours marked <strong>Request a Quote</strong> stay visible
        because their price is confirmed in writing — we never guess a price to fill the space.
      </p>
    </div>
  );
}
