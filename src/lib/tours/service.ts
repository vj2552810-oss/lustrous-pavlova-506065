import "server-only";
import { and, asc, count, desc, eq, ilike, or, sql } from "drizzle-orm";
import { db } from "@/db";
import { enquiries, tours } from "@/db/schema";
import { SEED_TOURS, type TourType } from "./catalog";

export type TourRecord = typeof tours.$inferSelect;
export type EnquiryRecord = typeof enquiries.$inferSelect;

export interface TourFilters {
  q?: string;
  type?: TourType | "all";
  country?: string;
  continent?: string;
  style?: string;
  duration?: string;
  budget?: string;
}

const globalForSeed = globalThis as typeof globalThis & { __pritivoToursSeeded?: Promise<void> };

/**
 * Idempotent seed so a fresh database (or a new deployment) always has the tour
 * catalogue without a manual script. Existing rows are never overwritten — admin
 * edits survive.
 */
export function ensureToursSeeded(): Promise<void> {
  if (!globalForSeed.__pritivoToursSeeded) {
    globalForSeed.__pritivoToursSeeded = (async () => {
      // Insert any catalogue slug that is missing, without touching existing rows
      // (staff edits and unpublish flags survive). Safe to run on every boot.
      const existing = await db.select({ slug: tours.slug }).from(tours);
      const have = new Set(existing.map((r) => r.slug));
      const missing = SEED_TOURS.filter((t) => !have.has(t.slug));
      if (missing.length > 0) {
        await db.insert(tours).values(missing).onConflictDoNothing({ target: tours.slug });
      }
    })().catch((err) => {
      console.error("Tour seeding failed", err instanceof Error ? err.message : "");
      globalForSeed.__pritivoToursSeeded = undefined;
    });
  }
  return globalForSeed.__pritivoToursSeeded;
}

const DURATION_BANDS: Record<string, [number, number]> = {
  short: [1, 4],
  mid: [5, 7],
  long: [8, 10],
  expedition: [11, 60],
};

const BUDGET_BANDS: Record<string, [number, number]> = {
  "under-30k": [0, 30000],
  "30-60k": [30000, 60000],
  "60k-1l": [60000, 100000],
  "1l-plus": [100000, 10000000],
};

export async function listTours(filters: TourFilters, opts: { includeDrafts?: boolean } = {}) {
  await ensureToursSeeded();

  const clauses = [];
  if (!opts.includeDrafts) clauses.push(eq(tours.published, true));
  if (filters.type && filters.type !== "all") clauses.push(eq(tours.type, filters.type));
  if (filters.country) clauses.push(eq(tours.country, filters.country));
  if (filters.continent) clauses.push(eq(tours.continent, filters.continent));

  const q = filters.q?.trim();
  if (q) {
    const like = `%${q}%`;
    clauses.push(
      or(
        ilike(tours.name, like),
        ilike(tours.city, like),
        ilike(tours.country, like),
        ilike(tours.continent, like),
        ilike(tours.summary, like),
        sql`${tours.styles}::text ILIKE ${like}`,
      )!,
    );
  }

  if (filters.style) {
    clauses.push(sql`${tours.styles} @> ${JSON.stringify([filters.style])}::jsonb`);
  }

  if (filters.duration && DURATION_BANDS[filters.duration]) {
    const [min, max] = DURATION_BANDS[filters.duration];
    clauses.push(sql`${tours.durationDays} BETWEEN ${min} AND ${max}`);
  }

  if (filters.budget && BUDGET_BANDS[filters.budget]) {
    const [min, max] = BUDGET_BANDS[filters.budget];
    // Only verified prices can be matched against a budget; tours awaiting a quote stay visible.
    clauses.push(
      or(
        and(eq(tours.priceVerified, true), sql`${tours.priceFromINR} BETWEEN ${min} AND ${max}`)!,
        sql`${tours.priceFromINR} IS NULL OR ${tours.priceVerified} = false`,
      )!,
    );
  }

  return db
    .select()
    .from(tours)
    .where(clauses.length ? and(...clauses) : undefined)
    .orderBy(desc(tours.featured), asc(tours.sortOrder), asc(tours.name));
}

