import { NextResponse } from "next/server";
import { adminConfigured, adminSetupMessage, createAdminSession, passcodeMatches, purgeExpiredAdminSessions } from "@/lib/admin/auth";
import { clientIp, NO_STORE, rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

/** Staff passcode gate for the tour manager. This is not a customer account. */
export async function POST(req: Request) {
  const ip = clientIp(req);
  const limit = rateLimit(`admin-unlock:${ip}`, 6, 15 * 60_000);
  if (!limit.allowed) {
    return NextResponse.json({ ok: false, error: "Too many attempts. Please wait 15 minutes." }, { status: 429, headers: NO_STORE });
  }
  if (!adminConfigured()) {
    return NextResponse.json({ ok: false, error: adminSetupMessage() }, { status: 503, headers: NO_STORE });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400, headers: NO_STORE });
  }
  const passcode = typeof body.passcode === "string" ? body.passcode : "";
  if (!passcodeMatches(passcode)) {
    return NextResponse.json({ ok: false, error: "That passcode is not correct." }, { status: 401, headers: NO_STORE });
  }

  await purgeExpiredAdminSessions();
  await createAdminSession(req);
  return NextResponse.json({ ok: true }, { headers: NO_STORE });
}
