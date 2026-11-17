import { NextResponse } from "next/server";
import { nearbyPlaces, placesConfigured, type PlaceCategory } from "@/lib/maps/places";
import { isValidLatLng } from "@/lib/maps/config";
import { clientIp, NO_STORE, rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const CATEGORIES: PlaceCategory[] = ["attraction", "restaurant", "airport", "transit"];

/** Server-side proxy: the Google Places key never reaches the browser. */
export async function GET(req: Request) {
  const limit = rateLimit(`places:${clientIp(req)}`, 30, 10 * 60_000);
  if (!limit.allowed) {
    return NextResponse.json({ configured: placesConfigured(), results: [], error: "Too many requests. Please wait a moment." }, { status: 429, headers: NO_STORE });
  }

  const url = new URL(req.url);
  const lat = Number(url.searchParams.get("lat"));
  const lng = Number(url.searchParams.get("lng"));
  const categoryParam = url.searchParams.get("category") ?? "attraction";

  if (!isValidLatLng(lat, lng)) {
    return NextResponse.json({ configured: placesConfigured(), results: [], error: "No verified coordinates were supplied." }, { status: 422, headers: NO_STORE });
  }
  const category = (CATEGORIES as string[]).includes(categoryParam) ? (categoryParam as PlaceCategory) : "attraction";

  const result = await nearbyPlaces({ lat, lng, category });
  return NextResponse.json(result, { status: result.error && result.configured && result.results.length === 0 ? 502 : 200, headers: NO_STORE });
}
