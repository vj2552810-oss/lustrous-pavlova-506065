import { NextResponse } from "next/server";
import { findBookingForGuest } from "@/lib/bookings";
import { formatStayDate, formatMoney } from "@/lib/hotels/provider";
import { clientIp, NO_STORE, rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const maskEmail = (email: string) => {
  const [user, domain] = email.split("@");
  if (!domain) return "•••";
  return `${user.slice(0, 2)}${"•".repeat(Math.max(2, user.length - 2))}@${domain}`;
};
const maskPhone = (phone: string) => `••••••${phone.slice(-4)}`;

/**
 * Guest lookup — booking reference plus the email or phone used on the booking.
 * No account required, and the response never reveals whether a reference exists
 * when the contact details do not match.
 */
export async function POST(req: Request) {
  const ip = clientIp(req);
  const limit = rateLimit(`lookup:${ip}`, 10, 15 * 60_000);
  if (!limit.allowed) {
    return NextResponse.json(
      { ok: false, error: "Too many lookup attempts. Please wait a few minutes, or contact us on WhatsApp for help." },
      { status: 429, headers: NO_STORE },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400, headers: NO_STORE });
  }

  const reference = typeof body.reference === "string" ? body.reference.trim().toUpperCase() : "";
  const contact = typeof body.contact === "string" ? body.contact.trim() : "";
  const errors: Record<string, string> = {};
  if (!/^PVH-[A-Z0-9]{6}$/.test(reference)) errors.reference = "Enter the booking reference, for example PVH-8K2M4Q.";
  if (contact.length < 6) errors.contact = "Enter the email address or phone number used for the booking.";
  if (Object.keys(errors).length) return NextResponse.json({ ok: false, errors }, { status: 422, headers: NO_STORE });

  const booking = await findBookingForGuest(reference, contact);
  if (!booking) {
    return NextResponse.json(
      {
        ok: false,
        error: "We couldn't find a booking with that reference and contact detail. Check the reference in your confirmation, or message us on WhatsApp and we'll help.",
      },
      { status: 404, headers: NO_STORE },
    );
  }

  return NextResponse.json(
    {
      ok: true,
      booking: {
        reference: booking.reference,
        status: booking.status,
        mode: booking.mode,
        hotelName: booking.hotelName,
        city: booking.city,
        roomName: booking.roomName,
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        checkInLabel: formatStayDate(booking.checkIn),
        checkOutLabel: formatStayDate(booking.checkOut),
        nights: booking.nights,
        rooms: booking.rooms,
        guests: booking.guests,
        guestName: booking.guestName,
        emailMasked: maskEmail(booking.guestEmail),
        phoneMasked: maskPhone(booking.guestPhone),
        totalLabel: formatMoney(booking.totalMinor, booking.currency),
        cancellationLabel: booking.cancellationLabel,
        confirmationCode: booking.confirmationCode ?? null,
        createdAt: booking.createdAt,
      },
    },
    { headers: NO_STORE },
  );
}
