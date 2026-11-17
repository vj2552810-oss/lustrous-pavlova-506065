"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import Link from "next/link";
import { SITE, whatsappLink } from "@/lib/site";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";

/**
 * Route-level error boundary. Renders instead of the platform's generic
 * "This page couldn't load" screen, reports honestly, and never invents content.
 */
export default function RouteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Server-side detail stays in the server log; only the digest is shown.
    console.error("[page-error]", error.digest ?? "", error.message);
  }, [error]);

  return (
    <section className="flex min-h-[80vh] items-center bg-ink px-5 pt-24 text-white">
      <div className="mx-auto max-w-lg text-center">
        <AlertTriangle className="mx-auto h-12 w-12 text-gold" aria-hidden="true" />
        <h1 className="mt-5 font-serif text-4xl">This page hit an error</h1>
        <p className="mt-4 text-sm leading-6 text-white/65">
          Something went wrong while loading this page — usually a database or supplier connection problem. Nothing has
          been booked or charged. Try reloading; if it persists, message us and we&apos;ll handle it personally.
        </p>
        {error.digest && <p className="mt-3 font-mono text-xs text-white/65">Reference: {error.digest}</p>}
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <button type="button" onClick={reset} className="bg-gold-gradient inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 font-semibold text-ink">
            <RefreshCw className="h-4 w-4" aria-hidden="true" /> Try again
          </button>
          <Link href="/" className="rounded-full border border-white/30 px-6 py-3 font-semibold hover:bg-white hover:text-ink">Back home</Link>
        </div>
        <div className="mt-6 flex flex-col items-center gap-2 text-sm text-white/65">
          <a href={whatsappLink("Hello PRITIVO! A page on your website showed an error.")} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-2.5 font-semibold text-white">
            <WhatsAppIcon className="h-4 w-4" /> WhatsApp {SITE.phoneDisplay}
          </a>
          <span>{SITE.email}</span>
        </div>
      </div>
    </section>
  );
}