export async function getTourBySlug(slug: string, includeDrafts = false) {
  await ensureToursSeeded();
  const clauses = [eq(tours.slug, slug)];
  if (!includeDrafts) clauses.push(eq(tours.published, true));
  const rows = await db.select().from(tours).where(and(...clauses)).limit(1);
  return rows[0] ?? null;
}

export async function getTourById(id: number) {
  const rows = await db.select().from(tours).where(eq(tours.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function relatedTours(tour: TourRecord, limit = 3) {
  await ensureToursSeeded();
  return db
    .select()
    .from(tours)
    .where(and(eq(tours.published, true), eq(tours.type, tour.type), sql`${tours.id} <> ${tour.id}`))
    .orderBy(desc(tours.featured), asc(tours.sortOrder))
    .limit(limit);
}

export async function tourFacets() {
  await ensureToursSeeded();
  const rows = await db
    .select({ country: tours.country, continent: tours.continent, type: tours.type })
    .from(tours)
    .where(eq(tours.published, true));
  const countries = Array.from(new Set(rows.map((r) => r.country))).sort();
  const continents = Array.from(new Set(rows.map((r) => r.continent))).sort();
  const totals = { domestic: 0, international: 0, special: 0 } as Record<string, number>;
  rows.forEach((r) => {
    totals[r.type] = (totals[r.type] ?? 0) + 1;
  });
  return { countries, continents, totals, total: rows.length };
}

export interface TourInput {
  slug: string;
  name: string;
  type: TourType;
  city: string;
  country: string;
  continent: string;
  summary: string;
  description: string;
  durationDays: number;
  durationNights: number;
  priceFromINR: number | null;
  priceVerified: boolean;
  heroImage: string;
  heroImageAlt: string;
  highlights: string[];
  inclusions: string[];
  exclusions: string[];
  travelTips: string[];
  styles: string[];
  bestTime: string;
  published: boolean;
  featured: boolean;
  itinerary?: { day: number; title: string; description: string }[];
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 120);
}

export async function createTour(input: TourInput) {
  const rows = await db
    .insert(tours)
    .values({ ...input, updatedAt: new Date() })
    .returning();
  return rows[0];
}

export async function updateTour(id: number, input: Partial<TourInput>) {
  const rows = await db
    .update(tours)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(tours.id, id))
    .returning();
  return rows[0] ?? null;
}

export async function deleteTour(id: number) {
  await db.delete(tours).where(eq(tours.id, id));
}

/* ------------------------------- enquiries -------------------------------- */

export async function listEnquiries(status?: string) {
  const clauses = status && status !== "all" ? [eq(enquiries.status, status)] : [];
  return db
    .select()
    .from(enquiries)
    .where(clauses.length ? and(...clauses) : undefined)
    .orderBy(desc(enquiries.createdAt))
    .limit(200);
}

export async function updateEnquiry(id: number, patch: { status?: string; adminNote?: string }) {
  const rows = await db.update(enquiries).set(patch).where(eq(enquiries.id, id)).returning();
  return rows[0] ?? null;
}

export async function enquiryStats() {
  const rows = await db.select({ status: enquiries.status, value: count() }).from(enquiries).groupBy(enquiries.status);
  const byStatus: Record<string, number> = {};
  rows.forEach((r) => {
    byStatus[r.status] = Number(r.value);
  });
  return byStatus;
}

export async function tourStats() {
  await ensureToursSeeded();
  const rows = await db
    .select({ type: tours.type, published: tours.published, value: count() })
    .from(tours)
    .groupBy(tours.type, tours.published);
  return rows.map((r) => ({ type: r.type, published: r.published, value: Number(r.value) }));
}
