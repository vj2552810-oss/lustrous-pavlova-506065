import "server-only";
import { envValue } from "@/lib/env";
import type {
  HotelLocation,
  CancellationPolicy,
  ConfirmBookingInput,
  ConfirmBookingResult,
  HotelProvider,
  HotelResult,
  HotelSearchQuery,
  ProviderQuote,
  RoomOffer,
  SearchResponse,
} from "./types";

/**
 * LIVE PROVIDER ADAPTER
 *
 * Talks to an authorised hotel/aggregator API over HTTPS with the credentials
 * kept on the server. The request/response contract expected here is documented
 * in README.md ("Connecting a live hotel API"). Providers such as Hotelbeds,
 * TBO, RateHawk or a Duffel Stays account can be mapped into these four calls:
 *
 *   POST {base}/search   -> { hotels: [...] }
 *   GET  {base}/hotels/:id
 *   POST {base}/recheck  -> { quote: {...} }
 *   POST {base}/bookings -> { bookingId, confirmationCode }
 *
 * No fixture data is ever returned from this adapter: every failure is surfaced
 * to the caller so the UI can report the real problem instead of inventing a
 * price or a confirmation.
 */

const TIMEOUT_MS = 12_000;

interface LiveConfig {
  baseUrl: string;
  apiKey: string;
  providerLabel: string;
}

export function getLiveConfig(): LiveConfig | null {
  const baseUrl = envValue("HOTEL_API_BASE_URL")?.replace(/\/$/, "");
  const apiKey = envValue("HOTEL_API_KEY");
  if (!baseUrl || !apiKey) return null;
  return { baseUrl, apiKey, providerLabel: envValue("HOTEL_API_PROVIDER_NAME") || "Hotel API provider" };
}

async function call<T>(cfg: LiveConfig, path: string, init: { method: "GET" | "POST"; body?: unknown }): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${cfg.baseUrl}${path}`, {
      method: init.method,
      headers: {
        Authorization: `Bearer ${cfg.apiKey}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: init.body ? JSON.stringify(init.body) : undefined,
      signal: controller.signal,
      cache: "no-store",
    });
    const text = await res.text();
    if (!res.ok) {
      throw new Error(`Hotel provider responded ${res.status}: ${text.slice(0, 300)}`);
    }
    return JSON.parse(text) as T;
  } finally {
    clearTimeout(timer);
  }
}

interface RawCancellation {
  policy?: string;
  refundable?: boolean;
  deadline?: string;
}
interface RawRoom {
  id: string;
  name: string;
  description?: string;
  bed_type?: string;
  max_guests?: number;
  size_sqm?: number;
  amenities?: string[];
  nightly_price_minor?: number;
  subtotal_minor?: number;
  taxes_minor?: number;
  total_minor?: number;
  nightly_price?: number;
  currency?: string;
  rooms_available?: number;
  breakfast_included?: boolean;
  cancellation?: RawCancellation;
}
interface RawHotel {
  id: string;
  name: string;
  city?: string;
  area?: string;
  country?: string;
  star_rating?: number;
  description?: string;
  image?: string;
  image_alt?: string;
  amenities?: string[];
  rooms?: RawRoom[];
  latitude?: number | string;
  longitude?: number | string;
  address?: string;
  location_verified?: boolean;
}
interface RawQuote extends RawRoom {
  hotel_id?: string;
  hotel_name?: string;
  city?: string;
  nights?: number;
  rooms?: number;
}

function moneyMinor(room: RawRoom) {
  if (typeof room.nightly_price_minor === "number") return Math.round(room.nightly_price_minor);
  if (typeof room.nightly_price === "number") return Math.round(room.nightly_price * 100);
  return 0;
}

function policy(raw: RawCancellation | undefined): CancellationPolicy {
  return {
    label: raw?.policy || (raw?.refundable ? "Refundable — see terms" : "Cancellation terms provided at checkout"),
    refundable: raw?.refundable ?? false,
    terms: raw?.policy || "Cancellation terms are confirmed by the hotel provider before payment.",
  };
}

function toRooms(hotelId: string, rooms: RawRoom[] | undefined): RoomOffer[] {
  return (rooms ?? []).map((r) => {
    const nightly = moneyMinor(r);
    const subtotal = r.subtotal_minor ?? nightly;
    const taxes = r.taxes_minor ?? 0;
    return {
      id: r.id,
      hotelId,
      name: r.name,
      description: r.description ?? "",
      bedType: r.bed_type ?? "",
      maxGuestsPerRoom: r.max_guests ?? 2,
      sizeSqm: r.size_sqm ?? 0,
      amenities: r.amenities ?? [],
      nightlyPriceMinor: nightly,
      subtotalMinor: subtotal,
      taxesMinor: taxes,
      totalMinor: r.total_minor ?? subtotal + taxes,
      currency: r.currency ?? "INR",
      roomsAvailable: r.rooms_available ?? 0,
      cancellation: policy(r.cancellation),
      breakfastIncluded: r.breakfast_included ?? false,
    };
  });
}

function toHotel(raw: RawHotel, query: HotelSearchQuery): HotelResult {
  return {
    id: raw.id,
    name: raw.name,
    city: raw.city ?? query.destination,
    area: raw.area ?? "",
    country: raw.country ?? "India",
    starRating: raw.star_rating ?? 0,
    description: raw.description ?? "",
    image: raw.image ?? "",
    imageAlt: raw.image_alt ?? `${raw.name} — hotel photograph`,
    amenities: raw.amenities ?? [],
    rooms: toRooms(raw.id, raw.rooms).filter((r) => r.roomsAvailable > 0 && r.maxGuestsPerRoom * query.rooms >= query.guests),
    location: toLocation(raw),
  };
}

