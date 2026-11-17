import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { auditLogs } from "@/db/schema";
import { audit } from "@/lib/security/log";
import { NO_STORE, clientIp, rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

/**
 * n8n (or any automation) inbound webhook.
 *
 * Every call must be signed: header `x-pritivo-signature: sha256=<hex>` computed
 * over the raw body with N8N_WEBHOOK_SECRET. Without a configured secret all
 * workflows are rejected — nothing is open by default. Events are idempotent via
 * `x-pritivo-event-id` and recorded in `audit_logs`.
 */

const ALLOWED = [
  "enquiry-created",
  "quotation-generated",
  "booking-updated",
  "payment-updated",
  "supplier-updated",
  "reminder-sent",
  "feedback-requested",
  "assistant-handoff",
] as const;

function verify(raw: string, header: string | null, secret: string) {
  if (!header) return { ok: false, error: "Missing x-pritivo-signature header." };
  const [scheme, value] = header.split("=");
  if (scheme !== "sha256" || !value) return { ok: false, error: "Malformed signature header." };
  const expected = createHmac("sha256", secret).update(raw).digest("hex");
  const a = Buffer.from(value.trim());
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return { ok: false, error: "Invalid signature." };
  return { ok: true as const };
}

export async function POST(req: Request, { params }: { params: Promise<{ workflow: string }> }) {
  const { workflow } = await params;
  const secret = process.env.N8N_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json(
      { ok: false, error: "Automation webhooks are not configured. Set N8N_WEBHOOK_SECRET on the server to enable them." },
      { status: 503, headers: NO_STORE },
    );
  }

  const limit = rateLimit(`n8n:${clientIp(req)}`, 60, 60_000);
  if (!limit.allowed) return NextResponse.json({ ok: false, error: "Rate limit exceeded." }, { status: 429, headers: NO_STORE });

  const raw = await req.text();
  const check = verify(raw, req.headers.get("x-pritivo-signature"), secret);
  if (!check.ok) {
    await audit("webhook.signature_rejected", { actor: `n8n:${clientIp(req)}`, entityType: "workflow", entityId: workflow, detail: check.error });
    return NextResponse.json({ ok: false, error: check.error }, { status: 401, headers: NO_STORE });
  }

  let body: Record<string, unknown>;
  try {
    body = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "Body must be valid JSON." }, { status: 400, headers: NO_STORE });
  }

  const type = typeof body.type === "string" ? body.type : "";
  if (!(ALLOWED as readonly string[]).includes(type)) {
    return NextResponse.json({ ok: false, error: `Unknown event type. Allowed: ${ALLOWED.join(", ")}.` }, { status: 422, headers: NO_STORE });
  }

  const eventId = typeof body.eventId === "string" ? body.eventId.slice(0, 120) : "";
  if (eventId) {
    const existing = await db.select({ id: auditLogs.id }).from(auditLogs).where(eq(auditLogs.entityId, eventId)).limit(1);
    if (existing.length) {
      await audit("webhook.duplicate_ignored", { actor: "n8n", entityType: "workflow", entityId: eventId, detail: type });
      return NextResponse.json({ ok: true, duplicate: true }, { headers: NO_STORE });
    }
  }

  // We record the event and acknowledge it. Business-state changes stay in the
  // staff dashboard so automation can never silently confirm a booking.
  await audit("webhook.processed", {
    actor: `n8n:${workflow}`,
    entityType: "workflow",
    entityId: eventId || undefined,
    detail: `${type} received (${raw.length} bytes)`,
  });

  return NextResponse.json(
    {
      ok: true,
      received: type,
      workflow,
      note: "Event recorded. Booking, payment and supplier status changes must be applied by staff in the dashboard.",
    },
    { headers: NO_STORE },
  );
}
