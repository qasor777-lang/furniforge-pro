import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const id = parseInt(params.id);
  const analysis = await db.roomAnalysis.findUnique({
    where: { id },
    include: { recommendations: { orderBy: { rank: "asc" }, take: 6 } },
  });
  if (!analysis) return NextResponse.json({ error: "not found" }, { status: 404 });

  // attach model info to recs
  const modelIds = analysis.recommendations.map((r) => r.modelId);
  const models = await db.furnitureModel.findMany({ where: { id: { in: modelIds } } });
  const recsFull = analysis.recommendations.map((r) => {
    const m = models.find((x) => x.id === r.modelId);
    return { ...r, model: m };
  });
  return NextResponse.json({ analysis, recommendations: recsFull });
}
