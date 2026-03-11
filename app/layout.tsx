// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import StoreHydration from "@/components/client/StoreHydration";
import ImageLoader from "@/components/client/ImageLoader";
import HydrationGuard from "@/components/client/HydrationGuard";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://woodiz.fr";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "WOODIZ – Pizzeria Artisanale · Paris 15ème | 93 Rue Lecourbe",
    template: "%s | WOODIZ Pizzeria Paris 15ème",
  },
  description:
    "WOODIZ, pizzeria artisanale au cœur de Paris 15ème. Pâte maison fermentée 48h, four à bois 450°C, ingrédients frais du marché. Livraison rapide, menu midi dès 10,90€.",
  keywords:
    "pizzeria paris 15, woodiz, pizza artisanale paris, pizza napolitaine paris, pâte maison, four à bois, livraison pizza paris 15, rue lecourbe pizza, meilleure pizza paris",
  authors: [{ name: "WOODIZ", url: SITE_URL }],
  creator: "WOODIZ",
  publisher: "WOODIZ",
  category: "Restaurant",
  openGraph: {
    type: "website",
    locale: "fr_FR",
    alternateLocale: ["en_GB", "it_IT", "es_ES"],
    url: SITE_URL,
    siteName: "WOODIZ Pizzeria",
    title: "WOODIZ – Pizzeria Artisanale · Paris 15ème",
    description:
      "Pâte maison fermentée 48h, four à bois 450°C. La vraie pizza napolitaine au cœur de Paris 15ème. Livraison rapide, commande en ligne.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "WOODIZ Pizzeria Artisanale Paris 15ème",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "WOODIZ – Pizzeria Artisanale · Paris 15ème",
    description:
      "La vraie pizza napolitaine au cœur de Paris 15ème. Four à bois, pâte maison fermentée 48h.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  alternates: {
    canonical: SITE_URL,
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || "",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* Preload hero image for LCP */}
        <link
          rel="preload"
          as="image"
          href="https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=1200"
          fetchPriority="high"
        />
      </head>
      <body suppressHydrationWarning>
        <StoreHydration />
        <ImageLoader />
        <HydrationGuard>
          {children}
        </HydrationGuard>
      </body>
    </html>
  );
}
