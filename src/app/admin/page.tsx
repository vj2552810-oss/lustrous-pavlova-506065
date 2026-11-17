import type { Metadata } from "next";
import Link from "next/link";
import { desc } from "drizzle-orm";
import { BadgeIndianRupee, Building2, FileText, Inbox, Plus, ReceiptText, Users } from "lucide-react";
import { db } from "@/db";
import { customers as customersTable, enquiries as enquiriesTable, quotations as quotationsTable, suppliers as suppliersTable, tours as toursTable } from "@/db/schema";
import { adminConfigured, adminSetupMessage, isAdminAuthenticated } from "@/lib/admin/auth";
import { AdminUnlockForm } from "@/components/admin/AdminUnlockForm";
import { AdminTourTable } from "@/components/admin/AdminTourTable";
import { AdminEnquiryPipeline } from "@/components/admin/AdminEnquiryPipeline";
import { AdminCustomerList } from "@/components/admin/AdminCustomerList";
import { AdminSupplierManager } from "@/components/admin/AdminSupplierManager";
import { AdminSignOut } from "@/components/admin/AdminSignOut";
import { QuotationList } from "@/components/admin/QuotationList";
import { dashboardMetrics } from "@/lib/crm/enquiries";
import { listSuppliers } from "@/lib/crm/suppliers";
import { listQuotations } from "@/lib/crm/quotations";
import { ensureToursSeeded, tourStats } from "@/lib/tours/service";
import { formatMoney } from "@/lib/hotels/format";

