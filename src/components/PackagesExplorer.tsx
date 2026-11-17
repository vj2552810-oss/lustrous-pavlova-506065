"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Compass, Search, X } from "lucide-react";
import { PackageCard } from "./PackageCard";
import { PACKAGES, THEME_LABELS, type Region, type Theme } from "@/lib/packages";

type RegionFilter = "all" | Region;

export function PackagesExplorer({
  initialQuery = "",
  initialRegion = "all",
}: {
  initialQuery?: string;
  initialRegion?: RegionFilter;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [region, setRegion] = useState<RegionFilter>(initialRegion);
  const [theme, setTheme] = useState<Theme | "all">("all");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return PACKAGES.filter((p) => {
      if (region !== "all" && p.region !== region) return false;
      if (theme !== "all" && !p.themes.includes(theme)) return false;
      if (!q) return true;
      const hay = [p.name, p.location, p.summary, ...p.highlights, ...p.bestFor, ...p.themes].join(" ").toLowerCase();
      return hay.includes(q);
    });
  }, [query, region, theme]);

  const reset = () => {
    setQuery("");
    setRegion("all");
    setTheme("all");
  };
  const filtered = query || region !== "all" || theme !== "all";

  const chip = (active: boolean) =>
    `rounded-full border px-4 py-2 text-sm font-medium transition ${
      active ? "border-ink bg-ink text-white" : "border-neutral-200 bg-white text-neutral-600 hover:border-gold hover:text-ink"
    }`;

  return (
    <div>
      <div className="relative z-10 -mt-12 rounded-3xl border border-black/5 bg-white p-5 shadow-[0_30px_60px_-35px_rgba(0,0,0,0.4)] sm:p-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-500" aria-hidden="true" />
            <label htmlFor="pkg-search" className="sr-only">
              Search destinations
            </label>
            <input
              id="pkg-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search destination, experience or traveller type — e.g. honeymoon, snow, beach"
              className="w-full rounded-full border border-neutral-200 bg-ivory py-3.5 pl-12 pr-11 text-sm focus:border-gold focus:outline-none focus:ring-4 focus:ring-gold/15"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-ink"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <div role="group" aria-label="Filter by region" className="flex flex-wrap gap-2">
            {(["all", "domestic", "international"] as RegionFilter[]).map((r) => (
              <button key={r} type="button" aria-pressed={region === r} onClick={() => setRegion(r)} className={chip(region === r)}>
                {r === "all" ? "All" : r === "domestic" ? "India" : "International"}
              </button>
            ))}
          </div>
        </div>
        <div role="group" aria-label="Filter by experience" className="mt-5 flex flex-wrap gap-2 border-t border-neutral-100 pt-5">
          <button type="button" aria-pressed={theme === "all"} onClick={() => setTheme("all")} className={chip(theme === "all")}>
            All experiences
          </button>
          {(Object.keys(THEME_LABELS) as Theme[]).map((t) => (
            <button key={t} type="button" aria-pressed={theme === t} onClick={() => setTheme(t)} className={chip(theme === t)}>
              {THEME_LABELS[t]}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-10 flex items-center justify-between text-sm text-neutral-600" aria-live="polite">
        <p>
          Showing <strong className="text-ink">{results.length}</strong> of {PACKAGES.length} destinations
        </p>
        {filtered && (
          <button type="button" onClick={reset} className="font-medium text-gold-dark underline-offset-4 hover:underline">
            Reset filters
          </button>
        )}
      </div>

      {results.length > 0 ? (
        <ul className="mt-6 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {results.map((p, i) => (
            <li key={p.slug}>
              <PackageCard pkg={p} priority={i < 3} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-8 flex flex-col items-center rounded-3xl border border-dashed border-neutral-300 bg-white px-6 py-16 text-center">
          <Compass className="h-12 w-12 text-gold" aria-hidden="true" />
          <h3 className="mt-4 font-serif text-3xl">No matching packages — yet</h3>
          <p className="mt-3 max-w-md text-neutral-600">
            We plan custom trips to many more places than listed here. Tell us where you want to go and we&apos;ll build it for you.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button type="button" onClick={reset} className="rounded-full border border-neutral-300 px-5 py-2.5 text-sm font-medium hover:border-ink">
              Clear filters
            </button>
            <Link
              href={`/plan-trip${query ? `?destination=${encodeURIComponent(query)}` : ""}`}
              className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white hover:bg-gold hover:text-ink"
            >
              Plan a custom trip{query ? ` to “${query}”` : ""}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
