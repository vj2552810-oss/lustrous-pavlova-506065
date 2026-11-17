export type Region = "domestic" | "international";
export type Theme = "beach" | "hills" | "heritage" | "city" | "nature" | "snow";

export interface TourPackage {
  slug: string;
  name: string;
  location: string;
  region: Region;
  themes: Theme[];
  /** Suggested itinerary length — final duration is customised per enquiry. */
  duration: string;
  summary: string;
  highlights: string[];
  bestFor: string[];
  image: string;
  imageAlt: string;
  /**
   * Indicative price in INR per person. Leave `null` until a price has been
   * verified with suppliers — the UI then shows "Request a Quote".
   */
  verifiedPriceINR: number | null;
}

const px = (id: number, w = 1400) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}`;

export const PACKAGES: TourPackage[] = [
  {
    slug: "goa",
    name: "Goa",
    location: "Goa, India",
    region: "domestic",
    themes: ["beach"],
    duration: "3 Nights / 4 Days",
    summary: "Sun-soaked beaches, Portuguese heritage and relaxed coastal evenings — a short drive from Belagavi.",
    highlights: ["North & South Goa beaches", "Old Goa churches", "Mandovi river cruise", "Fontainhas Latin Quarter"],
    bestFor: ["Couples", "Friends", "Families"],
    image: px(4428274),
    imageAlt: "Aerial view of Goa's palm-fringed coastline and calm sea",
    verifiedPriceINR: null,
  },
  {
    slug: "coorg",
    name: "Coorg",
    location: "Karnataka, India",
    region: "domestic",
    themes: ["hills", "nature"],
    duration: "2 Nights / 3 Days",
    summary: "Misty hills, coffee estates and waterfalls in Karnataka's own Scotland of India.",
    highlights: ["Coffee plantation walk", "Abbey Falls", "Raja's Seat sunset", "Dubare elephant camp"],
    bestFor: ["Couples", "Families", "Weekend getaways"],
    image: px(37672619),
    imageAlt: "Misty green plantation hills under a soft morning sky",
    verifiedPriceINR: null,
  },
  {
    slug: "kerala",
    name: "Kerala",
    location: "Kerala, India",
    region: "domestic",
    themes: ["nature", "beach", "hills"],
    duration: "5 Nights / 6 Days",
    summary: "Tea-clad Munnar, Alleppey houseboats and golden beaches across God's Own Country.",
    highlights: ["Munnar tea gardens", "Alleppey houseboat stay", "Thekkady spice trails", "Kovalam beach"],
    bestFor: ["Honeymooners", "Families", "Slow travellers"],
    image: px(12950219),
    imageAlt: "Traditional houseboats cruising the Alappuzha backwaters in Kerala",
    verifiedPriceINR: null,
  },
  {
    slug: "manali",
    name: "Manali",
    location: "Himachal Pradesh, India",
    region: "domestic",
    themes: ["hills", "snow"],
    duration: "5 Nights / 6 Days",
    summary: "Snow-capped Himalayan peaks, pine valleys and adventure in the heart of Himachal.",
    highlights: ["Solang Valley", "Atal Tunnel & Sissu", "Old Manali cafés", "Hadimba Temple"],
    bestFor: ["Students", "Friends", "Adventure seekers"],
    image: px(16104060),
    imageAlt: "Snow-covered mountain ranges in Manali during winter",
    verifiedPriceINR: null,
  },
  {
    slug: "kashmir",
    name: "Kashmir",
    location: "Jammu & Kashmir, India",
    region: "domestic",
    themes: ["hills", "snow", "nature"],
    duration: "5 Nights / 6 Days",
    summary: "Shikara rides on Dal Lake, Mughal gardens and alpine meadows of Gulmarg and Pahalgam.",
    highlights: ["Dal Lake shikara ride", "Gulmarg gondola", "Pahalgam valleys", "Houseboat stay"],
    bestFor: ["Honeymooners", "Families", "Photographers"],
    image: px(27108526),
    imageAlt: "A traditional shikara gliding across a calm lake in Kashmir",
    verifiedPriceINR: null,
  },
  {
    slug: "rajasthan",
    name: "Rajasthan",
    location: "Rajasthan, India",
    region: "domestic",
    themes: ["heritage"],
    duration: "6 Nights / 7 Days",
    summary: "Royal palaces, desert forts and vibrant bazaars across Jaipur, Udaipur and Jaisalmer.",
    highlights: ["Amber Fort, Jaipur", "Lake Pichola, Udaipur", "Jaisalmer desert camp", "Heritage hotel stays"],
    bestFor: ["Families", "Culture lovers", "Groups"],
    image: px(31836726),
    imageAlt: "Jaipur's historic architecture glowing at golden sunset",
    verifiedPriceINR: null,
  },
  {
    slug: "dubai",
    name: "Dubai",
    location: "United Arab Emirates",
    region: "international",
    themes: ["city", "beach"],
    duration: "4 Nights / 5 Days",
    summary: "Iconic skylines, desert safaris and world-class shopping in the city of superlatives.",
    highlights: ["Burj Khalifa views", "Desert safari", "Dhow cruise dinner", "Dubai Mall & Souks"],
    bestFor: ["Families", "Couples", "First international trip"],
    image: px(19664340),
    imageAlt: "Dubai skyline with the Burj Khalifa seen across the sea",
    verifiedPriceINR: null,
  },
  {
    slug: "thailand",
    name: "Thailand",
    location: "Phuket · Krabi · Bangkok",
    region: "international",
    themes: ["beach", "city"],
    duration: "5 Nights / 6 Days",
    summary: "Turquoise islands, limestone cliffs, street food and lively Bangkok nights.",
    highlights: ["Phi Phi island tour", "Krabi beaches", "Bangkok temples", "Floating markets"],
    bestFor: ["Friends", "Couples", "Students"],
    image: px(176400),
    imageAlt: "Traditional longtail boat on turquoise water beneath limestone cliffs in Thailand",
    verifiedPriceINR: null,
  },
  {
    slug: "bali",
    name: "Bali",
    location: "Indonesia",
    region: "international",
    themes: ["beach", "nature", "heritage"],
    duration: "5 Nights / 6 Days",
    summary: "Temples, rice terraces, private villas and sunsets over the Indian Ocean.",
    highlights: ["Ubud rice terraces", "Tanah Lot temple", "Nusa Penida day trip", "Private pool villas"],
    bestFor: ["Honeymooners", "Couples", "Wellness travellers"],
    image: px(17716409),
    imageAlt: "Aerial view of a Balinese temple surrounded by green rice terraces",
    verifiedPriceINR: null,
  },
  {
    slug: "london",
    name: "London",
    location: "United Kingdom",
    region: "international",
    themes: ["city", "heritage"],
    duration: "5 Nights / 6 Days",
    summary: "Royal landmarks, museums and theatre nights in one of the world's great cities.",
    highlights: ["Westminster & Big Ben", "British Museum", "Thames river cruise", "West End show"],
    bestFor: ["Families", "First Europe trip", "Solo travellers"],
    image: px(17379169),
    imageAlt: "Big Ben and the Houses of Parliament beside the River Thames in London",
    verifiedPriceINR: null,
  },
  {
    slug: "singapore",
    name: "Singapore",
    location: "Singapore",
    region: "international",
    themes: ["city"],
    duration: "4 Nights / 5 Days",
    summary: "Futuristic gardens, Sentosa fun and a spotless, family-friendly city break.",
    highlights: ["Gardens by the Bay", "Sentosa Island", "Universal Studios", "Marina Bay night views"],
    bestFor: ["Families", "Kids", "First international trip"],
    image: px(18662417),
    imageAlt: "Singapore's Marina Bay skyline illuminated at night",
    verifiedPriceINR: null,
  },
];

export function packagesForRegion(region: Region): TourPackage[] {
  return PACKAGES.filter((p) => p.region === region);
}

export const THEME_LABELS: Record<Theme, string> = {
  beach: "Beaches",
  hills: "Hills",
  heritage: "Heritage",
  city: "City Breaks",
  nature: "Nature",
  snow: "Snow",
};

export const HERO_IMAGE = px(26853148, 2000);
export const ABOUT_IMAGE = px(12701460, 1600);

export function formatINR(value: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);
}
