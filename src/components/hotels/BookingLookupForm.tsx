"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { AlertCircle, FileSearch, Loader2, Mail, Phone, Search } from "lucide-react";

interface LookupBooking {
  reference: string;
  status: string;
  mode: string;
  hotelName: string;
  city: string;
  roomName: string;
  checkInLabel: string;
  checkOutLabel: string;
  nights: number;
  rooms: number;
  guests: number;
  guestName: string;
  emailMasked: string;
  phoneMasked: string;
  totalLabel: string;
  cancellationLabel: string;
  confirmationCode: string | null;
}

const STATUS_TEXT: Record<string, string> = {
  confirmed: "Confirmed by the hotel",
  pending_payment: "Awaiting payment",
  paid: "Payment received — confirming with hotel",
  request_received: "Request received — not confirmed",
  demo_request: "Demo request — not a reservation",
  confirmation_failed: "Could not be confirmed",
  refunded: "Refunded",
  cancelled: "Cancelled",
};

export function BookingLookupForm() {
  const [form, setForm] = useState({ reference: "", contact: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState<LookupBooking | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError("");
    setBooking(null);
    const next: Record<string, string> = {};
    if (!/^PVH-[A-Z0-9]{6}$/i.test(form.reference.trim())) next.reference = "Enter the full reference, e.g. PVH-8K2M4Q.";
    if (form.contact.trim().length < 6) next.contact = "Enter the email or phone used for the booking.";
    setErrors(next);
    if (Object.keys(next).length) return;

    setLoading(true);
    try {
      const res = await fetch("/api/bookings/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        if (json.errors) setErrors(json.errors);
        else setFormError(json.error ?? "We couldn't find that booking.");
      } else {
        setBooking(json.booking as LookupBooking);
      }
    } catch {
      setFormError("Network error — please try again.");
    }
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} noValidate className="rounded-3xl border border-black/5 bg-white p-6 shadow-[0_30px_60px_-35px_rgba(0,0,0,0.35)] sm:p-8">
        <h2 className="font-serif text-2xl">Find your booking</h2>
        <p className="mt-1 text-sm text-neutral-500">No account needed — use your reference plus the email or phone on the booking.</p>
        {formError && (
          <div role="alert" className="mt-4 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" /> {formError}
          </div>
        )}
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="lookup-reference" className="mb-1.5 block text-sm font-medium text-neutral-600">Booking reference</label>
            <input
              id="lookup-reference"
              value={form.reference}
              onChange={(e) => { setForm((f) => ({ ...f, reference: e.target.value.toUpperCase() })); setErrors((x) => ({ ...x, reference: "" })); }}
              placeholder="PVH-8K2M4Q"
              className={`w-full rounded-xl border bg-white px-3.5 py-3 font-mono text-sm tracking-wider focus:outline-none focus:ring-4 ${errors.reference ? "border-red-400 focus:ring-red-100" : "border-neutral-200 focus:border-gold focus:ring-gold/15"}`}
              aria-invalid={!!errors.reference || undefined}
            />
            {errors.reference && <p role="alert" className="mt-1 text-xs font-medium text-red-600">{errors.reference}</p>}
          </div>
          <div>
            <label htmlFor="lookup-contact" className="mb-1.5 block text-sm font-medium text-neutral-600">Email or phone</label>
            <input
              id="lookup-contact"
              value={form.contact}
              onChange={(e) => { setForm((f) => ({ ...f, contact: e.target.value })); setErrors((x) => ({ ...x, contact: "" })); }}
              placeholder="you@example.com or +91 98765 43210"
              className={`w-full rounded-xl border bg-white px-3.5 py-3 text-sm focus:outline-none focus:ring-4 ${errors.contact ? "border-red-400 focus:ring-red-100" : "border-neutral-200 focus:border-gold focus:ring-gold/15"}`}
              aria-invalid={!!errors.contact || undefined}
            />
            {errors.contact && <p role="alert" className="mt-1 text-xs font-medium text-red-600">{errors.contact}</p>}
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-gold-gradient mt-5 inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 font-semibold text-ink disabled:opacity-70"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Search className="h-4 w-4" aria-hidden="true" />}
          {loading ? "Looking up…" : "Retrieve booking"}
        </button>
      </form>

      {booking && (
        <section aria-live="polite" className="rounded-3xl border border-black/5 bg-white p-6 shadow-[0_30px_60px_-35px_rgba(0,0,0,0.35)] sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="eyebrow text-gold-dark">Booking found</p>
              <h2 className="mt-2 font-serif text-3xl">{booking.hotelName}</h2>
              <p className="text-sm text-neutral-500">{booking.city} · {booking.roomName}</p>
            </div>
            <span className="rounded-full bg-ink px-4 py-1.5 text-xs font-semibold text-white">{STATUS_TEXT[booking.status] ?? booking.status}</span>
          </div>
          <dl className="mt-6 grid gap-4 sm:grid-cols-2">
            {[
              ["Reference", booking.reference],
              ["Check-in", booking.checkInLabel],
              ["Check-out", booking.checkOutLabel],
              ["Stay", `${booking.nights} night(s) · ${booking.rooms} room(s) · ${booking.guests} guest(s)`],
              ["Lead guest", booking.guestName],
              ["Total", booking.totalLabel],
              ["Cancellation", booking.cancellationLabel],
              ...(booking.confirmationCode ? [["Hotel confirmation", booking.confirmationCode]] : []),
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="text-xs uppercase tracking-wider text-neutral-500">{label}</dt>
                <dd className="text-sm font-medium text-ink">{value}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-5 flex flex-wrap gap-4 text-xs text-neutral-500">
            <span className="inline-flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" aria-hidden="true" /> {booking.emailMasked}</span>
            <span className="inline-flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" aria-hidden="true" /> {booking.phoneMasked}</span>
          </div>
          <Link href={`/booking/${booking.reference}`} className="mt-6 inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white hover:bg-gold hover:text-ink">
            <FileSearch className="h-4 w-4" aria-hidden="true" /> Open booking page
          </Link>
        </section>
      )}
    </div>
  );
}
