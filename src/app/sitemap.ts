import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://fairtradeworker.com";

  const routes = [
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
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : route === "/pricing" ? 0.9 : 0.7,
  }));
}
