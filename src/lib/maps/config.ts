/**
 * Google Maps configuration that is safe to use in the browser.
 *
 * The browser key is deliberately public (it must be shipped to the client) and
 * is protected by HTTP-referrer restrictions plus a restricted API list in
 * Google Cloud. Server-only keys (Places/Geocoding) are never referenced here.
 */

import { envValue } from "@/lib/env";

// NOTE: NEXT_PUBLIC_* values are inlined at build time; envValue keeps placeholder
// keys (e.g. "YOUR_API_KEY") from being treated as configured.
export const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim().replace(/^["']|["']$/g, "") ?? "";
export const GOOGLE_MAPS_KEY_USABLE = GOOGLE_MAPS_API_KEY.length > 0 && !/^(your|changeme|replace|xxxx+|todo|<)/i.test(GOOGLE_MAPS_API_KEY);

export function mapsConfigured() {
  return GOOGLE_MAPS_KEY_USABLE;
}

export interface MapsIntegrationState {
  browserKeyConfigured: boolean;
  serverKeyConfigured: boolean;
  mapsEnabled: boolean;
}

export function mapsIntegrationState(): MapsIntegrationState {
  const browserKeyConfigured = mapsConfigured();
  const serverKeyConfigured = Boolean(envValue("GOOGLE_MAPS_SERVER_API_KEY"));
  return {
    browserKeyConfigured,
    serverKeyConfigured,
    mapsEnabled: browserKeyConfigured || serverKeyConfigured,
  };
}

export interface LatLng {
  lat: number;
  lng: number;
}

/** Google Maps directions URL — works without any API key. */
export function directionsUrl(target: { lat?: number | null; lng?: number | null; address?: string | null; query?: string }) {
  const base = "https://www.google.com/maps/dir/?api=1";
  if (typeof target.lat === "number" && typeof target.lng === "number") {
    return `${base}&destination=${target.lat},${target.lng}&travelmode=driving`;
  }
  const q = target.address || target.query || "";
  return q ? `${base}&destination=${encodeURIComponent(q)}&travelmode=driving` : "https://www.google.com/maps";
}

/** Opens a single place/marker on Google Maps. */
export function placeUrl(target: { lat?: number | null; lng?: number | null; address?: string | null; query?: string }) {
  if (typeof target.lat === "number" && typeof target.lng === "number") {
    return `https://www.google.com/maps/search/?api=1&query=${target.lat}%2C${target.lng}`;
  }
  const q = target.address || target.query || "";
  return q ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}` : "https://www.google.com/maps";
}

export function isValidLatLng(lat: unknown, lng: unknown): lat is number {
  return (
    typeof lat === "number" && typeof lng === "number" &&
    Number.isFinite(lat) && Number.isFinite(lng) &&
    Math.abs(lat) <= 90 && Math.abs(lng) <= 180 && !(lat === 0 && lng === 0)
  );
}
