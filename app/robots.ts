import type { MetadataRoute } from "next";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  (process.env.NODE_ENV === "production" ? "https://recto.cloud" : "http://localhost:3000");

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/f/",
          "/privacy",
          "/terms",
          "/cookies",
        ],
        disallow: [
          "/api/",
          "/dashboard/",
          "/forms/",
          "/sign-in",
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
