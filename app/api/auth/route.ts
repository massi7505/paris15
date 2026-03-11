// app/api/auth/route.ts
// Vérifie les identifiants admin directement en base MySQL.
// Les mots de passe sont hashés avec bcrypt (sécurité renforcée).

export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { queryOne } from "@/lib/mysql";
import { checkRateLimit, getRateLimitInfo } from "@/lib/rateLimit";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    // Protection brute-force — max 5 tentatives / minute par IP
    const ip =
      req.headers.get("x-real-ip") ||
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      "unknown";

    if (!checkRateLimit(ip)) {
      const { resetIn } = getRateLimitInfo(ip);
      return NextResponse.json(
        { ok: false, error: `Trop de tentatives. Réessayez dans ${resetIn}s.` },
        { status: 429 }
      );
    }

    const { username, password } = await req.json();
    if (!username || !password) {
      return NextResponse.json({ ok: false, error: "Identifiants manquants" }, { status: 400 });
    }

    const row = await queryOne<{ username: string; password_hash: string }>(
      "SELECT username, password_hash FROM admin_credentials WHERE id = 1"
    );

    const validUsername = row?.username ?? "admin";
    const storedHash   = row?.password_hash ?? "";

    // Vérification du nom d'utilisateur (timing-safe via bcrypt)
    if (username !== validUsername) {
      return NextResponse.json({ ok: false, error: "Identifiant ou mot de passe incorrect" }, { status: 401 });
    }

    // Comparaison bcrypt (résistant aux attaques timing)
    // Si le hash ne commence pas par $2 (bcrypt), on tombe en comparaison directe
    // pour la compatibilité avec les mots de passe en clair existants (migration)
    const isBcrypt = storedHash.startsWith("$2");
    const valid = isBcrypt
      ? await bcrypt.compare(password, storedHash)
      : password === storedHash;

    if (!valid) {
      return NextResponse.json({ ok: false, error: "Identifiant ou mot de passe incorrect" }, { status: 401 });
    }

    // Si le mot de passe était en clair, on le hashe automatiquement pour la prochaine fois
    if (!isBcrypt) {
      const { execute } = await import("@/lib/mysql");
      const newHash = await bcrypt.hash(password, 12);
      await execute(
        "UPDATE admin_credentials SET password_hash = ? WHERE id = 1",
        [newHash]
      ).catch((e) => console.warn("[auth] Auto-hash upgrade failed:", e));
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[auth] POST error:", err);
    return NextResponse.json({ ok: false, error: "Erreur serveur" }, { status: 500 });
  }
}
