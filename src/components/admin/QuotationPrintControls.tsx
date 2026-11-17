"use client";

import { Printer, Share2 } from "lucide-react";
import { whatsappLink } from "@/lib/site";

export function QuotationPrintControls({ code, expired }: { code: string; expired: boolean }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {expired && <span className="rounded-full bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700">Expired — regenerate before sending</span>}
      <a
        href={whatsappLink(`Hello! Sharing your PRITIVO quotation ${code}. I'll send the PDF shortly.`)}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm font-medium hover:border-gold"
      >
        <Share2 className="h-4 w-4" aria-hidden="true" /> Send via WhatsApp
      </a>
      <button
        type="button"
        onClick={() => window.print()}
        className="bg-gold-gradient inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-ink"
      >
        <Printer className="h-4 w-4" aria-hidden="true" /> Print / Save as PDF
      </button>
    </div>
  );
}
