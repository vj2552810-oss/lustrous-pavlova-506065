import type { Metadata } from "next";
import { Info } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { DestinationExplorer } from "@/components/maps/DestinationExplorer";
import { DESTINATIONS } from "@/lib/maps/destinations";
import { placesConfigured } from "@/lib/maps/places";
import { mapsIntegrationState } from "@/lib/maps/config";

export const metadata: Metadata = {
  title: "Explore Destinations on the Map — India & Worldwide",
  description:
    "Explore PRITIVO destinations across India and worldwide on an interactive map, then jump straight into live hotel search results for your dates. No account needed.",
  alternates: { canonical: "/explore" },
};

export default function ExplorePage() {
  const maps = mapsIntegrationState();
  return (
    <>
      <PageHero
        eyebrow="Destination explorer"
        title={<>Find your place on the <span className="text-gold-gradient italic">map.</span></>}
        description="Browse destinations across India and around the world, then open hotel results for your dates — no account required."
      />
      <section className="bg-ivory py-14">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          {!maps.browserKeyConfigured && (
            <div className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950">
              <Info className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" aria-hidden="true" />
              <p>
                The interactive map needs a Google Maps browser key. Destination cards, “Get directions” links and hotel
                search all still work — set <code>NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> to enable the map.
              </p>
            </div>
          )}
          <DestinationExplorer destinations={DESTINATIONS} nearbyAvailable={placesConfigured()} />
          <p className="mt-8 text-center text-xs leading-5 text-neutral-500">
            Destination pins show approximate city centres for orientation. Hotel prices and availability always come from
            our hotel provider, not from Google Maps.
          </p>
        </div>
      </section>
    </>
  );
}
