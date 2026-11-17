import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { customers } from "@/db/schema";
import { isAdminAuthenticated } from "@/lib/admin/auth";
import { audit } from "@/lib/security/log";
import { NO_STORE } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const str = (v: unknown, max = 2000) => (typeof v === "string" ? v.slice(0, max) : "");

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ ok: false, error: "Staff session required." }, { status: 401, headers: NO_STORE });
  const { id } = await params;
  const customerId = Number(id);
  if (!Number.isInteger(customerId)) return NextResponse.json({ ok: false, error: "Invalid customer." }, { status: 400, headers: NO_STORE });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400, headers: NO_STORE });
  }

  const patch: Record<string, unknown> = { updatedAt: new Date() };
  if (typeof body.notes === "string") patch.notes = str(body.notes, 2000);
  if (typeof body.preferences === "string") patch.preferences = str(body.preferences, 1000);
  if (typeof body.city === "string") patch.city = str(body.city, 120) || null;
  if (Object.keys(patch).length === 1) return NextResponse.json({ ok: false, error: "Nothing to update." }, { status: 422, headers: NO_STORE });

  const rows = await db.update(customers).set(patch).where(eq(customers.id, customerId)).returning();
  if (!rows[0]) return NextResponse.json({ ok: false, error: "Customer not found." }, { status: 404, headers: NO_STORE });
  await audit("admin.customer.updated", { actor: "staff", entityType: "customer", entityId: customerId, detail: Object.keys(patch).join(",") });
  return NextResponse.json({ ok: true }, { headers: NO_STORE });
}
