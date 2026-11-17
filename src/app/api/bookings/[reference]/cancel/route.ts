import { NextResponse } from "next/server";
import { bookingMatchesContact, cancelUnpaidBooking, getBooking } from "@/lib/bookings";
import { clientIp, NO_STORE, rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

/**
 * Guests can release an unpaid booking themselves. Paid/confirmed bookings are
 * never cancelled automatically — the hotel's cancellation policy and any refund
 * must be handled with the provider, so we route those to support.
 */
export async function POST(req: Request, { params }: { params: Promise<{ reference: string }> }) {
  const { reference } = await params;
  const limit = rateLimit(`cancel:${clientIp(req)}`, 10, 10 * 60_000);
  if (!limit.allowed) return NextResponse.json({ ok: false, error: "Too many requests. Please wait a moment." }, { status: 429, headers: NO_STORE });

  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    /* contact validated below */
  }
  const contact = typeof body.contact === "string" ? body.contact : "";

  const booking = await getBooking(reference);
  if (!booking || !bookingMatchesContact(booking, contact)) {
    return NextResponse.json({ ok: false, error: "We couldn't match that booking with those contact details." }, { status: 404, headers: NO_STORE });
  }

  const result = await cancelUnpaidBooking(booking);
  return NextResponse.json(result, { status: result.ok ? 200 : 409, headers: NO_STORE });
}
