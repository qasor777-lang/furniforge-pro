import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const t0 = Date.now();
  try {
    const [models, sets, projects] = await Promise.all([
      db.furnitureModel.count(),
      db.roomSet.count(),
      db.project.count(),
    ]);
    return NextResponse.json({
      ok: true,
      uptime: process.uptime(),
      latencyMs: Date.now() - t0,
      counts: { models, sets, projects },
      version: "0.2.0",
      time: new Date().toISOString(),
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message, latencyMs: Date.now() - t0 }, { status: 500 });
  }
}
