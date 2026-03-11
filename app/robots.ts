// app/robots.ts
import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://woodiz.fr";
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/admin/" },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
