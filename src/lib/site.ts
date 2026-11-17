export const SITE = {
  name: "PRITIVO",
  tagline: "Your World. Your Way.",
  url: (process.env.NEXT_PUBLIC_SITE_URL || "https://pritivo.vercel.app").replace(/\/$/, ""),
  description:
    "PRITIVO is an online travel agency in Belagavi, Karnataka. Book hotels as a guest with no account needed, retrieve bookings with a reference, and plan personalised holidays across India and abroad.",
  phoneDisplay: "+91 78923 37596",
  phoneE164: "+917892337596",
  whatsappNumber: "917892337596",
  email: "vj2552810@gmail.com",
  location: "Belagavi, Karnataka, India",
  // Add real profile URLs here when available. Empty values are hidden automatically.
  social: {
    instagram: "",
    facebook: "",
    youtube: "",
    linkedin: "",
  } as Record<string, string>,
};

export const telLink = `tel:${SITE.phoneE164}`;

export function whatsappLink(message?: string) {
  const base = `https://wa.me/${SITE.whatsappNumber}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export function mailtoLink(subject?: string, body?: string) {
  const params: string[] = [];
  if (subject) params.push(`subject=${encodeURIComponent(subject)}`);
  if (body) params.push(`body=${encodeURIComponent(body)}`);
  return `mailto:${SITE.email}${params.length ? `?${params.join("&")}` : ""}`;
}

export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/tours", label: "Tours" },
  { href: "/hotels", label: "Hotels" },
  { href: "/flights", label: "Flights" },
  { href: "/destinations", label: "Destinations" },
  { href: "/services", label: "Services" },
  { href: "/plan-trip", label: "Plan a Trip" },
  { href: "/about", label: "About" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

export const TOUR_LINKS = [
  { href: "/tours", label: "All tours" },
  { href: "/tours?type=domestic", label: "Domestic tours" },
  { href: "/tours?type=international", label: "International tours" },
  { href: "/tours?type=special", label: "Special packages" },
  { href: "/packages", label: "Curated packages" },
];

export const HOTEL_LINKS = [
  { href: "/hotels", label: "Search hotels" },
  { href: "/my-booking", label: "Find my booking" },
  { href: "/explore", label: "Explore map" },
  { href: "/flights", label: "Flights & fares" },
  { href: "/faq", label: "Booking help" },
];

export const LEGAL_LINKS = [
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms & Conditions" },
  { href: "/cancellation-refund-policy", label: "Cancellation & Refund" },
  { href: "/cookie-policy", label: "Cookie Policy" },
];
