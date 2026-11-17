/** Client-safe CRM constants (no database or server-only imports). */

export const SUPPLIER_CATEGORIES = [
  "hotel",
  "resort",
  "tour_operator",
  "taxi_operator",
  "bus_operator",
  "flight_partner",
  "international_partner",
] as const;

export type SupplierCategory = (typeof SUPPLIER_CATEGORIES)[number];

export const SUPPLIER_CATEGORY_LABELS: Record<SupplierCategory, string> = {
  hotel: "Hotels",
  resort: "Resorts",
  tour_operator: "Tour operators",
  taxi_operator: "Taxi operators",
  bus_operator: "Bus operators",
  flight_partner: "Flight booking partners",
  international_partner: "International travel partners",
};

export const VERIFICATION_STATUSES = ["unverified", "verified", "suspended"] as const;

export const ENQUIRY_STATUS_FLOW = [
  "new_enquiry",
  "contacted",
  "quotation_sent",
  "awaiting_approval",
  "awaiting_payment",
  "awaiting_supplier_confirmation",
  "confirmed",
  "completed",
  "cancelled",
] as const;

export const ENQUIRY_STATUS_LABELS: Record<string, string> = {
  new_enquiry: "New enquiry",
  contacted: "Contacted",
  quotation_sent: "Quotation sent",
  awaiting_approval: "Awaiting customer approval",
  awaiting_payment: "Awaiting payment",
  awaiting_supplier_confirmation: "Awaiting supplier confirmation",
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
  new: "New (legacy)",
  quoted: "Quoted (legacy)",
  closed: "Closed (legacy)",
};

export const PAYMENT_STATUSES = ["not_collected", "unpaid", "partially_paid", "paid", "refunded"] as const;
