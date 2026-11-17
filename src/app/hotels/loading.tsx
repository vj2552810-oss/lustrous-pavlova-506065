export default function LoadingHotels() {
  return (
    <div className="min-h-[70vh] bg-ivory pb-24 pt-36">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="h-3 w-32 animate-pulse rounded-full bg-neutral-200" />
        <div className="mt-4 h-10 w-2/3 animate-pulse rounded-2xl bg-neutral-200" />
        <div className="mt-8 h-32 animate-pulse rounded-3xl bg-white" />
        <div className="mt-6 space-y-5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-56 animate-pulse rounded-3xl border border-black/5 bg-white" />
          ))}
        </div>
        <p className="mt-6 text-center text-sm text-neutral-500" role="status" aria-live="polite">
          Checking availability with our hotel partner…
        </p>
      </div>
    </div>
  );
}
