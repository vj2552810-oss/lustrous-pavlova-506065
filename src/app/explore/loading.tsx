export default function LoadingExplore() {
  return (
    <div className="min-h-[70vh] bg-ivory pb-24 pt-36">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="h-3 w-40 animate-pulse rounded-full bg-neutral-200" />
        <div className="mt-4 h-10 w-2/3 animate-pulse rounded-2xl bg-neutral-200" />
        <div className="mt-8 grid gap-8 lg:grid-cols-12">
          <div className="h-[26rem] animate-pulse rounded-3xl bg-white lg:col-span-7" />
          <div className="h-80 animate-pulse rounded-3xl bg-white lg:col-span-5" />
        </div>
        <p className="mt-6 text-center text-sm text-neutral-500" role="status" aria-live="polite">Preparing the destination map…</p>
      </div>
    </div>
  );
}
