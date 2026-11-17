import { CONTINENTS, type TourType } from "./constants";

const TYPES: TourType[] = ["domestic", "international", "special"];

const str = (v: unknown, max = 4000) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const list = (v: unknown, max = 40): string[] => {
  if (Array.isArray(v)) return v.map((x) => str(x, 240)).filter(Boolean).slice(0, max);
  if (typeof v === "string") return v.split("\n").map((x) => x.replace(/^[-•*]\s*/, "").trim()).filter(Boolean).slice(0, max);
  return [];
};

export interface RawTourForm {
  slug?: string;
  name?: string;
  type?: string;
  city?: string;
  country?: string;
  continent?: string;
  summary?: string;
  description?: string;
  durationDays?: unknown;
  durationNights?: unknown;
  priceFromINR?: unknown;
  priceVerified?: unknown;
  heroImage?: string;
  heroImageAlt?: string;
  highlights?: unknown;
  inclusions?: unknown;
  exclusions?: unknown;
  travelTips?: unknown;
  styles?: unknown;
  bestTime?: string;
  published?: unknown;
  featured?: unknown;
  itinerary?: unknown;
}

/** Parses and validates the admin tour form. Shared by create and update. */
export function parseTourForm(body: RawTourForm | Record<string, unknown>) {
  const b = body as RawTourForm;
  const errors: Record<string, string> = {};

  const name = str(b.name, 160);
  if (name.length < 3) errors.name = "Enter the tour name.";

  const slug = str(b.slug, 140).toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
  if (slug && slug.length < 2) errors.slug = "Slug must be at least 2 characters.";

  const type = str(b.type, 20) as TourType;
  if (!TYPES.includes(type)) errors.type = "Choose domestic, international or special.";

  const country = str(b.country, 120);
  if (!country) errors.country = "Country is required.";

  const continent = str(b.continent, 80);
  if (!continent) errors.continent = "Continent is required.";

  const summary = str(b.summary, 400);
  if (summary.length < 20) errors.summary = "Write a summary of at least 20 characters.";

  const days = Number(b.durationDays);
  const nights = Number(b.durationNights);
  if (!Number.isInteger(days) || days < 1 || days > 60) errors.durationDays = "Duration must be 1–60 days.";
  if (!Number.isInteger(nights) || nights < 0 || nights > days) errors.durationNights = "Nights must be between 0 and the number of days.";

  const priceRaw = b.priceFromINR === null || b.priceFromINR === "" || b.priceFromINR === undefined ? null : Number(b.priceFromINR);
  if (priceRaw !== null && (!Number.isFinite(priceRaw) || priceRaw < 0 || priceRaw > 50_000_000)) {
    errors.priceFromINR = "Enter a valid indicative price in INR, or leave it blank.";
  }
  const priceVerified = b.priceVerified === true || b.priceVerified === "true";
  if (priceVerified && priceRaw === null) errors.priceFromINR = "A verified price needs an amount.";

  const heroImage = str(b.heroImage, 500);
  if (!heroImage) errors.heroImage = "Add a hero image URL.";

  const itineraryRaw = Array.isArray(b.itinerary)
    ? b.itinerary
    : typeof b.itinerary === "string"
      ? b.itinerary
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean)
          .map((line, i) => {
            const [title, ...rest] = line.split("|");
            return { day: i + 1, title: (title ?? "").trim(), description: rest.join("|").trim() };
          })
      : [];

  const itinerary = (itineraryRaw as { day?: unknown; title?: unknown; description?: unknown }[])
    .map((d, i) => ({
      day: Number(d.day) || i + 1,
      title: str(d.title, 160),
      description: str(d.description, 1200),
    }))
    .filter((d) => d.title)
    .slice(0, 40);

  const styles = Array.isArray(b.styles)
    ? b.styles.map((s) => str(s, 40).toLowerCase()).filter(Boolean).slice(0, 8)
    : str(b.styles, 300).split(",").map((s) => s.trim().toLowerCase()).filter(Boolean).slice(0, 8);

  const input = {
    slug,
    name,
    type,
    city: str(b.city, 160),
    country,
    continent: CONTINENTS.includes(continent as (typeof CONTINENTS)[number]) ? continent : continent,
    summary,
    description: str(b.description, 4000),
    durationDays: days,
    durationNights: nights,
    priceFromINR: priceRaw === null ? null : Math.round(priceRaw),
    priceVerified,
    heroImage,
    heroImageAlt: str(b.heroImageAlt, 300) || `${name} tour`,
    highlights: list(b.highlights, 12),
    inclusions: list(b.inclusions, 20),
    exclusions: list(b.exclusions, 20),
    travelTips: list(b.travelTips, 12),
    styles,
    bestTime: str(b.bestTime, 160),
    published: b.published !== false && b.published !== "false",
    featured: b.featured === true || b.featured === "true",
    itinerary,
  };

  if (input.highlights.length === 0) errors.highlights = "Add at least one highlight.";
  if (itinerary.length === 0 && input.durationDays > 0) {
    // Itinerary is optional in the editor; the detail page simply omits the section.
  }

  return { input: Object.keys(errors).length ? null : input, errors };
}
