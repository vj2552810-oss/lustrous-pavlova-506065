"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { AlertCircle, CheckCircle2, Loader2, Send } from "lucide-react";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { whatsappLink } from "@/lib/site";

const empty = { name: "", email: "", phone: "", destination: "", travelDates: "", travelers: "2", message: "" };

export function HotelEnquiryForm({ defaultDestination = "" }: { defaultDestination?: string }) {
  const [form, setForm] = useState({ ...empty, destination: defaultDestination });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [formError, setFormError] = useState("");

  const set = (key: keyof typeof form) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    if (errors[key]) setErrors((er) => ({ ...er, [key]: "" }));
  };

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError("");
    const next: Record<string, string> = {};
    if (form.name.trim().length < 2) next.name = "Enter your full name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())) next.email = "Enter a valid email address.";
    if (!/^\+?\d{10,15}$/.test(form.phone.replace(/[\s\-()]/g, ""))) next.phone = "Enter a valid phone number.";
    if (form.destination.trim().length < 2) next.destination = "Which city or hotel?";
    if (form.message.trim().length < 5) next.message = "Tell us what you need.";
    setErrors(next);
    if (Object.keys(next).length) return;

    setStatus("sending");
    try {
      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "hotel", ...form, travelers: Number(form.travelers) }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        if (json.errors) setErrors(json.errors);
        else setFormError(json.error ?? "We couldn't send your enquiry.");
        setStatus("error");
        return;
      }
      setStatus("sent");
    } catch {
      setFormError("Network error — please try again or message us on WhatsApp.");
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="rounded-3xl border border-black/5 bg-white p-8 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-gold" aria-hidden="true" />
        <h3 className="mt-4 font-serif text-3xl">Enquiry received</h3>
        <p className="mt-3 text-sm leading-6 text-neutral-600">
          Thank you, {form.name.split(" ")[0]}. A PRITIVO planner will reply with live rates and options. For anything
          urgent, message us on WhatsApp.
        </p>
        <a
          href={whatsappLink(`Hello PRITIVO! I just sent a hotel enquiry for ${form.destination}. Name: ${form.name}.`)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-6 py-3 font-semibold text-white"
        >
          <WhatsAppIcon /> Continue on WhatsApp
        </a>
        <button type="button" onClick={() => { setForm({ ...empty, destination: defaultDestination }); setStatus("idle"); }} className="mt-4 block w-full text-sm font-medium text-gold-dark hover:underline">
          Send another enquiry
        </button>
      </div>
    );
  }

  const input = (invalid?: string) =>
    `w-full rounded-xl border bg-white px-3.5 py-3 text-sm focus:outline-none focus:ring-4 ${invalid ? "border-red-400 focus:ring-red-100" : "border-neutral-200 focus:border-gold focus:ring-gold/15"}`;

  return (
    <form onSubmit={onSubmit} noValidate className="rounded-3xl border border-black/5 bg-white p-6 sm:p-8">
      <h2 className="font-serif text-2xl">Hotel booking enquiry</h2>
      <p className="mt-1 text-sm text-neutral-500">Want a specific hotel, group rate or longer stay? Ask a planner — no account needed.</p>
      {formError && (
        <div role="alert" className="mt-4 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" /> {formError}
        </div>
      )}
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="he-name" className="mb-1.5 block text-sm font-medium text-neutral-600">Full name</label>
          <input id="he-name" value={form.name} onChange={set("name")} className={input(errors.name)} autoComplete="name" />
          {errors.name && <p role="alert" className="mt-1 text-xs font-medium text-red-600">{errors.name}</p>}
        </div>
        <div>
          <label htmlFor="he-phone" className="mb-1.5 block text-sm font-medium text-neutral-600">Phone / WhatsApp</label>
          <input id="he-phone" value={form.phone} onChange={set("phone")} className={input(errors.phone)} autoComplete="tel" placeholder="+91 98765 43210" />
          {errors.phone && <p role="alert" className="mt-1 text-xs font-medium text-red-600">{errors.phone}</p>}
        </div>
        <div>
          <label htmlFor="he-email" className="mb-1.5 block text-sm font-medium text-neutral-600">Email</label>
          <input id="he-email" type="email" value={form.email} onChange={set("email")} className={input(errors.email)} autoComplete="email" />
          {errors.email && <p role="alert" className="mt-1 text-xs font-medium text-red-600">{errors.email}</p>}
        </div>
        <div>
          <label htmlFor="he-destination" className="mb-1.5 block text-sm font-medium text-neutral-600">City / hotel</label>
          <input id="he-destination" value={form.destination} onChange={set("destination")} className={input(errors.destination)} placeholder="e.g. Goa, Candolim" />
          {errors.destination && <p role="alert" className="mt-1 text-xs font-medium text-red-600">{errors.destination}</p>}
        </div>
        <div>
          <label htmlFor="he-dates" className="mb-1.5 block text-sm font-medium text-neutral-600">Dates</label>
          <input id="he-dates" value={form.travelDates} onChange={set("travelDates")} className={input()} placeholder="e.g. 12–16 Dec" />
        </div>
        <div>
          <label htmlFor="he-guests" className="mb-1.5 block text-sm font-medium text-neutral-600">Guests</label>
          <input id="he-guests" type="number" min={1} max={16} value={form.travelers} onChange={set("travelers")} className={input()} />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="he-message" className="mb-1.5 block text-sm font-medium text-neutral-600">What do you need?</label>
          <textarea id="he-message" rows={3} value={form.message} onChange={set("message")} className={input(errors.message)} placeholder="Room preference, budget, special occasion…" />
          {errors.message && <p role="alert" className="mt-1 text-xs font-medium text-red-600">{errors.message}</p>}
        </div>
      </div>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <button type="submit" disabled={status === "sending"} className="bg-gold-gradient inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 font-semibold text-ink disabled:opacity-70">
          {status === "sending" ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Send className="h-4 w-4" aria-hidden="true" />}
          Send enquiry
        </button>
        <a href={whatsappLink("Hello PRITIVO! I'd like help with a hotel booking.")} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 rounded-full border border-neutral-300 px-6 py-3.5 font-semibold hover:border-[#25D366] hover:text-[#1da851]">
          <WhatsAppIcon className="h-4 w-4" /> WhatsApp us
        </a>
      </div>
    </form>
  );
}
