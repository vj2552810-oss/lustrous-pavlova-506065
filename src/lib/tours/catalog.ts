import "server-only";
import type { TourType, TravelStyle } from "./constants";

export {
  BUDGET_BANDS,
  CONTINENTS,
  DURATION_BANDS,
  STYLE_LABELS,
  type TourType,
  type TravelStyle,
} from "./constants";

const px = (id: number, w = 1400) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}`;

interface Row {
  slug: string;
  name: string;
  city: string;
  country: string;
  continent: string;
  days: number;
  nights: number;
  summary: string;
  highlights: string[];
  styles: TravelStyle[];
  image: number;
  alt: string;
  bestTime: string;
  featured?: boolean;
}

const domesticRows: Row[] = [
  { slug: "darjeeling", name: "Darjeeling", city: "Darjeeling & Gangtok", country: "India", continent: "Asia", days: 5, nights: 4, summary: "Toy-train mornings, tea gardens and Kanchenjunga sunrises in the eastern Himalayas.", highlights: ["Tiger Hill sunrise", "Darjeeling Himalayan Railway joyride", "Happy Valley tea estate", "Batasia Loop & Peace Pagoda", "Bhutanese monastery visit"], styles: ["family", "budget", "nature"], image: 103875, alt: "Tea plantations on rolling hills in Darjeeling", bestTime: "March–May and October–December", featured: true },
  { slug: "kashmir", name: "Kashmir", city: "Srinagar · Gulmarg · Pahalgam", country: "India", continent: "Asia", days: 6, nights: 5, summary: "Shikara rides on Dal Lake, gondola views over Gulmarg and meadow walks in Pahalgam.", highlights: ["Dal Lake shikara ride", "Gulmarg gondola", "Betaab Valley, Pahalgam", "Mughal gardens of Srinagar", "Houseboat stay"], styles: ["honeymoon", "family", "luxury"], image: 27108526, alt: "Shikara boat on a calm lake in Kashmir", bestTime: "March–October; December for snow", featured: true },
  { slug: "goa", name: "Goa", city: "North & South Goa", country: "India", continent: "Asia", days: 4, nights: 3, summary: "Palm-lined beaches, Portuguese quarters and long coastal evenings — an easy first escape.", highlights: ["Candolim & Baga beaches", "Fontainhas Latin Quarter", "Old Goa churches", "Mandovi river cruise", "Spice plantation lunch"], styles: ["budget", "weekend", "beach"], image: 4428274, alt: "Aerial view of Goa's palm-fringed coastline", bestTime: "November–March", featured: true },
  { slug: "manali", name: "Manali", city: "Manali · Solang", country: "India", continent: "Asia", days: 6, nights: 5, summary: "Pine valleys, snow at Solang and café afternoons in Old Manali.", highlights: ["Solang Valley", "Atal Tunnel & Sissu", "Hadimba Temple", "Old Manali cafés", "Paragliding option"], styles: ["adventure", "budget", "family"], image: 16104060, alt: "Snow-covered mountains around Manali", bestTime: "October–June", featured: true },
  { slug: "sikkim", name: "Sikkim", city: "Gangtok · Lachung · Yumthang", country: "India", continent: "Asia", days: 6, nights: 5, summary: "Monasteries, orchid valleys and the Zero Point road high above the tree line.", highlights: ["Rumtek Monastery", "Tsomgo Lake", "Yumthang Valley", "Zero Point, North Sikkim", "MG Marg evening walk"], styles: ["adventure", "spiritual", "nature"], image: 37866434, alt: "Rumtek Monastery surrounded by greenery in Sikkim", bestTime: "March–June and September–November" },
  { slug: "meghalaya", name: "Meghalaya", city: "Shillong · Cherrapunji · Dawki", country: "India", continent: "Asia", days: 5, nights: 4, summary: "Living root bridges, waterfalls and the glass-clear Umngot river.", highlights: ["Nohkalikai Falls", "Double Decker root bridge", "Dawki river boat ride", "Mawphlang sacred grove", "Laitlum canyons"], styles: ["adventure", "nature", "trekking"], image: 19469039, alt: "Waterfall tumbling through green hills in Meghalaya", bestTime: "September–May" },
  { slug: "ladakh", name: "Ladakh", city: "Leh · Nubra · Pangong", country: "India", continent: "Asia", days: 7, nights: 6, summary: "High-altitude passes, monastery mornings and the impossible blue of Pangong Tso.", highlights: ["Khardung La pass", "Nubra Valley & Diskit", "Pangong Tso lakeside night", "Thiksey Monastery", "Leh market & Shanti Stupa"], styles: ["adventure", "roadtrip", "private"], image: 27593915, alt: "High mountain lake reflecting a clear sky in Ladakh", bestTime: "June–September", featured: true },
  { slug: "kerala", name: "Kerala", city: "Munnar · Alleppey · Kochi", country: "India", continent: "Asia", days: 6, nights: 5, summary: "Tea-country mornings, a backwater houseboat night and Kochi's colonial lanes.", highlights: ["Munnar tea estates", "Alleppey houseboat stay", "Thekkady spice plantation", "Fort Kochi walk", "Kathakali performance"], styles: ["honeymoon", "family", "nature"], image: 12950219, alt: "Houseboats on the Kerala backwaters", bestTime: "September–March", featured: true },
  { slug: "karnataka", name: "Karnataka Heritage", city: "Hampi · Mysuru · Coorg", country: "India", continent: "Asia", days: 6, nights: 5, summary: "Vijayanagara ruins, Mysore's palaces and coffee-scented Coorg — our home-state circuit.", highlights: ["Hampi boulder ruins", "Mysore Palace", "Coorg coffee estate", "Abbey Falls", "Belur & Halebidu temples"], styles: ["heritage", "family", "budget"], image: 2102587, alt: "Plantation bungalow among green hills", bestTime: "October–March" },
  { slug: "rajasthan", name: "Rajasthan", city: "Jaipur · Jodhpur · Udaipur", country: "India", continent: "Asia", days: 7, nights: 6, summary: "Fort cities, lake palaces and desert evenings in India's most regal state.", highlights: ["Amber Fort, Jaipur", "Mehrangarh Fort", "Lake Pichola boat ride", "Sam desert camp", "Heritage haveli stay"], styles: ["heritage", "luxury", "family"], image: 31836726, alt: "Jaipur's historic architecture at golden hour", bestTime: "October–March", featured: true },
  { slug: "andaman", name: "Andaman Islands", city: "Port Blair · Havelock", country: "India", continent: "Asia", days: 5, nights: 4, summary: "Coral reefs, white sand and island ferries far from the mainland rush.", highlights: ["Radhanagar Beach", "Elephant Beach snorkelling", "Cellular Jail light show", "Neil Island day trip", "Scuba discovery dive"], styles: ["honeymoon", "beach", "islands"], image: 261102, alt: "Beachside resort pool framed by palm trees", bestTime: "November–April" },
  { slug: "uttarakhand", name: "Uttarakhand", city: "Rishikesh · Mussoorie", country: "India", continent: "Asia", days: 5, nights: 4, summary: "Ganga aarti evenings, rafting stretches and misty hill-station walks.", highlights: ["Ganga aarti, Rishikesh", "White-water rafting", "Kempty Falls", "Mall Road, Mussoorie", "Beatles Ashram"], styles: ["spiritual", "adventure", "weekend"], image: 26853148, alt: "Mountain lake and forest at dawn", bestTime: "September–June" },
  { slug: "ooty", name: "Ooty", city: "Ooty · Coonoor", country: "India", continent: "Asia", days: 4, nights: 3, summary: "Nilgiri tea country, a toy-train climb and cool hill-town evenings.", highlights: ["Nilgiri Mountain Railway", "Ooty Botanical Gardens", "Tea estate walk, Coonoor", "Pykara Lake", "Doddabetta Peak viewpoint"], styles: ["family", "weekend", "nature"], image: 37633371, alt: "Lush tea plantations in the Nilgiri hills", bestTime: "March–June and September–November" },
  { slug: "coorg", name: "Coorg", city: "Madikeri · Virajpet", country: "India", continent: "Asia", days: 3, nights: 2, summary: "A short, green reset among coffee estates and waterfalls.", highlights: ["Coffee estate walk", "Abbey Falls", "Raja's Seat sunset", "Dubare elephant camp"], styles: ["weekend", "nature", "family"], image: 37672619, alt: "Misty plantation hills", bestTime: "October–March" },
];

const internationalRows: Row[] = [
  { slug: "switzerland", name: "Switzerland", city: "Zurich · Interlaken · Lucerne", country: "Switzerland", continent: "Europe", days: 7, nights: 6, summary: "Alpine railways, lake steamers and car-free mountain villages.", highlights: ["Jungfraujoch excursion", "Interlaken & Lake Brienz", "Mount Titlis cable car", "Lucerne old town", "Glacier Express section"], styles: ["luxury", "honeymoon", "family"], image: 5210287, alt: "Railway and high mountains in the Swiss Alps", bestTime: "May–September; December–March for snow", featured: true },
  { slug: "scotland", name: "Scotland", city: "Edinburgh · Highlands", country: "United Kingdom", continent: "Europe", days: 6, nights: 5, summary: "Castle skylines, Highland glens and whisky-country roads.", highlights: ["Edinburgh Castle", "Isle of Skye", "Loch Ness", "Glencoe valley", "Speyside distillery visit"], styles: ["heritage", "nature", "private"], image: 30928872, alt: "Eilean Donan Castle on a Scottish loch", bestTime: "May–September" },
  { slug: "italy", name: "Italy", city: "Rome · Florence · Venice", country: "Italy", continent: "Europe", days: 8, nights: 7, summary: "Ancient Rome, Renaissance Florence and a gondola evening in Venice.", highlights: ["Colosseum & Roman Forum", "Vatican Museums", "Florence Duomo", "Tuscany wine tasting", "Venice canals"], styles: ["heritage", "honeymoon", "culture"], image: 14836534, alt: "The Colosseum in Rome", bestTime: "April–June and September–October", featured: true },
  { slug: "france", name: "France", city: "Paris · Nice · Provence", country: "France", continent: "Europe", days: 7, nights: 6, summary: "Parisian museums, Riviera coastlines and lavender-country drives.", highlights: ["Eiffel Tower & Seine cruise", "Louvre Museum", "Palace of Versailles", "French Riviera, Nice", "Provence village drive"], styles: ["honeymoon", "luxury", "city"], image: 31482953, alt: "Paris skyline with the Eiffel Tower", bestTime: "April–June and September–October" },
  { slug: "greece", name: "Greece", city: "Athens · Santorini · Mykonos", country: "Greece", continent: "Europe", days: 7, nights: 6, summary: "Acropolis mornings, caldera sunsets and island ferries in the Aegean.", highlights: ["Acropolis & Parthenon", "Santorini caldera sunset", "Oia village walk", "Mykonos beaches", "Greek taverna dinner"], styles: ["honeymoon", "islands", "luxury"], image: 1010657, alt: "Blue-domed churches above the caldera in Santorini", bestTime: "May–October", featured: true },
  { slug: "norway", name: "Norway", city: "Oslo · Bergen · Fjords", country: "Norway", continent: "Europe", days: 7, nights: 6, summary: "Fjord cruises, mountain railways and aurora nights in the north.", highlights: ["Bergen & Bryggen wharf", "Flåm railway", "Sognefjord cruise", "Tromsø aurora chase", "Oslo waterfront"], styles: ["northern-lights", "nature", "adventure"], image: 29513239, alt: "Colourful houses reflected in a Norwegian fjord", bestTime: "June–August; September–March for aurora" },
  { slug: "iceland", name: "Iceland", city: "Reykjavík · Golden Circle", country: "Iceland", continent: "Europe", days: 6, nights: 5, summary: "Waterfalls, black-sand coasts and the northern lights overhead.", highlights: ["Golden Circle", "Seljalandsfoss & Skógafoss", "Jökulsárlón glacier lagoon", "Reynisfjara black beach", "Northern lights hunt"], styles: ["northern-lights", "adventure", "private"], image: 1009136, alt: "Northern lights over a waterfall and snowy mountain in Iceland", bestTime: "September–March for aurora; June–August for midnight sun", featured: true },
  { slug: "japan", name: "Japan", city: "Tokyo · Kyoto · Osaka", country: "Japan", continent: "Asia", days: 8, nights: 7, summary: "Neon Tokyo, temple Kyoto and bullet-train day trips.", highlights: ["Shibuya & Shinjuku", "Kiyomizu-dera, Kyoto", "Fushimi Inari torii walk", "Shinkansen to Osaka", "Nara deer park"], styles: ["culture", "family", "city"], image: 9297099, alt: "Pagoda and temple architecture in Kyoto", bestTime: "March–May and October–November", featured: true },
  { slug: "south-korea", name: "South Korea", city: "Seoul · Busan", country: "South Korea", continent: "Asia", days: 6, nights: 5, summary: "Palace hanbok mornings, café districts and coastal Busan.", highlights: ["Gyeongbokgung Palace", "N Seoul Tower", "Bukchon Hanok Village", "Gamcheon Culture Village, Busan", "Korean BBQ evening"], styles: ["culture", "city", "budget"], image: 29562547, alt: "Traditional hanbok strolling through a Seoul palace in autumn", bestTime: "April–May and September–October" },
  { slug: "bali", name: "Bali", city: "Ubud · Seminyak · Nusa Penida", country: "Indonesia", continent: "Asia", days: 6, nights: 5, summary: "Rice terraces, temple sunsets and a private villa with a pool.", highlights: ["Tegallalang rice terraces", "Tanah Lot sunset", "Nusa Penida day trip", "Ubud art market", "Private pool villa stay"], styles: ["honeymoon", "islands", "beach"], image: 17716409, alt: "Balinese temple amid green rice terraces", bestTime: "April–October", featured: true },
  { slug: "maldives", name: "Maldives", city: "North Malé Atoll", country: "Maldives", continent: "Asia", days: 4, nights: 3, summary: "Overwater villas, house reefs and nothing on the agenda.", highlights: ["Overwater villa stay", "Snorkelling the house reef", "Sunset dolphin cruise", "Sandbank picnic", "Spa over the lagoon"], styles: ["honeymoon", "luxury", "islands"], image: 9394274, alt: "Overwater bungalows on a turquoise lagoon in the Maldives", bestTime: "November–April", featured: true },
  { slug: "dubai", name: "Dubai", city: "Dubai · Abu Dhabi", country: "United Arab Emirates", continent: "Middle East", days: 5, nights: 4, summary: "Skyscraper views, desert dunes and family theme parks.", highlights: ["Burj Khalifa 124th floor", "Desert safari & dune bash", "Dubai Mall & fountains", "Marina dhow cruise", "Sheikh Zayed Grand Mosque"], styles: ["family", "luxury", "city"], image: 19664340, alt: "Dubai skyline with the Burj Khalifa", bestTime: "November–March", featured: true },
  { slug: "turkey", name: "Turkey", city: "Istanbul · Cappadocia", country: "Türkiye", continent: "Europe", days: 7, nights: 6, summary: "Bosphorus ferries, Ottoman palaces and balloons over Cappadocia.", highlights: ["Hagia Sophia & Blue Mosque", "Bosphorus cruise", "Cappadocia balloon flight", "Göreme open-air museum", "Grand Bazaar"], styles: ["heritage", "culture", "honeymoon"], image: 27260270, alt: "Hot air balloons drifting over the Cappadocia landscape", bestTime: "April–June and September–November" },
  { slug: "egypt", name: "Egypt", city: "Cairo · Nile · Luxor", country: "Egypt", continent: "Africa", days: 7, nights: 6, summary: "Pyramids, Nile cruises and the temples of the upper valley.", highlights: ["Pyramids of Giza & Sphinx", "Egyptian Museum", "Nile cruise, Luxor–Aswan", "Karnak Temple", "Abu Simbel option"], styles: ["heritage", "culture", "cruise"], image: 29390088, alt: "Pyramids of Giza under a bright sky", bestTime: "October–April" },
  { slug: "south-africa", name: "South Africa", city: "Cape Town · Kruger", country: "South Africa", continent: "Africa", days: 9, nights: 8, summary: "Table Mountain, Cape winelands and Big Five game drives.", highlights: ["Table Mountain cableway", "Cape Peninsula drive", "Stellenbosch wine estates", "Kruger safari drives", "Johannesburg stopover"], styles: ["wildlife", "luxury", "nature"], image: 32415206, alt: "Wildlife on the South African savanna", bestTime: "May–September for wildlife; November–March for Cape Town", featured: true },
  { slug: "australia", name: "Australia", city: "Sydney · Melbourne · Gold Coast", country: "Australia", continent: "Oceania", days: 9, nights: 8, summary: "Harbour icons, coastal drives and family beach days.", highlights: ["Sydney Opera House & Harbour Bridge", "Blue Mountains", "Great Ocean Road", "Gold Coast theme parks", "Melbourne laneways"], styles: ["family", "city", "beach"], image: 33378301, alt: "Sydney Opera House beside the harbour", bestTime: "September–November and March–May" },
  { slug: "new-zealand", name: "New Zealand", city: "Auckland · Queenstown · Milford Sound", country: "New Zealand", continent: "Oceania", days: 9, nights: 8, summary: "Fjord cruises, alpine roads and adventure capital energy.", highlights: ["Milford Sound cruise", "Queenstown Skyline gondola", "Rotorua geothermal valley", "Hobbiton movie set", "Auckland harbour"], styles: ["adventure", "nature", "private"], image: 27623549, alt: "Milford Sound fjords and mountains in New Zealand", bestTime: "October–April", featured: true },
  { slug: "usa", name: "United States", city: "New York · Las Vegas · Los Angeles", country: "United States", continent: "North America", days: 10, nights: 9, summary: "East-coast icons, desert spectacle and a Pacific-coast finish.", highlights: ["Statue of Liberty & Manhattan", "Times Square evening", "Grand Canyon day trip", "Las Vegas strip", "Hollywood & Santa Monica"], styles: ["city", "family", "luxury"], image: 8569166, alt: "New York City skyline silhouetted at sunset", bestTime: "April–June and September–October" },
  { slug: "canada", name: "Canada", city: "Toronto · Banff · Vancouver", country: "Canada", continent: "North America", days: 9, nights: 8, summary: "Turquoise lakes, Rockies rail views and Pacific-city food.", highlights: ["Niagara Falls", "Banff National Park", "Lake Louise", "Rocky Mountaineer section", "Granville Island, Vancouver"], styles: ["nature", "family", "luxury"], image: 36328281, alt: "Turquoise lake surrounded by forested mountains in Canada", bestTime: "June–September", featured: true },
  { slug: "london", name: "London", city: "Central London", country: "United Kingdom", continent: "Europe", days: 6, nights: 5, summary: "Royal landmarks, world-class museums and West End evenings.", highlights: ["Westminster & Big Ben", "British Museum", "Tower of London", "Thames river cruise", "West End show"], styles: ["city", "heritage", "family"], image: 17379169, alt: "Big Ben and the Houses of Parliament beside the Thames", bestTime: "May–September" },
  { slug: "malaysia", name: "Malaysia", city: "Kuala Lumpur · Langkawi", country: "Malaysia", continent: "Asia", days: 6, nights: 5, summary: "Twin-tower skylines, Batu Caves and Langkawi's cable-car coast.", highlights: ["Petronas Towers & KLCC", "Batu Caves", "Genting Highlands", "Langkawi SkyCab", "Pantai Cenang beach"], styles: ["family", "budget", "islands"], image: 91121, alt: "Longtail boats moored on a tropical shore", bestTime: "May–September" },
  { slug: "europe", name: "Europe Grand Tour", city: "Paris · Interlaken · Rome · Santorini", country: "Multiple (Europe)", continent: "Europe", days: 12, nights: 11, summary: "One carefully paced route through France, Switzerland, Italy and Greece.", highlights: ["Eiffel Tower & Seine cruise", "Jungfraujoch excursion", "Colosseum & Vatican", "Santorini caldera sunset", "Schengen visa assistance"], styles: ["luxury", "honeymoon", "heritage"], image: 31482953, alt: "Paris skyline with the Eiffel Tower", bestTime: "May–September", featured: true },
  { slug: "thailand", name: "Thailand", city: "Bangkok · Phuket · Krabi", country: "Thailand", continent: "Asia", days: 6, nights: 5, summary: "Temple mornings, island hopping and street-food nights.", highlights: ["Grand Palace, Bangkok", "Phi Phi island tour", "Krabi beaches", "Floating market", "Thai massage evening"], styles: ["budget", "beach", "islands"], image: 176400, alt: "Longtail boat on turquoise water beneath limestone cliffs", bestTime: "November–April" },
  { slug: "singapore", name: "Singapore", city: "Singapore", country: "Singapore", continent: "Asia", days: 5, nights: 4, summary: "Gardens, Sentosa fun and an effortless family city break.", highlights: ["Gardens by the Bay", "Sentosa Island", "Universal Studios", "Marina Bay night views", "Hawker food trail"], styles: ["family", "city", "islands"], image: 18662417, alt: "Singapore Marina Bay skyline illuminated at night", bestTime: "Year-round" },
  { slug: "vietnam", name: "Vietnam", city: "Hanoi · Ha Long · Hoi An", country: "Vietnam", continent: "Asia", days: 7, nights: 6, summary: "Karst bays, lantern towns and some of Asia's best-value food.", highlights: ["Ha Long Bay cruise", "Hanoi old quarter", "Hoi An lantern evening", "Mekong Delta option", "Vietnamese cooking class"], styles: ["budget", "culture", "cruise"], image: 2693078, alt: "Limestone karsts rising from calm water", bestTime: "October–April" },
];

const specialRows: Row[] = [
  { slug: "honeymoon-escape", name: "Honeymoon Escape", city: "Maldives · Bali · Santorini", country: "Multiple", continent: "Multi-region", days: 7, nights: 6, summary: "Private villas, sunset dinners and a planner who handles every detail quietly.", highlights: ["Private pool villa", "Candlelit beach dinner", "Couples spa ritual", "Sunset cruise", "Airport-to-villa transfers"], styles: ["honeymoon", "luxury"], image: 9394274, alt: "Overwater villa on a turquoise lagoon", bestTime: "November–April", featured: true },
  { slug: "family-holidays", name: "Family Holiday Collection", city: "Singapore · Dubai · Gold Coast", country: "Multiple", continent: "Multi-region", days: 8, nights: 7, summary: "Short transfers, connecting rooms and something for every age each day.", highlights: ["Theme park day", "Interactive museum", "Family beach afternoon", "Kid-friendly dining plan", "Rest day built in"], styles: ["family"], image: 18662417, alt: "City skyline lit at night", bestTime: "School holidays", featured: true },
  { slug: "luxury-collection", name: "Luxury Collection", city: "Private yacht · 5-star stays", country: "Multiple", continent: "Multi-region", days: 9, nights: 8, summary: "Five-star stays, private guides and skip-the-line access throughout.", highlights: ["5-star suite stays", "Private guide & vehicle", "Fine-dining reservations", "Private transfers", "Lounge access"], styles: ["luxury", "private"], image: 271624, alt: "Contemporary hotel exterior lit at dusk", bestTime: "Year-round" },
  { slug: "budget-explorer", name: "Budget Explorer", city: "Thailand · Vietnam · Sri Lanka", country: "Multiple", continent: "Multi-region", days: 7, nights: 6, summary: "Carefully chosen 3-star stays, local transport and zero wasted spending.", highlights: ["Handpicked budget stays", "Local transport passes", "Street-food walk", "Shared day tours", "Free-time blocks"], styles: ["budget"], image: 176400, alt: "Traditional boat on turquoise water", bestTime: "Shoulder seasons" },
  { slug: "adventure-expedition", name: "Adventure Expedition", city: "Ladakh · Iceland · New Zealand", country: "Multiple", continent: "Multi-region", days: 8, nights: 7, summary: "High passes, glacier walks and adrenaline days with safety-first operators.", highlights: ["Guided trek day", "Glacier or high-pass drive", "Water or air adventure", "Camp or lodge night", "Certified activity operators"], styles: ["adventure"], image: 27623549, alt: "Fjord surrounded by steep mountains", bestTime: "May–September", featured: true },
  { slug: "trekking-trails", name: "Trekking Trails", city: "Himalayas · Alps · Highlands", country: "Multiple", continent: "Multi-region", days: 9, nights: 8, summary: "Acclimatisation planned properly, with porters, guides and rest days.", highlights: ["Acclimatisation schedule", "Licensed mountain guide", "Porter support", "Tea-house or lodge stays", "Contingency weather day"], styles: ["trekking", "adventure"], image: 12701460, alt: "Mountain range reflected in still water", bestTime: "May–June and September–October" },
  { slug: "wildlife-safari", name: "Wildlife Safari", city: "Kruger · Masai Mara · Ranthambore", country: "Multiple", continent: "Multi-region", days: 7, nights: 6, summary: "Dawn and dusk game drives with naturalists who read the bush.", highlights: ["Morning game drive", "Evening game drive", "Naturalist-led bush walk", "Lodge or tented camp", "Conservation talk"], styles: ["wildlife", "nature"], image: 32415206, alt: "Wildlife on open savanna", bestTime: "Dry season" },
  { slug: "cruise-holidays", name: "Cruise Holidays", city: "Mediterranean · Norwegian fjords · Caribbean", country: "Multiple", continent: "Multi-region", days: 8, nights: 7, summary: "Unpack once — cabins, ports and shore excursions planned around you.", highlights: ["Balcony cabin selection", "Curated shore excursions", "Onboard dining plan", "Port transfers", "Sea-day planning"], styles: ["cruise", "luxury"], image: 32609062, alt: "Cruise ship sailing into the sunset", bestTime: "May–September" },
  { slug: "northern-lights", name: "Northern Lights Chase", city: "Tromsø · Reykjavík · Lapland", country: "Multiple", continent: "Europe", days: 6, nights: 5, summary: "Aurora forecasts, dark-sky drives and warm base camps.", highlights: ["Aurora forecast planning", "Night chase with local guide", "Glass igloo or lodge stay", "Snowmobile or dog-sled option", "Spare aurora night"], styles: ["northern-lights", "adventure"], image: 1009136, alt: "Northern lights above a waterfall and snowy mountain", bestTime: "September–March", featured: true },
  { slug: "spiritual-journeys", name: "Spiritual Journeys", city: "Varanasi · Rishikesh · Nepal", country: "Multiple", continent: "Multi-region", days: 6, nights: 5, summary: "Quiet mornings, temple rituals and time to simply sit still.", highlights: ["Ganga aarti evening", "Sunrise boat ride", "Temple and monastery visits", "Yoga or meditation session", "Simple vegetarian dining"], styles: ["spiritual", "culture"], image: 26853148, alt: "Calm lake at sunrise", bestTime: "October–March" },
  { slug: "weekend-getaway", name: "Weekend Getaways", city: "Coorg · Goa · Pondicherry", country: "Multiple", continent: "Multi-region", days: 3, nights: 2, summary: "Friday-to-Sunday escapes from Belagavi with everything arranged.", highlights: ["Two nights, handpicked stay", "Breakfast included", "One signature experience", "Private transfers", "Late checkout request"], styles: ["weekend", "budget"], image: 37672619, alt: "Misty plantation hills", bestTime: "Year-round" },
  { slug: "private-custom-tour", name: "Customised Private Tour", city: "Your itinerary, anywhere", country: "Multiple", continent: "Multi-region", days: 8, nights: 7, summary: "Start with a blank page — we build the route, stays and pace around you.", highlights: ["Private vehicle & guide", "Your pace and dates", "Handpicked stays", "Flexible sightseeing", "One dedicated planner"], styles: ["private", "luxury"], image: 26853148, alt: "Mountain lake at dawn", bestTime: "Whenever suits you", featured: true },
];

/* ------------------------------ content builders ------------------------------ */

const INCLUSIONS: Record<TourType, string[]> = {
  domestic: [
    "Accommodation in the selected category on a twin-share basis",
    "Daily breakfast as listed in the itinerary",
    "All transfers and sightseeing by private air-conditioned vehicle",
    "English-speaking driver or local guide",
    "All applicable taxes on the services listed above",
  ],
  international: [
    "Accommodation in the selected category with daily breakfast",
    "Airport transfers and inter-city travel as listed",
    "Sightseeing and entrance fees listed in the itinerary",
    "Local English-speaking guides on touring days",
    "Visa documentation assistance (government fees extra unless stated)",
    "24/7 WhatsApp support from your PRITIVO planner",
  ],
  special: [
    "Handpicked stays in the category that matches your brief",
    "Daily breakfast and the meals listed in the itinerary",
    "Private transfers and the experiences listed",
    "A dedicated PRITIVO planner before and during the trip",
    "All applicable taxes on the services listed above",
  ],
};

const EXCLUSIONS = [
  "International and domestic airfare unless explicitly stated",
  "Visa fees, travel insurance premiums and airport taxes",
  "Personal expenses, tips, laundry and minibar",
  "Optional activities not listed in the itinerary",
  "Anything not mentioned under inclusions",
  "Peak-season or event surcharges, confirmed in writing before you pay",
];

function itineraryFor(row: Row) {
  const days: { day: number; title: string; description: string }[] = [
    {
      day: 1,
      title: `Arrive ${row.city.split("·")[0].trim()}`,
      description: `Arrival, private transfer to your hotel and a gentle first evening at your own pace. Your PRITIVO planner confirms flight times, transfer details and hotel contacts in your written itinerary.`,
    },
  ];

  const middleDays = Math.max(0, row.days - 2);
  for (let i = 0; i < middleDays; i++) {
    const highlight = row.highlights[i % row.highlights.length];
    days.push({
      day: i + 2,
      title: highlight,
      description: `Today is built around ${highlight.toLowerCase()}. Timings are paced so you are not rushing between stops, with local guidance on the ground and free time for lunch. Your final day-by-day timings are confirmed in writing.`,
    });
  }

  days.push({
    day: row.days,
    title: "Departure",
    description: "Breakfast at the hotel, checkout and a private transfer for your onward journey. Late checkout or an extra night can be arranged on request.",
  });
  return days;
}

function tipsFor(row: Row): string[] {
  const tips = [
    `Best time to travel: ${row.bestTime}. We will flag festival dates, local holidays and weather windows when we quote.`,
    "Keep a digital and printed copy of your booking confirmations, insurance and ID — our planner sends a single trip document.",
    "Share any accessibility, dietary or medical needs early so we can brief hotels and guides before you arrive.",
  ];
  if (row.continent === "Europe" || row.continent === "North America" || row.continent === "Oceania") {
    tips.push("For this region, check passport validity (usually six months beyond return), visa or e-ticket requirements and Schengen/ETA rules for your nationality before booking.");
  } else if (row.continent === "Asia" || row.continent === "Middle East" || row.continent === "Africa") {
    tips.push("Visa rules vary by nationality and destination; we share the current checklist but approval always rests with the authorities.");
  } else {
    tips.push("Domestic travel is straightforward; carry a government photo ID accepted by hotels, and share any permit requirements for restricted areas.");
  }
  if (row.styles.includes("trekking") || row.styles.includes("adventure")) {
    tips.push("Build in acclimatisation days for high-altitude routes, carry a basic first-aid kit and travel insurance that covers your planned activities.");
  }
  return tips;
}

export interface SeedTour {
  slug: string;
  name: string;
  type: TourType;
  city: string;
  country: string;
  continent: string;
  summary: string;
  description: string;
  durationDays: number;
  durationNights: number;
  heroImage: string;
  heroImageAlt: string;
  highlights: string[];
  itinerary: { day: number; title: string; description: string }[];
  inclusions: string[];
  exclusions: string[];
  travelTips: string[];
  styles: string[];
  bestTime: string;
  published: boolean;
  featured: boolean;
  sortOrder: number;
}

function build(row: Row, type: TourType, index: number): SeedTour {
  return {
    slug: row.slug,
    name: row.name,
    type,
    city: row.city,
    country: row.country,
    continent: row.continent,
    summary: row.summary,
    description: `${row.summary} This ${row.days}-day journey through ${row.city} is a starting point: every PRITIVO itinerary is adjusted to your dates, pace, hotel category and interests. Your planner confirms the final day-by-day plan, inclusions and price in a written quotation before anything is booked.`,
    durationDays: row.days,
    durationNights: row.nights,
    heroImage: px(row.image),
    heroImageAlt: row.alt,
    highlights: row.highlights,
    itinerary: itineraryFor(row),
    inclusions: INCLUSIONS[type],
    exclusions: EXCLUSIONS,
    travelTips: tipsFor(row),
    styles: row.styles,
    bestTime: row.bestTime,
    published: true,
    featured: Boolean(row.featured),
    sortOrder: index + 1,
  };
}

export const SEED_TOURS: SeedTour[] = [
  ...domesticRows.map((r, i) => build(r, "domestic", i)),
  ...internationalRows.map((r, i) => build(r, "international", i)),
  ...specialRows.map((r, i) => build(r, "special", i)),
];

