import { NextResponse } from "next/server";
import { db } from "@/db";
import { newsletterSubscribers } from "@/db/schema";
import { clientIp, NO_STORE, rateLimit } from "@/lib/rate-limit";
import { audit } from "@/lib/security/log";

export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Newsletter sign-up: email only — no unnecessary personal data collected. */
export async function POST(req: Request) {
  const ip = clientIp(req);
  const limit = rateLimit(`newsletter:${ip}`, 5, 60 * 60_000);
  if (!limit.allowed) {
    return NextResponse.json({ ok: false, error: "Too many sign-ups from this device. Please try again later." }, { status: 429, headers: NO_STORE });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400, headers: NO_STORE });
  }
  if (typeof body.website === "string" && body.website.trim()) {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400, headers: NO_STORE });
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase().slice(0, 200) : "";
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ ok: false, errors: { email: "Please enter a valid email address." } }, { status: 422, headers: NO_STORE });
  }

  try {
    await db
      .insert(newsletterSubscribers)
      .values({ email, source: typeof body.source === "string" ? body.source.slice(0, 60) : "website" })
      .onConflictDoNothing();
    audit("newsletter.subscribed", { actor: `guest:${ip}`, detail: "email stored" });
    return NextResponse.json({ ok: true, message: "You're on the list. We'll only email travel offers and updates." }, { status: 201, headers: NO_STORE });
  } catch (err) {
    console.error("Newsletter sign-up failed", err instanceof Error ? err.message : "");
    return NextResponse.json({ ok: false, error: "We couldn't save that right now. Please try again." }, { status: 500, headers: NO_STORE });
  }
}
