import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const room = sp.get("room") || "";
  const style = sp.get("style") || "";
  const featured = sp.get("featured");
  const where: any = {};
  if (room) where.roomType = room;
  if (featured === "1") where.isFeatured = true;

  const sets = await db.roomSet.findMany({
    where,
    orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
    take: 200,
  });

  let filtered = sets;
  if (style) {
    filtered = sets.filter((s) => {
      try { return (JSON.parse(s.styleTags) as string[]).includes(style); }
      catch { return false; }
    });
  }
  return NextResponse.json({ sets: filtered });
}
