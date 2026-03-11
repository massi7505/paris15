// app/sitemap.ts
import { MetadataRoute } from "next";

// Static product data for sitemap generation (mirrors default store data)
// In a real Next.js app with DB access you'd import from your data layer
const PRODUCT_SLUGS = [
  "margherita", "regina", "napolitaine", "pecheur", "calzone",
  "5-fromages", "diablo", "vegetarienne", "tartiflette", "norvegienne",
  "auvergnate", "fermiere", "chevre-figue", "3-fondus",
  "mountain", "truffeta", "burratissima", "nutella",
  "coca-cola", "eau-petillante", "jus-d-orange",
];

const CATEGORY_SLUGS = [
  "tomate", "creme", "sig", "dessert", "boissons",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://woodiz.fr";
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/mentions-legales`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/cgu`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  // Per-product SEO pages (anchor-based for SPA, or real pages if SSG)
  const productRoutes: MetadataRoute.Sitemap = PRODUCT_SLUGS.map((slug) => ({
    url: `${baseUrl}/#produit-${slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // Per-category routes
  const categoryRoutes: MetadataRoute.Sitemap = CATEGORY_SLUGS.map((slug) => ({
    url: `${baseUrl}/#categorie-${slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...productRoutes, ...categoryRoutes];
}
