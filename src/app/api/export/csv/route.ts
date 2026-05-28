import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { resolveParts } from "@/lib/geometry";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const items = body.items as { modelId: number; params: Record<string, number>; qty?: number }[];

  const rows = [["SKU", "Detal", "L_mm", "W_mm", "T_mm", "Qty", "Material", "Decor", "Edge_top", "Edge_bot", "Edge_left", "Edge_right"]];

  for (const item of items || []) {
    const model = await db.furnitureModel.findUnique({
      where: { id: item.modelId },
      include: { modules: { include: { parts: { include: { material: true } } } } },
    });
    if (!model) continue;
    const dsl = JSON.parse(model.geometryDsl);
    const params = { ...JSON.parse(model.defaultParams), ...item.params };
    const resolved = resolveParts(dsl, params);
    const qty = item.qty || 1;

    for (const mod of model.modules) {
      for (const part of mod.parts) {
        const r = resolved.find((x) => x.code === part.code);
        if (!r || r.length <= 0 || r.width <= 0) continue;
        rows.push([
          model.sku, part.code, String(r.length), String(r.width), String(part.thickness),
          String(r.qty * qty),
          part.material.code, part.material.decor || "",
          r.edges.top || "", r.edges.bottom || "", r.edges.left || "", r.edges.right || "",
        ]);
      }
    }
  }

  const csv = rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n");
  return new Response("\uFEFF" + csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="cutting-list-${Date.now()}.csv"`,
    },
  });
}
