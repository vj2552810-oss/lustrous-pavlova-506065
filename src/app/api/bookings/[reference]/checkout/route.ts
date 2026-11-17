import { NextResponse } from "next/server";
import { attachCheckoutSession, bookingMatchesContact, getBooking } from "@/lib/bookings";
import { createCheckoutSession, stripeConfigured } from "@/lib/payments/stripe";
import { formatStayDate } from "@/lib/hotels/provider";
import { clientIp, NO_STORE, rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

/** Starts a Stripe Checkout session for an existing unpaid booking. */
export async function POST(req: Request, { params }: { params: Promise<{ reference: string }> }) {
  const { reference } = await params;
  const limit = rateLimit(`checkout:${clientIp(req)}`, 10, 10 * 60_000);
  if (!limit.allowed) return NextResponse.json({ ok: false, error: "Too many attempts. Please wait a few minutes." }, { status: 429, headers: NO_STORE });

  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    /* contact is validated below */
  }
  const contact = typeof body.contact === "string" ? body.contact : "";

  const booking = await getBooking(reference);
  if (!booking || !bookingMatchesContact(booking, contact)) {
    return NextResponse.json({ ok: false, error: "We couldn't match that booking with those contact details." }, { status: 404, headers: NO_STORE });
  }
  if (booking.mode === "demo") {
    return NextResponse.json(
      { ok: false, error: "Demo mode does not take payments. Connect an authorised hotel API and Stripe to enable online booking." },
      { status: 409, headers: NO_STORE },
    );
  }
  if (booking.status === "confirmed") {
    return NextResponse.json({ ok: false, error: "This booking is already confirmed.", reference: booking.reference }, { status: 409, headers: NO_STORE });
  }
  if (booking.status !== "pending_payment" && booking.status !== "paid") {
    return NextResponse.json({ ok: false, error: "This booking can no longer be paid online." }, { status: 409, headers: NO_STORE });
  }
  if (!stripeConfigured()) {
    return NextResponse.json(
      { ok: false, error: "Online payment isn't configured yet. Please message us on WhatsApp and a planner will send a secure payment link." },
      { status: 503, headers: NO_STORE },
    );
  }

  try {
    const origin = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || new URL(req.url).origin;
    const session = await createCheckoutSession({
      bookingReference: booking.reference,
      bookingId: booking.id,
      amountMinor: booking.totalMinor,
      currency: booking.currency,
      description: `${booking.hotelName} · ${booking.roomName} · ${formatStayDate(booking.checkIn)}–${formatStayDate(booking.checkOut)}`,
      guestEmail: booking.guestEmail,
      origin,
    });
    await attachCheckoutSession(booking, session.id);
    return NextResponse.json({ ok: true, url: session.url, sessionId: session.id }, { headers: NO_STORE });
  } catch (err) {
    console.error("Stripe checkout creation failed", err);
    return NextResponse.json(
      { ok: false, error: "We couldn't open the secure payment page. Please try again or contact us on WhatsApp." },
      { status: 502, headers: NO_STORE },
    );
  }
}