/** Only provider-supplied coordinates are treated as verified. */
function toLocation(raw: RawHotel): HotelLocation {
  const lat = typeof raw.latitude === "string" ? Number(raw.latitude) : raw.latitude;
  const lng = typeof raw.longitude === "string" ? Number(raw.longitude) : raw.longitude;
  const valid =
    typeof lat === "number" && typeof lng === "number" && Number.isFinite(lat) && Number.isFinite(lng) &&
    Math.abs(lat) <= 90 && Math.abs(lng) <= 180 && !(lat === 0 && lng === 0);
  const address = typeof raw.address === "string" && raw.address.trim().length > 3 ? raw.address.trim() : null;
  if (!valid) {
    return {
      address,
      lat: null,
      lng: null,
      verified: false,
      note: "The hotel provider did not return coordinates for this property, so no map marker is shown.",
    };
  }
  return { address, lat: lat as number, lng: lng as number, verified: true };
}

function toQuote(raw: RawQuote, hotelId: string, roomId: string, query: HotelSearchQuery): ProviderQuote {
  const nightly = moneyMinor(raw);
  const subtotal = raw.subtotal_minor ?? nightly;
  const taxes = raw.taxes_minor ?? 0;
  return {
    hotelId: raw.hotel_id ?? hotelId,
    hotelName: raw.hotel_name ?? "",
    city: raw.city ?? query.destination,
    roomId: raw.id ?? roomId,
    roomName: raw.name,
    maxGuestsPerRoom: raw.max_guests ?? 2,
    roomsAvailable: raw.rooms_available ?? 0,
    nights: raw.nights ?? 0,
    rooms: raw.rooms ?? query.rooms,
    nightlyPriceMinor: nightly,
    subtotalMinor: subtotal,
    taxesMinor: taxes,
    totalMinor: raw.total_minor ?? subtotal + taxes,
    currency: raw.currency ?? "INR",
    cancellation: policy(raw.cancellation),
    breakfastIncluded: raw.breakfast_included ?? false,
  };
}

export function createLiveProvider(cfg: LiveConfig): HotelProvider {
  return {
    id: "live",
    label: cfg.providerLabel,
    mode: "live",
    liveConfigured: true,

    async search(query): Promise<SearchResponse> {
      const data = await call<{ hotels?: RawHotel[] }>(cfg, "/search", {
        method: "POST",
        body: {
          destination: query.destination,
          check_in: query.checkIn,
          check_out: query.checkOut,
          guests: query.guests,
          rooms: query.rooms,
          currency: "INR",
        },
      });
      const hotels = (data.hotels ?? []).map((h) => toHotel(h, query)).filter((h) => h.rooms.length > 0);
      return {
        mode: "live",
        provider: cfg.providerLabel,
        query,
        nights: 0,
        hotels,
        notice: "Live availability and prices supplied by our hotel partner for the dates you selected.",
        generatedAt: new Date().toISOString(),
      };
    },

    async getHotel(hotelId, query) {
      const data = await call<{ hotel?: RawHotel }>(cfg, `/hotels/${encodeURIComponent(hotelId)}?check_in=${query.checkIn}&check_out=${query.checkOut}&guests=${query.guests}&rooms=${query.rooms}`, { method: "GET" });
      return data.hotel ? toHotel(data.hotel, query) : null;
    },

    async recheck(hotelId, roomId, query) {
      const data = await call<{ quote?: RawQuote | null }>(cfg, "/recheck", {
        method: "POST",
        body: { hotel_id: hotelId, room_id: roomId, check_in: query.checkIn, check_out: query.checkOut, guests: query.guests, rooms: query.rooms },
      });
      return data.quote ? toQuote(data.quote, hotelId, roomId, query) : null;
    },

    async confirm(input: ConfirmBookingInput): Promise<ConfirmBookingResult> {
      try {
        const data = await call<{ bookingId?: string; confirmationCode?: string; status?: string }>(cfg, "/bookings", {
          method: "POST",
          body: {
            hotel_id: input.quote.hotelId,
            room_id: input.quote.roomId,
            check_in: input.checkIn,
            check_out: input.checkOut,
            guests: input.guests,
            rooms: input.rooms,
            guest: { name: input.guestName, email: input.guestEmail, phone: input.guestPhone, requests: input.specialRequests ?? "" },
            total_minor: input.quote.totalMinor,
            currency: input.quote.currency,
            payment_reference: input.paymentReference,
            partner_reference: input.reference,
          },
        });
        if (!data.bookingId) {
          return { ok: false, provider: cfg.providerLabel, error: "The hotel provider did not return a booking confirmation." };
        }
        return {
          ok: data.status !== "failed",
          provider: cfg.providerLabel,
          providerBookingId: data.bookingId,
          confirmationCode: data.confirmationCode,
          error: data.status === "failed" ? "The hotel provider rejected the reservation." : undefined,
        };
      } catch (err) {
        return { ok: false, provider: cfg.providerLabel, error: err instanceof Error ? err.message : "The hotel provider could not be reached." };
      }
    },
  };
}
