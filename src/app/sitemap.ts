import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";
import { listTours } from "@/lib/tours/service";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes: [string, number][] = [
    ["", 1],
    ["/tours", 0.95],
    ["/destinations", 0.9],
    ["/services", 0.9],
    ["/hotels", 0.95],
    ["/flights", 0.8],
    ["/my-booking", 0.6],
    ["/explore", 0.8],
    ["/packages", 0.9],
    ["/plan-trip", 0.9],
    ["/about", 0.7],
    ["/contact", 0.8],
    ["/faq", 0.6],
    ["/privacy-policy", 0.3],
    ["/terms", 0.3],
    ["/cancellation-refund-policy", 0.3],
    ["/cookie-policy", 0.3],
  ];
  const now = new Date();

  let tourRoutes: MetadataRoute.Sitemap = [];
  try {
    const tours = await listTours({});
    tourRoutes = tours.map((t) => ({
      url: `${SITE.url}/tours/${t.slug}`,
      lastModified: t.updatedAt ?? now,
      changeFrequency: "monthly" as const,
      priority: t.featured ? 0.85 : 0.7,
    }));
  } catch {
    tourRoutes = [];
  }

  return [
    ...routes.map(([path, priority]) => ({
      url: `${SITE.url}${path}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority,
    })),
    ...tourRoutes,
  ];
}
