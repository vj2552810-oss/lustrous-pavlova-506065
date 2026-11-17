"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Mail, Phone } from "lucide-react";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { whatsappLink } from "@/lib/site";
import type { EnquiryRecord } from "@/lib/tours/service";

const STATUSES = ["new", "contacted", "quoted", "closed"];

export function AdminEnquiryTable({ enquiries }: { enquiries: EnquiryRecord[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<number | null>(null);
  const [error, setError] = useState("");

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
      if (!res.ok || !json.ok) setError(json.error ?? "Could not update that enquiry.");
      else router.refresh();
    } catch {
      setError("Network error — please try again.");
    }
    setBusy(null);
  }

  if (enquiries.length === 0) {
    return <p className="rounded-2xl border border-dashed border-neutral-300 px-4 py-8 text-center text-sm text-neutral-500">No enquiries yet. They appear here as soon as a guest sends one.</p>;
  }

  return (
    <div className="space-y-3">
      {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      {enquiries.map((e) => (
        <article key={e.id} className="rounded-2xl border border-neutral-100 bg-white p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-wider text-neutral-500">
                <span className="rounded-full bg-sand px-2 py-0.5 font-semibold text-neutral-600">{e.kind}</span>
                {e.tourSlug && <span className="font-mono text-xs text-neutral-500">{e.tourSlug}</span>}
                <span>{new Date(e.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</span>
              </p>
              <h3 className="mt-1 font-serif text-xl text-ink">{e.destination || e.subject || "Enquiry"}</h3>
              <p className="text-sm text-neutral-600">{e.name} · {e.phone}</p>
              <p className="text-xs text-neutral-500">
                {[e.travelDates, e.travelers ? `${e.travelers} traveller(s)` : "", e.budget, e.tripType].filter(Boolean).join(" · ")}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor={`status-${e.id}`} className="sr-only">Status for enquiry from {e.name}</label>
              <select
                id={`status-${e.id}`}
                value={e.status}
                disabled={busy === e.id}
                onChange={(ev) => patch(e.id, { status: ev.target.value })}
                className="rounded-full border border-neutral-200 px-3 py-1.5 text-xs font-medium capitalize focus:border-gold focus:outline-none"
              >
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              {busy === e.id && <Loader2 className="h-4 w-4 animate-spin text-gold-dark" aria-hidden="true" />}
            </div>
          </div>

          {e.message && <p className="mt-2 rounded-xl bg-ivory px-3 py-2 text-sm text-neutral-600">{e.message}</p>}

          <div className="mt-3 flex flex-wrap gap-2">
            <a href={whatsappLink(`Hello ${e.name}! This is PRITIVO following up on your ${e.destination || "travel"} enquiry.`)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-full bg-[#25D366] px-3 py-1.5 text-xs font-semibold text-white">
              <WhatsAppIcon className="h-3.5 w-3.5" /> WhatsApp
            </a>
            <a href={`mailto:${e.email}?subject=${encodeURIComponent(`PRITIVO — your ${e.destination || "travel"} enquiry`)}`} className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 px-3 py-1.5 text-xs font-medium hover:border-gold">
              <Mail className="h-3.5 w-3.5" aria-hidden="true" /> Email
            </a>
            <a href={`tel:${e.phone}`} className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 px-3 py-1.5 text-xs font-medium hover:border-gold">
              <Phone className="h-3.5 w-3.5" aria-hidden="true" /> Call
            </a>
          </div>

          <label htmlFor={`note-${e.id}`} className="mt-3 block text-xs font-semibold uppercase tracking-wider text-neutral-500">Internal note</label>
          <textarea
            id={`note-${e.id}`}
            defaultValue={e.adminNote ?? ""}
            rows={2}
            onBlur={(ev) => {
              if (ev.target.value !== (e.adminNote ?? "")) patch(e.id, { adminNote: ev.target.value });
            }}
            placeholder="Quote sent, follow up on Monday…"
            className="mt-1 w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm focus:border-gold focus:outline-none focus:ring-4 focus:ring-gold/15"
          />
        </article>
      ))}
    </div>
  );
}
