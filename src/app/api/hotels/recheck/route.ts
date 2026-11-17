import { NextResponse } from "next/server";
import { getHotelProvider, validateSearchQuery, formatMoney } from "@/lib/hotels/provider";
import { clientIp, NO_STORE, rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

/** Fresh availability + total immediately before the guest submits details. */
export async function POST(req: Request) {
  const limit = rateLimit(`hotel-recheck:${clientIp(req)}`, 40, 10 * 60_000);
  if (!limit.allowed) return NextResponse.json({ ok: false, error: "Too many checks. Please wait a moment." }, { status: 429, headers: NO_STORE });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400, headers: NO_STORE });
  }

  const hotelId = typeof body.hotelId === "string" ? body.hotelId.slice(0, 120) : "";
  const roomId = typeof body.roomId === "string" ? body.roomId.slice(0, 120) : "";
  if (!hotelId || !roomId) return NextResponse.json({ ok: false, error: "Select a room first." }, { status: 400, headers: NO_STORE });

  const { query, errors } = validateSearchQuery(body as Record<string, unknown>);
  if (Object.keys(errors).length) return NextResponse.json({ ok: false, errors }, { status: 422, headers: NO_STORE });

  const provider = getHotelProvider();
  try {
    const quote = await provider.recheck(hotelId, roomId, query);
    if (!quote) {
      return NextResponse.json({ ok: false, available: false, error: "That room is no longer available for the selected dates." }, { status: 409, headers: NO_STORE });
    }
    return NextResponse.json(
      {
        ok: true,
        available: true,
        mode: provider.mode,
        quote: { ...quote, totalLabel: formatMoney(quote.totalMinor, quote.currency) },
      },
      { headers: NO_STORE },
    );
  } catch (err) {
    console.error("Recheck failed", err);
    return NextResponse.json({ ok: false, error: "We couldn't reach the hotel provider to confirm availability. Please try again." }, { status: 502, headers: NO_STORE });
  }
}
