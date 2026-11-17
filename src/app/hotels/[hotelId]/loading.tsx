export default function LoadingHotel() {
  return (
    <div className="min-h-[70vh] bg-ivory pt-32">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="h-64 animate-pulse rounded-3xl bg-ink/10" />
        <div className="mt-8 grid gap-8 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-7">
            <div className="h-48 animate-pulse rounded-3xl bg-white" />
            <div className="h-64 animate-pulse rounded-3xl bg-white" />
          </div>
          <div className="h-80 animate-pulse rounded-3xl bg-white lg:col-span-5" />
        </div>
        <p className="mt-6 text-center text-sm text-neutral-500" role="status" aria-live="polite">Loading hotel details…</p>
      </div>
    </div>
  );
}
