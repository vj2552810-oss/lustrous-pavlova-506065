"use client";

import { useEffect, useRef, useState } from "react";
import { Bot, Loader2, Send, Sparkles, User, X } from "lucide-react";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { SITE } from "@/lib/site";

interface Suggestion {
  label: string;
  href: string;
}
interface Message {
  role: "user" | "assistant";
  text: string;
  suggestions?: Suggestion[];
  handoff?: string | null;
}

const STARTERS = [
  "Best places for a honeymoon",
  "Trips under ₹60,000 per person",
  "Tell me about Switzerland",
  "Do you arrange car rental?",
];

export function AssistantWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      text: `Namaste! I'm the PRITIVO assistant. Ask me about destinations, travel styles, budgets or our services. I can't quote live prices or confirm availability — a planner does that in writing.`,
      suggestions: [
        { label: "Browse tours", href: "/tours" },
        { label: "Destination guides", href: "/destinations" },
      ],
    },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  async function send(text: string) {
    const message = text.trim();
    if (!message || busy) return;
    setError("");
    setMessages((m) => [...m, { role: "user", text: message }]);
    setInput("");
    setBusy(true);
    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) {
        setError(json.error ?? "The assistant is unavailable right now.");
        setMessages((m) => [
          ...m,
          { role: "assistant", text: json.error ?? "I couldn't process that. Please message us on WhatsApp and a planner will help." },
        ]);
      } else {
        setMessages((m) => [...m, { role: "assistant", text: json.answer, suggestions: json.suggestions ?? [], handoff: json.handoff ?? null }]);
      }
    } catch {
      setError("Network error — please try again.");
      setMessages((m) => [...m, { role: "assistant", text: "I couldn't reach the server. Please message us on WhatsApp." }]);
    }
    setBusy(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label={open ? "Close travel assistant" : "Open travel assistant"}
        className="fixed bottom-24 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-ink text-gold shadow-2xl shadow-black/30 transition hover:scale-105 sm:bottom-24 sm:right-7"
      >
        {open ? <X className="h-6 w-6" /> : <Bot className="h-6 w-6" />}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="PRITIVO travel assistant"
          className="fixed bottom-44 right-4 z-40 flex h-[30rem] w-[calc(100vw-2rem)] max-w-sm flex-col overflow-hidden rounded-3xl border border-black/10 bg-white shadow-2xl sm:right-7"
        >
          <div className="flex items-center gap-2 bg-ink px-4 py-3 text-white">
            <Sparkles className="h-4 w-4 text-gold" aria-hidden="true" />
            <div className="min-w-0">
              <p className="font-serif text-xl leading-tight">PRITIVO Assistant</p>
              <p className="truncate text-xs text-white/65">Guidance only — no invented prices or availability</p>
            </div>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-ivory px-3 py-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-2 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                {m.role === "assistant" && (
                  <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gold/20 text-gold-dark">
                    <Bot className="h-3.5 w-3.5" aria-hidden="true" />
                  </span>
                )}
                <div className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-6 ${m.role === "user" ? "bg-ink text-white" : "bg-white text-neutral-600 shadow-sm"}`}>
                  {m.text}
                  {m.suggestions && m.suggestions.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {m.suggestions.map((s) => (
                        <a key={s.href + s.label} href={s.href} className="rounded-full border border-gold/50 px-2.5 py-1 text-xs font-medium text-gold-dark hover:bg-champagne/40">
                          {s.label}
                        </a>
                      ))}
                    </div>
                  )}
                  {m.handoff && (
                    <a href={m.handoff} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-[#25D366] px-3 py-1.5 text-xs font-semibold text-white">
                      <WhatsAppIcon className="h-3 w-3" /> Talk to a planner
                    </a>
                  )}
                </div>
                {m.role === "user" && (
                  <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ink text-white">
                    <User className="h-3.5 w-3.5" aria-hidden="true" />
                  </span>
                )}
              </div>
            ))}
            {busy && (
              <p className="flex items-center gap-2 pl-8 text-xs text-neutral-500">
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> Thinking…
              </p>
            )}
            {error && <p role="alert" className="pl-8 text-xs text-red-600">{error}</p>}
          </div>

          {messages.length <= 1 && (
            <div className="flex flex-wrap gap-1.5 border-t border-neutral-100 bg-white px-3 py-2">
              {STARTERS.map((s) => (
                <button key={s} type="button" onClick={() => send(s)} className="rounded-full border border-neutral-200 px-2.5 py-1 text-xs text-neutral-600 hover:border-gold">
                  {s}
                </button>
              ))}
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              void send(input);
            }}
            className="flex items-center gap-2 border-t border-neutral-100 bg-white p-3"
          >
            <label htmlFor="assistant-input" className="sr-only">Ask the PRITIVO assistant</label>
            <input
              id="assistant-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              maxLength={500}
              placeholder="Ask about a destination or budget…"
              className="min-w-0 flex-1 rounded-full border border-neutral-200 px-3.5 py-2.5 text-sm focus:border-gold focus:outline-none focus:ring-4 focus:ring-gold/15"
            />
            <button type="submit" disabled={busy || !input.trim()} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold-gradient text-ink disabled:opacity-50" aria-label="Send message">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </button>
          </form>
          <p className="bg-white px-3 pb-2 text-xs leading-4 text-neutral-500">
            Prefer a human? WhatsApp {SITE.phoneDisplay} — we reply from Belagavi.
          </p>
        </div>
      )}
    </>
  );
}
