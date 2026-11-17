"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { CalendarDays, MapPin, Search, Users } from "lucide-react";
import { todayISO } from "@/lib/hotels/format";
import type { HotelSearchQuery } from "@/lib/hotels/types";

const DESTINATIONS = ["Belagavi", "Goa", "Coorg", "Kerala", "Mumbai", "Manali"];

export function HotelSearchForm({
  initial,
  variant = "panel",
  action = "/hotels",
  idPrefix = "hotel",
}: {
  initial: HotelSearchQuery;
  variant?: "panel" | "hero";
  action?: string;
  /** Keeps field ids unique when this form appears more than once on a page. */
  idPrefix?: string;
}) {
  const router = useRouter();
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const today = todayISO();

  const id = (name: string) => `${idPrefix}-${name}`;
  const listId = `${idPrefix}-destinations`;

  function update(key: keyof HotelSearchQuery, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: "" }));
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (form.destination.trim().length < 2) next.destination = "Enter a destination.";
    if (!form.checkIn || form.checkIn < today) next.checkIn = "Choose a valid check-in date.";
    if (!form.checkOut || form.checkOut <= form.checkIn) next.checkOut = "Check-out must be after check-in.";
    if (!form.guests || form.guests < 1) next.guests = "At least one guest.";
    if (!form.rooms || form.rooms < 1) next.rooms = "At least one room.";
    if (form.guests < form.rooms) next.rooms = "Each room needs a guest.";
    setErrors(next);
    if (Object.keys(next).length) return;

    const params = new URLSearchParams({
      destination: form.destination.trim(),
      checkIn: form.checkIn,
      checkOut: form.checkOut,
      guests: String(form.guests),
      rooms: String(form.rooms),
    });
    router.push(`${action}?${params.toString()}`);
  }

  const isHero = variant === "hero";
  const labelBase = "mb-1.5 block text-xs font-semibold uppercase tracking-wider";
  const label = isHero ? `${labelBase} text-white/65` : `${labelBase} text-neutral-500`;
  const field =
    "w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-3 text-sm text-ink focus:border-gold focus:outline-none focus:ring-4 focus:ring-gold/15";
  const err = "mt-1 text-xs font-medium text-red-300";
  const errLight = "mt-1 text-xs font-medium text-red-600";

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className={
        isHero
          ? "rounded-3xl border border-white/15 bg-white/10 p-4 backdrop-blur-md sm:p-5"
          : "rounded-3xl border border-black/5 bg-white p-5 shadow-[0_30px_60px_-35px_rgba(7,22,41,0.4)] sm:p-7"
      }
      aria-label="Hotel search"
    >
      <div className="grid items-end gap-4 md:grid-cols-2 lg:grid-cols-12">
        <div className="lg:col-span-3">
          <label htmlFor={id("destination")} className={label}>
            <MapPin className="mr-1 inline h-3.5 w-3.5" aria-hidden="true" /> Destination
          </label>
          <input
            id={id("destination")}
            list={listId}
            value={form.destination}
            onChange={(e) => update("destination", e.target.value)}
            className={field}
            placeholder="City, area or hotel"
            aria-invalid={!!errors.destination || undefined}
            aria-describedby={errors.destination ? `${id("destination")}-error` : undefined}
          />
          <datalist id={listId}>
            {DESTINATIONS.map((d) => (
              <option key={d} value={d} />
            ))}
          </datalist>
          {errors.destination && (
            <p id={`${id("destination")}-error`} className={isHero ? err : errLight}>{errors.destination}</p>
          )}
        </div>

        <div className="lg:col-span-2">
          <label htmlFor={id("checkin")} className={label}>
            <CalendarDays className="mr-1 inline h-3.5 w-3.5" aria-hidden="true" /> Check-in
          </label>
          <input
            id={id("checkin")}
            type="date"
            min={today}
            value={form.checkIn}
            onChange={(e) => update("checkIn", e.target.value)}
            className={field}
            aria-invalid={!!errors.checkIn || undefined}
          />
          {errors.checkIn && <p className={isHero ? err : errLight}>{errors.checkIn}</p>}
        </div>

        <div className="lg:col-span-2">
          <label htmlFor={id("checkout")} className={label}>
            <CalendarDays className="mr-1 inline h-3.5 w-3.5" aria-hidden="true" /> Check-out
          </label>
          <input
            id={id("checkout")}
            type="date"
            min={form.checkIn || today}
            value={form.checkOut}
            onChange={(e) => update("checkOut", e.target.value)}
            className={field}
            aria-invalid={!!errors.checkOut || undefined}
          />
          {errors.checkOut && <p className={isHero ? err : errLight}>{errors.checkOut}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3 lg:col-span-2 lg:gap-3">
          <div>
            <label htmlFor={id("guests")} className={label}>
              <Users className="mr-1 inline h-3 w-3" aria-hidden="true" /> Guests
            </label>
            <input
              id={id("guests")}
              type="number"
              min={1}
              max={16}
              value={form.guests}
              onChange={(e) => update("guests", e.target.value)}
              className={field}
            />
          </div>
          <div>
            <label htmlFor={id("rooms")} className={label}>
              Rooms
            </label>
            <input
              id={id("rooms")}
              type="number"
              min={1}
              max={6}
              value={form.rooms}
              onChange={(e) => update("rooms", e.target.value)}
              className={field}
            />
          </div>
          {(errors.guests || errors.rooms) && (
            <p className={`col-span-2 ${isHero ? err : errLight}`}>{errors.guests || errors.rooms}</p>
          )}
        </div>

        {/* Submit shares the input row from lg upward — a compact search bar
            instead of an orphaned button on its own line (issue 14). */}
        <div className="md:col-span-2 lg:col-span-3">
          <button
            type="submit"
            className="bg-gold-gradient inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-ink shadow-lg shadow-gold/20 transition hover:brightness-110"
          >
            <Search className="h-4 w-4" aria-hidden="true" /> Search hotels
          </button>
        </div>
      </div>

      <p className={`mt-3 text-xs ${isHero ? "text-white/65" : "text-neutral-500"}`}>
        No account needed — search, book and retrieve your booking with a reference.
      </p>
    </form>
  );
}
