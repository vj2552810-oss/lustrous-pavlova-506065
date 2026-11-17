import { NextResponse } from "next/server";
import { db } from "@/db";
import { hotelBookings, paymentEvents } from "@/db/schema";
import { eq } from "drizzle-orm";
import { confirmBookingAfterPayment, getBooking, logEvent } from "@/lib/bookings";
import { verifyStripeSignature } from "@/lib/payments/stripe";
import { NO_STORE } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

interface StripeEvent {
  id: string;
  type: string;
  data: { object: Record<string, unknown> };
}

/**
 * Stripe webhook. Signature is verified against the raw body before anything is
 * processed; events are deduplicated so retries cannot double-confirm a booking.
 * A booking is only confirmed after Stripe reports the payment as paid AND the
 * hotel provider returns a confirmation (see confirmBookingAfterPayment).
 */
export async function POST(req: Request) {
  const raw = await req.text();
  const verification = verifyStripeSignature(raw, req.headers.get("stripe-signature"));
  if (!verification.ok) {
    console.warn("Rejected Stripe webhook:", verification.error);
    return NextResponse.json({ ok: false, error: verification.error }, { status: 400, headers: NO_STORE });
  }

  let event: StripeEvent;
  try {
    event = JSON.parse(raw) as StripeEvent;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid payload" }, { status: 400, headers: NO_STORE });
  }
  if (!event?.id || !event.type) return NextResponse.json({ ok: false, error: "Invalid event" }, { status: 400, headers: NO_STORE });

  // Idempotency: insert-or-ignore on the event id.
  const inserted = await db
    .insert(paymentEvents)
    .values({ eventId: event.id, type: event.type })
    .onConflictDoNothing()
    .returning({ id: paymentEvents.id });
  if (inserted.length === 0) return NextResponse.json({ ok: true, duplicate: true }, { headers: NO_STORE });

  try {
    if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
      const object = event.data.object;
      const reference = (object.client_reference_id as string | undefined) ?? (object.metadata as Record<string, string> | undefined)?.bookingReference;
      const sessionId = object.id as string | undefined;
      if (!reference || !sessionId) return NextResponse.json({ ok: true, ignored: "missing reference" }, { headers: NO_STORE });

      const booking = await getBooking(reference);
      if (!booking) {
        console.error("Stripe webhook for unknown booking", reference);
        return NextResponse.json({ ok: true, ignored: "unknown booking" }, { headers: NO_STORE });
      }
      const result = await confirmBookingAfterPayment(booking, { sessionId });
      return NextResponse.json({ ok: true, status: result.status }, { headers: NO_STORE });
    }

    if (event.type === "checkout.session.expired") {
      const reference = (event.data.object.client_reference_id as string | undefined) ?? (event.data.object.metadata as Record<string, string> | undefined)?.bookingReference;
      const booking = reference ? await getBooking(reference) : null;
      if (booking && booking.status === "pending_payment") {
        await db.update(hotelBookings).set({ status: "cancelled", paymentStatus: "expired", updatedAt: new Date() }).where(eq(hotelBookings.id, booking.id));
        await logEvent(booking.id, "checkout_expired", event.id);
      }
      return NextResponse.json({ ok: true }, { headers: NO_STORE });
    }

    if (event.type === "charge.refunded") {
      const metadata = (event.data.object.metadata as Record<string, string> | undefined) ?? {};
      const reference = metadata.bookingReference;
      const booking = reference ? await getBooking(reference) : null;
      if (booking) {
        await db.update(hotelBookings).set({ status: "refunded", paymentStatus: "refunded", updatedAt: new Date() }).where(eq(hotelBookings.id, booking.id));
        await logEvent(booking.id, "refund_webhook", event.id);
      }
      return NextResponse.json({ ok: true }, { headers: NO_STORE });
    }

    return NextResponse.json({ ok: true, ignored: event.type }, { headers: NO_STORE });
  } catch (err) {
    console.error("Stripe webhook processing failed", err);
    // Returning 500 lets Stripe retry; the dedupe row is removed so the retry is processed.
    await db.delete(paymentEvents).where(eq(paymentEvents.eventId, event.id));
    return NextResponse.json({ ok: false, error: "Processing failed" }, { status: 500, headers: NO_STORE });
  }
}
