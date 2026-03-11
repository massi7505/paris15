// app/api/images/route.ts
// Gestion des images stockées en MySQL (base64) avec migration vers fichiers locaux.
// Les nouvelles images passent par /api/upload → public/uploads/ (URL directe).
// Cette route garde la compatibilité pour les anciennes images base64 en MySQL.

export const dynamic = "force-dynamic";

import { NextResponse }                         from "next/server";
import { queryOne, execute }                    from "@/lib/mysql";
import { saveImageLocal, deleteImageLocal, keyToSubDir } from "@/lib/localImages";

async function ensureTable() {
  await execute(`
    CREATE TABLE IF NOT EXISTS images (
      img_key    VARCHAR(200) NOT NULL PRIMARY KEY,
      data_url   LONGTEXT     NOT NULL DEFAULT '',
      local_url  VARCHAR(500),
      mime_type  VARCHAR(60)  NOT NULL DEFAULT 'image/webp',
      byte_size  INT UNSIGNED NOT NULL DEFAULT 0,
      created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_key_prefix (img_key(50))
    ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
  `).catch(() => {});
}

/** GET /api/images?key=product:42 — sert l'image (compatibilité anciens __idb:) */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const key = searchParams.get("key");
    if (!key) return NextResponse.json({ ok: false, error: "key manquant" }, { status: 400 });

    await ensureTable();
    const row = await queryOne<any>(
      "SELECT data_url, mime_type, local_url FROM images WHERE img_key = ?",
      [key]
    );
    if (!row) return NextResponse.json({ ok: false, data: null });

    // Si l'image est déjà en fichier local, retourner l'URL directement
    if (row.local_url) {
      return NextResponse.json({ ok: true, data: row.local_url });
    }

    // Sinon retourner la base64 (ancienne image)
    return NextResponse.json({ ok: true, data: row.data_url || null });
  } catch (err) {
    console.error("[images] GET error:", err);
    return NextResponse.json({ ok: false, data: null });
  }
}

/** POST /api/images  body: { key, dataUrl } — compatibilité ancien système + migration vers fichier local */
export async function POST(req: Request) {
  try {
    const { key, dataUrl } = await req.json();
    if (!key || !dataUrl)
      return NextResponse.json({ ok: false, error: "key ou dataUrl manquant" }, { status: 400 });

    await ensureTable();

    const mimeMatch = dataUrl.match(/^data:([^;]+);base64,/);
    const mimeType  = mimeMatch?.[1] ?? "image/webp";
    const ext       = mimeType.split("/")[1]?.replace("jpeg", "jpg") ?? "webp";
    const byteSize  = Math.round((dataUrl.length * 3) / 4);

    // Tenter de sauvegarder en fichier local (préféré)
    let localUrl: string | null = null;
    try {
      const base64 = dataUrl.split(",")[1];
      const buffer = Buffer.from(base64, "base64");
      const { sub, name } = keyToSubDir(key);
      const filename = `${name}.${ext}`;
      localUrl = saveImageLocal(sub, filename, buffer);
    } catch (e) {
      console.warn("[images] Sauvegarde locale échouée, fallback MySQL base64:", e);
    }

    await execute(
      `INSERT INTO images (img_key, data_url, mime_type, byte_size, local_url)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         data_url=VALUES(data_url), mime_type=VALUES(mime_type),
         byte_size=VALUES(byte_size), local_url=VALUES(local_url)`,
      [key, localUrl ? "" : dataUrl, mimeType, byteSize, localUrl]
    );

    return NextResponse.json({ ok: true, url: localUrl });
  } catch (err) {
    console.error("[images] POST error:", err);
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

/** DELETE /api/images?key=product:42 */
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const key = searchParams.get("key");
    if (!key) return NextResponse.json({ ok: false }, { status: 400 });

    await ensureTable();
    const row = await queryOne<any>("SELECT local_url FROM images WHERE img_key = ?", [key]);

    // Supprimer le fichier local si présent
    if (row?.local_url) {
      deleteImageLocal(row.local_url);
    }

    await execute("DELETE FROM images WHERE img_key = ?", [key]);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[images] DELETE error:", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
