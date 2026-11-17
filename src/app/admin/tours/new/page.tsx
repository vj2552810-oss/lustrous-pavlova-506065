import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminUnlockInline } from "@/components/admin/AdminUnlockInline";
import { TourEditor } from "@/components/admin/TourEditor";
import { adminConfigured, isAdminAuthenticated } from "@/lib/admin/auth";

export const metadata: Metadata = { title: "New tour (Staff)", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function NewTourPage() {
  if (!(await isAdminAuthenticated())) {
    if (!adminConfigured()) redirect("/admin");
    return <AdminUnlockInline />;
  }
  return (
    <section className="min-h-screen bg-ivory pb-24 pt-32">
      <div className="mx-auto max-w-4xl px-5 sm:px-8">
        <p className="eyebrow text-gold-dark">Staff only</p>
        <h1 className="mt-2 font-serif text-4xl">Create a tour</h1>
        <p className="mt-1 mb-6 text-sm text-neutral-500">Publish a new destination or special package. Unpublished tours stay hidden from guests.</p>
        <TourEditor />
      </div>
    </section>
  );
}
