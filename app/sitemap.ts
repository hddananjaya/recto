import type { MetadataRoute } from "next";

import { TRY_FORM_PATH } from "@/components/landing/constants";
import { prisma } from "@/lib/prisma";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  (process.env.NODE_ENV === "production" ? "https://recto.cloud" : "http://localhost:3000");

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${siteUrl}${TRY_FORM_PATH}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/f/watzbe`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${siteUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${siteUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${siteUrl}/cookies`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];

  try {
    const publishedForms = await prisma.form.findMany({
      where: {
        isPublished: true,
        isPlayground: false,
      },
      select: {
        id: true,
        updatedAt: true,
      },
      take: 50000,
    });

    const knownUrls = new Set(staticRoutes.map((r) => r.url));

    const dynamicRoutes: MetadataRoute.Sitemap = publishedForms
      .map((form) => ({
        url: `${siteUrl}/f/${form.id}`,
        lastModified: form.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      }))
      .filter((route) => !knownUrls.has(route.url));

    return [...staticRoutes, ...dynamicRoutes];
  } catch {
    // Fallback gracefully if database is unreachable during build
    return staticRoutes;
  }
}
