import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const idOrCode = params.id;
  const id = parseInt(idOrCode, 10);
  const set = !isNaN(id)
    ? await db.roomSet.findUnique({ where: { id } })
    : await db.roomSet.findUnique({ where: { code: idOrCode } });
  if (!set) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Resolve item SKUs to actual model details so the studio can place them
  let items: any[] = [];
  try { items = JSON.parse(set.itemsJson); } catch {}
  const skus = items.map((i: any) => i.sku);
  const models = await db.furnitureModel.findMany({
    where: { sku: { in: skus } },
    select: {
      id: true, sku: true, nameUz: true, geometryDsl: true, defaultParams: true,
      paramSchema: true, bboxW: true, bboxD: true, bboxH: true, baseCostUzs: true, thumbnailUrl: true,
    },
  });
  const bySku = new Map<string, any>(models.map((m: any) => [m.sku, m]));
  const resolved = items
    .map((it: any) => {
      const m = bySku.get(it.sku);
      if (!m) return null;
      return { ...it, model: m };
    })
    .filter(Boolean);

  return NextResponse.json({ set, items: resolved });
}
