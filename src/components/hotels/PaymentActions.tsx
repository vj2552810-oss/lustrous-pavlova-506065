"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, CheckCircle2, CreditCard, Loader2, RefreshCw, XCircle } from "lucide-react";

export function PaymentActions({
  reference,
  maskedContact,
  canPay,
  canCancel,
  stripeConfigured,
  paymentNotice,
}: {
  reference: string;
  maskedContact: string;
  canPay: boolean;
  canCancel: boolean;
  stripeConfigured: boolean;
  paymentNotice?: string | null;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [contact, setContact] = useState("");
  const [busy, setBusy] = useState<"" | "pay" | "sync" | "cancel">("");
  const [message, setMessage] = useState<{ tone: "ok" | "warn" | "error"; text: string } | null>(null);
  const synced = useRef(false);

  const returnedFromCheckout = params.get("checkout");

  async function sync(silent = false) {
    setBusy("sync");
    if (!silent) setMessage(null);
    try {
      const res = await fetch(`/api/bookings/${reference}/sync`, { method: "POST" });
      const json = await res.json();
      if (json.status === "confirmed") {
        setMessage({ tone: "ok", text: "Payment verified and the hotel confirmed your reservation." });
      } else if (json.message) {
        setMessage({ tone: "warn", text: json.message });
      }
      router.refresh();
    } catch {
      if (!silent) setMessage({ tone: "error", text: "We couldn't check the payment status. Please try again." });
    }
    setBusy("");
  }

  useEffect(() => {
    // Only runs once per visit, after returning from Stripe.
    if (returnedFromCheckout === "success" && !synced.current) {
      synced.current = true;
      void sync(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [returnedFromCheckout]);

  async function pay() {
    setMessage(null);
    if (contact.trim().length < 6) {
      setMessage({ tone: "error", text: `Enter the email or phone used on this booking (${maskedContact}) to continue.` });
      return;
    }
    setBusy("pay");
    try {
      const res = await fetch(`/api/bookings/${reference}/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contact }),
      });
      const json = await res.json();
      if (!res.ok || !json.url) {
        setMessage({ tone: "error", text: json.error ?? "We couldn't open the payment page." });
        setBusy("");
        return;
      }
      window.location.assign(json.url);
    } catch {
      setMessage({ tone: "error", text: "Network error — please try again." });
      setBusy("");
    }
  }

  async function cancel() {
    setMessage(null);
    if (contact.trim().length < 6) {
      setMessage({ tone: "error", text: "Enter the email or phone used on this booking to cancel it." });
      return;
    }
    setBusy("cancel");
    try {
      const res = await fetch(`/api/bookings/${reference}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contact }),
      });
      const json = await res.json();
      setMessage({ tone: json.ok ? "ok" : "error", text: json.message ?? json.error ?? "Done." });
      if (json.ok) router.refresh();
    } catch {
      setMessage({ tone: "error", text: "Network error — please try again." });
    }
    setBusy("");
  }

  return (
    <div className="rounded-3xl border border-black/5 bg-white p-6 sm:p-7">
      <h2 className="font-serif text-2xl">Booking actions</h2>
      {paymentNotice && (
        <p className="mt-3 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-950">
          <strong className="block">Payment status</strong>
          {paymentNotice}
        </p>
      )}
      {returnedFromCheckout === "cancelled" && (
        <p className="mt-3 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          You left the payment page without paying. Nothing has been charged — you can try again below.
        </p>
      )}
      {message && (
        <div
          role="status"
          className={`mt-3 flex items-start gap-2 rounded-2xl border px-4 py-3 text-sm ${
            message.tone === "ok"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : message.tone === "warn"
                ? "border-amber-300 bg-amber-50 text-amber-900"
                : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {message.tone === "ok" ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" /> : <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />}
          {message.text}
        </div>
      )}

      <div className="mt-4">
        <label htmlFor="booking-contact" className="mb-1.5 block text-sm font-medium text-neutral-600">
          Confirm the email or phone on this booking
        </label>
        <input
          id="booking-contact"
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          className="w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-3 text-sm focus:border-gold focus:outline-none focus:ring-4 focus:ring-gold/15"
          placeholder={maskedContact}
          autoComplete="email"
        />
        <p className="mt-1 text-xs text-neutral-500">Required to protect your booking. On file: {maskedContact}</p>
      </div>

      <div className="mt-4 flex flex-col gap-3">
        {canPay && (
          <>
            <button
              type="button"
              onClick={pay}
              disabled={busy !== "" || !stripeConfigured}
              className="bg-gold-gradient inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 font-semibold text-ink disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy === "pay" ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <CreditCard className="h-4 w-4" aria-hidden="true" />}
              Pay securely
            </button>
            {!stripeConfigured && (
              <p className="text-xs text-amber-800">Online payment isn&apos;t configured on this site yet. Message us on WhatsApp and we&apos;ll send a secure link.</p>
            )}
            <button
              type="button"
              onClick={() => sync(false)}
              disabled={busy !== ""}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-neutral-300 px-6 py-3 text-sm font-medium hover:border-gold disabled:opacity-60"
            >
              {busy === "sync" ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <RefreshCw className="h-4 w-4" aria-hidden="true" />}
              Already paid? Verify payment
            </button>
          </>
        )}
        {canCancel && (
          <button
            type="button"
            onClick={cancel}
            disabled={busy !== ""}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-neutral-200 px-6 py-3 text-sm font-medium text-neutral-600 hover:border-red-300 hover:text-red-700 disabled:opacity-60"
          >
            {busy === "cancel" ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <XCircle className="h-4 w-4" aria-hidden="true" />}
            Cancel this unpaid booking
          </button>
        )}
      </div>
    </div>
  );
}
