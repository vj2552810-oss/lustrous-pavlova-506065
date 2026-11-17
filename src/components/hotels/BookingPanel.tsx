"use client";

import { useRouter } from "next/navigation";
import { useState, type ChangeEvent, type FormEvent } from "react";
import { AlertCircle, BedDouble, Check, Coffee, Loader2, Lock, RefreshCw, ShieldCheck } from "lucide-react";
import { formatMoney, formatStayDate, nightsCount } from "@/lib/hotels/format";
import type { HotelResult, HotelSearchQuery, ProviderQuote } from "@/lib/hotels/types";

interface Props {
  hotel: HotelResult;
  query: HotelSearchQuery;
  mode: "demo" | "live";
  paymentConfigured: boolean;
}

const inputCls = (invalid?: boolean) =>
  `w-full rounded-xl border bg-white px-3.5 py-3 text-sm text-ink placeholder:text-neutral-500 focus:outline-none focus:ring-4 ${
    invalid ? "border-red-400 focus:border-red-500 focus:ring-red-100" : "border-neutral-200 focus:border-gold focus:ring-gold/15"
  }`;
const labelCls = "mb-1.5 block text-sm font-medium text-neutral-600";

export function BookingPanel({ hotel, query, mode, paymentConfigured }: Props) {
  const router = useRouter();
  const [roomId, setRoomId] = useState(hotel.rooms[0]?.id ?? "");
  const [guest, setGuest] = useState({ guestName: "", guestEmail: "", guestPhone: "", specialRequests: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [checking, setChecking] = useState(false);
  const [quote, setQuote] = useState<ProviderQuote | null>(null);
  const [recheckNote, setRecheckNote] = useState("");

  const nights = nightsCount(query.checkIn, query.checkOut);
  const selectedRoom = hotel.rooms.find((r) => r.id === roomId) ?? hotel.rooms[0];

  const set = (key: keyof typeof guest) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setGuest((g) => ({ ...g, [key]: e.target.value }));
    if (errors[key]) setErrors((er) => ({ ...er, [key]: "" }));
  };

  async function recheck() {
    if (!selectedRoom) return;
    setChecking(true);
    setRecheckNote("");
    try {
      const res = await fetch("/api/hotels/recheck", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hotelId: hotel.id, roomId: selectedRoom.id, ...query }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setQuote(null);
        setRecheckNote(json.error ?? "This room is no longer available.");
      } else {
        setQuote(json.quote);
        setRecheckNote(`Current price for these dates: ${json.quote.totalLabel} (including taxes).`);
      }
    } catch {
      setRecheckNote("We couldn't check availability just now. Please try again.");
    }
    setChecking(false);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError("");
    const next: Record<string, string> = {};
    if (guest.guestName.trim().length < 2) next.guestName = "Enter the lead guest's full name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(guest.guestEmail.trim())) next.guestEmail = "Enter a valid email address.";
    if (!/^\+?\d{10,15}$/.test(guest.guestPhone.replace(/[\s\-()]/g, ""))) next.guestPhone = "Enter a valid phone number (10–15 digits).";
    setErrors(next);
    if (Object.keys(next).length) {
      document.getElementById(`guest-${Object.keys(next)[0]}`)?.focus();
      return;
    }
    if (!selectedRoom) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hotelId: hotel.id, roomId: selectedRoom.id, ...query, ...guest }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        if (json.errors) setErrors(json.errors);
        else setFormError(json.error ?? "We couldn't start this booking.");
        setSubmitting(false);
        return;
      }
      router.push(json.next ?? `/booking/${json.reference}`);
    } catch {
      setFormError("Network error — please check your connection and try again.");
      setSubmitting(false);
    }
  }

  if (!selectedRoom) {
    return (
      <div className="rounded-3xl border border-neutral-200 bg-white p-8 text-center text-sm text-neutral-600">
        No rooms are available for these dates. Try different dates, or message us on WhatsApp.
      </div>
    );
  }

  const ctaLabel = mode === "demo" ? "Send demo booking request" : paymentConfigured ? "Continue to secure payment" : "Send booking request";

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-6 rounded-3xl border border-black/5 bg-white p-6 shadow-[0_30px_60px_-35px_rgba(0,0,0,0.35)] sm:p-8">
      <div>
        <h2 className="font-serif text-3xl">Choose your room</h2>
        <p className="mt-1 text-sm text-neutral-500">
          Prices are for {nights} night{nights === 1 ? "" : "s"} and {query.rooms} room{query.rooms > 1 ? "s" : ""}, including taxes.
        </p>
      </div>

      <div className="space-y-3">
        {hotel.rooms.map((room) => {
          const active = room.id === roomId;
          const fits = room.maxGuestsPerRoom * query.rooms >= query.guests;
          return (
            <label
              key={room.id}
              className={`block cursor-pointer rounded-2xl border p-4 transition ${
                active ? "border-gold bg-champagne/40 ring-2 ring-gold/30" : "border-neutral-200 hover:border-gold/60"
              } ${fits ? "" : "opacity-60"}`}
            >
              <div className="flex items-start gap-3">
                <input
                  type="radio"
                  name="room"
                  value={room.id}
                  checked={active}
                  onChange={() => { setRoomId(room.id); setQuote(null); setRecheckNote(""); }}
                  className="mt-1.5 h-4 w-4 accent-[#c6a866]"
                  disabled={!fits}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="flex items-center gap-2 font-medium text-ink">
                        <BedDouble className="h-4 w-4 text-gold" aria-hidden="true" /> {room.name}
                      </p>
                      <p className="mt-1 text-xs text-neutral-500">{room.bedType} · up to {room.maxGuestsPerRoom} per room{fits ? "" : " — too small for your party"}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-serif text-xl font-semibold text-ink">{formatMoney(room.totalMinor)}</p>
                      <p className="text-xs text-neutral-500">{formatMoney(room.nightlyPriceMinor)} / night</p>
                    </div>
                  </div>
                  <p className="mt-2 text-xs leading-5 text-neutral-600">{room.description}</p>
                  <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs">
                    <li className={`inline-flex items-center gap-1 ${room.cancellation.refundable ? "text-emerald-700" : "text-neutral-500"}`}>
                      <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" /> {room.cancellation.label}
                    </li>
                    {room.breakfastIncluded && <li className="inline-flex items-center gap-1 text-emerald-700"><Coffee className="h-3.5 w-3.5" aria-hidden="true" /> Breakfast included</li>}
                    <li className="text-neutral-500">{room.roomsAvailable} room(s) shown available</li>
                  </ul>
                </div>
              </div>
            </label>
          );
        })}
      </div>

      <div className="rounded-2xl bg-ivory p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-neutral-600">
            <strong>{formatStayDate(query.checkIn)}</strong> → <strong>{formatStayDate(query.checkOut)}</strong> · {query.guests} guest(s)
          </p>
          <button
            type="button"
            onClick={recheck}
            disabled={checking}
            className="inline-flex items-center gap-2 rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm font-medium hover:border-gold disabled:opacity-60"
          >
            {checking ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <RefreshCw className="h-4 w-4" aria-hidden="true" />}
            Recheck availability &amp; price
          </button>
        </div>
        {recheckNote && (
          <p className={`mt-2 text-sm ${quote ? "text-emerald-700" : "text-amber-800"}`} aria-live="polite">{recheckNote}</p>
        )}
        {quote && (
          <dl className="mt-3 space-y-1 border-t border-neutral-200 pt-3 text-sm">
            <div className="flex justify-between"><dt className="text-neutral-500">Room subtotal</dt><dd>{formatMoney(quote.subtotalMinor)}</dd></div>
            <div className="flex justify-between"><dt className="text-neutral-500">Taxes</dt><dd>{formatMoney(quote.taxesMinor)}</dd></div>
            <div className="flex justify-between font-semibold"><dt>Total</dt><dd>{formatMoney(quote.totalMinor)}</dd></div>
          </dl>
        )}
      </div>

      <div>
        <h3 className="font-serif text-2xl">Guest details</h3>
        <p className="mt-1 text-sm text-neutral-500">No account needed — we only use these details for this booking.</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="guest-guestName" className={labelCls}>Lead guest full name <span className="text-gold-dark">*</span></label>
            <input id="guest-guestName" value={guest.guestName} onChange={set("guestName")} className={inputCls(!!errors.guestName)} autoComplete="name" aria-invalid={!!errors.guestName || undefined} />
            {errors.guestName && <p role="alert" className="mt-1 text-xs font-medium text-red-600">{errors.guestName}</p>}
          </div>
          <div>
            <label htmlFor="guest-guestEmail" className={labelCls}>Email <span className="text-gold-dark">*</span></label>
            <input id="guest-guestEmail" type="email" value={guest.guestEmail} onChange={set("guestEmail")} className={inputCls(!!errors.guestEmail)} autoComplete="email" aria-invalid={!!errors.guestEmail || undefined} />
            {errors.guestEmail && <p role="alert" className="mt-1 text-xs font-medium text-red-600">{errors.guestEmail}</p>}
          </div>
          <div>
            <label htmlFor="guest-guestPhone" className={labelCls}>Phone / WhatsApp <span className="text-gold-dark">*</span></label>
            <input id="guest-guestPhone" type="tel" value={guest.guestPhone} onChange={set("guestPhone")} className={inputCls(!!errors.guestPhone)} autoComplete="tel" placeholder="+91 98765 43210" aria-invalid={!!errors.guestPhone || undefined} />
            {errors.guestPhone && <p role="alert" className="mt-1 text-xs font-medium text-red-600">{errors.guestPhone}</p>}
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="guest-specialRequests" className={labelCls}>Special requests <span className="font-normal text-neutral-500">(optional)</span></label>
            <textarea id="guest-specialRequests" rows={3} maxLength={800} value={guest.specialRequests} onChange={set("specialRequests")} className={inputCls(!!errors.specialRequests)} placeholder="Late arrival, high floor, celebration…" />
          </div>
        </div>
      </div>

      {formError && (
        <div role="alert" className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" /> {formError}
        </div>
      )}

      <div className="rounded-2xl border border-neutral-200 p-4">
        <div className="flex items-start gap-2 text-sm text-neutral-600">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden="true" />
          <p>
            <strong>{selectedRoom.cancellation.label}.</strong> {selectedRoom.cancellation.terms}
          </p>
        </div>
      </div>

      <div>
        <button
          type="submit"
          disabled={submitting}
          className="bg-gold-gradient inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-4 font-semibold text-ink shadow-lg shadow-gold/20 transition hover:brightness-110 disabled:cursor-wait disabled:opacity-70"
        >
          {submitting ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> : mode === "demo" ? <Check className="h-5 w-5" aria-hidden="true" /> : <Lock className="h-5 w-5" aria-hidden="true" />}
          {submitting ? "Saving your details…" : ctaLabel}
        </button>
        <p className="mt-3 text-xs leading-5 text-neutral-500">
          {mode === "demo" ? (
            <>Demo mode: this records a sample request only. <strong>No payment is taken and no reservation is confirmed.</strong></>
          ) : paymentConfigured ? (
            <>You&apos;ll review the final price, then pay securely on Stripe. Your booking is confirmed only after the hotel provider confirms it.</>
          ) : (
            <>Online payment is not enabled yet, so this sends a booking request. We&apos;ll reply with a secure payment link — no payment is taken here.</>
          )}
        </p>
      </div>
    </form>
  );
}
