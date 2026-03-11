/** @type {import('next').NextConfig} */
const nextConfig = {
  // ─── Hostinger Node.js ────────────────────────────────────────────────────
  // ⚠️  NE PAS utiliser output:"standalone" avec un server.js custom.
  //     Le server.js custom utilise require('next') depuis node_modules.
  //     Pour Hostinger : npm install + npm run build + pm2 start ecosystem.config.js
  // output: "standalone",  // ← désactivé intentionnellement

  // ─── Packages Node.js natifs (ne pas bundler par Webpack) ────────────────
  // mysql2, bcryptjs, sharp et @aws-sdk nécessitent l'environnement Node.js natif.
  // Sans cela, Next.js tente de les bundler et échoue avec des erreurs de build.
  serverExternalPackages: ["mysql2", "bcryptjs", "sharp"],

  // ─── Optimisations ────────────────────────────────────────────────────────
  compress: true,
  poweredByHeader: false, // Ne pas exposer "X-Powered-By: Next.js"

  // ─── Images ───────────────────────────────────────────────────────────────
  images: {
    remotePatterns: [
      // Images Unsplash (défaut / démo)
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "**.unsplash.com" },
    ],
    // Les images locales /uploads/* sont servies statiquement par Next.js
    // Aucune configuration supplémentaire nécessaire pour les URLs relatives.
    dangerouslyAllowSVG: true,
    formats: ["image/avif", "image/webp"],
  },

  // ─── Taille maximale du body (uploads images) ────────────────────────────
  // Hostinger limite parfois le body à 1MB par défaut.
  // On autorise jusqu'à 10MB pour les uploads d'images compressées.
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
      // Cache long pour les assets statiques Next.js
      {
        source: "/_next/static/(.*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
