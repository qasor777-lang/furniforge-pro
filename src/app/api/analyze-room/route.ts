import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { analyzeRoomImage } from "@/lib/vision";
import { recommendForRoom } from "@/lib/recommend";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("image") as File | null;
    if (!file) return NextResponse.json({ error: "image required" }, { status: 400 });

    const buf = Buffer.from(await file.arrayBuffer());
    const hash = crypto.createHash("sha1").update(buf).digest("hex").slice(0, 12);
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
    const fname = `${Date.now()}_${hash}.${ext}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });
    await writeFile(path.join(uploadDir, fname), buf);
    const publicUrl = `/uploads/${fname}`;

    // Build data URL for OpenAI
    const dataUrl = `data:${file.type || "image/jpeg"};base64,${buf.toString("base64")}`;

    const { result, latencyMs, modelUsed, isMock } = await analyzeRoomImage(dataUrl);

    // Persist
    const saved = await db.roomAnalysis.create({
      data: {
        imageUrl: publicUrl,
        roomType: result.roomType,
        roomTypeConf: result.roomTypeConfidence,
        estimatedW: result.estimatedDimensionsMm.width,
        estimatedD: result.estimatedDimensionsMm.depth,
        estimatedH: result.estimatedDimensionsMm.height,
        styleLabel: result.styleLabel,
        styleTags: JSON.stringify(result.styleTags),
        palette: JSON.stringify(result.colorPalette),
        lighting: JSON.stringify(result.lighting),
        freeSpace: JSON.stringify(result.freeFloorRegions),
        detectedObjects: JSON.stringify(result.detectedFurniture),
        rawVision: JSON.stringify(result),
        modelsUsed: JSON.stringify({ vision: modelUsed }),
        latencyMs,
      },
    });

    // Recommend
    const recs = await recommendForRoom(result, 8);

    // Persist top recommendations
    await db.roomRecommendation.createMany({
      data: recs.map((r, idx) => ({
        roomAnalysisId: saved.id,
        modelId: r.modelId,
        score: r.score,
        adaptedParams: JSON.stringify(r.adaptedParams),
        reason: r.reason,
        rank: idx + 1,
      })),
    });

    return NextResponse.json({
      analysisId: saved.id,
      analysisUuid: saved.uuid,
      imageUrl: publicUrl,
      isMock,
      latencyMs,
      analysis: result,
      recommendations: recs,
    });
  } catch (e: any) {
    console.error("analyze-room error:", e);
    return NextResponse.json({ error: e?.message || "internal error" }, { status: 500 });
  }
}
