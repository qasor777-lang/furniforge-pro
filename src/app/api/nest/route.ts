import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { resolveParts } from "@/lib/geometry";
import { type NestPart } from "@/lib/nesting";
import { nestPortfolio } from "@/lib/nesting-genetic";

interface NestRequestItem { modelId: number; params: Record<string, number>; qty?: number; }

export async function POST(req: NextRequest) {
  const body = (await req.json()) as { items: NestRequestItem[] };
  if (!body?.items?.length) return NextResponse.json({ error: "items required" }, { status: 400 });

  // Resolve all parts grouped by material+thickness
  type Bucket = { materialCode: string; thickness: number; sheetW: number; sheetH: number; parts: NestPart[] };
  const buckets = new Map<string, Bucket>();
  let cuttingList: any[] = [];

  for (const item of body.items) {
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
        const mat = part.material;
        const key = `${mat.code}_${part.thickness}`;
        if (!buckets.has(key)) {
          buckets.set(key, { materialCode: mat.code, thickness: part.thickness, sheetW: mat.sheetW, sheetH: mat.sheetH, parts: [] });
        }
        buckets.get(key)!.parts.push({
          id: `M${model.id}_P${part.id}`,
          code: `${model.sku}/${part.code}`,
          length: r.length,
          width: r.width,
          qty: r.qty * qty,
          grain: mat.hasGrain ? "X" : "none",
        });
        cuttingList.push({
          modelSku: model.sku,
          partCode: part.code,
          length: r.length,
          width: r.width,
          thickness: part.thickness,
          qty: r.qty * qty,
          material: mat.code,
          decor: mat.decor,
          edges: r.edges,
        });
      }
    }
  }

  const sheets: any[] = [];
  for (const [, bucket] of buckets) {
    const result = nestPortfolio(bucket.parts, {
      width: bucket.sheetW, height: bucket.sheetH, thickness: bucket.thickness, materialCode: bucket.materialCode,
    });
    sheets.push({
      materialCode: bucket.materialCode,
      thickness: bucket.thickness,
      sheetWidth: bucket.sheetW,
      sheetHeight: bucket.sheetH,
      ...result,
    });
  }

  return NextResponse.json({
    cuttingList,
    nesting: sheets,
    summary: {
      totalParts: cuttingList.reduce((a, b) => a + b.qty, 0),
      totalSheets: sheets.reduce((a, b) => a + b.totalSheets, 0),
      avgUtilization: sheets.length ? sheets.reduce((a, b) => a + b.avgUtilization, 0) / sheets.length : 0,
    },
  });
}
