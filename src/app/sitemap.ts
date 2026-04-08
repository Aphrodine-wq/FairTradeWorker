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
    "/new-way",
    "/mississippi-contractor-resources",
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

  // Sub-service index pages: /services/[trade]/[subservice]
  const subServiceIndexEntries: MetadataRoute.Sitemap = TRADES.flatMap((trade) =>
    trade.subServices.map((sub) => ({
      url: `${baseUrl}/services/${trade.slug}/${sub.slug}`,
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

  // City hub pages: /services/city/[city]
  const cityHubEntries: MetadataRoute.Sitemap = SERVICE_LOCATIONS
    .filter((loc) => loc.profile != null)
    .map((loc) => ({
      url: `${baseUrl}/services/city/${loc.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.9,
    }));

  // Neighborhood pages: /services/city/[city]/[neighborhood]
  const neighborhoodEntries: MetadataRoute.Sitemap = SERVICE_LOCATIONS
    .filter((loc) => loc.profile != null)
    .flatMap((loc) =>
      loc.profile!.neighborhoods.map((hood) => ({
        url: `${baseUrl}/services/city/${loc.slug}/${hood.slug}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.8,
      })),
    );

  // Blog posts (static slugs)
  const blogSlugs = [
    "roof-replacement-cost-mississippi",
    "hvac-installation-cost-mississippi",
    "how-much-kitchen-remodel-mississippi",
    "fence-cost-mississippi",
    "termite-damage-mississippi",
    "hvac-maintenance-mississippi-summer",
    "bathroom-remodel-cost-guide",
    "hiring-contractor-checklist",
    "killing-lead-fees",
    "storm-damage-roof-mississippi",
    "hunter-voice-ai",
    "energy-efficient-home-mississippi",
    "escrow-payments-guide",
    "first-time-homeowner-mississippi",
    "mississippi-launch",
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
    ...subServiceIndexEntries,
    ...subServiceEntries,
    ...cityHubEntries,
    ...neighborhoodEntries,
    ...blogEntries,
  ];
}
