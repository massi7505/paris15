// lib/cache.ts — Cache mémoire pour /api/store
// Réduit les requêtes MySQL de ~90% en mémorisant le résultat 60 secondes.
// Usage :
//   GET /api/store  → getCached() avant la query MySQL
//   POST /api/store → invalidateCache() après la sauvegarde

const TTL_MS = 60_000; // 60 secondes

interface CacheEntry {
  data: unknown;
  ts:   number;
}

let cache: CacheEntry | null = null;

/**
 * Retourne les données en cache si elles sont encore valides, sinon null.
 */
export function getCached<T = unknown>(): T | null {
  if (cache && Date.now() - cache.ts < TTL_MS) {
    return cache.data as T;
  }
  return null;
}

/**
 * Stocke de nouvelles données dans le cache avec le timestamp actuel.
 */
export function setCache(data: unknown): void {
  cache = { data, ts: Date.now() };
}

/**
 * Invalide le cache immédiatement (à appeler après chaque écriture en base).
 */
export function invalidateCache(): void {
  cache = null;
}

/**
 * Retourne le temps restant en secondes avant expiration, ou 0 si expiré.
 */
export function getCacheTTL(): number {
  if (!cache) return 0;
  const remaining = TTL_MS - (Date.now() - cache.ts);
  return remaining > 0 ? Math.ceil(remaining / 1000) : 0;
}
