import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { CreateModelSchema } from "@/lib/validators";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const room = url.searchParams.get("room");
  const style = url.searchParams.get("style");
  const q = url.searchParams.get("q");

  const models = await db.furnitureModel.findMany({
    where: { status: "published" },
    include: { category: true },
    orderBy: { id: "asc" },
  });

  const filtered = models.filter((m: any) => {
    if (q && !m.nameUz.toLowerCase().includes(q.toLowerCase()) && !m.sku.toLowerCase().includes(q.toLowerCase())) return false;
    if (style) {
      const tags = JSON.parse(m.styleTags || "[]") as string[];
      if (!tags.includes(style)) return false;
    }
    if (room) {
      const compat = JSON.parse(m.roomCompat || "{}") as Record<string, number>;
      if (!compat[room] || compat[room] < 0.3) return false;
    }
    return true;
  });

  return NextResponse.json({ models: filtered });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = CreateModelSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", issues: parsed.error.issues }, { status: 400 });
  }
  const {
    sku, nameUz, categoryCode,
    paramSchema, defaultParams, geometryDsl,
    bboxW, bboxD, bboxH,
    baseCostUzs, styleTags, roomCompat, source,
  } = parsed.data;

  const cat = await db.furnitureCategory.findUnique({ where: { code: categoryCode } });
  if (!cat) return NextResponse.json({ error: "Kategoriya topilmadi" }, { status: 400 });

  // SKU uniqueness
  const existing = await db.furnitureModel.findUnique({ where: { sku } });
  if (existing) return NextResponse.json({ error: "Bunday SKU mavjud" }, { status: 409 });

  // Find default materials
  const materials = await db.material.findMany();
  if (!materials.length) return NextResponse.json({ error: "Material yo'q. Avval seed.ts ishga tushiring." }, { status: 500 });
  const defaultMat = materials.find((m: any) => m.thickness === 18) || materials[0];
  const backMat = materials.find((m: any) => m.thickness === 3) || defaultMat;

  const model = await db.furnitureModel.create({
    data: {
      sku, nameUz, description: null,
      categoryId: cat.id,
      paramSchema: JSON.stringify(paramSchema),
      defaultParams: JSON.stringify(defaultParams),
      geometryDsl: JSON.stringify(geometryDsl),
      bboxW: bboxW || 600, bboxD: bboxD || 560, bboxH: bboxH || 720,
      baseCostUzs: baseCostUzs || 0,
      styleTags: JSON.stringify(styleTags || []),
      roomCompat: JSON.stringify(roomCompat || {}),
      source: source || "manual",
    },
  });

  // Seed module + atomic parts from DSL
  const mod = await db.module.create({
    data: { modelId: model.id, code: "main", role: "carcass", transform: JSON.stringify({ pos: [0, 0, 0], rot: [0, 0, 0] }) },
  });
  const dslParts = (geometryDsl.parts || []) as any[];
  for (const p of dslParts) {
    const isBack = p.code === "back" || p.code === "drawer_bottom";
    await db.atomicPart.create({
      data: {
        moduleId: mod.id,
        code: p.code,
        lengthExpr: String(p.L),
        widthExpr: String(p.W),
        thickness: Number(p.T) || 18,
        materialId: isBack ? backMat.id : defaultMat.id,
        edgeTop: p.edges?.all || p.edges?.top || null,
        edgeBottom: p.edges?.all || p.edges?.bottom || null,
        edgeLeft: p.edges?.all || p.edges?.left || null,
        edgeRight: p.edges?.all || p.edges?.right || p.edges?.front || null,
        qtyExpr: String(p.qty ?? 1),
      },
    });
  }

  return NextResponse.json({ model });
}
