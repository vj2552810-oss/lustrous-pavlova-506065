import type { ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { PageHero } from "./PageHero";

export function LegalPage({ title, updated, children }: { title: string; updated: string; children: ReactNode }) {
  return (
    <>
      <PageHero eyebrow="Legal" title={title} description={`Draft — last updated ${updated}`} />
      <section className="bg-ivory py-16">
        <div className="mx-auto max-w-3xl px-5 sm:px-8">
          <div role="note" className="flex items-start gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-5 text-sm leading-6 text-amber-900">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
            <p>
              <strong>DRAFT — FOR REVIEW BEFORE PUBLICATION.</strong> This is editable starter content and is not legal
              advice. It should be reviewed by a qualified professional and adapted to PRITIVO&apos;s actual business
              practices before being relied upon. Where this page conflicts with your written quotation, the quotation
              prevails.
            </p>
          </div>
          <article className="prose-legal mt-8 rounded-3xl border border-black/5 bg-white p-7 sm:p-10">{children}</article>
        </div>
      </section>
    </>
  );
}
