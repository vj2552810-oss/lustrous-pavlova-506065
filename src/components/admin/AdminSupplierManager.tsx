"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, ShieldAlert, Trash2 } from "lucide-react";
import { SUPPLIER_CATEGORY_LABELS, SUPPLIER_CATEGORIES, VERIFICATION_STATUSES, type SupplierCategory } from "@/lib/crm/constants";
import type { SupplierRecord } from "@/lib/crm/types";

const input = "w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm focus:border-gold focus:outline-none focus:ring-4 focus:ring-gold/15";
const label = "mb-1 block text-xs font-semibold uppercase tracking-wider text-neutral-500";

const emptyForm = {
  name: "",
  category: "hotel" as SupplierCategory,
  contactName: "",
  email: "",
  phone: "",
  location: "",
  services: "",
  agreedRate: "",
  commissionPercent: "",
  agreementNotes: "",
  verificationStatus: "unverified",
};

export function AdminSupplierManager({ suppliers }: { suppliers: SupplierRecord[] }) {
  const router = useRouter();
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState<number | "create" | null>(null);
  const [adding, setAdding] = useState(false);

  async function create() {
    setBusy("create");
    setFormError("");
    try {
      const res = await fetch("/api/admin/suppliers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          services: form.services.split(",").map((s) => s.trim()).filter(Boolean),
          commissionPercent: form.commissionPercent === "" ? null : Number(form.commissionPercent),
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) {
        if (json.errors) setErrors(json.errors);
        else setFormError(json.error ?? "Could not save the supplier.");
      } else {
        setForm(emptyForm);
        setAdding(false);
        router.refresh();
      }
    } catch {
      setFormError("Network error — please try again.");
    }
    setBusy(null);
  }

  async function patch(id: number, body: Record<string, unknown>) {
    setBusy(id);
    setFormError("");
    try {
      const res = await fetch(`/api/admin/suppliers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) {
        const fieldError = json.errors ? Object.values(json.errors).join(" ") : "";
        setFormError(fieldError || json.error || "Could not update the supplier.");
      } else router.refresh();
    } catch {
      setFormError("Network error — please try again.");
    }
    setBusy(null);
  }

  async function remove(id: number, name: string) {
    if (!window.confirm(`Delete supplier “${name}”? This cannot be undone.`)) return;
    setBusy(id);
    try {
      const res = await fetch(`/api/admin/suppliers/${id}`, { method: "DELETE" });
      if (res.ok) router.refresh();
      else setFormError("Could not delete the supplier.");
    } catch {
      setFormError("Network error — please try again.");
    }
    setBusy(null);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-neutral-600">{suppliers.length} supplier{suppliers.length === 1 ? "" : "s"} on file</p>
        <button type="button" onClick={() => setAdding((a) => !a)} className="bg-gold-gradient inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-ink">
          <Plus className="h-4 w-4" aria-hidden="true" /> {adding ? "Close form" : "Add supplier"}
        </button>
      </div>

      {formError && (
        <p role="alert" className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" /> {formError}
        </p>
      )}

      {adding && (
        <div className="rounded-2xl border border-neutral-100 bg-ivory p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="s-name" className={label}>Supplier name</label>
              <input id="s-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={input} />
              {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
            </div>
            <div>
              <label htmlFor="s-category" className={label}>Category</label>
              <select id="s-category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as SupplierCategory })} className={input}>
                {SUPPLIER_CATEGORIES.map((c) => <option key={c} value={c}>{SUPPLIER_CATEGORY_LABELS[c]}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="s-location" className={label}>Location</label>
              <input id="s-location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className={input} placeholder="Goa, India" />
            </div>
            <div>
              <label htmlFor="s-contact" className={label}>Contact person</label>
              <input id="s-contact" value={form.contactName} onChange={(e) => setForm({ ...form, contactName: e.target.value })} className={input} />
            </div>
            <div>
              <label htmlFor="s-phone" className={label}>Phone</label>
              <input id="s-phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={input} />
              {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="s-email" className={label}>Email</label>
              <input id="s-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={input} />
              {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="s-services" className={label}>Services (comma separated)</label>
              <input id="s-services" value={form.services} onChange={(e) => setForm({ ...form, services: e.target.value })} className={input} placeholder="Deluxe rooms, airport transfers" />
            </div>
            <div>
              <label htmlFor="s-rate" className={label}>Agreed rate</label>
              <input id="s-rate" value={form.agreedRate} onChange={(e) => setForm({ ...form, agreedRate: e.target.value })} className={input} placeholder="₹4,800 per night, twin share" />
            </div>
            <div>
              <label htmlFor="s-commission" className={label}>Commission %</label>
              <input id="s-commission" type="number" min={0} max={100} value={form.commissionPercent} onChange={(e) => setForm({ ...form, commissionPercent: e.target.value })} className={input} />
              {errors.commissionPercent && <p className="mt-1 text-xs text-red-600">{errors.commissionPercent}</p>}
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="s-agreement" className={label}>Agreement notes</label>
              <textarea id="s-agreement" rows={2} value={form.agreementNotes} onChange={(e) => setForm({ ...form, agreementNotes: e.target.value })} className={input} placeholder="Net-15 payment terms, free cancellation up to 48h…" />
            </div>
            <div>
              <label htmlFor="s-verification" className={label}>Verification status</label>
              <select id="s-verification" value={form.verificationStatus} onChange={(e) => setForm({ ...form, verificationStatus: e.target.value })} className={input}>
                {VERIFICATION_STATUSES.map((v) => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
          </div>
          <button type="button" onClick={create} disabled={busy === "create"} className="mt-4 inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60">
            {busy === "create" ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Plus className="h-4 w-4" aria-hidden="true" />} Save supplier
          </button>
        </div>
      )}

      {suppliers.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-neutral-300 px-4 py-10 text-center text-sm text-neutral-500">
          No suppliers yet. Add hotels, resorts, operators and partners so you can record confirmations against bookings.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b border-neutral-200 text-xs uppercase tracking-wider text-neutral-500">
                <th className="py-2 pr-3">Supplier</th>
                <th className="py-2 pr-3">Category</th>
                <th className="py-2 pr-3">Contact</th>
                <th className="py-2 pr-3">Rate / commission</th>
                <th className="py-2 pr-3">Verified</th>
                <th className="py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.map((s) => (
                <tr key={s.id} className="border-b border-neutral-100 align-top">
                  <td className="py-3 pr-3">
                    <p className="font-medium text-ink">{s.name}</p>
                    <p className="text-xs text-neutral-500">{s.location ?? "—"}</p>
                    {(s.services as string[]).length > 0 && <p className="text-xs text-neutral-500">{(s.services as string[]).slice(0, 3).join(", ")}</p>}
                  </td>
                  <td className="py-3 pr-3 text-neutral-600">{SUPPLIER_CATEGORY_LABELS[s.category as SupplierCategory] ?? s.category}</td>
                  <td className="py-3 pr-3 text-xs text-neutral-600">
                    {s.contactName ?? "—"}
                    <br />{s.phone ?? ""}
                    <br />{s.email ?? ""}
                  </td>
                  <td className="py-3 pr-3 text-xs text-neutral-600">
                    {s.agreedRate ?? "—"}
                    <br />{s.commissionPercent !== null ? `${s.commissionPercent}% commission` : ""}
                  </td>
                  <td className="py-3 pr-3">
                    <label htmlFor={`verify-${s.id}`} className="sr-only">Verification status for {s.name}</label>
                    <select
                      id={`verify-${s.id}`}
                      value={s.verificationStatus}
                      disabled={busy === s.id}
                      onChange={(ev) => patch(s.id, { verificationStatus: ev.target.value })}
                      className={`rounded-full border px-2.5 py-1 text-xs font-semibold capitalize focus:outline-none ${
                        s.verificationStatus === "verified" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : s.verificationStatus === "suspended" ? "border-red-200 bg-red-50 text-red-700" : "border-neutral-200 bg-neutral-50 text-neutral-600"
                      }`}
                    >
                      {VERIFICATION_STATUSES.map((v) => <option key={v} value={v}>{v}</option>)}
                    </select>
                  </td>
                  <td className="py-3 text-right">
                    <button
                      type="button"
                      onClick={() => remove(s.id, s.name)}
                      disabled={busy === s.id}
                      className="inline-flex items-center gap-1 rounded-full border border-neutral-200 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:border-red-300 disabled:opacity-50"
                      aria-label={`Delete ${s.name}`}
                    >
                      {busy === s.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="text-xs leading-5 text-neutral-500">
        Only suppliers marked <strong>verified</strong> can be recorded as the confirming party for a booking. Agreed rates
        and commission details stay in this staff area and are never shown to guests.
      </p>
    </div>
  );
}
