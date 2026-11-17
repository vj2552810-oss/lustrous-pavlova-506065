import "server-only";

/**
 * Destination guide pages.
 *
 * Budget figures are clearly labelled as *indicative planning ranges*, never
 * guaranteed prices, and every page links to the live tour catalogue for the
 * actual written quote. Availability is never claimed here.
 */
export interface DestinationGuide {
  slug: string;
  name: string;
  region: "Domestic" | "International";
  country: string;
  /** Free-text keys used to find matching tours in the catalogue. */
  tourMatches: string[];
  overview: string;
  bestTime: string;
  attractions: string[];
  durations: string;
  indicativeBudgetINR: { label: string; from: number; to: number; perPerson: boolean };
  budgetNote: string;
  included: string[];
  excluded: string[];
  tips: string[];
  image: string;
  imageAlt: string;
}

const px = (id: number, w = 1600) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}`;

export const DESTINATION_GUIDES: DestinationGuide[] = [
  {
    slug: "goa", name: "Goa", region: "Domestic", country: "India", tourMatches: ["goa"],
    overview: "India's easiest beach escape — a short drive from Belagavi. Portuguese-era churches in Old Goa, the Latin Quarter of Fontainhas, palm-lined shores in the north and quieter coves in the south.",
    bestTime: "November to March for dry, warm weather; June to September for green, low-season rates.",
    attractions: ["Candolim & Baga beaches", "Old Goa basilicas", "Fontainhas Latin Quarter", "Mandovi river cruise", "Dudhsagar Falls day trip"],
    durations: "3–5 days is ideal; longer if you want both north and south.",
    indicativeBudgetINR: { label: "Comfortable beach stay", from: 12000, to: 32000, perPerson: true },
    budgetNote: "Indicative planning range for a 3–4 night stay including hotel, transfers and sightseeing, excluding travel to Goa. Actual pricing depends on season, hotel category and group size, and is confirmed only in your written quotation.",
    included: ["Hotel in your chosen category", "Airport/station transfers", "Sightseeing by private vehicle", "Daily breakfast"],
    excluded: ["Travel to and from Goa", "Water sports and entry tickets unless listed", "Personal expenses and tips"],
    tips: ["Peak season (late December) needs early planning — hotels fill quickly.", "North Goa is livelier, south Goa is calmer; tell us your preference.", "Carry a government photo ID for hotel check-in."],
    image: px(4428274), imageAlt: "Aerial view of Goa's palm-fringed coastline",
  },
  {
    slug: "kerala", name: "Kerala", region: "Domestic", country: "India", tourMatches: ["kerala"],
    overview: "Tea-country mornings in Munnar, a night aboard an Alleppey houseboat, spice plantations in Thekkady and colonial Fort Kochi — India's slowest, greenest holiday.",
    bestTime: "September to March; monsoon (June–August) is lush and quieter.",
    attractions: ["Munnar tea estates", "Alleppey backwaters", "Thekkady spice trails", "Fort Kochi & Chinese fishing nets", "Kovalam beach"],
    durations: "5–7 days covers the classic circuit comfortably.",
    indicativeBudgetINR: { label: "Classic Kerala circuit", from: 18000, to: 45000, perPerson: true },
    budgetNote: "Indicative range for 5–6 nights including houseboat night, hotels and private transport. Houseboat category changes the total significantly; the exact figure appears in your written quotation.",
    included: ["Hotels and one houseboat night", "Private air-conditioned vehicle", "Daily breakfast", "Sightseeing as per itinerary"],
    excluded: ["Flights or trains to Kochi", "Ayurveda treatments unless requested", "Entry fees not listed"],
    tips: ["Houseboats are shared or private — tell us which you prefer.", "Munnar roads are winding; plan motion-sickness remedies for children.", "Kathakali performances usually start early evening."],
    image: px(12950219), imageAlt: "Houseboats on the Kerala backwaters",
  },
  {
    slug: "kashmir", name: "Kashmir", region: "Domestic", country: "India", tourMatches: ["kashmir"],
    overview: "Shikara rides at dawn on Dal Lake, gondola views above Gulmarg, meadow walks in Pahalgam and Mughal gardens in Srinagar.",
    bestTime: "March to October for valleys and gardens; December to February for snow.",
    attractions: ["Dal Lake & houseboats", "Gulmarg gondola", "Pahalgam & Betaab Valley", "Mughal Gardens", "Sonmarg day trip"],
    durations: "5–6 days is the standard circuit.",
    indicativeBudgetINR: { label: "Srinagar · Gulmarg · Pahalgam", from: 20000, to: 52000, perPerson: true },
    budgetNote: "Indicative range for 5 nights including houseboat or hotel stay, private vehicle and sightseeing. Gondola tickets and pony rides are extra unless listed in your quotation.",
    included: ["Hotel and houseboat nights", "Private vehicle with driver", "Daily breakfast", "Sightseeing per itinerary"],
    excluded: ["Flights to Srinagar", "Gondola and adventure activity tickets", "Pony rides and personal shopping"],
    tips: ["Gulmarg gondola runs in phases and depends on weather.", "Winter travel needs warm layers and flexible dates.", "Carry ID; some areas may require permits which we arrange."],
    image: px(27108526), imageAlt: "Shikara boat on Dal Lake in Kashmir",
  },
  {
    slug: "manali", name: "Manali", region: "Domestic", country: "India", tourMatches: ["manali"],
    overview: "Pine valleys, snow at Solang, café afternoons in Old Manali and river-side walks along the Beas.",
    bestTime: "October to June; December to February for snow.",
    attractions: ["Solang Valley", "Atal Tunnel & Sissu", "Hadimba Temple", "Old Manali cafés", "Rohtang Pass (seasonal)"],
    durations: "5–6 days, often combined with Shimla or Kasol.",
    indicativeBudgetINR: { label: "Himachal hill holiday", from: 16000, to: 40000, perPerson: true },
    budgetNote: "Indicative range for 5 nights including hotel, private vehicle and sightseeing, excluding travel to the region. Snow activities are charged separately and confirmed in your quotation.",
    included: ["Hotel stays", "Private vehicle", "Daily breakfast", "Local sightseeing"],
    excluded: ["Travel to Manali", "Rohtang permits and snow activities", "Paragliding and adventure sports"],
    tips: ["Rohtang Pass closes in heavy snow — itineraries adapt seasonally.", "Book early for December–January peak snow season.", "Acclimatise a day before high-altitude excursions."],
    image: px(16104060), imageAlt: "Snow-covered mountains around Manali",
  },
  {
    slug: "rajasthan", name: "Rajasthan", region: "Domestic", country: "India", tourMatches: ["rajasthan"],
    overview: "Fort cities, lake palaces and desert camps — Jaipur's pink lanes, Jodhpur's blue city, Udaipur's Pichola sunsets and Jaisalmer's golden dunes.",
    bestTime: "October to March; summers are extremely hot.",
    attractions: ["Amber Fort, Jaipur", "Mehrangarh Fort, Jodhpur", "Lake Pichola boat ride", "Sam Sand Dunes camp", "City Palace & Hawa Mahal"],
    durations: "6–8 days for the golden triangle plus desert.",
    indicativeBudgetINR: { label: "Royal Rajasthan circuit", from: 24000, to: 70000, perPerson: true },
    budgetNote: "Indicative range for 6–7 nights across two to three cities. Heritage hotel categories vary widely, so your quotation states the exact properties and room types.",
    included: ["Heritage or modern hotels as chosen", "Private vehicle with driver", "Daily breakfast", "Monument sightseeing per itinerary"],
    excluded: ["Monument entry fees unless listed", "Desert camp upgrades", "Cultural show tickets"],
    tips: ["Monuments have separate entry fees and camera charges.", "Desert camps are best between October and March.", "Haveli stays have steep stairs — mention accessibility needs early."],
    image: px(31836726), imageAlt: "Jaipur's historic architecture at golden hour",
  },
  {
    slug: "coorg", name: "Coorg", region: "Domestic", country: "India", tourMatches: ["coorg"],
    overview: "Karnataka's own hill country — coffee estates, misty mornings, Abbey Falls and Kodava home cooking, close enough to Belagavi for a weekend.",
    bestTime: "October to March; monsoon is dramatic but wet.",
    attractions: ["Coffee plantation walk", "Abbey Falls", "Raja's Seat sunset", "Dubare elephant camp", "Talakaveri"],
    durations: "2–3 nights.",
    indicativeBudgetINR: { label: "Weekend plantation escape", from: 8000, to: 22000, perPerson: true },
    budgetNote: "Indicative range for 2 nights including plantation stay, breakfast and local sightseeing. Homestay and resort categories differ considerably; the exact rate appears in your quotation.",
    included: ["Plantation stay or resort", "Daily breakfast", "Estate walk and local sightseeing"],
    excluded: ["Travel to Coorg", "Adventure activities", "Meals beyond breakfast unless listed"],
    tips: ["Estate walks are best early morning.", "Leeches appear during heavy monsoon — carry salt and closed shoes.", "Weekends fill quickly; midweek rates are lower."],
    image: px(37672619), imageAlt: "Misty plantation hills in Coorg",
  },
  {
    slug: "ooty", name: "Ooty", region: "Domestic", country: "India", tourMatches: ["ooty"],
    overview: "The Nilgiri queen of hill stations — a toy-train climb through tea country, botanical gardens, eucalyptus-scented air and Coonoor's quieter estates.",
    bestTime: "March to June and September to November.",
    attractions: ["Nilgiri Mountain Railway", "Government Botanical Gardens", "Ooty Lake", "Doddabetta Peak", "Coonoor tea estates"],
    durations: "3–4 days, often with Coonoor and Kodaikanal.",
    indicativeBudgetINR: { label: "Nilgiri hill holiday", from: 10000, to: 26000, perPerson: true },
    budgetNote: "Indicative range for 3 nights including hotel, private vehicle and sightseeing. Toy-train tickets are subject to IRCTC availability and are confirmed separately in your quotation.",
    included: ["Hill-station hotel", "Private vehicle", "Daily breakfast", "Local sightseeing"],
    excluded: ["Toy-train tickets unless arranged", "Travel to the Nilgiris", "Boating and activity fees"],
    tips: ["Book toy-train seats well ahead — they sell out.", "Evenings are cold even in summer; pack layers.", "Weekend traffic in Ooty town is heavy."],
    image: px(37633371), imageAlt: "Tea plantations in the Nilgiri hills",
  },
  {
    slug: "andaman", name: "Andaman Islands", region: "Domestic", country: "India", tourMatches: ["andaman"],
    overview: "Coral reefs, white sand and island ferries — Radhanagar's sunsets, Elephant Beach snorkelling and Port Blair's colonial history.",
    bestTime: "November to April; seas are calmest for water sports.",
    attractions: ["Radhanagar Beach, Havelock", "Elephant Beach snorkelling", "Cellular Jail light show", "Neil Island", "Scuba discovery dive"],
    durations: "4–6 days including ferry days.",
    indicativeBudgetINR: { label: "Island hopping holiday", from: 28000, to: 75000, perPerson: true },
    budgetNote: "Indicative range for 4–5 nights including resort, inter-island ferries and sightseeing, excluding flights to Port Blair. Ferry schedules and weather can change itineraries; your quotation states what is included.",
    included: ["Resort or hotel stays", "Inter-island ferry transfers", "Airport transfers", "Daily breakfast", "Snorkelling trip"],
    excluded: ["Flights to Port Blair", "Scuba and water sports unless listed", "Cellular Jail entry tickets"],
    tips: ["Ferries depend on weather — keep a buffer day before your flight home.", "Scuba requires a medical declaration for some conditions.", "Carry reef-safe sunscreen."],
    image: px(261102), imageAlt: "Beachside resort pool framed by palms",
  },
  {
    slug: "dubai", name: "Dubai", region: "International", country: "United Arab Emirates", tourMatches: ["dubai"],
    overview: "A city of superlatives — the Burj Khalifa, desert dunes at dusk, dhow dinners on the Creek and theme parks that suit every age.",
    bestTime: "November to March; summers exceed 40°C.",
    attractions: ["Burj Khalifa 124th floor", "Desert safari & dune bash", "Dubai Mall & fountains", "Marina dhow cruise", "Sheikh Zayed Grand Mosque, Abu Dhabi"],
    durations: "4–6 days.",
    indicativeBudgetINR: { label: "Dubai city break", from: 55000, to: 140000, perPerson: true },
    budgetNote: "Indicative range for 4–5 nights including hotel, transfers, desert safari and Burj Khalifa entry, plus international flights from India in economy. Airfares and hotel rates fluctuate daily, so the exact total is confirmed only in your written quotation.",
    included: ["Hotel with daily breakfast", "Airport and sightseeing transfers", "Desert safari with BBQ dinner", "Burj Khalifa ticket", "Visa assistance"],
    excluded: ["Visa government fees unless stated", "Travel insurance", "Theme park tickets unless listed", "Personal shopping"],
    tips: ["Passport must usually be valid six months beyond return.", "Dress modestly at mosques and government areas.", "Desert safaris are not advised in late pregnancy or for back conditions."],
    image: px(19664340), imageAlt: "Dubai skyline with the Burj Khalifa",
  },
  {
    slug: "bali", name: "Bali", region: "International", country: "Indonesia", tourMatches: ["bali"],
    overview: "Temple sunsets, rice terraces, private pool villas and surf beaches — Indonesia's most popular honeymoon island.",
    bestTime: "April to October (dry season).",
    attractions: ["Tegallalang rice terraces", "Tanah Lot temple", "Nusa Penida day trip", "Ubud art market", "Uluwatu kecak dance"],
    durations: "5–7 days.",
    indicativeBudgetINR: { label: "Bali villa holiday", from: 60000, to: 150000, perPerson: true },
    budgetNote: "Indicative range for 5–6 nights including villa or hotel, transfers, sightseeing and economy flights from India. Villa categories vary enormously; your quotation names the exact property.",
    included: ["Villa or hotel with breakfast", "Private transfers", "Sightseeing per itinerary", "Nusa Penida day trip"],
    excluded: ["Visa on arrival fee", "Travel insurance", "Water sports unless listed"],
    tips: ["Visa on arrival is available for Indian passport holders — carry return tickets and hotel proof.", "Scooter rentals require an international driving permit.", "Temple visits need a sarong, usually provided."],
    image: px(17716409), imageAlt: "Balinese temple amid rice terraces",
  },
  {
    slug: "thailand", name: "Thailand", region: "International", country: "Thailand", tourMatches: ["thailand"],
    overview: "Bangkok's temples and street food, Phuket and Krabi's limestone islands, and some of Asia's best-value beach hotels.",
    bestTime: "November to April.",
    attractions: ["Grand Palace & Wat Pho", "Phi Phi island tour", "Krabi beaches", "Floating markets", "Thai massage"],
    durations: "5–7 days.",
    indicativeBudgetINR: { label: "Thailand beach & city", from: 45000, to: 110000, perPerson: true },
    budgetNote: "Indicative range for 5–6 nights including hotel, transfers, island tour and economy flights from India. Season and island choice change the total; exact pricing is confirmed in your quotation.",
    included: ["Hotel with breakfast", "Airport and inter-city transfers", "Island hopping tour", "Bangkok city tour"],
    excluded: ["Visa fee if applicable", "Travel insurance", "Optional shows and activities"],
    tips: ["Check current visa rules for your nationality before booking.", "Island transfers depend on sea conditions.", "Carry small cash for markets and tuk-tuks."],
    image: px(176400), imageAlt: "Longtail boat beneath limestone cliffs in Thailand",
  },
  {
    slug: "singapore", name: "Singapore", region: "International", country: "Singapore", tourMatches: ["singapore"],
    overview: "Spotless, family-friendly and compact — Gardens by the Bay, Sentosa, hawker food and effortless public transport.",
    bestTime: "Year-round; February to April is drier.",
    attractions: ["Gardens by the Bay", "Sentosa Island", "Universal Studios", "Marina Bay night views", "Chinatown & Little India"],
    durations: "4–5 days.",
    indicativeBudgetINR: { label: "Singapore family break", from: 60000, to: 130000, perPerson: true },
    budgetNote: "Indicative range for 4 nights including hotel, transfers, attraction passes and economy flights from India. Attraction bundles vary by date; your quotation lists each ticket included.",
    included: ["Hotel with breakfast", "Airport transfers", "Attraction passes as listed", "Half-day city tour"],
    excluded: ["Visa processing fees", "Travel insurance", "Meals beyond breakfast unless listed"],
    tips: ["Chewing gum and littering carry fines — brief children before arrival.", "Attraction passes are date-specific.", "MRT is the fastest way around; get an EZ-Link card."],
    image: px(18662417), imageAlt: "Singapore Marina Bay skyline at night",
  },
  {
    slug: "malaysia", name: "Malaysia", region: "International", country: "Malaysia", tourMatches: ["malaysia"],
    overview: "Kuala Lumpur's twin towers, Batu Caves, Genting's highland cool and Langkawi's cable-car coastline.",
    bestTime: "May to September for the west coast.",
    attractions: ["Petronas Towers & KLCC", "Batu Caves", "Genting Highlands", "Langkawi SkyCab", "Pantai Cenang"],
    durations: "5–7 days.",
    indicativeBudgetINR: { label: "Malaysia city & island", from: 45000, to: 105000, perPerson: true },
    budgetNote: "Indicative range for 5–6 nights including hotels, transfers, sightseeing and economy flights from India. Island legs add ferry or flight costs stated in your quotation.",
    included: ["Hotels with breakfast", "Transfers", "City and highland sightseeing", "Langkawi SkyCab ticket"],
    excluded: ["Visa or e-visa fees", "Travel insurance", "Theme park tickets unless listed"],
    tips: ["Check e-visa requirements for your nationality.", "Monsoon affects east-coast islands more than Langkawi.", "Dress modestly at mosques."],
    image: px(91121), imageAlt: "Longtail boats on a tropical shoreline",
  },
  {
    slug: "maldives", name: "Maldives", region: "International", country: "Maldives", tourMatches: ["maldives"],
    overview: "Overwater villas, house reefs and the shortest international hop from India — the classic honeymoon reset.",
    bestTime: "November to April.",
    attractions: ["Overwater villa stay", "House reef snorkelling", "Sunset dolphin cruise", "Sandbank picnic", "Over-water spa"],
    durations: "3–5 days; most travellers go straight to one resort.",
    indicativeBudgetINR: { label: "Maldives villa escape", from: 85000, to: 250000, perPerson: true },
    budgetNote: "Indicative range for 3–4 nights including resort, meals plan, speedboat or seaplane transfers and flights from India. Transfer type (speedboat vs seaplane) changes the price sharply; your quotation states both.",
    included: ["Resort stay with chosen meal plan", "Speedboat or seaplane transfers", "Snorkelling excursion", "Airport assistance"],
    excluded: ["Travel insurance", "Spa treatments", "Premium dining unless listed"],
    tips: ["Seaplane transfers operate in daylight only — plan arrival times accordingly.", "All-inclusive plans differ widely between resorts.", "Coral-safe sunscreen is often required."],
    image: px(9394274), imageAlt: "Overwater villa on a turquoise lagoon",
  },
  {
    slug: "europe", name: "Europe", region: "International", country: "Multiple (Europe)", tourMatches: ["europe", "switzerland", "italy", "france", "greece", "scotland", "norway", "iceland"],
    overview: "One continent, many itineraries — Alpine railways in Switzerland, Renaissance Rome, Parisian boulevards, Santorini sunsets, Scottish glens, Norwegian fjords and Icelandic auroras.",
    bestTime: "May to September for classic routes; September to March for northern lights.",
    attractions: ["Jungfraujoch, Switzerland", "Colosseum & Vatican, Rome", "Eiffel Tower & Louvre, Paris", "Santorini caldera", "Scottish Highlands", "Norwegian fjords", "Iceland waterfalls & aurora"],
    durations: "7–14 days depending on how many countries you combine.",
    indicativeBudgetINR: { label: "Multi-country Europe tour", from: 150000, to: 450000, perPerson: true },
    budgetNote: "Indicative range for 7–12 nights including hotels, intercity travel, sightseeing, Schengen visa assistance and economy flights from India. Switzerland, Norway and Iceland sit at the higher end. Actual pricing depends on season, route and hotel category and is confirmed only in your written quotation.",
    included: ["Hotels with breakfast", "Intercity trains or coaches", "Sightseeing and entry tickets listed", "Schengen visa document checklist", "English-speaking guides on touring days"],
    excluded: ["Schengen visa government fee and biometrics", "Travel insurance premium", "Meals beyond those listed", "Optional excursions"],
    tips: ["Schengen appointments can take weeks — start 2–3 months ahead.", "Passport validity of six months beyond return is normally required.", "European summers are busy; shoulder season offers better rates and fewer crowds."],
    image: px(5210287), imageAlt: "Railway and mountains in the Swiss Alps",
  },
];

export function findDestinationGuide(slug: string) {
  return DESTINATION_GUIDES.find((d) => d.slug === slug) ?? null;
}
