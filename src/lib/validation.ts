export type FieldErrors = Record<string, string>;

export const TRIP_TYPES = [
  "Family Holiday",
  "Honeymoon / Couple",
  "Solo Trip",
  "Friends / Group",
  "Student / Educational",
  "Corporate / Offsite",
  "Pilgrimage",
  "Adventure",
] as const;

export const BUDGET_RANGES = [
  "Under ₹15,000 per person",
  "₹15,000 – ₹30,000 per person",
  "₹30,000 – ₹60,000 per person",
  "₹60,000 – ₹1,00,000 per person",
  "Above ₹1,00,000 per person",
  "Not sure yet — please advise",
] as const;

export interface TripEnquiry {
  name: string;
  email: string;
  phone: string;
  destination: string;
  departureCity: string;
  startDate: string;
  endDate: string;
  flexibleDates: boolean;
  travelers: string;
  budget: string;
  tripType: string;
  requirements: string;
}

export interface ContactEnquiry {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function cleanPhone(phone: string) {
  return phone.replace(/[\s\-()]/g, "");
}

function validateCommon(d: { name: string; email: string; phone: string }, e: FieldErrors) {
  const name = d.name.trim();
  if (name.length < 2) e.name = "Please enter your full name.";
  else if (name.length > 120) e.name = "Name is too long.";
  else if (!/^[\p{L}\s.'-]+$/u.test(name)) e.name = "Name can only contain letters, spaces, dots and hyphens.";

  if (!EMAIL_RE.test(d.email.trim())) e.email = "Please enter a valid email address.";

  const phone = cleanPhone(d.phone);
  if (!/^\+?\d{10,15}$/.test(phone)) e.phone = "Enter a valid phone number (10–15 digits, country code optional).";
}

export function validateTrip(d: TripEnquiry, today = new Date()): FieldErrors {
  const e: FieldErrors = {};
  validateCommon(d, e);
  if (d.destination.trim().length < 2) e.destination = "Tell us where you'd like to go.";
  if (d.departureCity.trim().length < 2) e.departureCity = "Please enter your departure city.";

  const t = new Date(today.toISOString().slice(0, 10));
  if (!d.startDate) e.startDate = "Choose a preferred start date.";
  else if (new Date(d.startDate) < t) e.startDate = "Start date cannot be in the past.";
  if (d.endDate && d.startDate && new Date(d.endDate) < new Date(d.startDate))
    e.endDate = "Return date must be after the start date.";

  const n = Number(d.travelers);
  if (!Number.isInteger(n) || n < 1 || n > 200) e.travelers = "Enter number of travellers (1–200).";
  if (!d.budget) e.budget = "Please select a budget range.";
  if (!d.tripType) e.tripType = "Please select a trip type.";
  if (d.requirements.length > 1000) e.requirements = "Please keep this under 1000 characters.";
  return e;
}

export const HOTEL_CATEGORIES = ["Budget (2–3 star)", "Comfort (3–4 star)", "Premium (4–5 star)", "Luxury (5 star+)", "Boutique / homestay", "Any — please advise"] as const;

/**
 * Advanced trip enquiry: adds starting location, adults, children and hotel
 * category. Server-side validation mirrors the client form.
 */
export function validateAdvancedTrip(d: TripEnquiry, extra: Record<string, unknown>): FieldErrors {
  const e = validateTrip(d);
  if (d.departureCity.trim().length < 2) e.departureCity = "Please enter your starting location.";

  const adults = Number(extra.adults);
  const childrenRaw = extra.children === undefined || extra.children === "" ? 0 : Number(extra.children);
  if (!Number.isInteger(adults) || adults < 1 || adults > 20) e.adults = "Enter between 1 and 20 adults.";
  if (!Number.isInteger(childrenRaw) || childrenRaw < 0 || childrenRaw > 20) e.children = "Enter between 0 and 20 children.";
  if (Number.isInteger(adults) && Number.isInteger(childrenRaw) && adults + childrenRaw > 40) e.adults = "For groups above 40 travellers, please contact us directly.";

  const hotelCategory = typeof extra.hotelCategory === "string" ? extra.hotelCategory : "";
  if (!hotelCategory) e.hotelCategory = "Please choose a hotel category.";
  return e;
}

export function validateContact(d: ContactEnquiry): FieldErrors {
  const e: FieldErrors = {};
  validateCommon(d, e);
  if (d.subject.trim().length < 3) e.subject = "Please add a short subject.";
  if (d.message.trim().length < 10) e.message = "Message should be at least 10 characters.";
  else if (d.message.length > 1500) e.message = "Please keep your message under 1500 characters.";
  return e;
}

function fmtDate(s: string) {
  if (!s) return "";
  const d = new Date(s);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export function tripDatesText(d: TripEnquiry) {
  const range = d.endDate ? `${fmtDate(d.startDate)} – ${fmtDate(d.endDate)}` : `From ${fmtDate(d.startDate)}`;
  return d.flexibleDates ? `${range} (flexible)` : range;
}

export function buildTripMessage(d: TripEnquiry) {
  return [
    "Hello PRITIVO! I'd like a trip quotation.",
    "",
    `*Name:* ${d.name.trim()}`,
    `*Email:* ${d.email.trim()}`,
    `*Phone:* ${d.phone.trim()}`,
    `*Destination:* ${d.destination.trim()}`,
    `*Departure city:* ${d.departureCity.trim()}`,
    `*Travel dates:* ${tripDatesText(d)}`,
    `*Travellers:* ${d.travelers}`,
    `*Budget:* ${d.budget}`,
    `*Trip type:* ${d.tripType}`,
    d.requirements.trim() ? `*Special requirements:* ${d.requirements.trim()}` : "",
  ]
    .filter((l, i) => l !== "" || i === 1)
    .join("\n");
}

export function buildContactMessage(d: ContactEnquiry) {
  return [
    `Hello PRITIVO! ${d.subject.trim()}`,
    "",
    d.message.trim(),
    "",
    `— ${d.name.trim()}`,
    `Email: ${d.email.trim()}`,
    `Phone: ${d.phone.trim()}`,
  ].join("\n");
}
