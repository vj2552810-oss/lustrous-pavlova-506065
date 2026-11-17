"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { AlertCircle, KeyRound, Loader2, LogIn } from "lucide-react";

export function AdminUnlockForm({ configured, setupMessage }: { configured: boolean; setupMessage: string | null }) {
  const router = useRouter();
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (passcode.length < 8) {
      setError("Enter the staff passcode.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/admin/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) {
        setError(json.error ?? "Could not unlock the tour manager.");
        setLoading(false);
        return;
      }
      router.refresh();
    } catch {
      setError("Network error — please try again.");
      setLoading(false);
    }
  }

  if (!configured) {
    return (
      <div className="rounded-3xl border border-amber-300 bg-amber-50 p-6 text-sm leading-6 text-amber-950">
        <p className="flex items-center gap-2 font-semibold"><AlertCircle className="h-4 w-4" aria-hidden="true" /> Tour manager not configured</p>
        <p className="mt-2">{setupMessage}</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="rounded-3xl border border-black/5 bg-white p-6 shadow-[0_30px_60px_-40px_rgba(7,22,41,0.5)] sm:p-8">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-ink text-gold">
          <KeyRound className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <h1 className="font-serif text-2xl">Staff access</h1>
          <p className="text-xs text-neutral-500">Tour manager for PRITIVO staff only.</p>
        </div>
      </div>

      {error && (
        <div role="alert" className="mt-4 flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" /> {error}
        </div>
      )}

      <label htmlFor="admin-passcode" className="mt-5 block text-sm font-medium text-neutral-600">Staff passcode</label>
      <input
        id="admin-passcode"
        type="password"
        value={passcode}
        onChange={(e) => setPasscode(e.target.value)}
        autoComplete="current-password"
        className="mt-1.5 w-full rounded-xl border border-neutral-200 px-3.5 py-3 text-sm focus:border-gold focus:outline-none focus:ring-4 focus:ring-gold/15"
        aria-invalid={!!error || undefined}
      />
      <button
        type="submit"
        disabled={loading}
        className="bg-gold-gradient mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3.5 font-semibold text-ink disabled:opacity-70"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <LogIn className="h-4 w-4" aria-hidden="true" />}
        {loading ? "Checking…" : "Unlock tour manager"}
      </button>
      <p className="mt-3 text-xs leading-5 text-neutral-500">
        This is a staff-only tool. Customers never create accounts, log in or register anywhere on this site. The passcode
        is stored only as a server environment variable and every request is authorised on the server.
      </p>
    </form>
  );
}
