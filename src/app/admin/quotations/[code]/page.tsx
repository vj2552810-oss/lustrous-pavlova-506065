import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Check, Printer, X } from "lucide-react";
import { AdminUnlockInline } from "@/components/admin/AdminUnlockInline";
import { QuotationPrintControls } from "@/components/admin/QuotationPrintControls";
import { LogoMark } from "@/components/Logo";
import { adminConfigured, isAdminAuthenticated } from "@/lib/admin/auth";
import { getQuotationByCode } from "@/lib/crm/quotations";
import type { QuotationRecord } from "@/lib/crm/types";
import { formatMoney } from "@/lib/hotels/format";
import { SITE } from "@/lib/site";

export const metadata: Metadata = { title: "Quotation (Staff)", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const fmtDate = (d: Date) => d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

export default async function QuotationPage({ params }: { params: Promise<{ code: string }> }) {
  if (!(await isAdminAuthenticated())) {
    if (!adminConfigured()) redirect("/admin");
    return <AdminUnlockInline />;
  }
  const { code } = await params;
  let quote: QuotationRecord | null = null;
  let lookupFailed = false;
  try {
    quote = await getQuotationByCode(code);
  } catch (err) {
    console.error("Quotation lookup failed", err instanceof Error ? err.message : "");
    lookupFailed = true;
  }
  if (!quote) {
    if (lookupFailed) {
      return (
        <section className="min-h-screen bg-ivory px-5 pb-24 pt-32">
          <div className="mx-auto max-w-lg rounded-3xl border border-amber-300 bg-amber-50 p-8 text-center">
            <h1 className="font-serif text-3xl text-amber-950">Quotation unavailable</h1>
            <p className="mt-3 text-sm leading-6 text-amber-900">
              The quotation store could not be reached, so this document can&apos;t be rendered yet. Nothing has been
              changed or deleted. Check the database connection and reload.
            </p>
            <Link href="/admin?tab=quotations" className="mt-6 inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to quotations
            </Link>
          </div>
        </section>
      );
    }
    notFound();
  }

  const expired = quote.validUntil.getTime() < Date.now();

  return (
    <section className="min-h-screen bg-sand pb-20 pt-28 print:bg-white print:pt-0">
      <div className="mx-auto max-w-4xl px-5 sm:px-8 print:max-w-none print:px-0">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <Link href="/admin?tab=quotations" className="inline-flex items-center gap-2 text-sm font-medium text-gold-dark hover:underline">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to quotations
          </Link>
          <QuotationPrintControls code={quote.code} expired={expired} />
        </div>

        <article className="overflow-hidden rounded-3xl border border-black/5 bg-white shadow-[0_30px_70px_-45px_rgba(7,22,41,0.5)] print:rounded-none print:border-0 print:shadow-none">
          <header className="flex flex-wrap items-start justify-between gap-4 border-b border-neutral-100 bg-ink px-7 py-6 text-white print:bg-white print:text-ink">
            <div className="flex items-center gap-3">
              <LogoMark className="h-12 w-12" />
              <div>
                <p className="font-serif text-2xl tracking-[0.28em]">PRITIVO</p>
                <p className="text-xs uppercase tracking-[0.4em] text-gold print:text-gold-dark">Your World. Your Way.</p>
              </div>
            </div>
            <div className="text-right text-xs leading-5 text-white/65 print:text-neutral-600">
              <p className="font-mono text-base font-semibold text-gold print:text-ink">{quote.code}</p>
              <p>Issued {fmtDate(quote.createdAt)}</p>
              <p className={expired ? "text-red-300 print:text-red-600" : ""}>Valid until {fmtDate(quote.validUntil)}{expired ? " (expired)" : ""}</p>
            </div>
          </header>

          <div className="grid gap-6 px-7 py-6 sm:grid-cols-2">
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Prepared for</h2>
              <p className="mt-1 font-serif text-2xl">{quote.customerName}</p>
              <p className="text-sm text-neutral-600">{quote.customerEmail}</p>
              <p className="text-sm text-neutral-600">{quote.customerPhone}</p>
            </div>
            <div className="sm:text-right">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Prepared by</h2>
              <p className="mt-1 font-serif text-xl">PRITIVO Travel</p>
              <p className="text-sm text-neutral-600">{SITE.location}</p>
              <p className="text-sm text-neutral-600">{SITE.phoneDisplay} · {SITE.email}</p>
            </div>
          </div>

          <div className="grid gap-4 border-y border-neutral-100 bg-ivory px-7 py-5 sm:grid-cols-3 print:bg-white">
            <div><p className="text-xs uppercase tracking-wider text-neutral-500">Destination</p><p className="text-sm font-medium">{quote.destination}</p></div>
            <div><p className="text-xs uppercase tracking-wider text-neutral-500">Travel dates</p><p className="text-sm font-medium">{quote.travelDates || "To be confirmed"}</p></div>
            <div><p className="text-xs uppercase tracking-wider text-neutral-500">Travellers</p><p className="text-sm font-medium">{quote.travelers}</p></div>
            {quote.hotelDetails && <div className="sm:col-span-3"><p className="text-xs uppercase tracking-wider text-neutral-500">Hotel details</p><p className="text-sm leading-6">{quote.hotelDetails}</p></div>}
            {quote.transportDetails && <div className="sm:col-span-3"><p className="text-xs uppercase tracking-wider text-neutral-500">Transport details</p><p className="text-sm leading-6">{quote.transportDetails}</p></div>}
          </div>

          <div className="grid gap-6 px-7 py-6 sm:grid-cols-2">
            <div>
              <h2 className="font-serif text-xl">Inclusions</h2>
              <ul className="mt-2 space-y-1.5 text-sm leading-6 text-neutral-600">
                {(quote.inclusions as string[]).map((i) => <li key={i} className="flex items-start gap-2"><Check className="mt-1 h-3.5 w-3.5 shrink-0 text-emerald-600" aria-hidden="true" /> {i}</li>)}
              </ul>
            </div>
            <div>
              <h2 className="font-serif text-xl">Exclusions</h2>
              <ul className="mt-2 space-y-1.5 text-sm leading-6 text-neutral-600">
                {(quote.exclusions as string[]).map((i) => <li key={i} className="flex items-start gap-2"><X className="mt-1 h-3.5 w-3.5 shrink-0 text-red-400" aria-hidden="true" /> {i}</li>)}
              </ul>
            </div>
          </div>

          <div className="mx-7 rounded-2xl border border-neutral-100 p-5">
            <h2 className="font-serif text-xl">Package price</h2>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-neutral-500">Subtotal</dt><dd>{formatMoney(quote.subtotalMinor, quote.currency)}</dd></div>
              <div className="flex justify-between"><dt className="text-neutral-500">Applicable taxes</dt><dd>{formatMoney(quote.taxesMinor, quote.currency)}</dd></div>
              <div className="flex justify-between border-t border-neutral-200 pt-2 font-serif text-2xl"><dt>Total package price</dt><dd>{formatMoney(quote.totalMinor, quote.currency)}</dd></div>
            </dl>
            <p className="mt-2 text-xs text-neutral-500">Prices are quoted in INR per this quotation and apply to {quote.travelers} traveller(s).</p>
          </div>

          <div className="grid gap-6 px-7 py-6 sm:grid-cols-2">
            <div><h2 className="font-serif text-xl">Payment terms</h2><p className="mt-2 text-sm leading-6 text-neutral-600">{quote.paymentTerms || "To be advised in writing."}</p></div>
            <div><h2 className="font-serif text-xl">Cancellation policy</h2><p className="mt-2 text-sm leading-6 text-neutral-600">{quote.cancellationPolicy || "As per PRITIVO's published policy."}</p></div>
          </div>

          {quote.notes && <p className="mx-7 mb-6 rounded-2xl bg-champagne/30 px-4 py-3 text-sm text-neutral-600"><strong>Notes:</strong> {quote.notes}</p>}

          <footer className="border-t border-neutral-100 px-7 py-5 text-xs leading-5 text-neutral-500">
            <p>
              This quotation is an offer to plan and arrange travel services. It is not a confirmed booking. A reservation is
              confirmed only after supplier confirmation and the payment conditions above are met.
            </p>
            <p className="mt-2">PRITIVO · {SITE.location} · WhatsApp/Call {SITE.phoneDisplay} · {SITE.email}</p>
          </footer>
        </article>
      </div>
    </section>
  );
}
