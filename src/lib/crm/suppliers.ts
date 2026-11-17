import "server-only";
import { and, asc, eq, ilike, or } from "drizzle-orm";
import { db } from "@/db";
import { suppliers } from "@/db/schema";
import { audit } from "@/lib/security/log";

export {
  SUPPLIER_CATEGORIES,
  SUPPLIER_CATEGORY_LABELS,
  VERIFICATION_STATUSES,
  type SupplierCategory,
} from "./constants";
import type { SupplierCategory } from "./constants";
import { SUPPLIER_CATEGORIES, VERIFICATION_STATUSES } from "./constants";

export interface SupplierInput {
  name: string;
  category: SupplierCategory;
  contactName: string;
  email: string;
  phone: string;
  location: string;
  services: string[];
  agreedRate: string;
  commissionPercent: number | null;
  agreementNotes: string;
  verificationStatus: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateSupplier(input: Partial<SupplierInput>) {
  const errors: Record<string, string> = {};
  if ((input.name ?? "").trim().length < 2) errors.name = "Enter the supplier name.";
  if (!(SUPPLIER_CATEGORIES as readonly string[]).includes(input.category ?? "")) errors.category = "Choose a supplier category.";
  if (input.email && !EMAIL_RE.test(input.email.trim())) errors.email = "Enter a valid email or leave it blank.";
  if (input.phone && !/^\+?\d{7,15}$/.test(input.phone.replace(/[\s\-()]/g, ""))) errors.phone = "Enter a valid phone number.";
  if (input.commissionPercent !== null && input.commissionPercent !== undefined) {
    if (!Number.isFinite(input.commissionPercent) || input.commissionPercent < 0 || input.commissionPercent > 100) {
      errors.commissionPercent = "Commission must be between 0 and 100.";
    }
  }
  if (!VERIFICATION_STATUSES.includes((input.verificationStatus ?? "unverified") as (typeof VERIFICATION_STATUSES)[number])) {
    errors.verificationStatus = "Unknown verification status.";
  }
  return errors;
}

export async function listSuppliers(search?: string, category?: string) {
  const clauses = [];
  if (category && (SUPPLIER_CATEGORIES as readonly string[]).includes(category)) clauses.push(eq(suppliers.category, category));
  const q = search?.trim();
  if (q) clauses.push(or(ilike(suppliers.name, `%${q}%`), ilike(suppliers.location, `%${q}%`))!);
  return db.select().from(suppliers).where(clauses.length ? and(...clauses) : undefined).orderBy(asc(suppliers.category), asc(suppliers.name));
}

export async function getSupplier(id: number) {
  const rows = await db.select().from(suppliers).where(eq(suppliers.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function createSupplier(input: SupplierInput, actor = "staff") {
  const rows = await db
    .insert(suppliers)
    .values({
      name: input.name.trim().slice(0, 160),
      category: input.category,
      contactName: input.contactName.trim().slice(0, 120) || null,
      email: input.email.trim().toLowerCase().slice(0, 200) || null,
      phone: input.phone.trim().slice(0, 30) || null,
      location: input.location.trim().slice(0, 160) || null,
      services: input.services.slice(0, 20),
      agreedRate: input.agreedRate.trim().slice(0, 160) || null,
      commissionPercent: input.commissionPercent,
      agreementNotes: input.agreementNotes.trim().slice(0, 2000) || null,
      verificationStatus: input.verificationStatus,
    })
    .returning();
  const row = rows[0];
  if (row) await audit("admin.supplier.created", { actor, entityType: "supplier", entityId: row.id, detail: row.name });
  return row;
}

export async function updateSupplier(id: number, input: Partial<SupplierInput>, actor = "staff") {
  const patch: Record<string, unknown> = { updatedAt: new Date() };
  if (input.name !== undefined) patch.name = input.name.trim().slice(0, 160);
  if (input.category !== undefined) patch.category = input.category;
  if (input.contactName !== undefined) patch.contactName = input.contactName.trim().slice(0, 120) || null;
  if (input.email !== undefined) patch.email = input.email.trim().toLowerCase().slice(0, 200) || null;
  if (input.phone !== undefined) patch.phone = input.phone.trim().slice(0, 30) || null;
  if (input.location !== undefined) patch.location = input.location.trim().slice(0, 160) || null;
  if (input.services !== undefined) patch.services = input.services.slice(0, 20);
  if (input.agreedRate !== undefined) patch.agreedRate = input.agreedRate.trim().slice(0, 160) || null;
  if (input.commissionPercent !== undefined) patch.commissionPercent = input.commissionPercent;
  if (input.agreementNotes !== undefined) patch.agreementNotes = input.agreementNotes.trim().slice(0, 2000) || null;
  if (input.verificationStatus !== undefined) patch.verificationStatus = input.verificationStatus;

  const rows = await db.update(suppliers).set(patch).where(eq(suppliers.id, id)).returning();
  if (rows[0]) await audit("admin.supplier.updated", { actor, entityType: "supplier", entityId: id, detail: rows[0].name });
  return rows[0] ?? null;
}

export async function deleteSupplier(id: number, actor = "staff") {
  await db.delete(suppliers).where(eq(suppliers.id, id));
  await audit("admin.supplier.deleted", { actor, entityType: "supplier", entityId: id });
}

/** Suppliers are only "usable" for confirmations once staff mark them verified. */
export function supplierCanConfirm(status: string) {
  return status === "verified";
}

