export default function LoadingFlights() {
  return (
    <div className="min-h-[70vh] bg-ivory pb-24 pt-36">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="h-10 w-1/2 animate-pulse rounded-2xl bg-neutral-200" />
        <div className="mt-8 grid gap-8 lg:grid-cols-12">
          <div className="h-96 animate-pulse rounded-3xl bg-white lg:col-span-7" />
          <div className="space-y-6 lg:col-span-5">
            <div className="h-56 animate-pulse rounded-3xl bg-white" />
            <div className="h-40 animate-pulse rounded-3xl bg-white" />
          </div>
        </div>
        <p className="mt-6 text-center text-sm text-neutral-500" role="status" aria-live="polite">Loading flight planning…</p>
      </div>
    </div>
  );
}
