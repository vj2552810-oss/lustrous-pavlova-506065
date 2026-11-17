import "server-only";
import { randomInt } from "node:crypto";
import { and, eq, or, sql } from "drizzle-orm";
import { db } from "@/db";
import { hotelBookingEvents, hotelBookings } from "@/db/schema";
import { bookingEmail, emailConfigured, sendEmail } from "./email";
import { getHotelProvider, formatMoney, formatStayDate, nightsCount } from "./hotels/provider";
import { retrieveCheckoutSession, refundPayment, stripeConfigured } from "./payments/stripe";
import type { BookingInput, ProviderQuote } from "./hotels/types";
import type { FieldErrors } from "./validation";
import { SITE } from "./site";

export type Booking = typeof hotelBookings.$inferSelect;

const REFERENCE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateReference() {
  let out = "";
  for (let i = 0; i < 6; i++) out += REFERENCE_ALPHABET[randomInt(REFERENCE_ALPHABET.length)];
  return `PVH-${out}`;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const normalizeEmail = (v: string) => v.trim().toLowerCase();
export const normalizePhone = (v: string) => v.replace(/[\s\-()]/g, "");
const digits = (v: string) => normalizePhone(v).replace(/\D/g, "").slice(-10);

export function validateGuest(input: Partial<BookingInput>): FieldErrors {
  const errors: FieldErrors = {};
  const name = (input.guestName ?? "").trim();
  if (name.length < 2) errors.guestName = "Enter the lead guest's full name.";
  else if (name.length > 120) errors.guestName = "Name is too long.";
  if (!EMAIL_RE.test(normalizeEmail(input.guestEmail ?? ""))) errors.guestEmail = "Enter a valid email address.";
  if (!/^\+?\d{10,15}$/.test(normalizePhone(input.guestPhone ?? ""))) errors.guestPhone = "Enter a valid phone number (10–15 digits).";
  if (input.specialRequests && input.specialRequests.length > 800) errors.specialRequests = "Please keep requests under 800 characters.";
  if (input.guests !== undefined && (!Number.isInteger(input.guests) || input.guests < 1 || input.guests > 16)) errors.guests = "Enter between 1 and 16 guests.";
  if (input.rooms !== undefined && (!Number.isInteger(input.rooms) || input.rooms < 1 || input.rooms > 6)) errors.rooms = "Enter between 1 and 6 rooms.";
  return errors;
}

export async function logEvent(bookingId: number, type: string, detail?: string, payload?: unknown) {
  try {
    await db.insert(hotelBookingEvents).values({ bookingId, type, detail: detail?.slice(0, 500), payload: payload ?? null });
  } catch (err) {
    console.error("Booking event log failed", err);
  }
}

export interface CreateBookingResult {
  ok: boolean;
  booking?: Booking;
  quote?: ProviderQuote;
  errors?: FieldErrors;
  error?: string;
  httpStatus?: number;
}

/**
 * Creates the booking record after re-checking availability and price with the
 * provider. Prices are always recalculated on the server; client-supplied amounts
 * are never trusted.
 */
export async function createBooking(input: BookingInput): Promise<CreateBookingResult> {
  const guestErrors = validateGuest(input);
  if (Object.keys(guestErrors).length) return { ok: false, errors: guestErrors, httpStatus: 422 };

  const provider = getHotelProvider();
  const query = {
    destination: "",
    checkIn: input.checkIn,
    checkOut: input.checkOut,
    guests: input.guests,
    rooms: input.rooms,
  };
  const nights = nightsCount(input.checkIn, input.checkOut);
  if (nights < 1) return { ok: false, error: "Check-out must be after check-in.", httpStatus: 422 };

  let quote: ProviderQuote | null = null;
  try {
    quote = await provider.recheck(input.hotelId, input.roomId, query);
  } catch (err) {
    console.error("Availability recheck failed", err);
    return { ok: false, error: "We couldn't re-check availability with the hotel provider. Please try again.", httpStatus: 502 };
  }
  if (!quote) return { ok: false, error: "That room is no longer available for the selected dates.", httpStatus: 409 };
  if (quote.roomsAvailable < input.rooms) return { ok: false, error: "There aren't enough rooms left at this rate for your party.", httpStatus: 409 };
  if (quote.maxGuestsPerRoom * input.rooms < input.guests) {
    return { ok: false, error: "This room type can't fit that many guests — add another room.", httpStatus: 422 };
  }

  const stripeReady = stripeConfigured();
  const status = provider.mode === "demo" ? "demo_request" : stripeReady ? "pending_payment" : "request_received";
  const paymentStatus = provider.mode === "demo" ? "not_applicable" : stripeReady ? "unpaid" : "not_collected";

  for (let attempt = 0; attempt < 5; attempt++) {
    const reference = generateReference();
    try {
      const inserted = await db
        .insert(hotelBookings)
        .values({
          reference,
          status,
          mode: provider.mode,
          provider: provider.label,
          hotelId: input.hotelId,
          hotelName: quote.hotelName,
          city: quote.city,
          roomId: input.roomId,
          roomName: quote.roomName,
          checkIn: input.checkIn,
          checkOut: input.checkOut,
          nights,
          guests: input.guests,
          rooms: input.rooms,
          breakfastIncluded: quote.breakfastIncluded,
          guestName: input.guestName.trim(),
          guestEmail: normalizeEmail(input.guestEmail),
          guestPhone: normalizePhone(input.guestPhone),
          specialRequests: input.specialRequests?.trim() || null,
          currency: quote.currency,
          nightlyPriceMinor: quote.nightlyPriceMinor,
          subtotalMinor: quote.subtotalMinor,
          taxesMinor: quote.taxesMinor,
          totalMinor: quote.totalMinor,
          cancellationLabel: quote.cancellation.label,
          cancellationTerms: quote.cancellation.terms,
          paymentProvider: provider.mode === "live" && stripeReady ? "stripe" : null,
          paymentStatus,
        })
        .returning();

      const booking = inserted[0];
      if (!booking) return { ok: false, error: "We couldn't save your booking details. Please try again.", httpStatus: 500 };
      await logEvent(booking.id, "booking_created", `${status} · ${provider.mode}`, { total: quote.totalMinor, mode: provider.mode });
      return { ok: true, booking, quote };
    } catch (err) {
      const code = (err as { code?: string }).code;
      if (code === "23505" && attempt < 4) continue; // reference collision, retry
      console.error("Booking insert failed", err);
      return { ok: false, error: "We couldn't save your booking details. Please try again.", httpStatus: 500 };
    }
  }
  return { ok: false, error: "We couldn't generate a booking reference. Please try again.", httpStatus: 500 };
}

export async function getBooking(reference: string) {
  const ref = reference.trim().toUpperCase();
  if (!/^PVH-[A-Z0-9]{6}$/.test(ref)) return null;
  const rows = await db.select().from(hotelBookings).where(eq(hotelBookings.reference, ref)).limit(1);
  return rows[0] ?? null;
}

/** Guest access requires the booking reference *and* the matching email or phone. */
export function bookingMatchesContact(booking: Booking, contact: string) {
  const value = contact.trim();
  if (!value) return false;
  if (EMAIL_RE.test(value) && normalizeEmail(value) === normalizeEmail(booking.guestEmail)) return true;
  const d = digits(value);
  return d.length >= 10 && d === digits(booking.guestPhone);
}

export async function findBookingForGuest(reference: string, contact: string) {
  const booking = await getBooking(reference);
  if (!booking) return null;
  return bookingMatchesContact(booking, contact) ? booking : null;
}

export async function attachCheckoutSession(booking: Booking, sessionId: string) {
  await db
    .update(hotelBookings)
    .set({ checkoutSessionId: sessionId, paymentStatus: "awaiting_payment", updatedAt: new Date() })
    .where(eq(hotelBookings.id, booking.id));
  await logEvent(booking.id, "checkout_created", sessionId);
}

/**
 * The only path that can mark a booking "confirmed".
 * 1. Payment must be verified with the gateway (never from the browser redirect).
 * 2. Availability and price are re-checked with the hotel provider.
 * 3. The provider must return a real confirmation reference.
 * If the provider fails after payment, a refund is attempted and recorded.
 */
export async function confirmBookingAfterPayment(
  booking: Booking,
  payment: { sessionId: string },
): Promise<{ status: Booking["status"]; booking: Booking; message?: string }> {
  if (booking.status === "confirmed") return { status: "confirmed", booking };

  if (booking.mode === "demo") {
    return { status: booking.status, booking, message: "Demo bookings cannot be confirmed." };
  }
  if (!stripeConfigured()) {
    return { status: booking.status, booking, message: "Online payment is not configured." };
  }

  let session;
  try {
    session = await retrieveCheckoutSession(payment.sessionId);
  } catch (err) {
    console.error("Stripe session verification failed", err);
    return { status: booking.status, booking, message: "We couldn't verify the payment with Stripe yet." };
  }

  const referenceMatches = session.metadata?.bookingReference === booking.reference || session.client_reference_id === booking.reference;
  const paid = session.payment_status === "paid";
  const amountMatches = session.amount_total === booking.totalMinor;

  if (!paid || !referenceMatches || !amountMatches) {
    await logEvent(booking.id, "payment_unverified", `paid=${paid} ref=${referenceMatches} amount=${session.amount_total}/${booking.totalMinor}`);
    return {
      status: booking.status,
      booking,
      message: !paid ? "Payment has not been completed yet." : "Payment details did not match this booking. Our team has been notified.",
    };
  }

  const paymentIntentId = session.payment_intent ?? null;
  const afterPaid = await db
    .update(hotelBookings)
    .set({ status: "paid", paymentStatus: "paid", paymentIntentId, updatedAt: new Date() })
    .where(and(eq(hotelBookings.id, booking.id), sql`${hotelBookings.status} <> 'confirmed'`))
    .returning();
  const paidBooking = afterPaid[0] ?? booking;
  await logEvent(booking.id, "payment_verified", `session ${session.id}`, { amount: session.amount_total });

  // Re-check with the provider immediately before requesting the reservation.
  const provider = getHotelProvider();
  let quote: ProviderQuote | null = null;
  try {
    quote = await provider.recheck(booking.hotelId, booking.roomId, {
      destination: booking.city,
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
      guests: booking.guests,
      rooms: booking.rooms,
    });
  } catch (err) {
    console.error("Provider recheck before confirmation failed", err);
  }

  const failWithRefund = async (reason: string) => {
    await logEvent(booking.id, "confirmation_failed", reason);
    let refundId: string | null = null;
    if (paymentIntentId) {
      const refund = await refundPayment(paymentIntentId, booking.totalMinor);
      if (refund.ok) refundId = refund.refundId ?? null;
      await logEvent(booking.id, "refund_attempt", refund.ok ? `refund ${refund.refundId}` : `refund failed: ${refund.error}`);
    }
    const updated = await db
      .update(hotelBookings)
      .set({
        status: refundId ? "refunded" : "confirmation_failed",
        paymentStatus: paymentIntentId ? "paid" : booking.paymentStatus,
        refundId,
        failureReason: reason.slice(0, 500),
        updatedAt: new Date(),
      })
      .where(eq(hotelBookings.id, booking.id))
      .returning();
    return updated[0] ?? paidBooking;
  };

  if (!quote) {
    const failed = await failWithRefund("The room sold out between payment and confirmation.");
    return { status: failed.status, booking: failed, message: "That room sold out while payment was completing. A refund has been started." };
  }
  if (quote.totalMinor !== booking.totalMinor) {
    const failed = await failWithRefund(`Price changed from ${booking.totalMinor} to ${quote.totalMinor} after payment.`);
    return { status: failed.status, booking: failed, message: "The price changed before the hotel could confirm. A refund has been started rather than charging a different amount." };
  }

  const result = await provider.confirm({
    reference: booking.reference,
    quote,
    checkIn: booking.checkIn,
    checkOut: booking.checkOut,
    guests: booking.guests,
    rooms: booking.rooms,
    guestName: booking.guestName,
    guestEmail: booking.guestEmail,
    guestPhone: booking.guestPhone,
    specialRequests: booking.specialRequests ?? undefined,
    paymentReference: paymentIntentId ?? session.id,
  });

  if (!result.ok) {
    const failed = await failWithRefund(result.error ?? "The hotel provider did not confirm the reservation.");
    return { status: failed.status, booking: failed, message: "The hotel could not confirm this reservation. A refund has been started." };
  }

  const confirmedAt = new Date();
  const updatedRows = await db
    .update(hotelBookings)
    .set({
      status: "confirmed",
      providerBookingId: result.providerBookingId ?? null,
      confirmationCode: result.confirmationCode ?? null,
      confirmedAt,
      updatedAt: confirmedAt,
    })
    .where(eq(hotelBookings.id, booking.id))
    .returning();
  const confirmed = updatedRows[0] ?? paidBooking;
  await logEvent(booking.id, "confirmed", result.confirmationCode ?? result.providerBookingId ?? undefined);

  const email = await sendBookingEmail(confirmed, true);
  const withEmail = email.sent ? { ...confirmed, emailStatus: "sent" } : confirmed;
  if (email.sent) {
    await db.update(hotelBookings).set({ emailStatus: "sent" }).where(eq(hotelBookings.id, booking.id));
  }
  return { status: "confirmed", booking: withEmail };
}

export async function sendBookingEmail(booking: Booking, confirmed: boolean) {
  if (!emailConfigured()) {
    await db.update(hotelBookings).set({ emailStatus: "not_configured" }).where(eq(hotelBookings.id, booking.id));
    return { sent: false, reason: "Email delivery is not configured." };
  }
  const mail = bookingEmail({
    reference: booking.reference,
    hotelName: booking.hotelName,
    city: booking.city,
    roomName: booking.roomName,
    checkInLabel: formatStayDate(booking.checkIn),
    checkOutLabel: formatStayDate(booking.checkOut),
    nights: booking.nights,
    rooms: booking.rooms,
    guests: booking.guests,
    guestName: booking.guestName,
    totalLabel: formatMoney(booking.totalMinor, booking.currency),
    confirmed,
    confirmationCode: booking.confirmationCode,
    cancellationLabel: booking.cancellationLabel,
  });
  const result = await sendEmail({ to: booking.guestEmail, subject: mail.subject, text: mail.text, html: mail.html });
  await db
    .update(hotelBookings)
    .set({ emailStatus: result.sent ? "sent" : "failed", updatedAt: new Date() })
    .where(eq(hotelBookings.id, booking.id));
  return result;
}

/** Unpaid bookings can be released by the guest without contacting us. */
export async function cancelUnpaidBooking(booking: Booking) {
  if (["confirmed", "paid", "refunded"].includes(booking.status)) {
    return { ok: false, message: "This booking is already paid or confirmed. Please contact us on WhatsApp so we can handle the hotel's cancellation policy." };
  }
  await db
    .update(hotelBookings)
    .set({ status: "cancelled", updatedAt: new Date() })
    .where(eq(hotelBookings.id, booking.id));
  await logEvent(booking.id, "cancelled_by_guest", `from ${booking.status}`);
  return { ok: true, message: "This unpaid booking has been cancelled and no payment will be taken." };
}

export function bookingSupportMessage(booking: Booking) {
  return `Hello PRITIVO! I need help with hotel booking ${booking.reference} — ${booking.hotelName}, ${formatStayDate(booking.checkIn)} to ${formatStayDate(booking.checkOut)}.`;
}

export function supportLinks(booking: Booking) {
  const message = bookingSupportMessage(booking);
  return {
    whatsapp: `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(message)}`,
    email: `mailto:${SITE.email}?subject=${encodeURIComponent(`Hotel booking ${booking.reference}`)}&body=${encodeURIComponent(message)}`,
  };
}

export async function recentGuestBookings(email: string) {
  const rows = await db
    .select({ reference: hotelBookings.reference })
    .from(hotelBookings)
    .where(or(eq(hotelBookings.guestEmail, normalizeEmail(email))))
    .limit(1);
  return rows.length;
}
