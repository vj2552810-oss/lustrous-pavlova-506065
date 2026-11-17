import { NextResponse } from "next/server";
import { mapsIntegrationState } from "@/lib/maps/config";
import { placesConfigured } from "@/lib/maps/places";
import { NO_STORE } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

/** Public map configuration status. Booleans only — never key values. */
export async function GET() {
  const maps = mapsIntegrationState();
  const problems: string[] = [];
  if (!maps.browserKeyConfigured) {
    problems.push("NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is missing, so no interactive map is drawn. Directions links still work.");
  }
  if (!placesConfigured()) {
    problems.push("GOOGLE_MAPS_SERVER_API_KEY is missing, so nearby attractions/restaurants/airports are not shown.");
  }

  return NextResponse.json(
    {
      maps: {
        browserKeyConfigured: maps.browserKeyConfigured,
        serverKeyConfigured: maps.serverKeyConfigured,
        placesConfigured: placesConfigured(),
      },
      dataSources: {
        mapTilesAndPlaces: "Google Maps Platform",
        hotelPricesAndAvailability: "hotel provider (never Google Maps)",
      },
      problems,
    },
    { headers: NO_STORE },
  );
}
