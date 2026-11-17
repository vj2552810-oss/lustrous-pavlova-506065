export interface Destination {
  slug: string;
  name: string;
  region: "India" | "International";
  /** Nearest city used for hotel searches. */
  hotelQuery: string;
  /** City/area the coordinates describe — deliberately not a hotel pin. */
  referencePoint: string;
  lat: number;
  lng: number;
  /** These are approximate city-centre references, not surveyed hotel locations. */
  approximate: true;
  blurb: string;
  bestFor: string[];
  image: string;
  imageAlt: string;
}

const px = (id: number, w = 1200) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}`;

/**
 * Destination geography.
 *
 * These coordinates describe the city/area centre so the explorer can move the
 * map. They are NOT hotel locations and are labelled as approximate in the UI.
 * Hotel markers only appear when the hotel provider supplies verified
 * coordinates (see HotelLocation.verified).
 */
export const DESTINATIONS: Destination[] = [
  { slug: "belagavi", name: "Belagavi", region: "India", hotelQuery: "Belagavi", referencePoint: "Belagavi city centre", lat: 15.8497, lng: 74.4977, approximate: true, blurb: "PRITIVO's home city — forts, lakes and easy access to the Western Ghats.", bestFor: ["City breaks", "Heritage"], image: px(3581362), imageAlt: "City skyline in Karnataka" },
  { slug: "goa", name: "Goa", region: "India", hotelQuery: "Goa", referencePoint: "Panaji, Goa", lat: 15.4909, lng: 73.8278, approximate: true, blurb: "Beaches, Portuguese heritage and long coastal evenings.", bestFor: ["Beaches", "Couples"], image: px(4428274), imageAlt: "Goa coastline with palms" },
  { slug: "coorg", name: "Coorg", region: "India", hotelQuery: "Coorg", referencePoint: "Madikeri, Coorg", lat: 12.4244, lng: 75.7382, approximate: true, blurb: "Coffee estates, waterfalls and misty plantation hills.", bestFor: ["Hills", "Weekends"], image: px(37672619), imageAlt: "Misty plantation hills" },
  { slug: "kerala", name: "Kerala", region: "India", hotelQuery: "Kerala", referencePoint: "Alappuzha, Kerala", lat: 9.4981, lng: 76.3388, approximate: true, blurb: "Backwater houseboats, tea country and calm beaches.", bestFor: ["Honeymoon", "Nature"], image: px(12950219), imageAlt: "Houseboats on Kerala backwaters" },
  { slug: "manali", name: "Manali", region: "India", hotelQuery: "Manali", referencePoint: "Manali, Himachal Pradesh", lat: 32.2432, lng: 77.1892, approximate: true, blurb: "Snow, pine valleys and mountain cafés.", bestFor: ["Snow", "Adventure"], image: px(16104060), imageAlt: "Snow-covered Manali mountains" },
  { slug: "kashmir", name: "Kashmir", region: "India", hotelQuery: "Srinagar", referencePoint: "Srinagar, Jammu & Kashmir", lat: 34.0837, lng: 74.7973, approximate: true, blurb: "Dal Lake, shikara rides and alpine meadows.", bestFor: ["Lakes", "Photography"], image: px(27108526), imageAlt: "Shikara on Dal Lake" },
  { slug: "rajasthan", name: "Rajasthan", region: "India", hotelQuery: "Jaipur", referencePoint: "Jaipur, Rajasthan", lat: 26.9124, lng: 75.7873, approximate: true, blurb: "Royal forts, desert camps and heritage hotels.", bestFor: ["Heritage", "Families"], image: px(31836726), imageAlt: "Jaipur architecture at sunset" },
  { slug: "mumbai", name: "Mumbai", region: "India", hotelQuery: "Mumbai", referencePoint: "Mumbai city centre", lat: 19.076, lng: 72.8777, approximate: true, blurb: "Waterfront promenades, business districts and street food.", bestFor: ["City", "Business"], image: px(266174), imageAlt: "Hotel lobby in a city hotel" },
  { slug: "dubai", name: "Dubai", region: "International", hotelQuery: "Dubai", referencePoint: "Dubai city centre", lat: 25.2048, lng: 55.2708, approximate: true, blurb: "Skylines, desert safaris and world-class shopping.", bestFor: ["Families", "First trip abroad"], image: px(19664340), imageAlt: "Dubai skyline" },
  { slug: "thailand", name: "Thailand", region: "International", hotelQuery: "Bangkok", referencePoint: "Bangkok, Thailand", lat: 13.7563, lng: 100.5018, approximate: true, blurb: "Islands, temples and street-food cities.", bestFor: ["Friends", "Islands"], image: px(176400), imageAlt: "Longtail boat in Thailand" },
  { slug: "bali", name: "Bali", region: "International", hotelQuery: "Bali", referencePoint: "Denpasar, Bali", lat: -8.6705, lng: 115.2126, approximate: true, blurb: "Temples, rice terraces and villa stays.", bestFor: ["Honeymoon", "Wellness"], image: px(17716409), imageAlt: "Balinese temple and rice terraces" },
  { slug: "london", name: "London", region: "International", hotelQuery: "London", referencePoint: "Central London, United Kingdom", lat: 51.5072, lng: -0.1276, approximate: true, blurb: "Royal landmarks, museums, markets and West End theatre.", bestFor: ["City", "Culture"], image: px(17379169), imageAlt: "Big Ben and the Houses of Parliament in London" },
  { slug: "singapore", name: "Singapore", region: "International", hotelQuery: "Singapore", referencePoint: "Singapore city centre", lat: 1.3521, lng: 103.8198, approximate: true, blurb: "Gardens, Sentosa and an easy family city break.", bestFor: ["Families", "City"], image: px(18662417), imageAlt: "Marina Bay skyline at night" },
];

export function findDestination(slug: string) {
  return DESTINATIONS.find((d) => d.slug === slug) ?? null;
}

/** Matches a free-text destination to a curated entry (for map framing). */
export function destinationForQuery(query: string): Destination | null {
  const q = query.trim().toLowerCase();
  if (!q) return null;
  return (
    DESTINATIONS.find((d) => d.slug === q || d.name.toLowerCase() === q || d.hotelQuery.toLowerCase() === q) ??
    DESTINATIONS.find((d) => q.includes(d.name.toLowerCase()) || d.name.toLowerCase().includes(q)) ??
    null
  );
}
