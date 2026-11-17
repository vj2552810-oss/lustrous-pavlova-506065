import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AdminUnlockInline } from "@/components/admin/AdminUnlockInline";
import { TourEditor } from "@/components/admin/TourEditor";
import { adminConfigured, isAdminAuthenticated } from "@/lib/admin/auth";
import { getTourById, type TourRecord } from "@/lib/tours/service";

export const metadata: Metadata = { title: "Edit tour (Staff)", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function EditTourPage({ params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) {
    if (!adminConfigured()) redirect("/admin");
    return <AdminUnlockInline />;
  }
  const { id } = await params;
  const tourId = Number(id);
  if (!Number.isInteger(tourId)) notFound();
  let tour: TourRecord | null = null;
  let lookupFailed = false;
  try {
    tour = await getTourById(tourId);
  } catch (err) {
    console.error("Tour lookup failed", err instanceof Error ? err.message : "");
    lookupFailed = true;
  }
  if (!tour) {
    if (lookupFailed) {
      return (
        <section className="min-h-screen bg-ivory px-5 pb-24 pt-32">
          <div className="mx-auto max-w-lg rounded-3xl border border-amber-300 bg-amber-50 p-8 text-center">
            <h1 className="font-serif text-3xl text-amber-950">Tour editor unavailable</h1>
            <p className="mt-3 text-sm leading-6 text-amber-900">
              The tour could not be loaded because the database could not be reached. No changes were made. Check the
              connection and reload.
            </p>
            <Link href="/admin?tab=tours" className="mt-6 inline-flex rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white">
              Back to tours
            </Link>
          </div>
        </section>
      );
    }
    notFound();
  }

  return (
    <section className="min-h-screen bg-ivory pb-24 pt-32">
      <div className="mx-auto max-w-4xl px-5 sm:px-8">
        <p className="eyebrow text-gold-dark">Staff only</p>
        <h1 className="mt-2 font-serif text-4xl">Edit “{tour.name}”</h1>
        <p className="mt-1 mb-6 text-sm text-neutral-500">Changes go live immediately for published tours.</p>
        <TourEditor tour={tour} />
      </div>
    </section>
  );
}
