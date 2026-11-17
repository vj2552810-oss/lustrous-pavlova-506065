import Link from "next/link";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <section className="flex min-h-[80vh] items-center justify-center bg-ink px-5 pt-24 text-center text-white">
      <div>
        <Compass className="mx-auto h-14 w-14 text-gold" strokeWidth={1.3} aria-hidden="true" />
        <p className="eyebrow mt-6 text-gold">404 · Off the map</p>
        <h1 className="mt-4 font-serif text-5xl">This page took a detour.</h1>
        <p className="mx-auto mt-4 max-w-md text-white/65">The page you&apos;re looking for doesn&apos;t exist. Let&apos;s get you back on route.</p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/" className="bg-gold-gradient rounded-full px-7 py-3.5 font-semibold text-ink">Back to home</Link>
          <Link href="/packages" className="rounded-full border border-white/30 px-7 py-3.5 font-semibold hover:bg-white hover:text-ink">Explore packages</Link>
        </div>
      </div>
    </section>
  );
}
