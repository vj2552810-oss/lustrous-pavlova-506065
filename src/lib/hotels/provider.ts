import "server-only";
import { envValue } from "@/lib/env";
import { demoProvider } from "./demo-provider";
import { createLiveProvider, getLiveConfig } from "./live-provider";
import type { HotelProvider, HotelSearchQuery } from "./types";
import type { FieldErrors } from "@/lib/validation";

const MAX_NIGHTS = 30;
const MAX_ROOMS = 6;
const MAX_GUESTS = 16;

/** Live mode is only used when credentials exist and the operator opts in. */
export function getHotelProvider(): HotelProvider {
  const cfg = getLiveConfig();
  const enabled = envValue("HOTEL_API_MODE") === "live";
  if (cfg && enabled) return createLiveProvider(cfg);
  return demoProvider;
}

export function hotelIntegrationState() {
  const cfg = getLiveConfig();
  return {
    mode: cfg && envValue("HOTEL_API_MODE") === "live" ? ("live" as const) : ("demo" as const),
    credentialsPresent: Boolean(cfg),
    liveEnabled: envValue("HOTEL_API_MODE") === "live",
    providerName: cfg?.providerLabel ?? null,
  };
}

import { todayISO } from "./format";

export { formatMoney, formatStayDate, formatStayDateShort, nightsCount, todayISO } from "./format";

const isoDate = /^\d{4}-\d{2}-\d{2}$/;

export function validateSearchQuery(raw: Record<string, unknown>): { query: HotelSearchQuery; errors: FieldErrors } {
  const str = (v: unknown, max = 80) => (typeof v === "string" ? v.trim().slice(0, max) : "");
  const num = (v: unknown, fallback: number) => {
    const n = Number(typeof v === "string" ? v : NaN);
    return Number.isFinite(n) ? Math.round(n) : fallback;
  };

  const errors: FieldErrors = {};
  const destination = str(raw.destination, 80);
  const checkIn = str(raw.checkIn, 10);
  const checkOut = str(raw.checkOut, 10);
  const guests = num(raw.guests, 2);
  const rooms = num(raw.rooms, 1);

  if (destination.length < 2) errors.destination = "Enter a destination, city or area.";
  if (!isoDate.test(checkIn)) errors.checkIn = "Choose a check-in date.";
  else if (checkIn < todayISO()) errors.checkIn = "Check-in cannot be in the past.";
  if (!isoDate.test(checkOut)) errors.checkOut = "Choose a check-out date.";
  else if (isoDate.test(checkIn) && checkOut <= checkIn) errors.checkOut = "Check-out must be after check-in.";
  else if (isoDate.test(checkIn)) {
    const nights = Math.round((Date.parse(checkOut) - Date.parse(checkIn)) / 86_400_000);
    if (nights > MAX_NIGHTS) errors.checkOut = `Stays are limited to ${MAX_NIGHTS} nights online — contact us for longer stays.`;
  }
  if (!Number.isInteger(guests) || guests < 1 || guests > MAX_GUESTS) errors.guests = `Enter between 1 and ${MAX_GUESTS} guests.`;
  if (!Number.isInteger(rooms) || rooms < 1 || rooms > MAX_ROOMS) errors.rooms = `Enter between 1 and ${MAX_ROOMS} rooms.`;
  if (!errors.guests && !errors.rooms && guests < rooms) errors.rooms = "Each room must have at least one guest.";

  return { query: { destination, checkIn, checkOut, guests, rooms }, errors: errors };
}

export function defaultQuery(): HotelSearchQuery {
  return { destination: "Belagavi", checkIn: todayISO(7), checkOut: todayISO(10), guests: 2, rooms: 1 };
}


