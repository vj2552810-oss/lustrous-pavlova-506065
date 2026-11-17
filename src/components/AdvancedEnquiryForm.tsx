"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { AlertCircle, CheckCircle2, ChevronDown, Copy, Loader2, Mail, Send } from "lucide-react";
import { Field, inputCls } from "./FormField";
import { WhatsAppIcon } from "./WhatsAppIcon";
import { PACKAGES } from "@/lib/packages";
import { mailtoLink, whatsappLink } from "@/lib/site";
import {
  BUDGET_RANGES,
  HOTEL_CATEGORIES,
  TRIP_TYPES,
  validateAdvancedTrip,
  validateTrip,
  type FieldErrors,
  type TripEnquiry,
} from "@/lib/validation";

type Status = "idle" | "sending" | "sent" | "error";

type FormState = TripEnquiry & { adults: string; children: string; hotelCategory: string };

interface Props {
  /** Pre-fills the destination (tour / destination / service pages). */
  defaultDestination?: string;
  defaultService?: string;
  heading?: string;
  subheading?: string;
  /**
   * "compact" shows only the nine fields a quote actually needs and folds the
   * rest into an optional disclosure — used where the form sits beside other
   * content (home page). "full" is the dedicated planning form.
   */
  variant?: "full" | "compact";
}

const emptyState = (destination: string): FormState => ({
  name: "",
  email: "",
  phone: "",
  destination,
  departureCity: "Belagavi",
  startDate: "",
  endDate: "",
  flexibleDates: false,
  travelers: "2",
  budget: "",
  tripType: "",
  requirements: "",
  adults: "",
  children: "",
  hotelCategory: "",
});

