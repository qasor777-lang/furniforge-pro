import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const project = await db.project.findUnique({ where: { id: parseInt(params.id) } });
  if (!project) return NextResponse.json({ error: "not found" }, { status: 404 });

  let roomAnalysis = null;
  if (project.roomAnalysisId) {
    roomAnalysis = await db.roomAnalysis.findUnique({ where: { id: project.roomAnalysisId } });
  }
  return NextResponse.json({ project, roomAnalysis });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await db.project.delete({ where: { id: parseInt(params.id) } });
  return NextResponse.json({ ok: true });
}
