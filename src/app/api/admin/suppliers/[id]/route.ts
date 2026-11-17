import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin/auth";
import { deleteSupplier, getSupplier, updateSupplier, validateSupplier, type SupplierInput } from "@/lib/crm/suppliers";
import { NO_STORE } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const str = (v: unknown, max = 2000) => (typeof v === "string" ? v.slice(0, max) : "");
const list = (v: unknown) => (Array.isArray(v) ? v.map((x) => str(x, 120).trim()).filter(Boolean).slice(0, 20) : str(v, 1000).split(",").map((x) => x.trim()).filter(Boolean).slice(0, 20));

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ ok: false, error: "Staff session required." }, { status: 401, headers: NO_STORE });
  const { id } = await params;
  const supplierId = Number(id);
  if (!Number.isInteger(supplierId)) return NextResponse.json({ ok: false, error: "Invalid supplier." }, { status: 400, headers: NO_STORE });
  if (!(await getSupplier(supplierId))) return NextResponse.json({ ok: false, error: "Supplier not found." }, { status: 404, headers: NO_STORE });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400, headers: NO_STORE });
  }

  const existing = await getSupplier(supplierId);
  const merged = {
    name: body.name !== undefined ? str(body.name, 160) : existing!.name,
    category: (body.category !== undefined ? str(body.category, 40) : existing!.category) as SupplierInput["category"],
    contactName: body.contactName !== undefined ? str(body.contactName, 120) : existing!.contactName ?? "",
    email: body.email !== undefined ? str(body.email, 200) : existing!.email ?? "",
    phone: body.phone !== undefined ? str(body.phone, 30) : existing!.phone ?? "",
    location: body.location !== undefined ? str(body.location, 160) : existing!.location ?? "",
    services: body.services !== undefined ? list(body.services) : (existing!.services as string[]),
    agreedRate: body.agreedRate !== undefined ? str(body.agreedRate, 160) : existing!.agreedRate ?? "",
    commissionPercent:
      body.commissionPercent === "" || body.commissionPercent === null || body.commissionPercent === undefined
        ? existing!.commissionPercent
        : Number(body.commissionPercent),
    agreementNotes: body.agreementNotes !== undefined ? str(body.agreementNotes, 2000) : existing!.agreementNotes ?? "",
    verificationStatus: body.verificationStatus !== undefined ? str(body.verificationStatus, 20) : existing!.verificationStatus,
  };

  const errors = validateSupplier(merged);
  if (Object.keys(errors).length) return NextResponse.json({ ok: false, errors }, { status: 422, headers: NO_STORE });

  const updated = await updateSupplier(supplierId, merged);
  return NextResponse.json({ ok: true, supplier: updated }, { headers: NO_STORE });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ ok: false, error: "Staff session required." }, { status: 401, headers: NO_STORE });
  const { id } = await params;
  const supplierId = Number(id);
  if (!Number.isInteger(supplierId)) return NextResponse.json({ ok: false, error: "Invalid supplier." }, { status: 400, headers: NO_STORE });
  await deleteSupplier(supplierId);
  return NextResponse.json({ ok: true }, { headers: NO_STORE });
}
