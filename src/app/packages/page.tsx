import type { Metadata } from "next";
import Link from "next/link";
import { Info } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { PackagesExplorer } from "@/components/PackagesExplorer";
import { PACKAGES } from "@/lib/packages";

export const metadata: Metadata = {
  title: "Tour Packages from Belagavi — Goa, Kerala, Kashmir, Dubai, Bali & more",
  description:
    "Explore customisable holiday packages from Belagavi: Goa, Coorg, Kerala, Manali, Kashmir, Rajasthan, Dubai, Thailand, Bali and Singapore. Request a personalised quote from PRITIVO.",
  alternates: { canonical: "/packages" },
};

export default async function PackagesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[]; region?: string | string[] }>;
}) {
  const sp = await searchParams;
  const q = (Array.isArray(sp.q) ? sp.q[0] : sp.q)?.slice(0, 80) ?? "";
  const r = Array.isArray(sp.region) ? sp.region[0] : sp.region;
  const region = r === "domestic" || r === "international" ? r : "all";

  return (
    <>
      <PageHero
        eyebrow="Tour packages"
        title={<>Ten destinations. <span className="text-gold-gradient italic">Endless ways</span> to see them.</>}
        description="Suggested itineraries you can tailor completely — change the duration, hotels, pace or add another destination."
        image={PACKAGES[4].image}
        imageAlt="Shikara on a calm lake in Kashmir"
      />
      <section className="bg-ivory pb-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <PackagesExplorer initialQuery={q} initialRegion={region} />
          <div className="mt-14 flex items-start gap-3 rounded-2xl border border-gold/30 bg-champagne/40 p-5 text-sm leading-6 text-neutral-600">
            <Info className="mt-0.5 h-5 w-5 shrink-0 text-gold-dark" aria-hidden="true" />
            <p>
              <strong>About pricing:</strong> Prices depend on travel dates, hotel category, group size and availability, so
              we show <em>“Request a Quote”</em> until a price has been verified. Durations are suggestions. All final
              prices, inclusions and terms are confirmed in your written quotation.{" "}
              <Link href="/faq" className="font-medium text-gold-dark underline">Read the FAQ</Link>.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