export const metadata: Metadata = { title: "Tour Manager (Staff)", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const TABS = ["overview", "enquiries", "customers", "suppliers", "quotations", "tours"] as const;
type Tab = (typeof TABS)[number];

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ tab?: string | string[] }> }) {
  const configured = adminConfigured();
  const authed = await isAdminAuthenticated();

  if (!authed) {
    return (
      <section className="min-h-screen bg-ivory pb-24 pt-32">
        <div className="mx-auto max-w-lg px-5 sm:px-8">
          <AdminUnlockForm configured={configured} setupMessage={adminSetupMessage()} />
        </div>
      </section>
    );
  }

  await ensureToursSeeded().catch(() => undefined);
  const sp = await searchParams;
  const tabRaw = Array.isArray(sp.tab) ? sp.tab[0] : sp.tab;
  const tab: Tab = (TABS as readonly string[]).includes(tabRaw ?? "") ? (tabRaw as Tab) : "overview";

  // Every panel degrades independently so a database problem never blanks the
  // whole dashboard; the outage banner explains what is missing.
  const [metrics, stats, suppliers, quotations, customerRows, recentEnquiries, adminTours] = await Promise.all([
    dashboardMetrics().catch(() => null),
    tourStats().catch(() => []),
    listSuppliers().catch(() => []),
    listQuotations(100).catch(() => []),
    db.select().from(customersTable).orderBy(desc(customersTable.updatedAt)).limit(100).catch(() => [] as typeof customersTable.$inferSelect[]),
    db.select().from(enquiriesTable).orderBy(desc(enquiriesTable.createdAt)).limit(200).catch(() => [] as typeof enquiriesTable.$inferSelect[]),
    db.select().from(toursTable).orderBy(desc(toursTable.updatedAt)).limit(200).catch(() => [] as typeof toursTable.$inferSelect[]),
  ]);
  const dataUnavailable = metrics === null;
  const safeMetrics = metrics ?? {
    total: 0, new: 0, pendingQuotes: 0, awaitingSupplier: 0, confirmed: 0, cancelled: 0, completed: 0,
    customers: 0, suppliers: 0, quotations: 0, revenueMinor: 0, recent: [] as typeof recentEnquiries,
  };

  const history: Record<number, typeof recentEnquiries> = {};
  for (const e of recentEnquiries) {
    if (e.customerId) (history[e.customerId] ??= []).push(e);
  }

  const published = stats.filter((s) => s.published).reduce((sum, s) => sum + s.value, 0);
  const tourTotal = stats.length ? stats.reduce((sum, s) => sum + s.value, 0) : adminTours.length;

  const cards = [
    { icon: Inbox, label: "Total enquiries", value: String(safeMetrics.total), sub: `${safeMetrics.new} new` },
    { icon: ReceiptText, label: "Pending quotations", value: String(safeMetrics.pendingQuotes), sub: `${safeMetrics.quotations} issued` },
    { icon: Users, label: "Confirmed bookings", value: String(safeMetrics.confirmed), sub: `${safeMetrics.awaitingSupplier} awaiting supplier` },
    { icon: BadgeIndianRupee, label: "Revenue (paid)", value: formatMoney(safeMetrics.revenueMinor), sub: "Recorded payments only" },
    { icon: Building2, label: "Suppliers", value: String(safeMetrics.suppliers), sub: `${suppliers.filter((s) => s.verificationStatus === "verified").length} verified` },
    { icon: FileText, label: "Tours", value: `${published}/${tourTotal}`, sub: "published / total" },
  ];

  return (
    <section className="min-h-screen bg-ivory pb-24 pt-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow text-gold-dark">Staff only · server-authorised</p>
            <h1 className="mt-2 font-serif text-4xl">Travel management dashboard</h1>
            <p className="mt-1 text-sm text-neutral-500">
              Enquiries, quotations, CRM, suppliers, bookings and the tour catalogue. Guests never see this area and never
              need an account.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link href="/admin/quotations/new" className="inline-flex items-center gap-2 rounded-full border border-neutral-300 bg-white px-4 py-2.5 text-sm font-semibold hover:border-gold">
              <ReceiptText className="h-4 w-4" aria-hidden="true" /> New quotation
            </Link>
            <Link href="/admin/tours/new" className="bg-gold-gradient inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold text-ink">
              <Plus className="h-4 w-4" aria-hidden="true" /> New tour
            </Link>
            <AdminSignOut />
          </div>
        </div>

        <ul className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {cards.map((c) => (
            <li key={c.label} className="rounded-2xl border border-black/5 bg-white p-5">
              <c.icon className="h-5 w-5 text-gold" aria-hidden="true" />
              <p className="mt-3 font-serif text-2xl">{c.value}</p>
              <p className="text-sm font-medium text-ink">{c.label}</p>
              <p className="text-xs text-neutral-500">{c.sub}</p>
            </li>
          ))}
        </ul>

        <div className="mt-7 flex flex-wrap gap-2" role="tablist" aria-label="Dashboard sections">
          {TABS.map((t) => (
            <Link
              key={t}
              href={`/admin?tab=${t}`}
              role="tab"
              aria-selected={tab === t}
              className={`rounded-full border px-4 py-2 text-sm font-medium capitalize ${tab === t ? "border-ink bg-ink text-white" : "border-neutral-200 bg-white text-neutral-600 hover:border-gold"}`}
            >
              {t}
            </Link>
          ))}
          <Link href="/tours" className="ml-auto rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-medium hover:border-gold">
            View public site →
          </Link>
        </div>

        <div className="mt-4 rounded-3xl border border-black/5 bg-white p-5 sm:p-6">
          {tab === "overview" && (
            <div className="grid gap-6 lg:grid-cols-2">
              <div>
                <h2 className="font-serif text-2xl">Recent activity</h2>
                <ul className="mt-3 space-y-2">
                  {safeMetrics.recent.map((e) => (
                    <li key={e.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-ivory px-3 py-2 text-sm">
                      <span className="min-w-0">
                        <span className="font-medium text-ink">{e.destination || e.subject || e.kind}</span>
                        <span className="ml-2 text-xs text-neutral-500">{e.name} · {e.code ?? ""}</span>
                      </span>
                      <span className="text-xs capitalize text-neutral-500">{e.status.replace(/_/g, " ")}</span>
                    </li>
                  ))}
                  {safeMetrics.recent.length === 0 && <li className="rounded-xl border border-dashed border-neutral-300 px-3 py-6 text-center text-sm text-neutral-500">No enquiries yet.</li>}
                </ul>
              </div>
              <div>
                <h2 className="font-serif text-2xl">Pipeline</h2>
                <ul className="mt-3 space-y-2">
                  {[
                    ["New enquiries", safeMetrics.new],
                    ["Contacted / quoted", safeMetrics.pendingQuotes],
                    ["Awaiting supplier", safeMetrics.awaitingSupplier],
                    ["Confirmed", safeMetrics.confirmed],
                    ["Completed", safeMetrics.completed],
                    ["Cancelled", safeMetrics.cancelled],
                  ].map(([label, value]) => (
                    <li key={label as string} className="flex items-center justify-between rounded-xl bg-ivory px-3 py-2 text-sm">
                      <span className="text-neutral-600">{label as string}</span>
                      <span className="font-semibold text-ink">{value as number}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-4 rounded-xl border border-gold/30 bg-champagne/30 px-3 py-2 text-xs leading-5 text-neutral-600">
                  Revenue counts only enquiries whose payment status is recorded as <strong>paid</strong>. Nothing is
                  counted as confirmed without supplier confirmation.
                </p>
              </div>
            </div>
          )}

          {dataUnavailable && (
            <p role="alert" className="mb-4 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              Dashboard data is temporarily unavailable — the database could not be reached. Existing records have not
              been changed. Check <code className="rounded bg-white px-1">DATABASE_URL</code> and reload.
            </p>
          )}

          {tab === "enquiries" && <AdminEnquiryPipeline enquiries={recentEnquiries} suppliers={suppliers} />}
          {tab === "customers" && <AdminCustomerList customers={customerRows} history={history} />}
          {tab === "suppliers" && <AdminSupplierManager suppliers={suppliers} />}
          {tab === "quotations" && <QuotationList quotations={quotations} />}
          {tab === "tours" && <AdminTourTable tours={adminTours} />}
        </div>

        <p className="mt-6 text-xs leading-5 text-neutral-500">
          Sessions expire after 12 hours and every action is written to the audit log (without secrets). To revoke access,
          change or remove <code className="rounded bg-white px-1">ADMIN_PASSCODE</code> and redeploy. Public visitors cannot
          reach any endpoint under <code className="rounded bg-white px-1">/api/admin</code>.
        </p>
      </div>
    </section>
  );
}
