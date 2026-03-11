// lib/localImages.ts
// Stockage local des images sur Hostinger dans public/uploads/
// Images accessibles via : https://monsite.com/uploads/<filename>
//
// Structure des dossiers :
//   public/uploads/products/   → images produits
//   public/uploads/slider/     → slides hero
//   public/uploads/promos/     → images promos
//   public/uploads/categories/ → icônes catégories
//   public/uploads/misc/       → autres (favicon, etc.)

import fs   from "fs";
import path from "path";

// Dossier racine des uploads (doit être dans public/ pour être servi statiquement)
const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");

/** Crée le dossier s'il n'existe pas */
function ensureDir(dir: string): void {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/** Initialise tous les sous-dossiers au démarrage */
export function initUploadsDir(): void {
  for (const sub of ["products", "slider", "promos", "categories", "misc"]) {
    ensureDir(path.join(UPLOADS_DIR, sub));
  }
}

/**
 * Sauvegarde un buffer image sur le disque.
 * @param subDir  Sous-dossier : "products" | "slider" | "promos" | "categories" | "misc"
 * @param filename  Nom de fichier avec extension ex: "42.webp"
 * @param buffer  Buffer du fichier image
 * @returns  URL publique accessible depuis le navigateur
 */
export function saveImageLocal(
  subDir: string,
  filename: string,
  buffer: Buffer
): string {
  const dir = path.join(UPLOADS_DIR, subDir);
  ensureDir(dir);

  const filePath = path.join(dir, filename);
  fs.writeFileSync(filePath, buffer);

  // URL publique relative → servie par Next.js depuis /public
  return `/uploads/${subDir}/${filename}`;
}

/**
 * Supprime un fichier image du disque.
 * @param publicUrl  URL publique ex: "/uploads/products/42.webp"
 */
export function deleteImageLocal(publicUrl: string): void {
  try {
    // Extraire le chemin relatif depuis l'URL publique
    const relativePath = publicUrl.replace(/^\/uploads\//, "");
    const filePath = path.join(UPLOADS_DIR, relativePath);

    // Sécurité : vérifier que le fichier est bien dans UPLOADS_DIR
    if (!filePath.startsWith(UPLOADS_DIR)) {
      console.warn("[localImages] Tentative de suppression hors du dossier uploads:", filePath);
      return;
    }

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (e) {
    console.warn("[localImages] Erreur suppression:", e);
  }
}

/**
 * Extrait le sous-dossier et le nom de fichier depuis une clé d'image.
 * Exemples :
 *   "product:42"   → { sub: "products", name: "42" }
 *   "slider:0"     → { sub: "slider",   name: "0"  }
 *   "promo:3"      → { sub: "promos",   name: "3"  }
 *   "category:tomate" → { sub: "categories", name: "tomate" }
 */
export function keyToSubDir(key: string): { sub: string; name: string } {
  const [type, id] = key.split(":");
  const map: Record<string, string> = {
    product:  "products",
    slider:   "slider",
    promo:    "promos",
    category: "categories",
    misc:     "misc",
    favicon:  "misc",
  };
  return {
    sub:  map[type] ?? "misc",
    name: id ?? key,
  };
}
