// lib/serverImages.ts
// Compatibilité pour le flow StoreHydration (client uniquement).
// Les nouvelles images sont désormais des URLs directes (/uploads/...) — pas de base64.

/** Construit l'URL de base absolue pour les appels fetch côté client */
function apiBase(): string {
  if (typeof window !== "undefined") return "";
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

export async function saveImageToServer(key: string, dataUrl: string): Promise<string | null> {
  try {
    const res = await fetch(`${apiBase()}/api/images`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, dataUrl }),
    });
    const json = await res.json();
    if (!res.ok || !json.ok) {
      console.error(`[serverImages] Échec upload key="${key}":`, json.error ?? res.status);
      return null;
    }
    return json.url ?? null;
  } catch (e) {
    console.error(`[serverImages] Erreur réseau key="${key}":`, e);
    return null;
  }
}

export async function getImageFromServer(key: string): Promise<string | null> {
  try {
    const res  = await fetch(`${apiBase()}/api/images?key=${encodeURIComponent(key)}`);
    const json = await res.json();
    return json?.ok && json?.data ? json.data : null;
  } catch (e) {
    console.warn("[serverImages] getImageFromServer failed:", e);
    return null;
  }
}
