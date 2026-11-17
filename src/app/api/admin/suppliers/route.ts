import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin/auth";
import { createSupplier, validateSupplier, type SupplierInput } from "@/lib/crm/suppliers";
import { NO_STORE } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const str = (v: unknown, max = 2000) => (typeof v === "string" ? v.slice(0, max) : "");
const list = (v: unknown) => (Array.isArray(v) ? v.map((x) => str(x, 120).trim()).filter(Boolean).slice(0, 20) : str(v, 1000).split(",").map((x) => x.trim()).filter(Boolean).slice(0, 20));

export async function POST(req: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ ok: false, error: "Staff session required." }, { status: 401, headers: NO_STORE });
  }
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400, headers: NO_STORE });
  }

  const commissionRaw = body.commissionPercent === "" || body.commissionPercent === null || body.commissionPercent === undefined ? null : Number(body.commissionPercent);
  const input: SupplierInput = {
    name: str(body.name, 160),
    category: str(body.category, 40) as SupplierInput["category"],
    contactName: str(body.contactName, 120),
    email: str(body.email, 200),
    phone: str(body.phone, 30),
    location: str(body.location, 160),
    services: list(body.services),
    agreedRate: str(body.agreedRate, 160),
    commissionPercent: commissionRaw === null ? null : commissionRaw,
    agreementNotes: str(body.agreementNotes, 2000),
    verificationStatus: str(body.verificationStatus, 20) || "unverified",
  };

  const errors = validateSupplier(input);
  if (Object.keys(errors).length) return NextResponse.json({ ok: false, errors }, { status: 422, headers: NO_STORE });

  const supplier = await createSupplier(input);
  if (!supplier) return NextResponse.json({ ok: false, error: "Could not save the supplier." }, { status: 500, headers: NO_STORE });
  return NextResponse.json({ ok: true, id: supplier.id }, { status: 201, headers: NO_STORE });
}
