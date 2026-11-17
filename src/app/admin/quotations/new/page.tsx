import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { AdminUnlockInline } from "@/components/admin/AdminUnlockInline";
import { AdminQuotationForm } from "@/components/admin/AdminQuotationForm";
import { adminConfigured, isAdminAuthenticated } from "@/lib/admin/auth";
import { listEnquiriesAdvanced } from "@/lib/crm/enquiries";

export const metadata: Metadata = { title: "New quotation (Staff)", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function NewQuotationPage({
  searchParams,
}: {
  searchParams: Promise<{ enquiry?: string | string[] }>;
}) {
  if (!(await isAdminAuthenticated())) {
    if (!adminConfigured()) redirect("/admin");
    return <AdminUnlockInline />;
  }
  const sp = await searchParams;
  const enquiryParam = Array.isArray(sp.enquiry) ? sp.enquiry[0] : sp.enquiry;
  const enquiries = await listEnquiriesAdvanced(undefined, 60).catch(() => []);
  const selected = enquiryParam ? String(enquiryParam) : "";

  return (
    <section className="min-h-screen bg-ivory pb-24 pt-32">
      <div className="mx-auto max-w-4xl px-5 sm:px-8">
        <Link href="/admin?tab=quotations" className="inline-flex items-center gap-2 text-sm font-medium text-gold-dark hover:underline">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to quotations
        </Link>
        <p className="eyebrow mt-4 text-gold-dark">Staff only</p>
        <h1 className="mt-2 font-serif text-4xl">Generate a quotation</h1>
        <p className="mt-1 mb-6 text-sm text-neutral-500">
          Amounts entered here are stored server-side and shown only in this staff area and in the document you send.
        </p>
        <div className="rounded-3xl border border-black/5 bg-white p-6 sm:p-8">
          <AdminQuotationForm enquiries={enquiries} key={selected} />
          {selected && (
            <p className="mt-4 text-xs text-neutral-500">
              Pre-selected enquiry #{selected} — customer details are filled automatically when you pick it in the form.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
