import { NextResponse } from "next/server";
import { createBooking, normalizeEmail, normalizePhone, sendBookingEmail } from "@/lib/bookings";
import { validateSearchQuery } from "@/lib/hotels/provider";
import { getHotelProvider } from "@/lib/hotels/provider";
import { clientIp, NO_STORE, rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const str = (v: unknown, max = 200) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const int = (v: unknown) => {
  const n = Number(v);
  return Number.isFinite(n) ? Math.round(n) : NaN;
};

export async function POST(req: Request) {
  const ip = clientIp(req);
  const limit = rateLimit(`booking-create:${ip}`, 10, 30 * 60_000);
  if (!limit.allowed) {
    return NextResponse.json(
      { ok: false, error: "Too many booking attempts. Please wait a few minutes, or message us on WhatsApp." },
      { status: 429, headers: NO_STORE },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400, headers: NO_STORE });
  }
  // Honeypot — bots fill hidden fields, people don't.
  if (str(body.company)) return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400, headers: NO_STORE });

  const { query, errors } = validateSearchQuery(body as Record<string, unknown>);
  if (Object.keys(errors).length) return NextResponse.json({ ok: false, errors }, { status: 422, headers: NO_STORE });

  const hotelId = str(body.hotelId, 120);
  const roomId = str(body.roomId, 120);
  if (!hotelId || !roomId) return NextResponse.json({ ok: false, error: "Choose a room before continuing." }, { status: 422, headers: NO_STORE });

  const result = await createBooking({
    hotelId,
    roomId,
    checkIn: query.checkIn,
    checkOut: query.checkOut,
    guests: query.guests,
    rooms: query.rooms,
    guestName: str(body.guestName, 120),
    guestEmail: normalizeEmail(str(body.guestEmail, 200)),
    guestPhone: normalizePhone(str(body.guestPhone, 30)),
    specialRequests: str(body.specialRequests, 800),
  });

  if (!result.ok || !result.booking) {
    return NextResponse.json(
      { ok: false, errors: result.errors, error: result.error ?? "We couldn't start this booking." },
      { status: result.httpStatus ?? 400, headers: NO_STORE },
    );
  }

  const booking = result.booking;
  const provider = getHotelProvider();

  // Live but no payment gateway yet: record the request and email the guest that
  // it is NOT confirmed. Demo mode never emails or implies a reservation.
  if (booking.status === "request_received") {
    await sendBookingEmail(booking, false);
  }

  return NextResponse.json(
    {
      ok: true,
      reference: booking.reference,
      status: booking.status,
      mode: booking.mode,
      providerMode: provider.mode,
      next: `/booking/${booking.reference}`,
    },
    { status: 201, headers: NO_STORE },
  );
}
