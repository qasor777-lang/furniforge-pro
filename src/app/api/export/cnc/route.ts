import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { resolveParts } from "@/lib/geometry";
import { buildDrillingPlan, partToGcode } from "@/lib/cnc";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const items = body.items as { modelId: number; params?: any; qty?: number }[];

  // Build a single ZIP-like text bundle (actually concatenated G-code files separated by markers,
  // since Node fetch Response can't easily bundle ZIP without external deps).
  const files: { name: string; content: string }[] = [];
  let totalHoles = 0;

  for (const item of items || []) {
    const m = await db.furnitureModel.findUnique({ where: { id: item.modelId } });
    if (!m) continue;
    const dsl = JSON.parse(m.geometryDsl);
    const params = { ...JSON.parse(m.defaultParams), ...(item.params || {}) };
    const resolved = resolveParts(dsl, params);
    const plan = buildDrillingPlan(resolved);

    for (const p of plan) {
      const gcode = partToGcode(p);
      totalHoles += p.holes.length;
      files.push({ name: `${m.sku}_${p.partCode}.nc`, content: gcode });
    }
  }

  // Concatenate as a single .nc file with section headers (for routers that accept multi-program files)
  const combined = files
    .map((f) => `; ====== FILE: ${f.name} ======\n${f.content}\n`)
    .join("\n\n");

  const summary = `; FurniForge Pro CNC Bundle\n; Files: ${files.length}\n; Total holes: ${totalHoles}\n; Generated: ${new Date().toISOString()}\n\n`;

  return new Response(summary + combined, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": `attachment; filename="cnc-bundle-${Date.now()}.nc"`,
    },
  });
}
