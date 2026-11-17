export default function LoadingPackages() {
  return (
    <div className="min-h-[70vh] bg-ivory pb-24 pt-36">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="h-10 w-1/2 animate-pulse rounded-2xl bg-neutral-200" />
        <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-80 animate-pulse rounded-3xl bg-white" />
          ))}
        </div>
        <p className="mt-6 text-center text-sm text-neutral-500" role="status" aria-live="polite">Loading packages…</p>
      </div>
    </div>
  );
}
