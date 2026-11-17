import "server-only";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { enquiries, quotations } from "@/db/schema";
import { audit } from "@/lib/security/log";
import { generateQuoteCode } from "./enquiries";

export interface QuotationInput {
  enquiryId: number | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  destination: string;
  travelDates: string;
  travelers: number;
  hotelDetails: string;
  transportDetails: string;
  inclusions: string[];
  exclusions: string[];
  subtotalMinor: number;
  taxesMinor: number;
  paymentTerms: string;
  cancellationPolicy: string;
  validDays: number;
  notes: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateQuotation(input: Partial<QuotationInput>) {
  const errors: Record<string, string> = {};
  if ((input.customerName ?? "").trim().length < 2) errors.customerName = "Enter the customer name.";
  if (!EMAIL_RE.test((input.customerEmail ?? "").trim())) errors.customerEmail = "Enter a valid customer email.";
  if ((input.customerPhone ?? "").trim().length < 7) errors.customerPhone = "Enter the customer phone.";
  if ((input.destination ?? "").trim().length < 2) errors.destination = "Enter the destination.";
  if (!(input.travelers ?? 0) || (input.travelers ?? 0) < 1) errors.travelers = "Enter at least one traveller.";
  const subtotal = Number(input.subtotalMinor);
  const taxes = Number(input.taxesMinor ?? 0);
  if (!Number.isFinite(subtotal) || subtotal < 100 || subtotal > 5_000_000_000) errors.subtotalMinor = "Enter a valid subtotal (in rupees).";
  if (!Number.isFinite(taxes) || taxes < 0) errors.taxesMinor = "Enter valid taxes (in rupees).";
  const validDays = Number(input.validDays ?? 7);
  if (!Number.isInteger(validDays) || validDays < 1 || validDays > 90) errors.validDays = "Validity must be 1–90 days.";
  return errors;
}

export async function createQuotation(input: QuotationInput, actor = "staff") {
  const validUntil = new Date(Date.now() + (input.validDays || 7) * 86_400_000);
  const totalMinor = Math.round(input.subtotalMinor) + Math.round(input.taxesMinor || 0);

  for (let attempt = 0; attempt < 4; attempt++) {
    const code = generateQuoteCode();
    try {
      const rows = await db
        .insert(quotations)
        .values({
          code,
          enquiryId: input.enquiryId,
          customerName: input.customerName.trim().slice(0, 120),
          customerEmail: input.customerEmail.trim().toLowerCase().slice(0, 200),
          customerPhone: input.customerPhone.trim().slice(0, 30),
          destination: input.destination.trim().slice(0, 160),
          travelDates: input.travelDates.trim().slice(0, 120),
          travelers: input.travelers,
          hotelDetails: input.hotelDetails.trim().slice(0, 1000) || null,
          transportDetails: input.transportDetails.trim().slice(0, 1000) || null,
          inclusions: input.inclusions.slice(0, 30),
          exclusions: input.exclusions.slice(0, 30),
          subtotalMinor: Math.round(input.subtotalMinor),
          taxesMinor: Math.round(input.taxesMinor || 0),
          totalMinor,
          paymentTerms: input.paymentTerms.trim().slice(0, 1000) || null,
          cancellationPolicy: input.cancellationPolicy.trim().slice(0, 2000) || null,
          validUntil,
          notes: input.notes.trim().slice(0, 1000) || null,
        })
        .returning();
      const quote = rows[0];
      if (!quote) break;

      if (input.enquiryId) {
        await db
          .update(enquiries)
          .set({ status: "quotation_sent", quotationId: quote.id, subtotalMinor: Math.round(input.subtotalMinor), taxesMinor: Math.round(input.taxesMinor || 0), totalMinor, quoteValidUntil: validUntil })
          .where(eq(enquiries.id, input.enquiryId));
      }
      await audit("admin.quotation.created", { actor, entityType: "quotation", entityId: quote.id, detail: `${code} for ${quote.customerName}` });
      return quote;
    } catch (err) {
      if ((err as { code?: string }).code === "23505" && attempt < 3) continue;
      console.error("Quotation create failed", err instanceof Error ? err.message : "");
      return null;
    }
  }
  return null;
}

export async function listQuotations(limit = 100) {
  return db.select().from(quotations).orderBy(desc(quotations.createdAt)).limit(limit);
}

export async function getQuotationByCode(code: string) {
  const rows = await db.select().from(quotations).where(eq(quotations.code, code.trim().toUpperCase())).limit(1);
  return rows[0] ?? null;
}

export async function getQuotationById(id: number) {
  const rows = await db.select().from(quotations).where(eq(quotations.id, id)).limit(1);
  return rows[0] ?? null;
}

export const DEFAULT_PAYMENT_TERMS =
  "30% advance to confirm planning; balance due 15 days before departure, unless stated otherwise in this quotation. Payments are made through a secure link shared by PRITIVO or by bank transfer to the account stated in writing.";

export const DEFAULT_CANCELLATION =
  "Cancellation charges depend on supplier policies and are confirmed in writing before any payment. See PRITIVO's Cancellation & Refund Policy for general terms.";
