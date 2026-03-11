/** @type {import('next').NextConfig} */
const path = require("path");

const nextConfig = {
  // ─── Hostinger Node.js — mode standalone requis ───────────────────────────
  output: "standalone",

  // ─── Packages Node.js natifs (ne pas bundler par Webpack) ────────────────
  serverExternalPackages: ["mysql2", "bcryptjs", "sharp"],

  // ─── Optimisations ────────────────────────────────────────────────────────
  compress: true,
  poweredByHeader: false,

  // ─── Images ───────────────────────────────────────────────────────────────
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "**.unsplash.com" },
    ],
    dangerouslyAllowSVG: true,
    formats: ["image/avif", "image/webp"],
  },

  // ─── Taille maximale du body (uploads images) ────────────────────────────
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },

  // ─── En-têtes de sécurité HTTP ────────────────────────────────────────────
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options",  value: "nosniff" },
          { key: "X-Frame-Options",         value: "SAMEORIGIN" },
          { key: "X-XSS-Protection",        value: "1; mode=block" },
          { key: "Referrer-Policy",         value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
      {
        source: "/_next/static/(.*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },

  // ─── Alias @/ pour Linux/Hostinger ──────────────────────────────────────
  webpack(config) {
    config.resolve.alias["@"] = path.resolve(__dirname);
    return config;
  },
};

module.exports = nextConfig;
