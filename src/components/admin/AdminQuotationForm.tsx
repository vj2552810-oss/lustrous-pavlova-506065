"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, FileText, Loader2 } from "lucide-react";
import type { EnquiryRecord } from "@/lib/tours/service";

const input = "w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm focus:border-gold focus:outline-none focus:ring-4 focus:ring-gold/15";
const label = "mb-1 block text-xs font-semibold uppercase tracking-wider text-neutral-500";

export function AdminQuotationForm({ enquiries }: { enquiries: EnquiryRecord[] }) {
  const router = useRouter();
  const [form, setForm] = useState({
    enquiryId: "",
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    destination: "",
    travelDates: "",
    travelers: "2",
    hotelDetails: "",
    transportDetails: "",
    inclusions: "Accommodation with daily breakfast\nPrivate transfers and sightseeing\nAll applicable taxes on listed services",
    exclusions: "Airfare unless stated\nVisa fees and travel insurance\nPersonal expenses and tips",
    subtotalINR: "",
    taxesINR: "",
    paymentTerms: "30% advance to confirm planning; balance due 15 days before departure.",
    cancellationPolicy: "Cancellation charges depend on supplier policies and are confirmed in writing before payment.",
    validDays: "7",
    notes: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState(false);

  function pickEnquiry(id: string) {
    const e = enquiries.find((x) => String(x.id) === id);
    if (!e) {
      setForm((f) => ({ ...f, enquiryId: id }));
      return;
    }
    setForm((f) => ({
      ...f,
      enquiryId: id,
      customerName: e.name,
      customerEmail: e.email,
      customerPhone: e.phone,
      destination: e.destination || e.subject || f.destination,
      travelDates: e.travelDates || f.travelDates,
      travelers: String(e.travelers ?? f.travelers),
    }));
    setErrors({});
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    setBusy(true);
    try {
      const res = await fetch("/api/admin/quotations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          enquiryId: form.enquiryId === "" ? null : Number(form.enquiryId),
          travelers: Number(form.travelers),
          validDays: Number(form.validDays),
          inclusions: form.inclusions.split("\n").map((x) => x.trim()).filter(Boolean),
          exclusions: form.exclusions.split("\n").map((x) => x.trim()).filter(Boolean),
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) {
        if (json.errors) setErrors(json.errors);
        else setFormError(json.error ?? "Could not generate the quotation.");
        setBusy(false);
        return;
      }
      router.push(`/admin/quotations/${json.code}`);
      router.refresh();
    } catch {
      setFormError("Network error — please try again.");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      {formError && (
        <div role="alert" className="flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" /> {formError}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="q-enquiry" className={label}>Link to an enquiry (optional)</label>
          <select id="q-enquiry" value={form.enquiryId} onChange={(ev) => pickEnquiry(ev.target.value)} className={input}>
            <option value="">Standalone quotation</option>
            {enquiries.slice(0, 60).map((e) => (
              <option key={e.id} value={e.id}>{e.code ?? `#${e.id}`} — {e.name} · {e.destination || e.subject || e.kind}</option>
            ))}
          </select>
          <p className="mt-1 text-xs text-neutral-500">Linking an enquiry moves it to “Quotation sent” automatically.</p>
        </div>
        <div>
          <label htmlFor="q-name" className={label}>Customer name</label>
          <input id="q-name" value={form.customerName} onChange={(ev) => setForm({ ...form, customerName: ev.target.value })} className={input} />
          {errors.customerName && <p className="mt-1 text-xs text-red-600">{errors.customerName}</p>}
        </div>
        <div>
          <label htmlFor="q-phone" className={label}>Customer phone</label>
          <input id="q-phone" value={form.customerPhone} onChange={(ev) => setForm({ ...form, customerPhone: ev.target.value })} className={input} />
          {errors.customerPhone && <p className="mt-1 text-xs text-red-600">{errors.customerPhone}</p>}
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="q-email" className={label}>Customer email</label>
          <input id="q-email" type="email" value={form.customerEmail} onChange={(ev) => setForm({ ...form, customerEmail: ev.target.value })} className={input} />
          {errors.customerEmail && <p className="mt-1 text-xs text-red-600">{errors.customerEmail}</p>}
        </div>
        <div>
          <label htmlFor="q-destination" className={label}>Destination</label>
          <input id="q-destination" value={form.destination} onChange={(ev) => setForm({ ...form, destination: ev.target.value })} className={input} />
          {errors.destination && <p className="mt-1 text-xs text-red-600">{errors.destination}</p>}
        </div>
        <div>
          <label htmlFor="q-dates" className={label}>Travel dates</label>
          <input id="q-dates" value={form.travelDates} onChange={(ev) => setForm({ ...form, travelDates: ev.target.value })} className={input} placeholder="12–18 Dec 2026" />
        </div>
        <div>
          <label htmlFor="q-travellers" className={label}>Travellers</label>
          <input id="q-travellers" type="number" min={1} max={200} value={form.travelers} onChange={(ev) => setForm({ ...form, travelers: ev.target.value })} className={input} />
          {errors.travelers && <p className="mt-1 text-xs text-red-600">{errors.travelers}</p>}
        </div>
        <div>
          <label htmlFor="q-valid" className={label}>Quote valid for (days)</label>
          <input id="q-valid" type="number" min={1} max={90} value={form.validDays} onChange={(ev) => setForm({ ...form, validDays: ev.target.value })} className={input} />
          {errors.validDays && <p className="mt-1 text-xs text-red-600">{errors.validDays}</p>}
        </div>
        <div>
          <label htmlFor="q-hotel" className={label}>Hotel details</label>
          <textarea id="q-hotel" rows={2} value={form.hotelDetails} onChange={(ev) => setForm({ ...form, hotelDetails: ev.target.value })} className={input} placeholder="Hotel name, room type, meal plan" />
        </div>
        <div>
          <label htmlFor="q-transport" className={label}>Transport details</label>
          <textarea id="q-transport" rows={2} value={form.transportDetails} onChange={(ev) => setForm({ ...form, transportDetails: ev.target.value })} className={input} placeholder="Private SUV with driver, airport transfers" />
        </div>
        <div>
          <label htmlFor="q-inclusions" className={label}>Inclusions (one per line)</label>
          <textarea id="q-inclusions" rows={4} value={form.inclusions} onChange={(ev) => setForm({ ...form, inclusions: ev.target.value })} className={input} />
        </div>
        <div>
          <label htmlFor="q-exclusions" className={label}>Exclusions (one per line)</label>
          <textarea id="q-exclusions" rows={4} value={form.exclusions} onChange={(ev) => setForm({ ...form, exclusions: ev.target.value })} className={input} />
        </div>
        <div>
          <label htmlFor="q-subtotal" className={label}>Subtotal (₹)</label>
          <input id="q-subtotal" type="number" min={1} step="100" value={form.subtotalINR} onChange={(ev) => setForm({ ...form, subtotalINR: ev.target.value })} className={input} />
          {errors.subtotalMinor && <p className="mt-1 text-xs text-red-600">{errors.subtotalMinor}</p>}
        </div>
        <div>
          <label htmlFor="q-taxes" className={label}>Taxes (₹)</label>
          <input id="q-taxes" type="number" min={0} step="100" value={form.taxesINR} onChange={(ev) => setForm({ ...form, taxesINR: ev.target.value })} className={input} />
          {errors.taxesMinor && <p className="mt-1 text-xs text-red-600">{errors.taxesMinor}</p>}
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="q-payment" className={label}>Payment terms</label>
          <textarea id="q-payment" rows={2} value={form.paymentTerms} onChange={(ev) => setForm({ ...form, paymentTerms: ev.target.value })} className={input} />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="q-cancellation" className={label}>Cancellation policy</label>
          <textarea id="q-cancellation" rows={2} value={form.cancellationPolicy} onChange={(ev) => setForm({ ...form, cancellationPolicy: ev.target.value })} className={input} />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="q-notes" className={label}>Notes</label>
          <textarea id="q-notes" rows={2} value={form.notes} onChange={(ev) => setForm({ ...form, notes: ev.target.value })} className={input} />
        </div>
      </div>

      <button type="submit" disabled={busy} className="bg-gold-gradient inline-flex items-center gap-2 rounded-full px-6 py-3.5 font-semibold text-ink disabled:opacity-70">
        {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <FileText className="h-4 w-4" aria-hidden="true" />}
        {busy ? "Generating…" : "Generate quotation"}
      </button>
      <p className="text-xs leading-5 text-neutral-500">
        The quotation opens in a print-ready view — use your browser&apos;s “Save as PDF”. Amounts are stored server-side and
        this page is staff-only.
      </p>
    </form>
  );
}
