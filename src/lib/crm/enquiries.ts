import "server-only";
import { and, count, desc, eq, gt, sql } from "drizzle-orm";
import { db } from "@/db";
import { customers, enquiries, quotations, suppliers } from "@/db/schema";
import { sendEmail, emailConfigured } from "@/lib/email";
import { audit, maskEmail } from "@/lib/security/log";
import { SITE, whatsappLink } from "@/lib/site";
import type { EnquiryRecord } from "@/lib/tours/service";

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/** Public enquiry/booking reference: PVH-ENQ-XXXXXX */
export function generateEnquiryCode() {
  let out = "";
  for (let i = 0; i < 6; i++) out += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
  return `PVH-ENQ-${out}`;
}

export const QUOTE_CODE_ALPHABET = CODE_ALPHABET;
export function generateQuoteCode() {
  let out = "";
  for (let i = 0; i < 6; i++) out += QUOTE_CODE_ALPHABET[Math.floor(Math.random() * QUOTE_CODE_ALPHABET.length)];
  return `PVH-Q-${out}`;
}

export const ENQUIRY_STATUSES = [
  { key: "new_enquiry", label: "New enquiry", next: ["quotation_sent", "contacted", "cancelled"] },
  { key: "contacted", label: "Contacted", next: ["quotation_sent", "awaiting_approval", "cancelled"] },
  { key: "quotation_sent", label: "Quotation sent", next: ["awaiting_approval", "cancelled"] },
  { key: "awaiting_approval", label: "Awaiting customer approval", next: ["awaiting_payment", "awaiting_supplier_confirmation", "cancelled"] },
  { key: "awaiting_payment", label: "Awaiting payment", next: ["awaiting_supplier_confirmation", "cancelled"] },
  { key: "awaiting_supplier_confirmation", label: "Awaiting supplier confirmation", next: ["confirmed", "cancelled"] },
  { key: "confirmed", label: "Confirmed", next: ["completed", "cancelled"] },
  { key: "completed", label: "Completed", next: [] },
  { key: "cancelled", label: "Cancelled", next: ["new_enquiry"] },
  // legacy values kept readable
  { key: "new", label: "New (legacy)", next: ["contacted", "quotation_sent"] },
  { key: "quoted", label: "Quoted (legacy)", next: ["awaiting_approval"] },
  { key: "closed", label: "Closed (legacy)", next: [] },
] as const;

export const ENQUIRY_STATUS_KEYS = ENQUIRY_STATUSES.map((s) => s.key);

export function statusLabel(key: string) {
  return ENQUIRY_STATUSES.find((s) => s.key === key)?.label ?? key;
}

export function allowedTransitions(from: string) {
  return ENQUIRY_STATUSES.find((s) => s.key === from)?.next ?? [];
}

/** Guards the rule: nothing is "confirmed" without supplier confirmation. */
export function canConfirm(enquiry: Pick<EnquiryRecord, "supplierConfirmed" | "paymentStatus">) {
  const paid = ["paid", "partially_paid", "full"].includes(enquiry.paymentStatus);
  return { ok: enquiry.supplierConfirmed && paid, needsSupplier: !enquiry.supplierConfirmed, needsPayment: !paid };
}

export async function ensureCustomer(input: { name: string; email: string; phone: string; city?: string | null; preferences?: string | null }) {
  const email = input.email.trim().toLowerCase();
  const rows = await db.select().from(customers).where(eq(customers.email, email)).limit(1);
  if (rows[0]) return rows[0];
  const inserted = await db
    .insert(customers)
    .values({
      name: input.name.trim().slice(0, 120),
      email: email.slice(0, 200),
      phone: input.phone.slice(0, 30),
      city: (input.city ?? "").slice(0, 120) || null,
      preferences: input.preferences ?? null,
      source: "website",
    })
    .returning();
  return inserted[0];
}

/** Duplicate guard: identical contact + destination + dates within 10 minutes. */
export async function findDuplicate(input: { email: string; destination: string | null; travelDates: string | null }) {
  const since = new Date(Date.now() - 10 * 60 * 1000);
  const rows = await db
    .select({ id: enquiries.id, code: enquiries.code })
    .from(enquiries)
    .where(
      and(
        sql`lower(${enquiries.email}) = ${input.email.toLowerCase()}`,
        eq(enquiries.destination, input.destination ?? ""),
        gt(enquiries.createdAt, since),
      ),
    )
    .limit(1);
  return rows[0] ?? null;
}

