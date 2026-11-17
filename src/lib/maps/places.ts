import "server-only";
import { isValidLatLng } from "./config";

/**
 * Nearby places come exclusively from the Google Places API. When the server key
 * is missing we return `configured: false` and the UI says so — no place names or
 * "walking distance" claims are ever generated locally.
 */

export type PlaceCategory = "attraction" | "restaurant" | "airport" | "transit";

export interface NearbyPlace {
  id: string;
  name: string;
  category: PlaceCategory;
  lat: number;
  lng: number;
  address: string | null;
  rating: number | null;
  userRatingsTotal: number | null;
  openNow: boolean | null;
  priceLevel: number | null;
  source: "google_places";
}

export interface NearbyResult {
  configured: boolean;
  results: NearbyPlace[];
  error?: string;
  attribution?: string;
}

const CATEGORY_QUERY: Record<PlaceCategory, { type: string; keyword?: string }> = {
  attraction: { type: "tourist_attraction" },
  restaurant: { type: "restaurant" },
  airport: { type: "airport" },
  transit: { type: "transit_station" },
};

interface CacheEntry {
  at: number;
  data: NearbyResult;
}
const globalForPlaces = globalThis as typeof globalThis & { __pritivoPlacesCache?: Map<string, CacheEntry> };
const cache = (globalForPlaces.__pritivoPlacesCache ??= new Map());
const TTL_MS = 6 * 60 * 60 * 1000;

import { envValue } from "@/lib/env";

function serverKey() {
  return envValue("GOOGLE_MAPS_SERVER_API_KEY") ?? "";
}

export function placesConfigured() {
  return serverKey().trim().length > 0;
}

interface RawPlace {
  place_id?: string;
  name?: string;
  vicinity?: string;
  rating?: number;
  user_ratings_total?: number;
  price_level?: number;
  opening_hours?: { open_now?: boolean };
  geometry?: { location?: { lat?: number; lng?: number } };
  types?: string[];
}

function mapCategory(types: string[] | undefined, fallback: PlaceCategory): PlaceCategory {
  if (!types) return fallback;
  if (types.some((t) => t.includes("airport"))) return "airport";
  if (types.some((t) => t.includes("transit") || t.includes("bus") || t.includes("train") || t.includes("subway"))) return "transit";
  if (types.some((t) => t.includes("restaurant") || t.includes("cafe") || t.includes("food"))) return "restaurant";
  if (types.some((t) => t.includes("tourist") || t.includes("museum") || t.includes("park"))) return "attraction";
  return fallback;
}

export async function nearbyPlaces(params: { lat: number; lng: number; category: PlaceCategory; radiusMeters?: number }): Promise<NearbyResult> {
  if (!placesConfigured()) {
    return {
      configured: false,
      results: [],
      error: "Nearby places require the Google Places API. Add GOOGLE_MAPS_SERVER_API_KEY to show live attractions, restaurants and transport.",
    };
  }
  if (!isValidLatLng(params.lat, params.lng)) {
    return { configured: true, results: [], error: "No verified coordinates are available for this location." };
  }

  const radius = Math.min(Math.max(params.radiusMeters ?? 3000, 500), 10_000);
  const key = `${params.lat.toFixed(4)},${params.lng.toFixed(4)}|${params.category}|${radius}`;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < TTL_MS) return hit.data;

  const q = CATEGORY_QUERY[params.category];
  const url = new URL("https://maps.googleapis.com/maps/api/place/nearbysearch/json");
  url.searchParams.set("location", `${params.lat},${params.lng}`);
  url.searchParams.set("radius", String(radius));
  url.searchParams.set("type", q.type);
  if (q.keyword) url.searchParams.set("keyword", q.keyword);
  url.searchParams.set("key", serverKey());

  try {
    const res = await fetch(url, { cache: "no-store" });
    const json = (await res.json()) as { status?: string; results?: RawPlace[]; error_message?: string };
    if (json.status && json.status !== "OK" && json.status !== "ZERO_RESULTS") {
      console.error("Places API error", json.status, json.error_message);
      const data: NearbyResult = {
        configured: true,
        results: [],
        error:
          json.status === "REQUEST_DENIED"
            ? "Google Places rejected the request. Enable “Places API” and check the server key's API restrictions."
            : "Nearby places are unavailable right now.",
      };
      return data;
    }

    const results: NearbyPlace[] = (json.results ?? [])
      .filter((p) => isFinite(p.geometry?.location?.lat ?? NaN) && isFinite(p.geometry?.location?.lng ?? NaN))
      .slice(0, 12)
      .map((p) => ({
        id: p.place_id ?? `${p.name}-${p.geometry?.location?.lat}-${p.geometry?.location?.lng}`,
        name: p.name ?? "Unnamed place",
        category: mapCategory(p.types, params.category),
        lat: p.geometry?.location?.lat as number,
        lng: p.geometry?.location?.lng as number,
        address: p.vicinity ?? null,
        rating: typeof p.rating === "number" ? p.rating : null,
        userRatingsTotal: typeof p.user_ratings_total === "number" ? p.user_ratings_total : null,
        openNow: p.opening_hours?.open_now ?? null,
        priceLevel: typeof p.price_level === "number" ? p.price_level : null,
        source: "google_places",
      }));

    const data: NearbyResult = { configured: true, results, attribution: "Nearby places © Google" };
    cache.set(key, { at: Date.now(), data });
    return data;
  } catch (err) {
    console.error("Places request failed", err);
    return { configured: true, results: [], error: "We couldn't load nearby places. Please try again later." };
  }
}
