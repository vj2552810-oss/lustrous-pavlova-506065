"use client";

import { useState } from "react";
import { Compass, ExternalLink, Info, Loader2, MapPin, Navigation } from "lucide-react";
import { MapCanvas, type MapMarker } from "./MapCanvas";
import { directionsUrl, isValidLatLng } from "@/lib/maps/config";

interface NearbyPlace {
  id: string;
  name: string;
  category: string;
  lat: number;
  lng: number;
  address: string | null;
  rating: number | null;
  source: string;
}

type Category = "attraction" | "restaurant" | "airport" | "transit";

const CATEGORIES: { key: Category; label: string }[] = [
  { key: "attraction", label: "Attractions" },
  { key: "restaurant", label: "Restaurants" },
  { key: "airport", label: "Airports" },
  { key: "transit", label: "Transport" },
];

export function HotelMapPanel({
  hotelName,
  hotelArea,
  hotelCity,
  location,
  destinationCentre,
  nearbyAvailable,
}: {
  hotelName: string;
  hotelArea: string;
  hotelCity: string;
  location: { address: string | null; lat: number | null; lng: number | null; verified: boolean; note?: string };
  destinationCentre: { name: string; lat: number; lng: number } | null;
  nearbyAvailable: boolean;
}) {
  const verified = location.verified && isValidLatLng(location.lat, location.lng);
  const centre = verified
    ? { lat: location.lat as number, lng: location.lng as number }
    : destinationCentre
      ? { lat: destinationCentre.lat, lng: destinationCentre.lng }
      : null;

  const [category, setCategory] = useState<Category>("attraction");
  const [places, setPlaces] = useState<NearbyPlace[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [nearbyError, setNearbyError] = useState("");
  const [loadedOnce, setLoadedOnce] = useState(false);

  const baseMarkers: MapMarker[] = verified
    ? [{
        id: "hotel",
        lat: location.lat as number,
        lng: location.lng as number,
        title: hotelName,
        subtitle: location.address ?? `${hotelArea ? hotelArea + ", " : ""}${hotelCity}`,
        verified: true,
        kind: "hotel",
      }]
    : destinationCentre
      ? [{
          id: "area",
          lat: destinationCentre.lat,
          lng: destinationCentre.lng,
          title: `${hotelArea || hotelCity} — approximate area`,
          subtitle: `${hotelName}: exact hotel coordinates are not verified, so this pin marks the area only.`,
          verified: false,
          kind: "area",
        }]
      : [];

  const placeMarkers: MapMarker[] = places
    .filter((p) => selected.includes(p.id) && isValidLatLng(p.lat, p.lng))
    .map((p) => ({
      id: p.id,
      lat: p.lat,
      lng: p.lng,
      title: p.name,
      subtitle: p.address ?? undefined,
      verified: true,
      kind: "attraction" as const,
    }));

  async function loadNearby(next: Category) {
    setCategory(next);
    setNearbyError("");
    if (!centre) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/places/nearby?lat=${centre.lat}&lng=${centre.lng}&category=${next}`);
      const json = await res.json();
      if (!json.configured) {
        setPlaces([]);
        setNearbyError(json.error ?? "Nearby places are not configured.");
      } else if (!res.ok || json.error) {
        setPlaces([]);
        setNearbyError(json.error ?? "Nearby places are unavailable right now.");
      } else {
        setPlaces(json.results ?? []);
        setSelected([]);
        if ((json.results ?? []).length === 0) setNearbyError("No places of this type were found close to this location.");
      }
    } catch {
      setNearbyError("We couldn't load nearby places. Please try again.");
    }
    setLoading(false);
    setLoadedOnce(true);
  }

  const listingCentre = verified ? "the hotel" : "the destination centre";
  const directions = verified
    ? directionsUrl({ lat: location.lat, lng: location.lng })
    : directionsUrl({ query: `${hotelArea ? hotelArea + ", " : ""}${hotelCity}` });

  return (
    <section aria-labelledby="map-title" className="rounded-3xl border border-black/5 bg-white p-6 sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="map-title" className="flex items-center gap-2 font-serif text-2xl">
            <MapPin className="h-5 w-5 text-gold" aria-hidden="true" /> Location &amp; map
          </h2>
          <p className="mt-1 text-sm text-neutral-500">
            {location.address ?? (verified ? `${hotelArea ? hotelArea + ", " : ""}${hotelCity}` : `${hotelArea ? hotelArea + ", " : ""}${hotelCity}`)}
          </p>
        </div>
        <a
          href={directions}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gold hover:text-ink"
        >
          <Navigation className="h-4 w-4" aria-hidden="true" /> Get directions
        </a>
      </div>

      {!verified && (
        <div className="mt-4 flex items-start gap-3 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" aria-hidden="true" />
          <p className="leading-6">
            <strong>Approximate area only.</strong> We don&apos;t have a verified street address or coordinates for this
            property, so the map shows the {hotelArea || hotelCity} area instead of a hotel pin.{" "}
            {location.note ?? "Exact coordinates appear once our hotel partner supplies them."}
          </p>
        </div>
      )}

      <div className="mt-4">
        <MapCanvas
          markers={[...baseMarkers, ...placeMarkers]}
          center={centre}
          zoom={verified ? 15 : 12}
          height={340}
          ariaLabel={`Map location for ${hotelName}`}
          fallbackHint="Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to show the interactive map; the directions link above still works."
        />
      </div>

      <div className="mt-5 border-t border-neutral-100 pt-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-ink">
            <Compass className="h-4 w-4 text-gold" aria-hidden="true" /> Explore nearby
          </h3>
          <p className="text-xs text-neutral-500">
            {verified ? "Around the hotel" : `Around ${listingCentre} (not the hotel)`} · Google Places
          </p>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c.key}
              type="button"
              onClick={() => loadNearby(c.key)}
              disabled={loading || !centre || !nearbyAvailable}
              aria-pressed={category === c.key && loadedOnce}
              className={`rounded-full border px-3.5 py-2 text-xs font-medium transition disabled:opacity-50 ${
                loadedOnce && category === c.key ? "border-ink bg-ink text-white" : "border-neutral-200 hover:border-gold"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {!nearbyAvailable && (
          <p className="mt-3 rounded-2xl bg-ivory px-4 py-3 text-xs leading-5 text-neutral-600">
            Nearby place data isn&apos;t available yet, so we don&apos;t list attractions, restaurants, airports or transport
            here — we never invent place names or distances. Ask us on WhatsApp and we&apos;ll tell you what&apos;s close to
            your hotel.
          </p>
        )}

        {loading && (
          <p className="mt-3 flex items-center gap-2 text-sm text-neutral-500">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Checking nearby places…
          </p>
        )}
        {nearbyError && !loading && (
          <p role="status" className="mt-3 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-900">
            {nearbyError}
          </p>
        )}

        {places.length > 0 && !loading && (
          <>
            <ul className="mt-3 space-y-2">
              {places.slice(0, 8).map((p) => {
                const active = selected.includes(p.id);
                return (
                  <li key={p.id}>
                    <label className={`flex cursor-pointer flex-wrap items-center justify-between gap-2 rounded-2xl border px-4 py-2.5 text-sm transition ${active ? "border-gold bg-champagne/40" : "border-neutral-100 hover:border-gold/50"}`}>
                      <span className="flex items-start gap-2">
                        <input
                          type="checkbox"
                          checked={active}
                          onChange={() => setSelected((s) => (s.includes(p.id) ? s.filter((x) => x !== p.id) : [...s, p.id]))}
                          className="mt-1 h-4 w-4 accent-[#c6a866]"
                        />
                        <span>
                          <span className="block font-medium text-ink">{p.name}</span>
                          <span className="block text-xs text-neutral-500">
                            {p.address ?? "Address unavailable"}
                            {p.rating ? ` · ${p.rating.toFixed(1)}★` : ""}
                          </span>
                        </span>
                      </span>
                      <a
                        href={directionsUrl({ lat: p.lat, lng: p.lng })}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-medium text-gold-dark hover:underline"
                      >
                        Directions <ExternalLink className="h-3 w-3" aria-hidden="true" />
                      </a>
                    </label>
                  </li>
                );
              })}
            </ul>
            <p className="mt-2 text-xs text-neutral-500">
              Place details from Google Places. Tick places to add them to the map and plan your route.
            </p>
          </>
        )}
      </div>
    </section>
  );
}
