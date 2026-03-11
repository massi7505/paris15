// app/api/upload/route.ts
// Reçoit un fichier image, le sauvegarde dans public/uploads/
// et retourne l'URL publique : /uploads/products/42.webp
// Images accessibles via : https://monsite.com/uploads/products/42.webp

export const dynamic = "force-dynamic";

import { NextResponse }                       from "next/server";
import { nanoid }                             from "nanoid";
import { saveImageLocal, keyToSubDir }        from "@/lib/localImages";

export async function POST(req: Request) {
  try {
    const form    = await req.formData();
    const file    = form.get("file") as File | null;
    const keyHint = (form.get("key") as string | null) ?? `misc/${nanoid(8)}`;

    if (!file) {
      return NextResponse.json({ ok: false, error: "Fichier manquant" }, { status: 400 });
    }

    // Vérification taille (max 10 Mo)
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { ok: false, error: `Fichier trop volumineux (max 10 Mo, reçu ${(file.size / 1024 / 1024).toFixed(1)} Mo)` },
        { status: 413 }
      );
    }

    // Vérification type MIME
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { ok: false, error: "Seules les images sont acceptées" },
        { status: 400 }
      );
    }

    const buffer   = Buffer.from(await file.arrayBuffer());
    const mimeType = file.type || "image/webp";
    const ext      = mimeType.split("/")[1]?.replace("jpeg", "jpg") ?? "webp";

    // Déterminer sous-dossier et nom de fichier depuis la clé
    // keyHint peut être : "product:42", "slider:0", "misc/abc123"
    let sub  = "misc";
    let name = nanoid(8);

    if (keyHint.includes(":")) {
      const parsed = keyToSubDir(keyHint);
      sub  = parsed.sub;
      name = parsed.name;
    } else if (keyHint.includes("/")) {
      const parts = keyHint.split("/");
      sub  = parts[0] ?? "misc";
      name = parts[1] ?? nanoid(8);
    }

    const filename  = `${name}.${ext}`;
    const publicUrl = saveImageLocal(sub, filename, buffer);

    return NextResponse.json({ ok: true, url: publicUrl, key: keyHint });
  } catch (err) {
    console.error("[upload] Erreur:", err);
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
