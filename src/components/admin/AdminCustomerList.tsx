"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Mail, Phone, ShieldAlert } from "lucide-react";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { whatsappLink, mailtoLink } from "@/lib/site";
import type { CustomerRecord, EnquiryRow } from "@/lib/crm/types";

export function AdminCustomerList({
  customers,
  history,
}: {
  customers: CustomerRecord[];
  history: Record<number, EnquiryRow[]>;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [openId, setOpenId] = useState<number | null>(null);

  async function save(id: number, patch: Record<string, string>) {
    setBusy(id);
    setError("");
    try {
      const res = await fetch(`/api/admin/customers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) setError(json.error ?? "Could not save the profile.");
      else router.refresh();
    } catch {
      setError("Network error — please try again.");
    }
    setBusy(null);
  }

  if (customers.length === 0) {
    return <p className="rounded-2xl border border-dashed border-neutral-300 px-4 py-10 text-center text-sm text-neutral-500">No customer profiles yet. They are created automatically from enquiries.</p>;
  }

  return (
    <div className="space-y-3">
      {error && (
        <p role="alert" className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" /> {error}
        </p>
      )}
      {customers.map((c) => {
        const rows = history[c.id] ?? [];
        const isOpen = openId === c.id;
        return (
          <article key={c.id} className="rounded-2xl border border-neutral-100 bg-white p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="font-serif text-xl text-ink">{c.name}</h3>
                <p className="text-sm text-neutral-600">{c.email} · {c.phone}{c.city ? ` · ${c.city}` : ""}</p>
                <p className="text-xs text-neutral-500">
                  {rows.length} enquiry{rows.length === 1 ? "" : "ies"} · added {new Date(c.createdAt).toLocaleDateString("en-IN", { dateStyle: "medium" })}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <a href={whatsappLink(`Hello ${c.name.split(" ")[0]}! This is PRITIVO.`)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-full bg-[#25D366] px-3 py-1.5 text-xs font-semibold text-white">
                  <WhatsAppIcon className="h-3.5 w-3.5" /> WhatsApp
                </a>
                <a href={mailtoLink("PRITIVO — your travel enquiry")} className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 px-3 py-1.5 text-xs font-medium hover:border-gold">
                  <Mail className="h-3.5 w-3.5" aria-hidden="true" /> Email
                </a>
                <a href={`tel:${c.phone}`} className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 px-3 py-1.5 text-xs font-medium hover:border-gold">
                  <Phone className="h-3.5 w-3.5" aria-hidden="true" /> Call
                </a>
                <button type="button" onClick={() => setOpenId(isOpen ? null : c.id)} className="rounded-full border border-neutral-200 px-3 py-1.5 text-xs font-medium hover:border-gold" aria-expanded={isOpen}>
                  {isOpen ? "Hide" : "Profile"}
                </button>
              </div>
            </div>

            {isOpen && (
              <div className="mt-4 grid gap-4 border-t border-neutral-100 pt-4 sm:grid-cols-2">
                <div>
                  <label htmlFor={`city-${c.id}`} className="mb-1 block text-xs font-semibold uppercase tracking-wider text-neutral-500">City</label>
                  <input
                    id={`city-${c.id}`}
                    defaultValue={c.city ?? ""}
                    onBlur={(ev) => { if (ev.target.value !== (c.city ?? "")) save(c.id, { city: ev.target.value }); }}
                    className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm focus:border-gold focus:outline-none"
                  />
                  <label htmlFor={`prefs-${c.id}`} className="mt-3 mb-1 block text-xs font-semibold uppercase tracking-wider text-neutral-500">Travel preferences</label>
                  <textarea
                    id={`prefs-${c.id}`}
                    defaultValue={c.preferences ?? ""}
                    rows={2}
                    onBlur={(ev) => { if (ev.target.value !== (c.preferences ?? "")) save(c.id, { preferences: ev.target.value }); }}
                    className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm focus:border-gold focus:outline-none"
                    placeholder="Prefers boutique stays, vegetarian meals…"
                  />
                </div>
                <div>
                  <label htmlFor={`notes-${c.id}`} className="mb-1 block text-xs font-semibold uppercase tracking-wider text-neutral-500">Internal notes / follow-ups</label>
                  <textarea
                    id={`notes-${c.id}`}
                    defaultValue={c.notes ?? ""}
                    rows={5}
                    onBlur={(ev) => { if (ev.target.value !== (c.notes ?? "")) save(c.id, { notes: ev.target.value }); }}
                    className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm focus:border-gold focus:outline-none"
                    placeholder="Called 12 Mar, awaiting dates…"
                  />
                  {busy === c.id && <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-neutral-500"><Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" /> Saving…</p>}
                </div>
                <div className="sm:col-span-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Booking history</h4>
                  {rows.length === 0 ? (
                    <p className="mt-1 text-sm text-neutral-500">No recorded enquiries.</p>
                  ) : (
                    <ul className="mt-2 space-y-1.5">
                      {rows.map((r) => (
                        <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-ivory px-3 py-2 text-sm">
                          <span className="min-w-0">
                            <span className="font-medium text-ink">{r.destination || r.subject || r.kind}</span>
                            <span className="ml-2 text-xs text-neutral-500">{r.travelDates ?? ""} · {new Date(r.createdAt).toLocaleDateString("en-IN", { dateStyle: "medium" })}</span>
                          </span>
                          <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold capitalize text-neutral-600">{r.status.replace(/_/g, " ")}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}
