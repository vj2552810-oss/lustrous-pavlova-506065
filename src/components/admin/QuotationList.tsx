import Link from "next/link";
import { ReceiptText } from "lucide-react";
import { formatMoney } from "@/lib/hotels/format";
import type { QuotationRecord } from "@/lib/crm/types";

export function QuotationList({ quotations }: { quotations: QuotationRecord[] }) {
  if (quotations.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-neutral-300 px-4 py-10 text-center">
        <ReceiptText className="mx-auto h-8 w-8 text-gold" aria-hidden="true" />
        <p className="mt-3 text-sm text-neutral-500">No quotations yet.</p>
        <Link href="/admin/quotations/new" className="mt-4 inline-flex rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-gold hover:text-ink">
          Generate your first quotation
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead>
          <tr className="border-b border-neutral-200 text-xs uppercase tracking-wider text-neutral-500">
            <th className="py-2 pr-3">Code</th>
            <th className="py-2 pr-3">Customer</th>
            <th className="py-2 pr-3">Destination</th>
            <th className="py-2 pr-3">Total</th>
            <th className="py-2 pr-3">Valid until</th>
            <th className="py-2 text-right">Document</th>
          </tr>
        </thead>
        <tbody>
          {quotations.map((q) => {
            const expired = q.validUntil.getTime() < Date.now();
            return (
              <tr key={q.id} className="border-b border-neutral-100">
                <td className="py-3 pr-3 font-mono text-xs">{q.code}</td>
                <td className="py-3 pr-3">
                  <p className="font-medium text-ink">{q.customerName}</p>
                  <p className="text-xs text-neutral-500">{q.customerPhone}</p>
                </td>
                <td className="py-3 pr-3 text-neutral-600">{q.destination}</td>
                <td className="py-3 pr-3 font-semibold">{formatMoney(q.totalMinor, q.currency)}</td>
                <td className={`py-3 pr-3 text-xs ${expired ? "text-red-600" : "text-neutral-500"}`}>
                  {q.validUntil.toLocaleDateString("en-IN", { dateStyle: "medium" })}
                  {expired && " · expired"}
                </td>
                <td className="py-3 text-right">
                  <Link href={`/admin/quotations/${q.code}`} className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 px-3 py-1.5 text-xs font-medium hover:border-gold">
                    <ReceiptText className="h-3.5 w-3.5" aria-hidden="true" /> Open / PDF
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
