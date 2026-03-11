// lib/rateLimit.ts — Protection contre les attaques brute-force
// Version légère sans Redis, basée sur une Map en mémoire.
// Usage recommandé : route /api/auth uniquement.
//
// Exemple d'utilisation dans app/api/auth/route.ts :
//
//   import { checkRateLimit } from '@/lib/rateLimit';
//
//   const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
//   if (!checkRateLimit(ip)) {
//     return NextResponse.json({ error: 'Trop de tentatives. Réessayez dans 1 minute.' }, { status: 429 });
//   }

interface RateLimitEntry {
  count: number;
  reset: number; // timestamp UNIX (ms) de réinitialisation
}

const attempts = new Map<string, RateLimitEntry>();

// Nettoyage automatique des entrées expirées toutes les 5 minutes
// pour éviter une fuite mémoire sur un serveur long-running.
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of attempts.entries()) {
      if (now > entry.reset) attempts.delete(key);
    }
  }, 5 * 60 * 1000);
}

/**
 * Vérifie si l'IP est sous la limite autorisée.
 *
 * @param ip        Adresse IP du client
 * @param max       Nombre maximum de tentatives (défaut : 5)
 * @param windowMs  Fenêtre de temps en ms (défaut : 60 000 = 1 minute)
 * @returns true si la requête est autorisée, false si elle doit être bloquée
 */
export function checkRateLimit(
  ip: string,
  max:      number = 5,
  windowMs: number = 60_000,
): boolean {
  const now   = Date.now();
  const entry = attempts.get(ip);

  // Fenêtre expirée ou première tentative → réinitialiser le compteur
  if (!entry || now > entry.reset) {
    attempts.set(ip, { count: 1, reset: now + windowMs });
    return true;
  }

  // Limite atteinte → bloquer
  if (entry.count >= max) return false;

  // Incrémenter le compteur
  entry.count++;
  return true;
}

/**
 * Retourne les informations de rate limit pour une IP donnée.
 * Utile pour ajouter des headers Retry-After dans la réponse 429.
 */
export function getRateLimitInfo(ip: string): { remaining: number; resetIn: number } {
  const now   = Date.now();
  const entry = attempts.get(ip);

  if (!entry || now > entry.reset) {
    return { remaining: 5, resetIn: 0 };
  }

  return {
    remaining: Math.max(0, 5 - entry.count),
    resetIn:   Math.ceil((entry.reset - now) / 1000), // secondes
  };
}
