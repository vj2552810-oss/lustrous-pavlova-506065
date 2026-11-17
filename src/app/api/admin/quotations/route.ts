import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin/auth";
import { createQuotation, validateQuotation, type QuotationInput } from "@/lib/crm/quotations";
import { NO_STORE } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const str = (v: unknown, max = 2000) => (typeof v === "string" ? v.slice(0, max) : "");
const list = (v: unknown) => (Array.isArray(v) ? v.map((x) => str(x, 200).trim()).filter(Boolean).slice(0, 30) : str(v, 3000).split("\n").map((x) => x.trim()).filter(Boolean).slice(0, 30));
const rupeesToMinor = (v: unknown) => Math.round(Number(v) * 100);

export async function POST(req: Request) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ ok: false, error: "Staff session required." }, { status: 401, headers: NO_STORE });
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400, headers: NO_STORE });
  }

  const input: QuotationInput = {
    enquiryId: body.enquiryId === null || body.enquiryId === undefined || body.enquiryId === "" ? null : Number(body.enquiryId),
    customerName: str(body.customerName, 120),
    customerEmail: str(body.customerEmail, 200),
    customerPhone: str(body.customerPhone, 30),
    destination: str(body.destination, 160),
    travelDates: str(body.travelDates, 120),
    travelers: Number(body.travelers) || 0,
    hotelDetails: str(body.hotelDetails, 1000),
    transportDetails: str(body.transportDetails, 1000),
    inclusions: list(body.inclusions),
    exclusions: list(body.exclusions),
    subtotalMinor: rupeesToMinor(body.subtotalINR),
    taxesMinor: rupeesToMinor(body.taxesINR ?? 0),
    paymentTerms: str(body.paymentTerms, 1000),
    cancellationPolicy: str(body.cancellationPolicy, 2000),
    validDays: Number(body.validDays ?? 7),
    notes: str(body.notes, 1000),
  };

  const errors = validateQuotation({ ...input, subtotalMinor: input.subtotalMinor, taxesMinor: input.taxesMinor });
  if (Object.keys(errors).length) return NextResponse.json({ ok: false, errors }, { status: 422, headers: NO_STORE });

  const quote = await createQuotation(input);
  if (!quote) return NextResponse.json({ ok: false, error: "Could not generate the quotation." }, { status: 500, headers: NO_STORE });
  return NextResponse.json({ ok: true, code: quote.code, id: quote.id, url: `/admin/quotations/${quote.code}` }, { status: 201, headers: NO_STORE });
}
