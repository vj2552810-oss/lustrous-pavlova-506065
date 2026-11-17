/**
 * Shared hotel booking types.
 *
 * `mode` is part of every payload on purpose: the UI must always be able to show
 * whether data came from a live, authorised hotel API or from clearly-labelled
 * demo inventory. Nothing in this project may present demo data as live.
 */
export type DataMode = "demo" | "live";

export interface HotelSearchQuery {
  destination: string;
  checkIn: string; // YYYY-MM-DD
  checkOut: string; // YYYY-MM-DD
  guests: number;
  rooms: number;
}

export interface CancellationPolicy {
  /** Short label shown on cards, e.g. "Free cancellation until 24 Feb". */
  label: string;
  refundable: boolean;
  /** Full terms, as supplied by the hotel/provider. */
  terms: string;
}

export interface RoomOffer {
  id: string;
  hotelId: string;
  name: string;
  description: string;
  bedType: string;
  maxGuestsPerRoom: number;
  sizeSqm: number;
  amenities: string[];
  /** Minor units (paise) per room per night, for the requested dates. */
  nightlyPriceMinor: number;
  /** Minor units for all nights × all rooms, before taxes. */
  subtotalMinor: number;
  taxesMinor: number;
  totalMinor: number;
  currency: string;
  roomsAvailable: number;
  cancellation: CancellationPolicy;
  breakfastIncluded: boolean;
}

/**
 * A hotel's map location. Coordinates are only ever reported as `verified` when
 * they come from the hotel provider or a geocoding service — never inferred.
 */
export interface HotelLocation {
  address: string | null;
  lat: number | null;
  lng: number | null;
  /** True only when lat/lng were supplied by the provider/geocoder. */
  verified: boolean;
  /** Human explanation when coordinates are unavailable. */
  note?: string;
}

export interface HotelResult {
  id: string;
  name: string;
  city: string;
  area: string;
  country: string;
  starRating: number;
  description: string;
  image: string;
  imageAlt: string;
  amenities: string[];
  rooms: RoomOffer[];
  location: HotelLocation;
}

export interface SearchResponse {
  mode: DataMode;
  provider: string;
  query: HotelSearchQuery;
  nights: number;
  hotels: HotelResult[];
  notice: string;
  generatedAt: string;
}

export interface PriceBreakdown {
  nights: number;
  rooms: number;
  subtotalMinor: number;
  taxesMinor: number;
  totalMinor: number;
  currency: string;
}

export interface BookingInput {
  hotelId: string;
  roomId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  rooms: number;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  specialRequests?: string;
}

export interface ProviderQuote {
  hotelId: string;
  hotelName: string;
  city: string;
  roomId: string;
  roomName: string;
  maxGuestsPerRoom: number;
  roomsAvailable: number;
  nights: number;
  rooms: number;
  nightlyPriceMinor: number;
  subtotalMinor: number;
  taxesMinor: number;
  totalMinor: number;
  currency: string;
  cancellation: CancellationPolicy;
  breakfastIncluded: boolean;
}

export interface ConfirmBookingInput {
  reference: string;
  quote: ProviderQuote;
  checkIn: string;
  checkOut: string;
  guests: number;
  rooms: number;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  specialRequests?: string;
  paymentReference: string;
}

export interface ConfirmBookingResult {
  ok: boolean;
  provider: string;
  providerBookingId?: string;
  confirmationCode?: string;
  error?: string;
}

export interface HotelProvider {
  id: string;
  label: string;
  mode: DataMode;
  /** True only when credentials are present AND the operator has enabled live mode. */
  liveConfigured: boolean;
  search(query: HotelSearchQuery): Promise<SearchResponse>;
  getHotel(hotelId: string, query: HotelSearchQuery): Promise<HotelResult | null>;
  /** Fresh availability + price straight from the provider (used before payment). */
  recheck(hotelId: string, roomId: string, query: HotelSearchQuery): Promise<ProviderQuote | null>;
  /** Creates the reservation with the hotel/provider. Must not be faked. */
  confirm(input: ConfirmBookingInput): Promise<ConfirmBookingResult>;
}
