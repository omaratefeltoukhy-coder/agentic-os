import type { MetadataRoute } from "next";
import { allSeoParams } from "@/lib/seo";

const BASE_URL = process.env.NEXTAUTH_URL ?? "https://gulfpaws.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ["/", "/browse", "/login", "/signup"].map((path) => ({
    url: `${BASE_URL}${path}`,
    changeFrequency: "daily" as const,
    priority: path === "/" ? 1 : 0.7,
  }));

  const seoRoutes = allSeoParams().map(({ service, city }) => ({
    url: `${BASE_URL}/find/${service}/${city}`,
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  return [...staticRoutes, ...seoRoutes];
}
