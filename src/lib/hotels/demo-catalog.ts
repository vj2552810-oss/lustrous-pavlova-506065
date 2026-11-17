import type { CancellationPolicy, HotelSearchQuery, RoomOffer } from "./types";

/**
 * DEMO INVENTORY — fictional properties with sample prices.
 *
 * This exists so the booking journey can be built, reviewed and demonstrated
 * before a commercial hotel API agreement is in place. It is deliberately NOT
 * modelled on any real hotel, is never presented as live availability, and the
 * demo provider refuses to "confirm" a reservation.
 */
export interface DemoRoom {
  id: string;
  name: string;
  description: string;
  bedType: string;
  maxGuestsPerRoom: number;
  sizeSqm: number;
  amenities: string[];
  baseNightlyINR: number;
  refundable: boolean;
  freeCancelDays: number;
  breakfastIncluded: boolean;
}

export interface DemoHotel {
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
  rooms: DemoRoom[];
}

const px = (id: number, w = 1200) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}`;

const COMMON = ["Free Wi-Fi", "24-hour front desk", "Air conditioning", "Room service"];

export const DEMO_HOTELS: DemoHotel[] = [
  {
    id: "demo-cormorant-house",
    name: "The Cormorant House",
    city: "Belagavi",
    area: "Tilakwadi",
    country: "India",
    starRating: 4,
    description:
      "A calm, contemporary stay in the heart of Belagavi with a rooftop pool, an all-day café and easy access to the fort and city markets.",
    image: px(271624),
    imageAlt: "Contemporary hotel exterior with warm evening lighting",
    amenities: [...COMMON, "Rooftop pool", "Fitness centre", "Airport transfers", "Restaurant"],
    rooms: [
      {
        id: "deluxe-king",
        name: "Deluxe King",
        description: "King bed, city view, work desk and a rain shower.",
        bedType: "1 king bed",
        maxGuestsPerRoom: 2,
        sizeSqm: 28,
        amenities: ["City view", "Rain shower", "Smart TV", "Tea & coffee"],
        baseNightlyINR: 5200,
        refundable: true,
        freeCancelDays: 2,
        breakfastIncluded: true,
      },
      {
        id: "premier-suite",
        name: "Premier Suite",
        description: "Separate living area, corner windows and club lounge access.",
        bedType: "1 king bed + sofa bed",
        maxGuestsPerRoom: 3,
        sizeSqm: 46,
        amenities: ["Lounge access", "Bathtub", "Larger workspace", "Evening snacks"],
        baseNightlyINR: 8600,
        refundable: true,
        freeCancelDays: 3,
        breakfastIncluded: true,
      },
      {
        id: "saver-queen",
        name: "Saver Queen",
        description: "Compact queen room — the best-value option for a short stay.",
        bedType: "1 queen bed",
        maxGuestsPerRoom: 2,
        sizeSqm: 22,
        amenities: ["City view", "Smart TV", "Tea & coffee"],
        baseNightlyINR: 3900,
        refundable: false,
        freeCancelDays: 0,
        breakfastIncluded: false,
      },
    ],
  },
  {
    id: "demo-aurea-beach",
    name: "Aurea Beach Retreat",
    city: "Goa",
    area: "Candolim",
    country: "India",
    starRating: 5,
    description:
      "A light-filled beach house-style resort a short walk from the sand, with two pools, a seafood grill and sunset-facing balconies.",
    image: px(261102),
    imageAlt: "Beachside resort pool framed by palm trees",
    amenities: [...COMMON, "Beach access", "Two pools", "Seafood grill", "Spa", "Kids club"],
    rooms: [
      {
        id: "garden-room",
        name: "Garden Room",
        description: "Ground-floor room opening onto tropical gardens.",
        bedType: "1 king bed",
        maxGuestsPerRoom: 2,
        sizeSqm: 32,
        amenities: ["Garden terrace", "Rain shower", "Minibar"],
        baseNightlyINR: 7400,
        refundable: true,
        freeCancelDays: 5,
        breakfastIncluded: true,
      },
      {
        id: "ocean-suite",
        name: "Ocean Suite",
        description: "Sea-facing balcony, outdoor daybed and a deep soaking tub.",
        bedType: "1 king bed",
        maxGuestsPerRoom: 3,
        sizeSqm: 55,
        amenities: ["Sea view", "Outdoor daybed", "Bathtub", "Lounge access"],
        baseNightlyINR: 12800,
        refundable: true,
        freeCancelDays: 7,
        breakfastIncluded: true,
      },
      {
        id: "poolside-twin",
        name: "Poolside Twin",
        description: "Two twin beds beside the main pool — ideal for friends.",
        bedType: "2 twin beds",
        maxGuestsPerRoom: 2,
        sizeSqm: 30,
        amenities: ["Pool access", "Smart TV", "Minibar"],
        baseNightlyINR: 6200,
        refundable: true,
        freeCancelDays: 3,
        breakfastIncluded: false,
      },
    ],
  },
  {
    id: "demo-hillcrest",
    name: "Hillcrest Estate Stay",
    city: "Coorg",
    area: "Madikeri",
    country: "India",
    starRating: 4,
    description:
      "A restored plantation bungalow surrounded by coffee bushes, with guided estate walks, home-style Kodava meals and misty mornings.",
    image: px(2102587),
    imageAlt: "Plantation bungalow surrounded by green hills",
    amenities: [...COMMON, "Plantation walks", "Bonfire evenings", "Home-style kitchen", "Free parking"],
    rooms: [
      {
        id: "estate-room",
        name: "Estate Room",
        description: "Colonial-style room with a private verandah.",
        bedType: "1 queen bed",
        maxGuestsPerRoom: 2,
        sizeSqm: 26,
        amenities: ["Verandah", "Garden view", "Heater", "Tea & coffee"],
        baseNightlyINR: 4800,
        refundable: true,
        freeCancelDays: 4,
        breakfastIncluded: true,
      },
      {
        id: "family-cottage",
        name: "Family Cottage",
        description: "Two-bedroom cottage with a fireplace and sit-out.",
        bedType: "1 king + 2 twin beds",
        maxGuestsPerRoom: 4,
        sizeSqm: 64,
        amenities: ["Fireplace", "Two bedrooms", "Garden view", "Living area"],
        baseNightlyINR: 9200,
        refundable: true,
        freeCancelDays: 4,
        breakfastIncluded: true,
      },
    ],
  },
  {
    id: "demo-marina-crest",
    name: "Marina Crest Hotel",
    city: "Mumbai",
    area: "Colaba",
    country: "India",
    starRating: 4,
    description:
      "A polished city hotel minutes from the waterfront, with a rooftop bar, business lounge and excellent airport connections.",
    image: px(266174),
    imageAlt: "Modern hotel lobby with warm lighting",
    amenities: [...COMMON, "Rooftop bar", "Business lounge", "Laundry", "Airport transfers"],
    rooms: [
      {
        id: "city-king",
        name: "City King",
        description: "King bed with harbour glimpses and a generous desk.",
        bedType: "1 king bed",
        maxGuestsPerRoom: 2,
        sizeSqm: 30,
        amenities: ["Harbour glimpse", "Work desk", "Smart TV"],
        baseNightlyINR: 8900,
        refundable: true,
        freeCancelDays: 2,
        breakfastIncluded: false,
      },
      {
        id: "twin-city",
        name: "Twin City",
        description: "Two twin beds for colleagues travelling together.",
        bedType: "2 twin beds",
        maxGuestsPerRoom: 2,
        sizeSqm: 29,
        amenities: ["Work desk", "Smart TV", "Tea & coffee"],
        baseNightlyINR: 8400,
        refundable: true,
        freeCancelDays: 2,
        breakfastIncluded: false,
      },
      {
        id: "crest-suite",
        name: "Crest Suite",
        description: "Corner suite with skyline views and lounge access.",
        bedType: "1 king bed",
        maxGuestsPerRoom: 3,
        sizeSqm: 52,
        amenities: ["Skyline view", "Lounge access", "Bathtub"],
        baseNightlyINR: 14500,
        refundable: true,
        freeCancelDays: 3,
        breakfastIncluded: true,
      },
    ],
  },
  {
    id: "demo-backwater-lodge",
    name: "Backwater Fern Lodge",
    city: "Kerala",
    area: "Alleppey",
    country: "India",
    starRating: 4,
    description:
      "A quiet waterside lodge with a small pool, Ayurvedic treatments and a jetty for canoe rides through the backwaters.",
    image: px(3242614),
    imageAlt: "Waterside lodge surrounded by tropical greenery",
    amenities: [...COMMON, "Waterside jetty", "Ayurvedic spa", "Canoe rides", "Garden restaurant"],
    rooms: [
      {
        id: "garden-cabana",
        name: "Garden Cabana",
        description: "Independent cabana with an open-air shower.",
        bedType: "1 king bed",
        maxGuestsPerRoom: 2,
        sizeSqm: 34,
        amenities: ["Open-air shower", "Garden view", "Private sit-out"],
        baseNightlyINR: 5800,
        refundable: true,
        freeCancelDays: 5,
        breakfastIncluded: true,
      },
      {
        id: "heritage-teak",
        name: "Heritage Teak Room",
        description: "Teak-furnished room in the restored main house.",
        bedType: "1 queen bed",
        maxGuestsPerRoom: 2,
        sizeSqm: 30,
        amenities: ["Verandah", "Fan & AC", "Tea & coffee"],
        baseNightlyINR: 4600,
        refundable: true,
        freeCancelDays: 3,
        breakfastIncluded: true,
      },
    ],
  },
  {
    id: "demo-summit-lodge",
    name: "Summit Pine Lodge",
    city: "Manali",
    area: "Old Manali",
    country: "India",
    starRating: 4,
    description:
      "Pine-clad rooms with balconies over the valley, a fireplace lounge and easy access to riverside cafés and trails.",
    image: px(2098408),
    imageAlt: "Pine lodge with balconies overlooking a valley",
    amenities: [...COMMON, "Fireplace lounge", "Valley views", "Café", "Cab hire desk"],
    rooms: [
      {
        id: "valley-balcony",
        name: "Valley Balcony Room",
        description: "Balcony facing the pine valley, with a sitting nook.",
        bedType: "1 king bed",
        maxGuestsPerRoom: 2,
        sizeSqm: 28,
        amenities: ["Balcony", "Valley view", "Heater"],
        baseNightlyINR: 4400,
        refundable: true,
        freeCancelDays: 3,
        breakfastIncluded: true,
      },
      {
        id: "attic-family",
        name: "Attic Family Room",
        description: "Sloping-ceiling attic room that sleeps four.",
        bedType: "2 double beds",
        maxGuestsPerRoom: 4,
        sizeSqm: 42,
        amenities: ["Valley view", "Heater", "Board games"],
        baseNightlyINR: 6600,
        refundable: true,
        freeCancelDays: 3,
        breakfastIncluded: true,
      },
    ],
  },
];

/** Deterministic placeholder availability for the demo catalogue only. */
export function demoRoomsFor(hotel: DemoHotel, query: HotelSearchQuery): RoomOffer[] {
  const nights = nightsBetween(query.checkIn, query.checkOut);
  const monthFactor = seasonalFactor(query.checkIn);
  const startOfDay = Date.parse(`${query.checkIn}T00:00:00Z`);

  const offers = hotel.rooms
    .map((room) => {
      const soldOut = pseudoRandom(`${hotel.id}|${room.id}|${query.checkIn}`) < 0.12;
      const nightly = Math.round((room.baseNightlyINR * monthFactor * 100) / 1);
      const subtotal = nightly * nights * query.rooms;
      const taxes = Math.round(subtotal * 0.12);
      const cancellation: CancellationPolicy = room.refundable
        ? {
            refundable: true,
            label: `Free cancellation until ${formatDate(new Date(startOfDay - room.freeCancelDays * 86_400_000))}`,
            terms: `Free cancellation up to ${room.freeCancelDays} day(s) before check-in. After that the first night is charged. No-shows are charged in full. Demo terms — the live provider's policy applies once connected.`,
          }
        : {
            refundable: false,
            label: "Non-refundable",
            terms: "This sample rate cannot be refunded or amended after booking. Demo terms — the live provider's policy applies once connected.",
          };

      return {
        id: room.id,
        hotelId: hotel.id,
        name: room.name,
        description: room.description,
        bedType: room.bedType,
        maxGuestsPerRoom: room.maxGuestsPerRoom,
        sizeSqm: room.sizeSqm,
        amenities: room.amenities,
        nightlyPriceMinor: nightly,
        subtotalMinor: subtotal,
        taxesMinor: taxes,
        totalMinor: subtotal + taxes,
        currency: "INR",
        roomsAvailable: soldOut ? 0 : 1 + Math.floor(pseudoRandom(`${room.id}|${hotel.id}`) * query.rooms),
        cancellation,
        breakfastIncluded: room.breakfastIncluded,
      } satisfies RoomOffer;
    })
    .sort((a, b) => a.totalMinor - b.totalMinor);

  // Keep the demo journey explorable: if the simulated inventory happens to sell
  // out every room type, release the cheapest one. (Demo data only.)
  if (offers.every((o) => o.roomsAvailable === 0) && offers.length > 0) {
    offers[0] = { ...offers[0], roomsAvailable: Math.max(1, query.rooms) };
  }
  return offers;
}

export function nightsBetween(checkIn: string, checkOut: string) {
  const a = Date.parse(`${checkIn}T00:00:00Z`);
  const b = Date.parse(`${checkOut}T00:00:00Z`);
  if (Number.isNaN(a) || Number.isNaN(b)) return 0;
  return Math.max(0, Math.round((b - a) / 86_400_000));
}

function seasonalFactor(checkIn: string) {
  const month = new Date(`${checkIn}T00:00:00Z`).getUTCMonth();
  // Peak season Dec–Jan and Apr–May; monsoon Jul–Aug is quieter.
  if ([11, 0].includes(month)) return 1.25;
  if ([3, 4].includes(month)) return 1.12;
  if ([6, 7].includes(month)) return 0.88;
  return 1;
}

function pseudoRandom(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 1000) / 1000;
}

export function formatDate(d: Date) {
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}
