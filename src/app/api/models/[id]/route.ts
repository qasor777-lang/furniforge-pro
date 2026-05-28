import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const numId = parseInt(params.id, 10);
  const model = await db.furnitureModel.findUnique({
    where: { id: numId },
    include: {
      category: true,
      modules: { include: { parts: { include: { material: true } } } },
    },
  });
  if (!model) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ model });
}
