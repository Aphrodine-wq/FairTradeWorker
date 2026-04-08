import type { MetadataRoute } from "next";
import { TRADES, SERVICE_LOCATIONS } from "@shared/lib/seo-data";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://fairtradeworker.com";

  // Core marketing pages
  const coreRoutes = [
    "",
    "/pricing",
    "/features",
    "/how-it-works",
    "/about",
    "/blog",
    "/careers",
    "/contact",
    "/faq",
    "/testimonials",
    "/fairprice",
    "/login",
    "/signup",
    "/privacy",
    "/terms",
  ];

  const coreEntries: MetadataRoute.Sitemap = coreRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : route === "/pricing" ? 0.9 : 0.7,
  }));

  // Services index
  const servicesIndex: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/services`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
  ];

  // Trade landing pages: /services/[trade]
  const tradeEntries: MetadataRoute.Sitemap = TRADES.map((trade) => ({
    url: `${baseUrl}/services/${trade.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.85,
  }));

  // Trade + location pages: /services/[trade]/[location]
  const tradeLocationEntries: MetadataRoute.Sitemap = TRADES.flatMap((trade) =>
    SERVICE_LOCATIONS.map((location) => ({
      url: `${baseUrl}/services/${trade.slug}/${location.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  );

  // Sub-service + location pages: /services/[trade]/[subservice]/[location]
  const subServiceEntries: MetadataRoute.Sitemap = TRADES.flatMap((trade) =>
    trade.subServices.flatMap((sub) =>
      SERVICE_LOCATIONS.map((location) => ({
        url: `${baseUrl}/services/${trade.slug}/${sub.slug}/${location.slug}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.75,
      })),
    ),
  );

  // Blog posts (static slugs)
  const blogSlugs = [
    "fair-pricing-construction",
    "ai-construction-estimating",
    "mississippi-launch",
    "escrow-payments-guide",
  ];

  const blogEntries: MetadataRoute.Sitemap = blogSlugs.map((slug) => ({
    url: `${baseUrl}/blog/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [
    ...coreEntries,
    ...servicesIndex,
    ...tradeEntries,
    ...tradeLocationEntries,
    ...subServiceEntries,
    ...blogEntries,
  ];
}
