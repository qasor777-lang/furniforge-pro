import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { CreateProjectSchema } from "@/lib/validators";

export async function GET() {
  const projects = await db.project.findMany({ orderBy: { updatedAt: "desc" }, take: 50 });
  return NextResponse.json({ projects });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = CreateProjectSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", issues: parsed.error.issues }, { status: 400 });
  }
  const { id, name, roomAnalysisId, layoutJson, roomSize } = parsed.data;

  const roomData = roomSize
    ? {
        roomW: Math.round(roomSize.roomW || 4000),
        roomD: Math.round(roomSize.roomD || 5000),
        roomH: Math.round(roomSize.roomH || 2700),
      }
    : {};

  if (id) {
    const updated = await db.project.update({
      where: { id },
      data: { name, roomAnalysisId, layoutJson: JSON.stringify(layoutJson || []), ...roomData },
    });
    return NextResponse.json({ project: updated });
  }

  const created = await db.project.create({
    data: {
      name: name || "Untitled Project",
      roomAnalysisId: roomAnalysisId || null,
      layoutJson: JSON.stringify(layoutJson || []),
      ...roomData,
    },
  });
  return NextResponse.json({ project: created });
}