export function AdvancedEnquiryForm({
  defaultDestination = "",
  defaultService = "",
  heading,
  subheading,
  variant = "full",
}: Props) {
  const compact = variant === "compact";
  const [data, setData] = useState<FormState>(emptyState(defaultDestination));
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [code, setCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [honeypot, setHoneypot] = useState("");

  const today = new Date().toISOString().slice(0, 10);

  const set =
    (key: keyof FormState) =>
    (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const value = e.target instanceof HTMLInputElement && e.target.type === "checkbox" ? e.target.checked : e.target.value;
      setData((d) => ({ ...d, [key]: value }));
      if (errors[key]) setErrors((er) => ({ ...er, [key]: "" }));
    };

  const aria = (key: string) => ({
    "aria-invalid": errors[key] ? true : undefined,
    "aria-describedby": errors[key] ? `${key}-error` : undefined,
  });

  // The guest only triggers the stricter contract when they actually use the
  // optional fields, so a quick enquiry stays quick.
  const usedAdvanced = !compact || Boolean(data.hotelCategory || data.adults || (data.children && data.children !== "0"));

  const summary = `Enquiry for ${data.destination || "a trip"}${data.startDate ? ` from ${data.startDate}` : ""}, ${data.travelers} traveller(s)${data.hotelCategory ? `, ${data.hotelCategory}` : ""}.`;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError("");
    const errs = usedAdvanced ? validateAdvancedTrip(data, { ...data } as Record<string, unknown>) : validateTrip(data);
    setErrors(errs);
    if (Object.keys(errs).length) {
      setStatus("error");
      document.getElementById(Object.keys(errs)[0])?.focus();
      return;
    }
    setStatus("sending");
    try {
      const payload: Record<string, unknown> = {
        kind: "trip",
        name: data.name,
        email: data.email,
        phone: data.phone,
        destination: data.destination,
        departureCity: data.departureCity,
        startDate: data.startDate,
        endDate: data.endDate,
        flexibleDates: data.flexibleDates,
        travelers: data.travelers,
        budget: data.budget,
        tripType: data.tripType,
        requirements: data.requirements,
        website: honeypot,
      };
      if (usedAdvanced) {
        payload.adults = data.adults;
        payload.children = data.children;
        payload.hotelCategory = data.hotelCategory;
      }
      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) {
        if (json.errors) setErrors(json.errors);
        else setFormError(json.error ?? "We couldn't send your enquiry.");
        setStatus("error");
        return;
      }
      setCode(json.code ?? null);
      setStatus("sent");
    } catch {
      setFormError("Network error — please check your connection, or message us on WhatsApp.");
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="rounded-3xl border border-black/5 bg-white p-8 text-center shadow-[0_30px_60px_-35px_rgba(7,22,41,0.35)] sm:p-10" role="status">
        <CheckCircle2 className="mx-auto h-14 w-14 text-gold" aria-hidden="true" />
        <h2 className="mt-5 font-serif text-3xl sm:text-4xl">Enquiry submitted</h2>
        <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-neutral-600">
          Thank you, {data.name.split(" ")[0]}. Your request has been saved and our team has been notified. A PRITIVO
          planner will reply with a tailored itinerary and a written quotation — nothing is booked or charged yet.
        </p>
        {code && (
          <div className="mx-auto mt-6 max-w-sm rounded-2xl border border-gold/40 bg-champagne/30 p-4">
            <p className="text-xs uppercase tracking-wider text-neutral-500">Your enquiry ID</p>
            <div className="mt-1 flex items-center justify-center gap-2">
              <p className="font-mono text-xl font-semibold tracking-wider text-ink">{code}</p>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard?.writeText(code).then(() => {
                    setCopied(true);
                    window.setTimeout(() => setCopied(false), 2000);
                  });
                }}
                className="rounded-full border border-neutral-300 p-1.5 text-neutral-600 hover:border-gold"
                aria-label="Copy enquiry ID"
              >
                <Copy className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
            <p className="mt-1 text-xs text-neutral-500">{copied ? "Copied" : "Quote this ID when you message us."}</p>
          </div>
        )}
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <a
            href={whatsappLink(`Hello PRITIVO! ${summary}${code ? ` My enquiry ID is ${code}.` : ""}`)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-3.5 font-semibold text-white"
          >
            <WhatsAppIcon /> Continue on WhatsApp
          </a>
          <a
            href={mailtoLink(`Enquiry ${code ?? ""} — ${data.destination}`, `${summary}\n\nName: ${data.name}\nEnquiry ID: ${code ?? "n/a"}`)}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-neutral-300 px-6 py-3.5 font-semibold hover:border-ink"
          >
            <Mail className="h-4 w-4" aria-hidden="true" /> Email us instead
          </a>
        </div>
        <button
          type="button"
          onClick={() => {
            setStatus("idle");
            setCode(null);
            setData(emptyState(defaultDestination));
          }}
          className="mt-6 text-sm font-medium text-gold-dark underline-offset-4 hover:underline"
        >
          Send another enquiry
        </button>
      </div>
    );
  }

  /* --------------------------------- fields -------------------------------- */

  const dateGroup = (
    <>
      <Field id="startDate" label="Departure date" required error={errors.startDate}>
        <input id="startDate" type="date" min={today} value={data.startDate} onChange={set("startDate")} className={inputCls(!!errors.startDate)} {...aria("startDate")} />
      </Field>
      <Field id="endDate" label="Return date" error={errors.endDate} hint="Optional">
        <input id="endDate" type="date" min={data.startDate || today} value={data.endDate} onChange={set("endDate")} className={inputCls(!!errors.endDate)} {...aria("endDate")} />
      </Field>
      {/* Kept inside the date group so it can't be misread as belonging to the
          traveller fields below it. */}
      <div className="-mt-1 rounded-2xl border border-neutral-100 bg-ivory/60 px-4 py-3 sm:col-span-2">
        <label className="flex cursor-pointer flex-wrap items-center gap-x-3 gap-y-1 text-sm text-neutral-700">
          <input type="checkbox" checked={data.flexibleDates} onChange={set("flexibleDates")} className="h-4 w-4 accent-[#c6a866]" />
          My dates are flexible
          <span className="text-xs text-neutral-500">applies to the departure and return dates above</span>
        </label>
      </div>
    </>
  );

  const optionalFields = (
    <>
      <Field id="adults" label="Number of adults" required={!compact} error={errors.adults} hint={compact ? "Optional" : undefined}>
        <input id="adults" type="number" min={1} max={20} inputMode="numeric" value={data.adults} onChange={set("adults")} className={inputCls(!!errors.adults)} {...aria("adults")} />
      </Field>
      <Field id="children" label="Number of children" error={errors.children} hint="Under 12 · optional">
        <input id="children" type="number" min={0} max={20} inputMode="numeric" value={data.children} onChange={set("children")} className={inputCls(!!errors.children)} {...aria("children")} />
      </Field>
      <Field id="hotelCategory" label="Hotel category" required={!compact} error={errors.hotelCategory} hint={compact ? "Optional" : undefined} className="sm:col-span-2">
        <select id="hotelCategory" value={data.hotelCategory} onChange={set("hotelCategory")} className={inputCls(!!errors.hotelCategory)} {...aria("hotelCategory")}>
          <option value="">{compact ? "No preference — please advise" : "Select hotel category"}</option>
          {HOTEL_CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </Field>
      <Field id="requirements" label="Special requirements" error={errors.requirements} hint="Dietary needs, accessibility, celebrations…" className="sm:col-span-2">
        <textarea id="requirements" rows={3} maxLength={1000} value={data.requirements} onChange={set("requirements")} className={inputCls(!!errors.requirements)} placeholder="Anything we should know?" {...aria("requirements")} />
      </Field>
    </>
  );

  return (
    <form
      noValidate
      onSubmit={onSubmit}
      className="rounded-3xl border border-black/5 bg-white p-6 shadow-[0_30px_60px_-35px_rgba(7,22,41,0.35)] sm:p-10"
      aria-labelledby="enquiry-form-title"
    >
      <h2 id="enquiry-form-title" className="font-serif text-3xl sm:text-4xl">
        {heading ?? "Plan your trip"}
      </h2>
      <p className="mt-2 text-sm text-neutral-500">
        {subheading ?? "Fields marked * are required. Takes about 2 minutes — no account needed."}
      </p>

      {status === "error" && Object.values(errors).some(Boolean) && (
        <div role="alert" className="mt-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
          Please correct the highlighted fields and try again.
        </div>
      )}
      {formError && (
        <div role="alert" className="mt-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" /> {formError}
        </div>
      )}

      <div className="absolute -left-[9999px]" aria-hidden="true">
        <label htmlFor="enquiry-website">Website</label>
        <input id="enquiry-website" tabIndex={-1} autoComplete="off" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
      </div>

      <fieldset className="mt-8">
        <legend className="eyebrow text-gold-dark">Your details</legend>
        <div className="mt-4 grid gap-5 sm:grid-cols-2">
          <Field id="name" label="Full name" required error={errors.name} className="sm:col-span-2">
            <input id="name" autoComplete="name" value={data.name} onChange={set("name")} className={inputCls(!!errors.name)} placeholder="Your full name" {...aria("name")} />
          </Field>
          <Field id="phone" label="Mobile number" required error={errors.phone}>
            <input id="phone" type="tel" autoComplete="tel" value={data.phone} onChange={set("phone")} className={inputCls(!!errors.phone)} placeholder="+91 98765 43210" {...aria("phone")} />
          </Field>
          <Field id="email" label="Email address" required error={errors.email}>
            <input id="email" type="email" autoComplete="email" value={data.email} onChange={set("email")} className={inputCls(!!errors.email)} placeholder="you@example.com" {...aria("email")} />
          </Field>
        </div>
      </fieldset>

      <fieldset className="mt-10">
        <legend className="eyebrow text-gold-dark">Trip details</legend>
        <div className="mt-4 grid gap-5 sm:grid-cols-2">
          <Field id="departureCity" label="Starting location" required error={errors.departureCity}>
            <input id="departureCity" value={data.departureCity} onChange={set("departureCity")} className={inputCls(!!errors.departureCity)} placeholder="e.g. Belagavi" {...aria("departureCity")} />
          </Field>
          <Field id="destination" label="Destination" required error={errors.destination} hint="Pick a suggestion or type any place">
            <input id="destination" list="destination-list" value={data.destination} onChange={set("destination")} className={inputCls(!!errors.destination)} placeholder="e.g. Switzerland" {...aria("destination")} />
            <datalist id="destination-list">
              {PACKAGES.map((p) => (
                <option key={p.slug} value={p.name} />
              ))}
            </datalist>
          </Field>

          {compact ? (
            <Field id="startDate" label="Departure date" required error={errors.startDate}>
              <input id="startDate" type="date" min={today} value={data.startDate} onChange={set("startDate")} className={inputCls(!!errors.startDate)} {...aria("startDate")} />
            </Field>
          ) : (
            dateGroup
          )}

          <Field id="travelers" label="Number of travellers" required error={errors.travelers}>
            <input id="travelers" type="number" min={1} max={200} inputMode="numeric" value={data.travelers} onChange={set("travelers")} className={inputCls(!!errors.travelers)} {...aria("travelers")} />
          </Field>
          <Field id="budget" label="Travel budget" required error={errors.budget}>
            <select id="budget" value={data.budget} onChange={set("budget")} className={inputCls(!!errors.budget)} {...aria("budget")}>
              <option value="">Select budget</option>
              {BUDGET_RANGES.map((b) => (
                <option key={b}>{b}</option>
              ))}
            </select>
          </Field>
          <Field id="tripType" label="Travel type" required error={errors.tripType}>
            <select id="tripType" value={data.tripType} onChange={set("tripType")} className={inputCls(!!errors.tripType)} {...aria("tripType")}>
              <option value="">Select travel type</option>
              {TRIP_TYPES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </Field>

          {compact ? (
            <details className="rounded-2xl border border-neutral-200 bg-ivory/50 px-4 py-3 sm:col-span-2">
              <summary className="flex cursor-pointer items-center justify-between gap-3 text-sm font-semibold text-ink [&::-webkit-details-marker]:hidden">
                Add dates, children, hotel category or requests
                <span className="flex items-center gap-2 font-normal text-neutral-500">
                  optional <ChevronDown className="h-4 w-4" aria-hidden="true" />
                </span>
              </summary>
              <div className="mt-4 grid gap-5 sm:grid-cols-2">
                <Field id="endDate" label="Return date" error={errors.endDate} hint="Optional">
                  <input id="endDate" type="date" min={data.startDate || today} value={data.endDate} onChange={set("endDate")} className={inputCls(!!errors.endDate)} {...aria("endDate")} />
                </Field>
                <div className="flex items-end pb-1">
                  <label className="flex cursor-pointer items-center gap-3 text-sm text-neutral-700">
                    <input type="checkbox" checked={data.flexibleDates} onChange={set("flexibleDates")} className="h-4 w-4 accent-[#c6a866]" />
                    My dates are flexible
                  </label>
                </div>
                {optionalFields}
              </div>
            </details>
          ) : (
            optionalFields
          )}
        </div>
      </fieldset>

      {/* Closing row: the disclaimer sits above, the submit owns a full-width
          row of its own so the form ends with one clear action. */}
      <div className="mt-10 border-t border-neutral-100 pt-6">
        <p className="text-xs leading-5 text-neutral-500">
          {defaultService ? `This enquiry is about our ${defaultService} service. ` : ""}
          Submitting saves your enquiry and notifies our team. You&apos;ll receive an enquiry ID — nothing is booked or
          charged. See our <a href="/privacy-policy" className="underline">Privacy Policy</a>.
        </p>
        <button
          type="submit"
          disabled={status === "sending"}
          className="bg-gold-gradient mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full px-8 py-4 font-semibold text-ink shadow-lg shadow-gold/25 transition hover:brightness-110 disabled:cursor-wait disabled:opacity-70 sm:w-auto sm:min-w-[16rem]"
        >
          {status === "sending" ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> : <Send className="h-5 w-5" aria-hidden="true" />}
          {status === "sending" ? "Sending…" : "Submit enquiry"}
        </button>
      </div>
    </form>
  );
}
