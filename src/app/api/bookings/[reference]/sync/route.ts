import { NextResponse } from "next/server";
import { confirmBookingAfterPayment, getBooking } from "@/lib/bookings";
import { stripeConfigured } from "@/lib/payments/stripe";
import { clientIp, NO_STORE, rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

/**
 * Called when the guest returns from Stripe. The browser is never trusted:
 * payment is re-verified with Stripe, then the hotel provider must confirm
 * before the booking becomes "confirmed".
 */
export async function POST(req: Request, { params }: { params: Promise<{ reference: string }> }) {
  const { reference } = await params;
  const limit = rateLimit(`sync:${clientIp(req)}`, 30, 10 * 60_000);
  if (!limit.allowed) return NextResponse.json({ ok: false, error: "Please wait a moment before refreshing again." }, { status: 429, headers: NO_STORE });

  const booking = await getBooking(reference);
  if (!booking) return NextResponse.json({ ok: false, error: "Booking not found." }, { status: 404, headers: NO_STORE });
  if (booking.mode === "demo") {
    return NextResponse.json({ ok: true, status: booking.status, message: "Demo mode: no payment is processed and no reservation is confirmed." }, { headers: NO_STORE });
  }
  if (!stripeConfigured() || !booking.checkoutSessionId) {
    return NextResponse.json({ ok: true, status: booking.status, message: "There is no payment to verify for this booking." }, { headers: NO_STORE });
  }

  const result = await confirmBookingAfterPayment(booking, { sessionId: booking.checkoutSessionId });
  return NextResponse.json(
    { ok: true, status: result.status, message: result.message ?? null, confirmationCode: result.booking.confirmationCode ?? null },
    { headers: NO_STORE },
  );
}
