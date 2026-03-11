// app/api/auth/route.ts
// Vérifie les identifiants admin directement en base MySQL.
// Les mots de passe sont hashés avec bcrypt (sécurité renforcée).

export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { checkRateLimit, getRateLimitInfo } from "@/lib/rateLimit";

export async function POST(req: Request) {
  // Toujours retourner du JSON — jamais laisser Next.js renvoyer une page HTML d'erreur
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

    let body: { username?: string; password?: string };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ ok: false, error: "Corps de requête invalide" }, { status: 400 });
    }

    const { username, password } = body;
    if (!username || !password) {
      return NextResponse.json({ ok: false, error: "Identifiants manquants" }, { status: 400 });
    }

    // Import dynamique pour capturer les erreurs de module (mysql2 non installé, etc.)
    let queryOne: typeof import("@/lib/mysql").queryOne;
    try {
      const mysqlModule = await import("@/lib/mysql");
      queryOne = mysqlModule.queryOne;
    } catch (moduleErr) {
      console.error("[auth] Impossible de charger mysql:", moduleErr);
      return NextResponse.json(
        { ok: false, error: "Erreur de configuration serveur. Contactez l'administrateur." },
        { status: 503 }
      );
    }

    let row: { username: string; password_hash: string } | null;
    try {
      row = await queryOne<{ username: string; password_hash: string }>(
        "SELECT username, password_hash FROM admin_credentials WHERE id = 1"
      );
    } catch (dbErr) {
      console.error("[auth] Erreur MySQL:", dbErr);
      return NextResponse.json(
        { ok: false, error: "Base de données inaccessible. Vérifiez la configuration MySQL." },
        { status: 503 }
      );
    }

    if (!row) {
      console.error("[auth] Table admin_credentials vide — exécutez le schema SQL.");
      return NextResponse.json(
        { ok: false, error: "Compte admin non configuré. Initialisez la base de données." },
        { status: 503 }
      );
    }

    const validUsername = row.username;
    const storedHash   = row.password_hash;

    if (username !== validUsername) {
      return NextResponse.json(
        { ok: false, error: "Identifiant ou mot de passe incorrect" },
        { status: 401 }
      );
    }

    // Comparaison bcrypt (résistant aux attaques timing)
    let bcrypt: typeof import("bcryptjs");
    try {
      bcrypt = (await import("bcryptjs")).default as unknown as typeof import("bcryptjs");
      if (!bcrypt || typeof bcrypt.compare !== "function") {
        bcrypt = await import("bcryptjs");
      }
    } catch {
      bcrypt = require("bcryptjs");
    }

    const isBcrypt = storedHash.startsWith("$2");
    let valid: boolean;

    try {
      valid = isBcrypt
        ? await bcrypt.compare(password, storedHash)
        : password === storedHash;
    } catch (bcryptErr) {
      console.error("[auth] Erreur bcrypt:", bcryptErr);
      // Hash invalide stocké en DB — comparaison directe en fallback
      valid = password === storedHash;
    }

    if (!valid) {
      return NextResponse.json(
        { ok: false, error: "Identifiant ou mot de passe incorrect" },
        { status: 401 }
      );
    }

    // Auto-upgrade : si le mot de passe était en clair, on le hashe automatiquement
    if (!isBcrypt) {
      try {
        const { execute } = await import("@/lib/mysql");
        const newHash = await bcrypt.hash(password, 12);
        await execute(
          "UPDATE admin_credentials SET password_hash = ? WHERE id = 1",
          [newHash]
        );
        console.log("[auth] Mot de passe migré vers bcrypt avec succès.");
      } catch (upgradeErr) {
        console.warn("[auth] Auto-hash upgrade failed:", upgradeErr);
      }
    }

    return NextResponse.json({ ok: true });

  } catch (err) {
    console.error("[auth] Erreur inattendue:", err);
    // CRITIQUE : toujours retourner du JSON valide, jamais laisser Next.js
    // renvoyer une page HTML qui casserait res.json() côté client
    return NextResponse.json(
      { ok: false, error: "Erreur serveur inattendue" },
      { status: 500 }
    );
  }
}
