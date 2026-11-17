
export type TourType = "domestic" | "international" | "special";

export const STYLE_LABELS = {
  honeymoon: "Honeymoon",
  family: "Family holidays",
  luxury: "Luxury tours",
  budget: "Budget trips",
  adventure: "Adventure",
  trekking: "Trekking",
  wildlife: "Wildlife safaris",
  cruise: "Cruise holidays",
  "northern-lights": "Northern lights",
  spiritual: "Spiritual tours",
  weekend: "Weekend getaways",
  private: "Private tours",
  beach: "Beaches",
  heritage: "Heritage",
  city: "City breaks",
  nature: "Nature",
  culture: "Culture",
  roadtrip: "Road trips",
  islands: "Islands",
} as const;

export type TravelStyle = keyof typeof STYLE_LABELS;

export const CONTINENTS = ["Asia", "Europe", "Africa", "North America", "South America", "Oceania", "Middle East", "Multi-region"] as const;

export const DURATION_BANDS = [
  { key: "short", label: "1–4 days", min: 1, max: 4 },
  { key: "mid", label: "5–7 days", min: 5, max: 7 },
  { key: "long", label: "8–10 days", min: 8, max: 10 },
  { key: "expedition", label: "11+ days", min: 11, max: 60 },
] as const;

export const BUDGET_BANDS = [
  { key: "under-30k", label: "Under ₹30,000 pp", min: 0, max: 30000 },
  { key: "30-60k", label: "₹30,000 – ₹60,000 pp", min: 30000, max: 60000 },
  { key: "60k-1l", label: "₹60,000 – ₹1,00,000 pp", min: 60000, max: 100000 },
  { key: "1l-plus", label: "₹1,00,000+ pp", min: 100000, max: 10000000 },
] as const;

export const TOUR_TYPE_LABELS: Record<TourType, string> = {
  domestic: "Domestic tours",
  international: "International tours",
  special: "Special packages",
};
