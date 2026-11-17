"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { AlertCircle, CheckCircle2, Loader2, MessageSquareQuote, Send } from "lucide-react";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { BUDGET_BANDS, STYLE_LABELS } from "@/lib/tours/constants";
import { whatsappLink } from "@/lib/site";

export function TourEnquiryForm({ tourName, tourSlug, compact = false }: { tourName: string; tourSlug: string; compact?: boolean }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    startDate: "",
    endDate: "",
    travelers: "2",
    budget: "",
    style: "",
    message: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");

  const set = (k: keyof typeof form) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    if (errors[k]) setErrors((er) => ({ ...er, [k]: "" }));
  };

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError("");
    const next: Record<string, string> = {};
    if (form.name.trim().length < 2) next.name = "Enter your full name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())) next.email = "Enter a valid email address.";
    if (!/^\+?\d{10,15}$/.test(form.phone.replace(/[\s\-()]/g, ""))) next.phone = "Enter a valid phone number.";
    if (!form.startDate) next.startDate = "Choose a preferred travel date.";
    const travellers = Number(form.travelers);
    if (!Number.isInteger(travellers) || travellers < 1 || travellers > 40) next.travelers = "Enter between 1 and 40 travellers.";
    if (form.endDate && form.startDate && form.endDate < form.startDate) next.endDate = "Return date must be after departure.";
    setErrors(next);
    if (Object.keys(next).length) {
      document.getElementById(`te-${Object.keys(next)[0]}`)?.focus();
      return;
    }

    setStatus("sending");
    try {
      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "tour",
          tourSlug,
          name: form.name,
          email: form.email,
          phone: form.phone,
          destination: tourName,
          travelDates: `${form.startDate}${form.endDate ? ` → ${form.endDate}` : ""}`,
          travelers: travellers,
          budget: form.budget,
          tripType: form.style,
          message: form.message,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) {
        if (json.errors) setErrors(json.errors);
        else setFormError(json.error ?? "We couldn't send your request.");
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
      <div className="rounded-3xl border border-black/5 bg-white p-7 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-gold" aria-hidden="true" />
        <h3 className="mt-4 font-serif text-2xl">Quotation request received</h3>
        <p className="mt-2 text-sm leading-6 text-neutral-600">
          Thank you, {form.name.split(" ")[0]}. A PRITIVO planner will reply with a tailored itinerary and written
          quote for {tourName}. No payment has been taken and nothing is booked yet.
        </p>
        <a
          href={whatsappLink(`Hello PRITIVO! I requested a quote for ${tourName}. Name: ${form.name}.`)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-3 text-sm font-semibold text-white"
        >
          <WhatsAppIcon className="h-4 w-4" /> Continue on WhatsApp
        </a>
        <button type="button" onClick={() => setStatus("idle")} className="mt-4 block w-full text-xs font-medium text-gold-dark hover:underline">
          Send another request
        </button>
      </div>
    );
  }

  const input = (invalid?: string) =>
    `w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-ink focus:outline-none focus:ring-4 ${
      invalid ? "border-red-400 focus:ring-red-100" : "border-neutral-200 focus:border-gold focus:ring-gold/15"
    }`;
  const label = "mb-1 block text-xs font-semibold uppercase tracking-wider text-neutral-500";

  return (
    <form onSubmit={onSubmit} noValidate className={compact ? "" : "rounded-3xl border border-black/5 bg-white p-6 sm:p-7"}>
      <div className="flex items-center gap-2">
        <MessageSquareQuote className="h-5 w-5 text-gold-dark" aria-hidden="true" />
        <h2 className="font-serif text-2xl">Request a quote</h2>
      </div>
      <p className="mt-1 text-xs text-neutral-500">No account needed. Written quote by WhatsApp or email.</p>

      {formError && (
        <div role="alert" className="mt-3 flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" /> {formError}
        </div>
      )}

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="te-name" className={label}>Full name</label>
          <input id="te-name" value={form.name} onChange={set("name")} className={input(errors.name)} autoComplete="name" />
          {errors.name && <p role="alert" className="mt-1 text-xs font-medium text-red-600">{errors.name}</p>}
        </div>
        <div>
          <label htmlFor="te-email" className={label}>Email</label>
          <input id="te-email" type="email" value={form.email} onChange={set("email")} className={input(errors.email)} autoComplete="email" />
          {errors.email && <p role="alert" className="mt-1 text-xs font-medium text-red-600">{errors.email}</p>}
        </div>
        <div>
          <label htmlFor="te-phone" className={label}>Phone / WhatsApp</label>
          <input id="te-phone" value={form.phone} onChange={set("phone")} className={input(errors.phone)} placeholder="+91 98765 43210" autoComplete="tel" />
          {errors.phone && <p role="alert" className="mt-1 text-xs font-medium text-red-600">{errors.phone}</p>}
        </div>
        <div>
          <label htmlFor="te-startDate" className={label}>Preferred start</label>
          <input id="te-startDate" type="date" value={form.startDate} onChange={set("startDate")} className={input(errors.startDate)} />
          {errors.startDate && <p role="alert" className="mt-1 text-xs font-medium text-red-600">{errors.startDate}</p>}
        </div>
        <div>
          <label htmlFor="te-endDate" className={label}>Return <span className="font-normal normal-case text-neutral-500">(optional)</span></label>
          <input id="te-endDate" type="date" min={form.startDate || undefined} value={form.endDate} onChange={set("endDate")} className={input(errors.endDate)} />
          {errors.endDate && <p role="alert" className="mt-1 text-xs font-medium text-red-600">{errors.endDate}</p>}
        </div>
        <div>
          <label htmlFor="te-travelers" className={label}>Travellers</label>
          <input id="te-travelers" type="number" min={1} max={40} value={form.travelers} onChange={set("travelers")} className={input(errors.travelers)} />
          {errors.travelers && <p role="alert" className="mt-1 text-xs font-medium text-red-600">{errors.travelers}</p>}
        </div>
        <div>
          <label htmlFor="te-budget" className={label}>Budget</label>
          <select id="te-budget" value={form.budget} onChange={set("budget")} className={input()}>
            <option value="">Not sure yet</option>
            {BUDGET_BANDS.map((b) => <option key={b.key} value={b.label}>{b.label}</option>)}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="te-style" className={label}>Travel style</label>
          <select id="te-style" value={form.style} onChange={set("style")} className={input()}>
            <option value="">Select a style</option>
            {Object.entries(STYLE_LABELS).map(([key, label]) => <option key={key} value={label}>{label}</option>)}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="te-message" className={label}>Preferences <span className="font-normal normal-case text-neutral-500">(optional)</span></label>
          <textarea id="te-message" rows={3} maxLength={1000} value={form.message} onChange={set("message")} className={input()} placeholder="Hotel category, pace, celebrations, must-see places…" />
        </div>
      </div>

      <button
        type="submit"
        disabled={status === "sending"}
        className="bg-gold-gradient mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3.5 text-sm font-semibold text-ink disabled:opacity-70"
      >
        {status === "sending" ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Send className="h-4 w-4" aria-hidden="true" />}
        {status === "sending" ? "Sending…" : "Send quotation request"}
      </button>
      <p className="mt-2 text-xs leading-4 text-neutral-500">
        This is a request, not a booking. Dates and prices are confirmed in writing before anything is reserved.
      </p>
    </form>
  );
}
