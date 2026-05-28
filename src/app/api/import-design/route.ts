import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { importDesignFromUrl } from "@/lib/design-import";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const body = await req.json();
  const url = body.url as string;
  if (!url || !/^https?:\/\//.test(url)) {
    return NextResponse.json({ error: "valid url required" }, { status: 400 });
  }

  const platform = detectPlatform(url);

  try {
    const { result, isMock, latencyMs } = await importDesignFromUrl(url);

    // Save as queued AI import
    const saved = await db.aiImportedDesign.create({
      data: {
        sourcePlatform: platform,
        sourceUrl: url,
        rawImageUrl: url,
        visionOutput: JSON.stringify(result),
        parametricJson: JSON.stringify({
          category: result.detectedCategory,
          dimensions: result.estimatedDimensionsMm,
          parameters: result.parameters,
        }),
        styleTags: JSON.stringify(result.styleTags || []),
        confidence: result.confidence,
        status: "parsed",
      },
    });

    return NextResponse.json({ id: saved.id, isMock, latencyMs, result });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "import failed" }, { status: 500 });
  }
}

function detectPlatform(url: string): string {
  if (/pinterest\./.test(url)) return "pinterest";
  if (/houzz\./.test(url)) return "houzz";
  if (/behance\./.test(url)) return "behance";
  if (/instagram\./.test(url)) return "instagram";
  return "web";
}

// Promote imported design to FurnitureModel (admin action)
export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { id } = body;
  const imp = await db.aiImportedDesign.findUnique({ where: { id: parseInt(id) } });
  if (!imp) return NextResponse.json({ error: "not found" }, { status: 404 });

  const result = JSON.parse(imp.visionOutput);
  const cat = await db.furnitureCategory.findUnique({ where: { code: result.detectedCategory } });
  if (!cat) return NextResponse.json({ error: "unknown category" }, { status: 400 });

  // Pick a similar existing model as template
  const template = await db.furnitureModel.findFirst({ where: { categoryId: cat.id }, include: { modules: { include: { parts: true } } } });
  if (!template) return NextResponse.json({ error: "no template" }, { status: 500 });

  const dims = result.estimatedDimensionsMm;
  const newSku = `${result.suggestedSku || `AI-${cat.code.slice(0, 3).toUpperCase()}-${imp.id}`}`;

  const created = await db.furnitureModel.create({
    data: {
      categoryId: cat.id,
      sku: newSku,
      nameUz: result.nameUz,
      paramSchema: template.paramSchema,
      defaultParams: JSON.stringify({
        ...JSON.parse(template.defaultParams),
        W: dims.width, H: dims.height, D: dims.depth,
        ...(result.parameters || {}),
      }),
      geometryDsl: template.geometryDsl,
      styleTags: imp.styleTags,
      roomCompat: template.roomCompat,
      bboxW: dims.width, bboxD: dims.depth, bboxH: dims.height,
      source: "ai_generated",
      baseCostUzs: template.baseCostUzs,
    },
  });

  // Copy parts
  for (const mod of template.modules) {
    const newMod = await db.module.create({
      data: { modelId: created.id, code: mod.code, role: mod.role, transform: mod.transform },
    });
    for (const p of mod.parts) {
      await db.atomicPart.create({
        data: {
          moduleId: newMod.id, code: p.code,
          lengthExpr: p.lengthExpr, widthExpr: p.widthExpr, thickness: p.thickness,
          materialId: p.materialId, grain: p.grain,
          edgeTop: p.edgeTop, edgeBottom: p.edgeBottom, edgeLeft: p.edgeLeft, edgeRight: p.edgeRight,
          qtyExpr: p.qtyExpr,
        },
      });
    }
  }

  await db.aiImportedDesign.update({ where: { id: imp.id }, data: { status: "published", promotedModelId: created.id } });

  return NextResponse.json({ modelId: created.id, sku: newSku });
}
