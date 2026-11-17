export default function LoadingBooking() {
  return (
    <div className="min-h-[70vh] bg-ivory pb-24 pt-32">
      <div className="mx-auto max-w-5xl px-5 sm:px-8">
        <div className="h-3 w-28 animate-pulse rounded-full bg-neutral-200" />
        <div className="mt-4 h-12 w-64 animate-pulse rounded-2xl bg-neutral-200" />
        <div className="mt-6 h-20 animate-pulse rounded-3xl bg-white" />
        <div className="mt-8 grid gap-6 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-7">
            <div className="h-56 animate-pulse rounded-3xl bg-white" />
            <div className="h-40 animate-pulse rounded-3xl bg-white" />
          </div>
          <div className="h-64 animate-pulse rounded-3xl bg-white lg:col-span-5" />
        </div>
        <p className="mt-6 text-center text-sm text-neutral-500" role="status" aria-live="polite">Loading your booking…</p>
      </div>
    </div>
  );
}
