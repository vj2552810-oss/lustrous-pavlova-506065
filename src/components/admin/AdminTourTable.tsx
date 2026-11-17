"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Eye, EyeOff, Loader2, Pencil, Trash2 } from "lucide-react";
import { formatINR } from "@/lib/packages";
import type { TourRecord } from "@/lib/tours/service";

export function AdminTourTable({ tours }: { tours: TourRecord[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<number | null>(null);
  const [error, setError] = useState("");

  async function toggle(tour: TourRecord) {
    setBusy(tour.id);
    setError("");
    try {
      const res = await fetch(`/api/admin/tours/${tour.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: !tour.published }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) setError(json.error ?? "Could not update that tour.");
      else router.refresh();
    } catch {
      setError("Network error — please try again.");
    }
    setBusy(null);
  }

  async function remove(tour: TourRecord) {
    if (!window.confirm(`Delete “${tour.name}” permanently? This cannot be undone.`)) return;
    setBusy(tour.id);
    setError("");
    try {
      const res = await fetch(`/api/admin/tours/${tour.id}`, { method: "DELETE" });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) setError(json.error ?? "Could not delete that tour.");
      else router.refresh();
    } catch {
      setError("Network error — please try again.");
    }
    setBusy(null);
  }

  if (tours.length === 0) {
    return <p className="rounded-2xl border border-dashed border-neutral-300 px-4 py-8 text-center text-sm text-neutral-500">No tours yet. Create your first tour to get started.</p>;
  }

  return (
    <div>
      {error && <p role="alert" className="mb-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-neutral-200 text-xs uppercase tracking-wider text-neutral-500">
              <th className="py-2 pr-3">Tour</th>
              <th className="py-2 pr-3">Type</th>
              <th className="py-2 pr-3">Duration</th>
              <th className="py-2 pr-3">Price</th>
              <th className="py-2 pr-3">Status</th>
              <th className="py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tours.map((t) => (
              <tr key={t.id} className="border-b border-neutral-100 align-top">
                <td className="py-3 pr-3">
                  <Link href={`/tours/${t.slug}`} className="font-medium text-ink hover:text-gold-dark">{t.name}</Link>
                  <p className="text-xs text-neutral-500">{t.city ? `${t.city} · ` : ""}{t.country}</p>
                </td>
                <td className="py-3 pr-3 capitalize text-neutral-600">{t.type}</td>
                <td className="py-3 pr-3 text-neutral-600">{t.durationDays}D/{t.durationNights}N</td>
                <td className="py-3 pr-3 text-neutral-600">
                  {t.priceVerified && t.priceFromINR ? formatINR(t.priceFromINR) : <span className="text-xs text-amber-700">Request a Quote</span>}
                </td>
                <td className="py-3 pr-3">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${t.published ? "bg-emerald-50 text-emerald-700" : "bg-neutral-100 text-neutral-600"}`}>
                    {t.published ? "Published" : "Unpublished"}
                  </span>
                </td>
                <td className="py-3 text-right">
                  <div className="inline-flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => toggle(t)}
                      disabled={busy === t.id}
                      className="inline-flex items-center gap-1 rounded-full border border-neutral-200 px-2.5 py-1.5 text-xs font-medium hover:border-gold disabled:opacity-50"
                      aria-label={t.published ? `Unpublish ${t.name}` : `Publish ${t.name}`}
                    >
                      {busy === t.id ? <Loader2 className="h-3 w-3 animate-spin" /> : t.published ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                      {t.published ? "Unpublish" : "Publish"}
                    </button>
                    <Link href={`/admin/tours/${t.id}`} className="inline-flex items-center gap-1 rounded-full border border-neutral-200 px-2.5 py-1.5 text-xs font-medium hover:border-gold">
                      <Pencil className="h-3 w-3" /> Edit
                    </Link>
                    <button
                      type="button"
                      onClick={() => remove(t)}
                      disabled={busy === t.id}
                      className="inline-flex items-center gap-1 rounded-full border border-neutral-200 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:border-red-300 disabled:opacity-50"
                      aria-label={`Delete ${t.name}`}
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
