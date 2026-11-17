"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, Mail, Phone, ReceiptText, ShieldAlert } from "lucide-react";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { whatsappLink, mailtoLink } from "@/lib/site";
import type { EnquiryRecord } from "@/lib/tours/service";
import type { SupplierRecord } from "@/lib/crm/types";
import { ENQUIRY_STATUS_FLOW, ENQUIRY_STATUS_LABELS, PAYMENT_STATUSES } from "@/lib/crm/constants";

export function AdminEnquiryPipeline({
  enquiries,
  suppliers,
}: {
  enquiries: EnquiryRecord[];
  suppliers: SupplierRecord[];
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState<number | null>(null);

  async function patch(id: number, body: Record<string, unknown>) {
    setBusy(id);
    setError("");
    try {
      const res = await fetch(`/api/admin/enquiries/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) {
        const fieldError = json.errors ? Object.values(json.errors).join(" ") : "";
        setError(fieldError || json.error || "Could not update that enquiry.");
      } else {
        router.refresh();
      }
    } catch {
      setError("Network error — please try again.");
    }
    setBusy(null);
  }

  if (enquiries.length === 0) {
    return <p className="rounded-2xl border border-dashed border-neutral-300 px-4 py-10 text-center text-sm text-neutral-500">No enquiries yet. They appear here as soon as a guest submits one.</p>;
  }

  return (
    <div className="space-y-3">
      {error && (
        <p role="alert" className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" /> {error}
        </p>
      )}

      {enquiries.map((e) => {
        const isOpen = expanded === e.id;
        const wa = whatsappLink(`Hello ${e.name.split(" ")[0]}! This is PRITIVO about your ${e.destination || "travel"} enquiry${e.code ? ` (${e.code})` : ""}.`);
        return (
          <article key={e.id} className="rounded-2xl border border-neutral-100 bg-white p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-wider text-neutral-500">
                  <span className="rounded-full bg-sand px-2 py-0.5 font-semibold text-neutral-600">{e.kind}</span>
                  {e.code && <span className="font-mono text-neutral-500">{e.code}</span>}
                  <span>{new Date(e.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</span>
                </p>
                <h3 className="mt-1 font-serif text-xl text-ink">{e.destination || e.subject || "General enquiry"}</h3>
                <p className="text-sm text-neutral-600">
                  {e.name} · {e.phone}
                </p>
                <p className="text-xs text-neutral-500">
                  {[e.originCity || e.departureCity ? `From ${e.originCity || e.departureCity}` : "", e.travelDates, e.adults !== null ? `${e.adults} adults` : "", e.children ? `${e.children} children` : "", e.travelers ? `${e.travelers} travellers` : "", e.hotelCategory, e.budget, e.tripType]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <label htmlFor={`status-${e.id}`} className="sr-only">Status</label>
                <select
                  id={`status-${e.id}`}
                  value={e.status}
                  disabled={busy === e.id}
                  onChange={(ev) => patch(e.id, { status: ev.target.value })}
                  className="rounded-full border border-neutral-200 px-3 py-1.5 text-xs font-medium focus:border-gold focus:outline-none"
                >
                  {Array.from(new Set([...ENQUIRY_STATUS_FLOW, e.status])).map((s) => (
                    <option key={s} value={s}>{ENQUIRY_STATUS_LABELS[s] ?? s}</option>
                  ))}
                </select>
                <button type="button" onClick={() => setExpanded(isOpen ? null : e.id)} className="rounded-full border border-neutral-200 px-3 py-1.5 text-xs font-medium hover:border-gold" aria-expanded={isOpen}>
                  {isOpen ? "Hide" : "Manage"}
                </button>
                {busy === e.id && <Loader2 className="h-4 w-4 animate-spin text-gold-dark" aria-hidden="true" />}
              </div>
            </div>

            {e.message && <p className="mt-2 rounded-xl bg-ivory px-3 py-2 text-sm text-neutral-600">{e.message}</p>}

            <div className="mt-3 flex flex-wrap gap-2">
              <a href={wa} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-full bg-[#25D366] px-3 py-1.5 text-xs font-semibold text-white">
                <WhatsAppIcon className="h-3.5 w-3.5" /> WhatsApp
              </a>
              <a href={mailtoLink(`PRITIVO — your ${e.destination || "travel"} enquiry${e.code ? ` ${e.code}` : ""}`)} className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 px-3 py-1.5 text-xs font-medium hover:border-gold">
                <Mail className="h-3.5 w-3.5" aria-hidden="true" /> Email
              </a>
              <a href={`tel:${e.phone}`} className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 px-3 py-1.5 text-xs font-medium hover:border-gold">
                <Phone className="h-3.5 w-3.5" aria-hidden="true" /> Call
              </a>
              <a href={`/admin/quotations/new?enquiry=${e.id}`} className="inline-flex items-center gap-1.5 rounded-full border border-gold/50 px-3 py-1.5 text-xs font-medium text-gold-dark hover:bg-champagne/40">
                <ReceiptText className="h-3.5 w-3.5" aria-hidden="true" /> Generate quotation
              </a>
            </div>

            {isOpen && (
              <div className="mt-4 grid gap-4 border-t border-neutral-100 pt-4 sm:grid-cols-2">
                <div>
                  <label htmlFor={`supplier-${e.id}`} className="mb-1 block text-xs font-semibold uppercase tracking-wider text-neutral-500">Supplier</label>
                  <select
                    id={`supplier-${e.id}`}
                    value={e.supplierId ?? ""}
                    disabled={busy === e.id}
                    onChange={(ev) => patch(e.id, { supplierId: ev.target.value === "" ? null : Number(ev.target.value) })}
                    className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm focus:border-gold focus:outline-none"
                  >
                    <option value="">Not assigned</option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>{s.name} ({s.verificationStatus})</option>
                    ))}
                  </select>
                  {e.supplierName && <p className="mt-1 text-xs text-neutral-500">Assigned: {e.supplierName}</p>}
                </div>
                <div>
                  <label htmlFor={`payment-${e.id}`} className="mb-1 block text-xs font-semibold uppercase tracking-wider text-neutral-500">Payment status</label>
                  <select
                    id={`payment-${e.id}`}
                    value={e.paymentStatus}
                    disabled={busy === e.id}
                    onChange={(ev) => patch(e.id, { paymentStatus: ev.target.value })}
                    className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm capitalize focus:border-gold focus:outline-none"
                  >
                    {PAYMENT_STATUSES.map((p) => <option key={p} value={p}>{p.replace(/_/g, " ")}</option>)}
                  </select>
                  <label htmlFor={`txn-${e.id}`} className="mt-2 mb-1 block text-xs font-semibold uppercase tracking-wider text-neutral-500">Transaction ID</label>
                  <input
                    id={`txn-${e.id}`}
                    defaultValue={e.transactionId ?? ""}
                    onBlur={(ev) => { if (ev.target.value !== (e.transactionId ?? "")) patch(e.id, { transactionId: ev.target.value }); }}
                    className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm focus:border-gold focus:outline-none"
                    placeholder="Gateway reference"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="inline-flex items-center gap-2 text-sm text-neutral-600">
                    <input
                      type="checkbox"
                      checked={e.supplierConfirmed}
                      disabled={busy === e.id}
                      onChange={(ev) => patch(e.id, { supplierConfirmed: ev.target.checked })}
                      className="h-4 w-4 accent-[#c6a866]"
                    />
                    Supplier has confirmed in writing
                  </label>
                  <p className="mt-1 text-xs text-neutral-500">
                    Required before a booking can be moved to <strong>Confirmed</strong>. Payment must also be recorded as paid.
                  </p>
                  {e.status === "confirmed" && (
                    <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                      <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" /> Confirmed
                    </p>
                  )}
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor={`note-${e.id}`} className="mb-1 block text-xs font-semibold uppercase tracking-wider text-neutral-500">Internal note</label>
                  <textarea
                    id={`note-${e.id}`}
                    defaultValue={e.adminNote ?? ""}
                    rows={2}
                    onBlur={(ev) => { if (ev.target.value !== (e.adminNote ?? "")) patch(e.id, { adminNote: ev.target.value }); }}
                    placeholder="Quote sent, follow up Monday…"
                    className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm focus:border-gold focus:outline-none"
                  />
                </div>
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}
