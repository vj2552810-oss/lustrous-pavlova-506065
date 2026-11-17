export interface Service {
  slug: string;
  name: string;
  icon: "compass" | "globe" | "bed" | "plane" | "train" | "car" | "users" | "heart" | "sparkles" | "pen";
  tagline: string;
  description: string;
  features: string[];
  howItWorks: string[];
  terms: string;
  /** Links to existing tour filters rather than duplicating content. */
  relatedTourFilters: Record<string, string>;
  image: string;
  imageAlt: string;
}

const px = (id: number, w = 1200) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}`;

export const SERVICES: Service[] = [
  {
    slug: "domestic-tours",
    name: "Domestic Tour Packages",
    icon: "compass",
    tagline: "India, from Himalayan passes to backwater mornings",
    description:
      "Curated journeys across India — Darjeeling, Kashmir, Ladakh, Kerala, Rajasthan, Goa, Coorg, Ooty, Andaman and more. Every itinerary is adjusted to your dates, pace and hotel category, and quoted in writing.",
    features: ["13+ Indian destinations", "Private and group departures", "Handpicked stays by category", "Local guides and transfers"],
    howItWorks: ["Share your dates and travellers", "We suggest 2–3 itinerary options", "You approve a written quote", "We arrange the details"],
    terms: "Prices are indicative until confirmed in writing. Final inclusions, hotel names and costs are shared in your quotation.",
    relatedTourFilters: { type: "domestic" },
    image: px(27108526),
    imageAlt: "Shikara boat on a calm lake in Kashmir",
  },
  {
    slug: "international-tours",
    name: "International Tour Packages",
    icon: "globe",
    tagline: "Switzerland, Japan, Iceland, Greece and beyond",
    description:
      "Worldwide holidays planned from Belagavi: Switzerland, Scotland, Italy, France, Greece, Norway, Iceland, Japan, South Korea, Bali, Maldives, Dubai, Türkiye, Egypt, South Africa, Australia, New Zealand, USA and Canada.",
    features: ["23+ countries", "Visa document checklists", "Multi-city and single-country routing", "English-speaking local guides"],
    howItWorks: ["Tell us the country and travel window", "We check season, visa and flight routing", "You receive a written itinerary and quote", "We handle supplier coordination"],
    terms: "Visa approval always rests with the relevant authorities. Airfares and taxes are confirmed at the time of quotation.",
    relatedTourFilters: { type: "international" },
    image: px(5210287),
    imageAlt: "Railway and high mountains in the Swiss Alps",
  },
  {
    slug: "hotel-reservations",
    name: "Hotel Reservations",
    icon: "bed",
    tagline: "Guest booking with no account needed",
    description:
      "Search stays by destination and dates, compare room types and cancellation terms, then book as a guest. Live supplier availability is enabled once our hotel partner API is connected — until then the site is clearly labelled as demo inventory and no reservation is confirmed.",
    features: ["Search by dates, guests and rooms", "Room types, amenities and cancellation terms", "Booking reference for later lookup", "Map view with verified locations"],
    howItWorks: ["Search your destination and dates", "Compare rooms and policies", "Enter guest details — no sign-up", "We confirm with the hotel before anything is charged"],
    terms: "No booking is confirmed until the hotel supplier confirms it. Demo-mode results are sample data and cannot be reserved.",
    relatedTourFilters: {},
    image: px(271624),
    imageAlt: "Contemporary hotel exterior in the evening",
  },
  {
    slug: "flight-booking-assistance",
    name: "Flight Booking Assistance",
    icon: "plane",
    tagline: "Fares sourced by people, not guessed by a website",
    description:
      "Share your route, dates and cabin preference and a planner will source real fares from airlines and consolidators. We never display invented prices: nothing is held or charged until you approve a written quote.",
    features: ["Domestic and international routing", "Student, group and corporate fares", "Multi-city itineraries", "Baggage and seat guidance"],
    howItWorks: ["Send your route and dates", "We check live availability", "You receive options in writing", "You approve and pay through a secure link"],
    terms: "Fares change constantly. The quoted fare and its validity are stated in writing; no fare is guaranteed before ticketing.",
    relatedTourFilters: {},
    image: px(19664340),
    imageAlt: "Dubai skyline at dusk",
  },
  {
    slug: "train-bus-assistance",
    name: "Train & Bus Booking Assistance",
    icon: "train",
    tagline: "Rail and road legs arranged alongside your trip",
    description:
      "Indian Railways and interstate bus connections planned around your itinerary — sleeper to AC first class, plus Volvo and night-bus options where they suit the route better than a flight.",
    features: ["Class and berth guidance", "Connections timed to your stay", "Group block assistance", "Station transfers"],
    howItWorks: ["Tell us origin, destination and dates", "We check realistic options", "You approve the plan", "Tickets are arranged and shared in writing"],
    terms: "Rail and bus availability is controlled by the operator. We confirm what is actually available rather than promising seats.",
    relatedTourFilters: {},
    image: px(5210287),
    imageAlt: "Train line through mountain scenery",
  },
  {
    slug: "car-rental",
    name: "Car Rental",
    icon: "car",
    tagline: "Private cabs, self-drive and airport transfers",
    description:
      "Chauffeur-driven cars for tours and transfers, plus self-drive options where available. Vehicles are sourced through verified local operators, with driver details shared before pickup.",
    features: ["Airport and hotel transfers", "Full-day and multi-day hires", "Self-drive where available", "Child seats on request"],
    howItWorks: ["Share pickup, drop and dates", "We confirm vehicle and driver", "You approve the rate in writing", "Driver details are shared before the trip"],
    terms: "Fuel, tolls, parking and driver allowances are stated in the quote. Night driving charges may apply.",
    relatedTourFilters: {},
    image: px(16104060),
    imageAlt: "Snow-covered mountain road",
  },
  {
    slug: "group-tours",
    name: "Group Tours",
    icon: "users",
    tagline: "Departures for clubs, colleges, corporates and families",
    description:
      "Group travel from 8 to 200+ travellers, with a single coordinator, phased payment schedules and contingency planning. Popular for college trips, corporate offsites and family reunions.",
    features: ["Group rates and rooming plans", "Dedicated coordinator", "Phased payment schedule", "Contingency and medical planning"],
    howItWorks: ["Share group size and dates", "We draft a rooming plan and itinerary", "You approve the quote and schedule", "We coordinate suppliers and transfers"],
    terms: "Group rates depend on final numbers and are confirmed in writing. Cancellation terms are shared before any payment.",
    relatedTourFilters: { type: "special" },
    image: px(32415206),
    imageAlt: "Wildlife on open savanna",
  },
  {
    slug: "family-holidays",
    name: "Family Holidays",
    icon: "users",
    tagline: "Short transfers, connecting rooms, something for every age",
    description:
      "Itineraries designed around children and grandparents: sensible travel days, kid-friendly meals, connecting rooms and rest days built in.",
    features: ["Connecting and family rooms", "Kid-friendly activities", "Slower daily pace", "Medical and dietary planning"],
    howItWorks: ["Tell us the ages and interests", "We shape a family-friendly route", "You approve the written quote", "We confirm family rooms with hotels"],
    terms: "Child rates depend on age and hotel policy; these are confirmed in the quotation.",
    relatedTourFilters: { style: "family" },
    image: px(18662417),
    imageAlt: "City skyline lit at night",
  },
  {
    slug: "honeymoon-packages",
    name: "Honeymoon Packages",
    icon: "heart",
    tagline: "Private villas, sunset dinners and quiet planning",
    description:
      "Honeymoons in the Maldives, Bali, Santorini, Switzerland, Kashmir and Kerala — with private transfers, decoration requests and a planner who keeps everything discreet.",
    features: ["Private pool villas and suites", "Candlelit dinners and decorations", "Couples spa experiences", "Discreet, single-point planning"],
    howItWorks: ["Share your dates and style", "We shortlist romantic stays", "You approve the quote", "Special requests are confirmed with the hotel"],
    terms: "Decorations, cakes and special requests depend on hotel availability and are confirmed in writing.",
    relatedTourFilters: { style: "honeymoon" },
    image: px(9394274),
    imageAlt: "Overwater villa on a turquoise lagoon",
  },
  {
    slug: "customized-travel",
    name: "Customized Travel Planning",
    icon: "pen",
    tagline: "Start with a blank page",
    description:
      "No fixed brochure. Tell us the trip you imagine — destinations, pace, budget, celebrations, accessibility needs — and we build the route, stays and experiences around you.",
    features: ["Bespoke routing and pacing", "Private guides and vehicles", "Celebration and accessibility planning", "One dedicated planner throughout"],
    howItWorks: ["Describe the trip you want", "We draft an itinerary and budget", "Refine until it fits", "Approve the written quote"],
    terms: "Custom itineraries are quoted individually. Nothing is reserved until you approve the written quotation.",
    relatedTourFilters: { style: "private" },
    image: px(26853148),
    imageAlt: "Mountain lake at sunrise",
  },
];

export function findService(slug: string) {
  return SERVICES.find((s) => s.slug === slug) ?? null;
}
