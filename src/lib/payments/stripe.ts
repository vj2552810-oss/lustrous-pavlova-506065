import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Minimal Stripe integration over HTTPS so no extra dependency is required.
 * All calls happen server-side with STRIPE_SECRET_KEY — the key is never sent
 * to the browser.
 */

const API = "https://api.stripe.com/v1";
export const PAYMENT_CURRENCY = "inr";

import { envValue } from "@/lib/env";

export function stripeConfigured() {
  return Boolean(envValue("STRIPE_SECRET_KEY"));
}

/**
 * Test mode is used until live credentials are approved. Never claims live
 * payments are enabled unless a live secret key is present.
 */
export function stripeMode(): "unconfigured" | "test" | "live" {
  const key = envValue("STRIPE_SECRET_KEY") ?? "";
  if (!key) return "unconfigured";
  if (key.startsWith("sk_live_") || key.startsWith("rk_live_")) return "live";
  return "test";
}

/** Guests must see clearly whether payment is in test mode. */
export function stripeModeNotice(): string | null {
  const mode = stripeMode();
  if (mode === "test") {
    return "Payments are running in Stripe test mode. No real money is charged and a test card is required — live payments are enabled only after the account is approved and live keys are configured.";
  }
  if (mode === "unconfigured") {
    return "Online payment isn't configured yet. Nothing will be charged on this site — we'll share a secure payment link instead.";
  }
  return null;
}

export function stripeWebhookConfigured() {
  return Boolean(envValue("STRIPE_WEBHOOK_SECRET"));
}

function secretKey() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not configured");
  return key;
}

async function stripeFetch<T>(path: string, init: { method: "GET" | "POST"; body?: URLSearchParams }): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    method: init.method,
    headers: {
      Authorization: `Bearer ${secretKey()}`,
      "Content-Type": "application/x-www-form-urlencoded",
      "Stripe-Version": "2024-06-20",
    },
    body: init.body,
    cache: "no-store",
  });
  const json = (await res.json()) as T & { error?: { message?: string } };
  if (!res.ok) {
    throw new Error(json.error?.message ?? `Stripe request failed (${res.status})`);
  }
  return json;
}

export interface CheckoutSession {
  id: string;
  url: string;
  payment_status: string;
  amount_total: number | null;
  currency: string | null;
  payment_intent: string | null;
  metadata?: Record<string, string>;
  client_reference_id?: string | null;
}

export async function createCheckoutSession(input: {
  bookingReference: string;
  bookingId: number;
  amountMinor: number;
  currency: string;
  description: string;
  guestEmail: string;
  origin: string;
}): Promise<CheckoutSession> {
  const body = new URLSearchParams({
    mode: "payment",
    success_url: `${input.origin}/booking/${input.bookingReference}?checkout=success`,
    cancel_url: `${input.origin}/booking/${input.bookingReference}?checkout=cancelled`,
    customer_email: input.guestEmail,
    client_reference_id: input.bookingReference,
    "line_items[0][quantity]": "1",
    "line_items[0][price_data][currency]": input.currency.toLowerCase(),
    "line_items[0][price_data][unit_amount]": String(input.amountMinor),
    "line_items[0][price_data][product_data][name]": input.description.slice(0, 240),
    "metadata[bookingReference]": input.bookingReference,
    "metadata[bookingId]": String(input.bookingId),
    "payment_intent_data[metadata][bookingReference]": input.bookingReference,
    "payment_intent_data[description]": `PRITIVO hotel booking ${input.bookingReference}`,
  });
  return stripeFetch<CheckoutSession>("/checkout/sessions", { method: "POST", body });
}

export async function retrieveCheckoutSession(id: string): Promise<CheckoutSession> {
  return stripeFetch<CheckoutSession>(`/checkout/sessions/${encodeURIComponent(id)}`, { method: "GET" });
}

/** Issues a refund for a paid booking when the hotel cannot honour it. */
export async function refundPayment(paymentIntentId: string, amountMinor?: number): Promise<{ ok: boolean; refundId?: string; error?: string }> {
  try {
    const body = new URLSearchParams({ payment_intent: paymentIntentId });
    if (amountMinor) body.set("amount", String(amountMinor));
    const refund = await stripeFetch<{ id: string; status: string }>("/refunds", { method: "POST", body });
    return { ok: true, refundId: refund.id };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Refund failed" };
  }
}

/**
 * Verifies the `Stripe-Signature` header with the webhook signing secret.
 * Rejects anything unsigned or outside the 5-minute tolerance window.
 */
export function verifyStripeSignature(payload: string, header: string | null, toleranceSeconds = 300): { ok: boolean; error?: string } {
  const secret = envValue("STRIPE_WEBHOOK_SECRET");
  if (!secret) return { ok: false, error: "STRIPE_WEBHOOK_SECRET is not configured" };
  if (!header) return { ok: false, error: "Missing Stripe-Signature header" };

  const parts = header.split(",").map((p) => p.trim());
  const timestamp = parts.find((p) => p.startsWith("t="))?.slice(2);
  const signatures = parts.filter((p) => p.startsWith("v1=")).map((p) => p.slice(3));
  if (!timestamp || signatures.length === 0) return { ok: false, error: "Malformed Stripe-Signature header" };

  const age = Math.abs(Math.floor(Date.now() / 1000) - Number(timestamp));
  if (!Number.isFinite(age) || age > toleranceSeconds) return { ok: false, error: "Signature timestamp outside tolerance" };

  const expected = createHmac("sha256", secret).update(`${timestamp}.${payload}`).digest("hex");
  const expectedBuf = Buffer.from(expected, "utf8");
  const valid = signatures.some((sig) => {
    const sigBuf = Buffer.from(sig, "utf8");
    return sigBuf.length === expectedBuf.length && timingSafeEqual(sigBuf, expectedBuf);
  });
  return valid ? { ok: true } : { ok: false, error: "Invalid signature" };
}
