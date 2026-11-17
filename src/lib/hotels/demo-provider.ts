import "server-only";
import { DEMO_HOTELS, demoRoomsFor, nightsBetween } from "./demo-catalog";
import type { HotelProvider, HotelResult, HotelSearchQuery, ProviderQuote, SearchResponse, ConfirmBookingResult } from "./types";

export const DEMO_NOTICE =
  "Demo mode — these are sample properties and sample prices created for PRITIVO, not live hotel availability. No payment is taken and no reservation is confirmed. Connect an authorised hotel API to enable live booking.";

function matches(hotel: (typeof DEMO_HOTELS)[number], destination: string) {
  const q = destination.trim().toLowerCase();
  if (!q) return true;
  return [hotel.city, hotel.area, hotel.name, hotel.country].some((v) => v.toLowerCase().includes(q));
}

function toHotelResult(hotel: (typeof DEMO_HOTELS)[number], query: HotelSearchQuery): HotelResult {
  const rooms = demoRoomsFor(hotel, query).filter((r) => r.roomsAvailable > 0 && r.maxGuestsPerRoom * query.rooms >= query.guests);
  return {
    id: hotel.id,
    name: hotel.name,
    city: hotel.city,
    area: hotel.area,
    country: hotel.country,
    starRating: hotel.starRating,
    description: hotel.description,
    image: hotel.image,
    imageAlt: hotel.imageAlt,
    amenities: hotel.amenities,
    rooms,
    // Demo properties are fictional, so no street address or coordinates exist.
    location: {
      address: null,
      lat: null,
      lng: null,
      verified: false,
      note: "Demo property: no verified address or coordinates. Live hotels show a verified location supplied by the hotel provider.",
    },
  };
}

export const demoProvider: HotelProvider = {
  id: "pritivo-demo",
  label: "PRITIVO demo inventory",
  mode: "demo",
  liveConfigured: false,

  async search(query: HotelSearchQuery): Promise<SearchResponse> {
    const hotels = DEMO_HOTELS.filter((h) => matches(h, query.destination))
      .map((h) => toHotelResult(h, query))
      .filter((h) => h.rooms.length > 0);

    return {
      mode: "demo",
      provider: "PRITIVO demo inventory",
      query,
      nights: nightsBetween(query.checkIn, query.checkOut),
      hotels,
      notice: DEMO_NOTICE,
      generatedAt: new Date().toISOString(),
    };
  },

  async getHotel(hotelId: string, query: HotelSearchQuery): Promise<HotelResult | null> {
    const hotel = DEMO_HOTELS.find((h) => h.id === hotelId);
    return hotel ? toHotelResult(hotel, query) : null;
  },

  async recheck(hotelId, roomId, query): Promise<ProviderQuote | null> {
    const hotel = DEMO_HOTELS.find((h) => h.id === hotelId);
    if (!hotel) return null;
    const room = demoRoomsFor(hotel, query).find((r) => r.id === roomId);
    if (!room || room.roomsAvailable < query.rooms || room.maxGuestsPerRoom * query.rooms < query.guests) return null;
    return {
      hotelId: hotel.id,
      hotelName: hotel.name,
      city: hotel.city,
      roomId: room.id,
      roomName: room.name,
      maxGuestsPerRoom: room.maxGuestsPerRoom,
      roomsAvailable: room.roomsAvailable,
      nights: nightsBetween(query.checkIn, query.checkOut),
      rooms: query.rooms,
      nightlyPriceMinor: room.nightlyPriceMinor,
      subtotalMinor: room.subtotalMinor,
      taxesMinor: room.taxesMinor,
      totalMinor: room.totalMinor,
      currency: room.currency,
      cancellation: room.cancellation,
      breakfastIncluded: room.breakfastIncluded,
    };
  },

  async confirm(): Promise<ConfirmBookingResult> {
    // Deliberately fails: demo inventory cannot produce a real reservation.
    return {
      ok: false,
      provider: "pritivo-demo",
      error:
        "Demo mode cannot create a real reservation. Configure an authorised hotel API (HOTEL_API_BASE_URL + HOTEL_API_KEY) to enable live booking.",
    };
  },
};
