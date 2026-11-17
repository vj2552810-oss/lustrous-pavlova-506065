import { NextResponse } from "next/server";
import { getHotelProvider, validateSearchQuery } from "@/lib/hotels/provider";
import { clientIp, NO_STORE, rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const limit = rateLimit(`hotel-search:${clientIp(req)}`, 60, 60_000);
  if (!limit.allowed) {
    return NextResponse.json({ ok: false, error: "Too many searches. Please wait a moment and try again." }, { status: 429, headers: NO_STORE });
  }

  const url = new URL(req.url);
  const { query, errors } = validateSearchQuery({
    destination: url.searchParams.get("destination") ?? "",
    checkIn: url.searchParams.get("checkIn") ?? "",
    checkOut: url.searchParams.get("checkOut") ?? "",
    guests: url.searchParams.get("guests") ?? "",
    rooms: url.searchParams.get("rooms") ?? "",
  });
  if (Object.keys(errors).length) return NextResponse.json({ ok: false, errors }, { status: 422, headers: NO_STORE });

  const provider = getHotelProvider();
  try {
    const result = await provider.search(query);
    return NextResponse.json({ ok: true, ...result }, { headers: NO_STORE });
  } catch (err) {
    console.error("Hotel search failed", err);
    return NextResponse.json(
      { ok: false, error: "The hotel provider is not responding right now. Please try again, or contact us on WhatsApp and we'll check availability for you." },
      { status: 502, headers: NO_STORE },
    );
  }
}
