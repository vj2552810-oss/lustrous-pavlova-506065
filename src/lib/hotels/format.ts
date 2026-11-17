/** Formatting helpers safe to use in both server and client components. */

export function nightsCount(checkIn: string, checkOut: string) {
  return Math.max(0, Math.round((Date.parse(`${checkOut}T00:00:00Z`) - Date.parse(`${checkIn}T00:00:00Z`)) / 86_400_000));
}

export function formatStayDate(iso: string) {
  if (!iso) return "";
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}

export function formatStayDateShort(iso: string) {
  if (!iso) return "";
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: "UTC" });
}

export function formatMoney(minor: number, currency = "INR") {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 0 }).format(Math.round(minor) / 100);
}

export function todayISO(offsetDays = 0) {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

export function maskEmail(email: string) {
  const [user, domain] = email.split("@");
  if (!domain) return "•••";
  return `${user.slice(0, 2)}${"•".repeat(Math.max(2, Math.min(6, user.length - 2)))}@${domain}`;
}

export function maskPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return `••••••${digits.slice(-4)}`;
}

export const BOOKING_STATUS_LABELS: Record<string, { label: string; tone: "success" | "warning" | "danger" | "neutral" }> = {
  confirmed: { label: "Confirmed", tone: "success" },
  paid: { label: "Payment received — confirming with hotel", tone: "warning" },
  pending_payment: { label: "Awaiting payment", tone: "warning" },
  request_received: { label: "Request received — not confirmed", tone: "warning" },
  demo_request: { label: "Demo request — not a reservation", tone: "warning" },
  confirmation_failed: { label: "Could not be confirmed", tone: "danger" },
  refunded: { label: "Refunded", tone: "neutral" },
  cancelled: { label: "Cancelled", tone: "neutral" },
};