export async function notifyAdminOfEnquiry(e: EnquiryRecord) {
  const subject = `New ${e.kind} enquiry ${e.code ?? ""} — ${e.destination || e.subject || "general"}`;
  const text = [
    subject,
    "",
    `Name: ${e.name}`,
    `Email: ${e.email}`,
    `Phone: ${e.phone}`,
    e.originCity ? `From: ${e.originCity}` : "",
    e.destination ? `Destination: ${e.destination}` : "",
    e.travelDates ? `Dates: ${e.travelDates}` : "",
    e.adults !== null ? `Adults: ${e.adults}` : "",
    e.children !== null ? `Children: ${e.children}` : "",
    e.travelers !== null ? `Travellers: ${e.travelers}` : "",
    e.hotelCategory ? `Hotel category: ${e.hotelCategory}` : "",
    e.budget ? `Budget: ${e.budget}` : "",
    e.tripType ? `Travel type: ${e.tripType}` : "",
    e.message ? `Message: ${e.message}` : "",
    "",
    `Open in the tour manager: ${SITE.url}/admin?tab=enquiries`,
    `WhatsApp the guest: ${whatsappLink(`Hello ${e.name}! This is PRITIVO about your ${e.destination || "travel"} enquiry${e.code ? ` (${e.code})` : ""}.`)}`,
  ]
    .filter((l) => l !== "")
    .join("\n");

  if (!emailConfigured()) {
    // Notification is logged server-side; never surfaced to the guest.
    audit("enquiry.received", { actor: "system", entityType: "enquiry", entityId: e.id, detail: `${e.kind} ${e.code ?? ""} from ${maskEmail(e.email)} (email delivery not configured)` });
    return { sent: false };
  }
  const result = await sendEmail({ to: SITE.email, subject, text, html: `<pre style="font-family:Inter,Arial,sans-serif;font-size:13px;line-height:1.7;white-space:pre-wrap">${text.replace(/[<>&]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" })[c] as string)}</pre>` });
  audit("enquiry.received", { actor: "system", entityType: "enquiry", entityId: e.id, detail: `${e.kind} ${e.code ?? ""} admin notification ${result.sent ? "sent" : "failed"}` });
  return result;
}

export async function listEnquiriesAdvanced(status?: string, limit = 200) {
  const clauses = status && status !== "all" ? [eq(enquiries.status, status)] : [];
  return db
    .select()
    .from(enquiries)
    .where(clauses.length ? and(...clauses) : undefined)
    .orderBy(desc(enquiries.createdAt))
    .limit(limit);
}

export async function getEnquiry(id: number) {
  const rows = await db.select().from(enquiries).where(eq(enquiries.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function updateEnquiryAdvanced(
  id: number,
  patch: Partial<{
    status: string;
    adminNote: string;
    supplierId: number | null;
    supplierName: string;
    supplierConfirmed: boolean;
    paymentStatus: string;
    transactionId: string;
    subtotalMinor: number;
    taxesMinor: number;
    totalMinor: number;
    quoteValidUntil: Date | null;
    quotationId: number;
  }>,
) {
  const rows = await db.update(enquiries).set(patch).where(eq(enquiries.id, id)).returning();
  return rows[0] ?? null;
}

export async function dashboardMetrics() {
  const [byStatus, totalCustomers, totalSuppliers, revenue, recent, quotes] = await Promise.all([
    db.select({ status: enquiries.status, value: count() }).from(enquiries).groupBy(enquiries.status),
    db.select({ value: count() }).from(customers),
    db.select({ value: count() }).from(suppliers),
    db
      .select({ value: sql<number>`coalesce(sum(case when ${enquiries.paymentStatus} = 'paid' then ${enquiries.totalMinor} else 0 end), 0)` })
      .from(enquiries),
    db.select().from(enquiries).orderBy(desc(enquiries.createdAt)).limit(8),
    db.select({ value: count() }).from(quotations),
  ]);

  const statuses: Record<string, number> = {};
  byStatus.forEach((r) => {
    statuses[r.status] = Number(r.value);
  });
  const total = byStatus.reduce((sum, r) => sum + Number(r.value), 0);

  return {
    total,
    new: Number(statuses.new_enquiry ?? 0) + Number(statuses.new ?? 0),
    pendingQuotes: Number(statuses.quotation_sent ?? 0) + Number(statuses.awaiting_approval ?? 0) + Number(statuses.quoted ?? 0),
    awaitingSupplier: Number(statuses.awaiting_supplier_confirmation ?? 0),
    confirmed: Number(statuses.confirmed ?? 0),
    cancelled: Number(statuses.cancelled ?? 0),
    completed: Number(statuses.completed ?? 0),
    customers: Number(totalCustomers[0]?.value ?? 0),
    suppliers: Number(totalSuppliers[0]?.value ?? 0),
    quotations: Number(quotes[0]?.value ?? 0),
    revenueMinor: Number(revenue[0]?.value ?? 0),
    recent,
  };
}

export function enquiryWhatsAppLink(e: EnquiryRecord) {
  return whatsappLink(
    `Hello ${e.name.split(" ")[0]}! This is PRITIVO regarding your ${e.destination || "travel"} enquiry${e.code ? ` (${e.code})` : ""}.`,
  );
}

