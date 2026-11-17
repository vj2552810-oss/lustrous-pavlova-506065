"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { AlertCircle, CheckCircle2, Loader2, Plane, Send } from "lucide-react";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { whatsappLink } from "@/lib/site";

const TRIP_TYPES = ["Return", "One way", "Multi-city"] as const;
const CABINS = ["Economy", "Premium economy", "Business", "First"] as const;

const empty = {
  name: "",
  email: "",
  phone: "",
  tripType: "Return" as (typeof TRIP_TYPES)[number],
  origin: "",
  destination: "",
  departDate: "",
  returnDate: "",
  travelers: "1",
  cabin: "Economy" as (typeof CABINS)[number],
  flexible: false,
  message: "",
};

export function FlightRequestForm({ initialTo = "", initialFrom = "" }: { initialTo?: string; initialFrom?: string }) {
  const [form, setForm] = useState({ ...empty, destination: initialTo, origin: initialFrom });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");

  const set = (key: keyof typeof form) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const value = e.target instanceof HTMLInputElement && e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((er) => ({ ...er, [key]: "" }));
  };

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError("");
    const next: Record<string, string> = {};
    if (form.name.trim().length < 2) next.name = "Enter your full name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())) next.email = "Enter a valid email address.";
    if (!/^\+?\d{10,15}$/.test(form.phone.replace(/[\s\-()]/g, ""))) next.phone = "Enter a valid phone number.";
    if (form.origin.trim().length < 2) next.origin = "Where are you flying from?";
    if (form.destination.trim().length < 2) next.destination = "Where are you flying to?";
    if (!form.departDate) next.departDate = "Choose a departure date.";
    if (form.tripType === "Return" && form.returnDate && form.returnDate < form.departDate) next.returnDate = "Return must be after departure.";
    const travellers = Number(form.travelers);
    if (!Number.isInteger(travellers) || travellers < 1 || travellers > 9) next.travelers = "Between 1 and 9 travellers online.";
    setErrors(next);
    if (Object.keys(next).length) return;

    setStatus("sending");
    try {
      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "flight",
          name: form.name,
          email: form.email,
          phone: form.phone,
          destination: form.destination,
          departureCity: form.origin,
          travelDates: `${form.departDate}${form.returnDate ? ` → ${form.returnDate}` : ""}${form.flexible ? " (flexible)" : ""}`,
          travelers: travellers,
          tripType: `${form.tripType} · ${form.cabin}`,
          message: form.message,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) {
        if (json.errors) setErrors(json.errors);
        else setFormError(json.error ?? "We couldn't send your flight request.");
        setStatus("idle");
        return;
      }
      setStatus("sent");
    } catch {
      setFormError("Network error — please try again or message us on WhatsApp.");
      setStatus("idle");
    }
  }

  if (status === "sent") {
    return (
      <div className="rounded-3xl border border-black/5 bg-white p-8 text-center shadow-[0_30px_60px_-35px_rgba(7,22,41,0.35)]">
        <CheckCircle2 className="mx-auto h-12 w-12 text-gold" aria-hidden="true" />
        <h2 className="mt-4 font-serif text-3xl">Flight request received</h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-neutral-600">
          Thank you, {form.name.split(" ")[0]}. No fare has been charged or reserved — a PRITIVO planner will reply with
          live options and a written quote for {form.origin} → {form.destination}.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <a
            href={whatsappLink(`Hello PRITIVO! I just sent a flight request: ${form.origin} to ${form.destination} (${form.departDate}). Name: ${form.name}.`)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-3 font-semibold text-white"
          >
            <WhatsAppIcon /> Continue on WhatsApp
          </a>
          <button type="button" onClick={() => { setForm({ ...empty, destination: initialTo, origin: initialFrom }); setStatus("idle"); }} className="rounded-full border border-neutral-300 px-6 py-3 font-semibold">
            Send another request
          </button>
        </div>
      </div>
    );
  }

  const label = "mb-1.5 block text-sm font-medium text-neutral-600";
  const input = (invalid?: string) =>
    `w-full rounded-xl border bg-white px-3.5 py-3 text-sm text-ink focus:outline-none focus:ring-4 ${invalid ? "border-red-400 focus:ring-red-100" : "border-neutral-200 focus:border-gold focus:ring-gold/15"}`;

  return (
    <form onSubmit={onSubmit} noValidate className="rounded-3xl border border-black/5 bg-white p-6 shadow-[0_30px_60px_-35px_rgba(7,22,41,0.35)] sm:p-8">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-ink text-gold">
          <Plane className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <h2 className="font-serif text-2xl">Request flight options</h2>
          <p className="text-xs text-neutral-500">Written quote by email or WhatsApp — no account needed.</p>
        </div>
      </div>

      {formError && (
        <div role="alert" className="mt-4 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" /> {formError}
        </div>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <span className={label}>Trip type</span>
          <div className="flex flex-wrap gap-2">
            {TRIP_TYPES.map((t) => (
              <button
                key={t}
                type="button"
                aria-pressed={form.tripType === t}
                onClick={() => setForm((f) => ({ ...f, tripType: t }))}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition ${form.tripType === t ? "border-ink bg-ink text-white" : "border-neutral-200 hover:border-gold"}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label htmlFor="fl-from" className={label}>Flying from</label>
          <input id="fl-from" value={form.origin} onChange={set("origin")} className={input(errors.origin)} placeholder="e.g. Belagavi (IXG)" autoComplete="off" />
          {errors.origin && <p role="alert" className="mt-1 text-xs font-medium text-red-600">{errors.origin}</p>}
        </div>
        <div>
          <label htmlFor="fl-to" className={label}>Flying to</label>
          <input id="fl-to" value={form.destination} onChange={set("destination")} className={input(errors.destination)} placeholder="e.g. Dubai (DXB)" autoComplete="off" />
          {errors.destination && <p role="alert" className="mt-1 text-xs font-medium text-red-600">{errors.destination}</p>}
        </div>
        <div>
          <label htmlFor="fl-depart" className={label}>Departure date</label>
          <input id="fl-depart" type="date" value={form.departDate} onChange={set("departDate")} className={input(errors.departDate)} />
          {errors.departDate && <p role="alert" className="mt-1 text-xs font-medium text-red-600">{errors.departDate}</p>}
        </div>
        <div>
          <label htmlFor="fl-return" className={label}>Return date {form.tripType !== "Return" && <span className="font-normal text-neutral-500">(optional)</span>}</label>
          <input id="fl-return" type="date" min={form.departDate || undefined} value={form.returnDate} onChange={set("returnDate")} disabled={form.tripType === "One way"} className={`${input(errors.returnDate)} disabled:bg-neutral-50 disabled:text-neutral-500`} />
          {errors.returnDate && <p role="alert" className="mt-1 text-xs font-medium text-red-600">{errors.returnDate}</p>}
        </div>
        <div>
          <label htmlFor="fl-travellers" className={label}>Travellers</label>
          <input id="fl-travellers" type="number" min={1} max={9} value={form.travelers} onChange={set("travelers")} className={input(errors.travelers)} />
          {errors.travelers && <p role="alert" className="mt-1 text-xs font-medium text-red-600">{errors.travelers}</p>}
        </div>
        <div>
          <label htmlFor="fl-cabin" className={label}>Cabin</label>
          <select id="fl-cabin" value={form.cabin} onChange={set("cabin")} className={input()}>
            {CABINS.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <label className="flex items-center gap-2 text-sm text-neutral-600 sm:col-span-2">
          <input type="checkbox" checked={form.flexible} onChange={set("flexible")} className="h-4 w-4 accent-[#c6a866]" />
          My dates are flexible (±3 days)
        </label>
        <div>
          <label htmlFor="fl-name" className={label}>Full name</label>
          <input id="fl-name" value={form.name} onChange={set("name")} className={input(errors.name)} autoComplete="name" />
          {errors.name && <p role="alert" className="mt-1 text-xs font-medium text-red-600">{errors.name}</p>}
        </div>
        <div>
          <label htmlFor="fl-phone" className={label}>Phone / WhatsApp</label>
          <input id="fl-phone" value={form.phone} onChange={set("phone")} className={input(errors.phone)} placeholder="+91 98765 43210" autoComplete="tel" />
          {errors.phone && <p role="alert" className="mt-1 text-xs font-medium text-red-600">{errors.phone}</p>}
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="fl-email" className={label}>Email</label>
          <input id="fl-email" type="email" value={form.email} onChange={set("email")} className={input(errors.email)} autoComplete="email" />
          {errors.email && <p role="alert" className="mt-1 text-xs font-medium text-red-600">{errors.email}</p>}
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="fl-message" className={label}>Anything else? <span className="font-normal text-neutral-500">(optional)</span></label>
          <textarea id="fl-message" rows={3} maxLength={800} value={form.message} onChange={set("message")} className={input()} placeholder="Preferred airline, baggage, student fares, onward connections…" />
        </div>
      </div>

      <button
        type="submit"
        disabled={status === "sending"}
        className="bg-gold-gradient mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-4 font-semibold text-ink disabled:cursor-wait disabled:opacity-70 sm:w-auto"
      >
        {status === "sending" ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Send className="h-4 w-4" aria-hidden="true" />}
        {status === "sending" ? "Sending request…" : "Request flight options"}
      </button>
      <p className="mt-3 text-xs leading-5 text-neutral-500">
        This sends a request, not a booking. We never display flight prices unless they come from an authorised provider,
        and no fare is held until you confirm a written quote.
      </p>
    </form>
  );
}
