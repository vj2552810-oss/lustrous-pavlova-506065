import "server-only";

/**
 * Security / audit logging.
 *
 * - Never logs passwords, passcodes, tokens, card data or full emails/phones.
 * - Writes a structured line to the server log AND (best-effort) to the
 *   `audit_logs` table so staff can review what changed.
 */

const SENSITIVE_KEYS = /(passcode|password|secret|token|authorization|cookie|card|cvv|cvc|api[_-]?key|session)/i;
const SENSITIVE_VALUES = [
  /sk_(live|test)_[A-Za-z0-9]+/g,
  /rk_(live|test)_[A-Za-z0-9]+/g,
  /whsec_[A-Za-z0-9]+/g,
  /AIza[0-9A-Za-z_-]{30,}/g,
  /postgres(ql)?:\/\/[^\s]+/gi,
  /Bearer\s+[A-Za-z0-9._-]+/g,
];

export function redact(value: unknown): string {
  let text: string;
  try {
    text = typeof value === "string" ? value : JSON.stringify(value);
  } catch {
    text = String(value);
  }
  if (!text) return "";
  for (const re of SENSITIVE_VALUES) text = text.replace(re, "[redacted]");
  return text.slice(0, 600);
}

/** Redacts object keys that look secret before anything is persisted. */
export function sanitizePayload(input: unknown): Record<string, unknown> | null {
  if (!input || typeof input !== "object") return null;
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
    if (SENSITIVE_KEYS.test(key)) {
      out[key] = "[redacted]";
      continue;
    }
    out[key] = typeof value === "string" ? redact(value) : value;
  }
  return out;
}

export function maskEmail(email: string) {
  const [user, domain] = String(email ?? "").split("@");
  if (!domain) return "[redacted-email]";
  return `${user.slice(0, 2)}***@${domain}`;
}

export function maskPhone(phone: string) {
  const digits = String(phone ?? "").replace(/\D/g, "");
  return digits.length > 4 ? `***${digits.slice(-4)}` : "[redacted-phone]";
}

export type SecurityEvent =
  | "admin.login.failed"
  | "admin.login.success"
  | "admin.logout"
  | "admin.session.rejected"
  | "admin.tour.created"
  | "admin.tour.updated"
  | "admin.tour.deleted"
  | "admin.enquiry.updated"
  | "admin.supplier.created"
  | "admin.supplier.updated"
  | "admin.supplier.deleted"
  | "admin.quotation.created"
  | "admin.customer.updated"
  | "enquiry.received"
  | "enquiry.rate_limited"
  | "enquiry.spam_blocked"
  | "enquiry.duplicate_ignored"
  | "booking.created"
  | "booking.payment.unverified"
  | "booking.payment.verified"
  | "booking.confirmation_failed"
  | "booking.refund"
  | "webhook.signature_rejected"
  | "webhook.duplicate_ignored"
  | "webhook.processed"
  | "newsletter.subscribed"
  | "validation.failed"
  | "rate_limited"
  | "config.missing";

export function logSecurity(event: SecurityEvent, detail?: unknown) {
  // eslint-disable-next-line no-console
  console.info(`[security] ${event}${detail !== undefined ? ` ${redact(detail)}` : ""}`);
}

/** Persists an audit row; failures never bubble up to guests. */
export async function audit(
  event: SecurityEvent,
  meta: { actor?: string; entityType?: string; entityId?: string | number; detail?: unknown; payload?: unknown },
) {
  logSecurity(event, meta.detail);
  try {
    const { auditLogs } = await import("@/db/schema");
    const { db } = await import("@/db");
    await db.insert(auditLogs).values({
      event,
      actor: (meta.actor ?? "system").slice(0, 80),
      entityType: meta.entityType ?? null,
      entityId: meta.entityId !== undefined ? String(meta.entityId).slice(0, 60) : null,
      detail: typeof meta.detail === "string" ? meta.detail.slice(0, 500) : redact(meta.detail),
      payload: sanitizePayload(meta.payload),
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("[security] audit write failed", err instanceof Error ? err.message : "");
  }
}
