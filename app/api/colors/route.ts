// app/api/colors/route.ts
// CRUD pour la table product_colors (palette de couleurs badges produits)

import { NextResponse } from "next/server";
import { query, execute } from "@/lib/mysql";

/** GET /api/colors — Liste toutes les couleurs A → Z */
export async function GET() {
  try {
    const rows = await query<any>(
      "SELECT * FROM product_colors ORDER BY label ASC"
    );
    return NextResponse.json({ ok: true, data: rows });
  } catch (err) {
    console.error("[woodiz/api/colors] GET error:", err);
    return NextResponse.json({ ok: false, data: [] });
  }
}

/** POST /api/colors — Crée ou met à jour une couleur { label, hex_value, text_color, is_default } */
export async function POST(req: Request) {
  try {
    const { id, label, hex_value, text_color, is_default } = await req.json();
    if (!label || !hex_value)
      return NextResponse.json({ ok: false, error: "label et hex_value requis" }, { status: 400 });

    if (id) {
      await execute(
        `UPDATE product_colors SET label=?, hex_value=?, text_color=?, is_default=? WHERE id=?`,
        [label, hex_value, text_color ?? "#FFFFFF", is_default ? 1 : 0, id]
      );
    } else {
      await execute(
        `INSERT INTO product_colors (label, hex_value, text_color, is_default)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           label=VALUES(label), text_color=VALUES(text_color), is_default=VALUES(is_default)`,
        [label, hex_value, text_color ?? "#FFFFFF", is_default ? 1 : 0]
      );
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[woodiz/api/colors] POST error:", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

/** DELETE /api/colors?id=5 */
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ ok: false, error: "id manquant" }, { status: 400 });
    await execute("DELETE FROM product_colors WHERE id = ?", [id]);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[woodiz/api/colors] DELETE error:", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
