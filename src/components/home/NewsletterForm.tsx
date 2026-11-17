"use client";

import { useState, type FormEvent } from "react";
import { AlertCircle, CheckCircle2, Loader2, Mail } from "lucide-react";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");
  const [honeypot, setHoneypot] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setMessage("");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) {
      setStatus("error");
      setMessage("Please enter a valid email address.");
      return;
    }
    setStatus("sending");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "home", website: honeypot }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) {
        setStatus("error");
        setMessage(json.error ?? json.errors?.email ?? "We couldn't save that email.");
        return;
      }
      setStatus("sent");
      setMessage(json.message ?? "You're on the list.");
      setEmail("");
    } catch {
      setStatus("error");
      setMessage("Network error — please try again.");
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="mt-5">
      <div className="absolute -left-[9999px]" aria-hidden="true">
        <label htmlFor="nl-website">Website</label>
        <input id="nl-website" tabIndex={-1} autoComplete="off" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <label htmlFor="nl-email" className="sr-only">Email address</label>
        <input
          id="nl-email"
          type="email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); if (status !== "idle") setStatus("idle"); }}
          placeholder="you@example.com"
          autoComplete="email"
          aria-invalid={status === "error" || undefined}
          aria-describedby={message ? "nl-message" : undefined}
          className="min-w-0 flex-1 rounded-full border border-white/25 bg-white/10 px-5 py-3.5 text-sm text-white placeholder:text-white/65 backdrop-blur-sm focus:border-gold focus:outline-none focus:ring-4 focus:ring-gold/20"
        />
        <button
          type="submit"
          disabled={status === "sending"}
          className="bg-gold-gradient inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold text-ink disabled:opacity-70"
        >
          {status === "sending" ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Mail className="h-4 w-4" aria-hidden="true" />}
          {status === "sending" ? "Subscribing…" : "Subscribe"}
        </button>
      </div>
      {message && (
        <p
          id="nl-message"
          role={status === "error" ? "alert" : "status"}
          className={`mt-3 flex items-start gap-2 text-xs ${status === "error" ? "text-red-300" : "text-emerald-300"}`}
        >
          {status === "error" ? <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" /> : <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />}
          {message}
        </p>
      )}
      <p className="mt-3 text-xs leading-4 text-white/65">
        Travel offers and destination inspiration only — no spam. Unsubscribe any time. See our{" "}
        <a href="/privacy-policy" className="underline">Privacy Policy</a>.
      </p>
    </form>
  );
}
