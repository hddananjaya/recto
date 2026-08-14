import type { MetadataRoute } from "next";

import { TRY_FORM_PATH } from "@/components/landing/constants";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "http://localhost:3000";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", TRY_FORM_PATH, "/playground"],
        disallow: ["/api/", "/forms/", "/dashboard", "/sign-in"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
