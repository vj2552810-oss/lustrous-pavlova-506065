import { NextResponse } from "next/server";
import { hotelIntegrationState } from "@/lib/hotels/provider";
import { stripeConfigured, stripeMode, stripeWebhookConfigured } from "@/lib/payments/stripe";
import { emailConfigured } from "@/lib/email";
import { mapsIntegrationState } from "@/lib/maps/config";
import { placesConfigured } from "@/lib/maps/places";
import { NO_STORE } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

/** Public configuration status — booleans only, never credentials. */
export async function GET() {
  const hotels = hotelIntegrationState();
  const payments = stripeConfigured();
  const email = emailConfigured();
  const maps = mapsIntegrationState();

  const problems: string[] = [];
  if (hotels.mode === "demo") {
    problems.push(
      hotels.credentialsPresent
        ? "Hotel API credentials found but HOTEL_API_MODE is not set to \"live\" — demo inventory is being shown."
        : "No hotel API configured: sample inventory only. Set HOTEL_API_BASE_URL, HOTEL_API_KEY and HOTEL_API_MODE=live to take live bookings.",
    );
  }
  if (!payments) problems.push("Stripe is not configured (STRIPE_SECRET_KEY), so online payment is unavailable.");
  if (payments && !stripeWebhookConfigured()) problems.push("STRIPE_WEBHOOK_SECRET is missing — payments could be taken without bookings being confirmed automatically.");
  if (!email) problems.push("Email delivery is not configured (RESEND_API_KEY, BOOKING_EMAIL_FROM); confirmations are shown on screen only.");
  if (!maps.browserKeyConfigured) problems.push("Google Maps browser key missing (NEXT_PUBLIC_GOOGLE_MAPS_API_KEY): maps are replaced by a fallback, directions links still work.");
  if (!placesConfigured()) problems.push("Google Places server key missing (GOOGLE_MAPS_SERVER_API_KEY): nearby attractions are not shown.");

  return NextResponse.json(
    {
      bookingEnabled: hotels.mode === "live" && payments,
      hotels,
      payments: { provider: "stripe", configured: payments, mode: stripeMode(), webhookConfigured: stripeWebhookConfigured() },
      email: { configured: email },
      maps: {
        browserKeyConfigured: maps.browserKeyConfigured,
        placesConfigured: placesConfigured(),
        hotelPricesSource: "hotel provider (never Google Maps)",
      },
      problems,
    },
    { headers: NO_STORE },
  );
}
