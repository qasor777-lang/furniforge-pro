// Room → Furniture matching engine.
// Score = w1·style + w2·fit + w3·color + w4·function - λ·conflict
// Production: replace with Qdrant ANN + LightGBM ranker.

import { db } from "./db";
import type { RoomAnalysis } from "./vision";
import { safeJson } from "./utils";

export interface Recommendation {
  modelId: number;
  sku: string;
  nameUz: string;
  thumbnailUrl: string | null;
  bbox: [number, number, number];
  score: number;
  breakdown: { style: number; fit: number; color: number; function: number; conflict: number };
  adaptedParams: Record<string, number>;
  reason: string;
  baseCostUzs: number;
}

// Hex → CIE LAB approximation for ΔE76 distance
function hexToRgb(h: string): [number, number, number] {
  const m = h.replace("#", "").match(/.{2}/g);
  if (!m) return [0, 0, 0];
  return [parseInt(m[0], 16), parseInt(m[1], 16), parseInt(m[2], 16)];
}
function rgbToLab([r, g, b]: [number, number, number]): [number, number, number] {
  // sRGB → XYZ
  const srgb = [r, g, b].map((v) => {
    v = v / 255;
    return v > 0.04045 ? Math.pow((v + 0.055) / 1.055, 2.4) : v / 12.92;
  });
  const x = (srgb[0] * 0.4124 + srgb[1] * 0.3576 + srgb[2] * 0.1805) / 0.95047;
  const y = (srgb[0] * 0.2126 + srgb[1] * 0.7152 + srgb[2] * 0.0722) / 1.0;
  const z = (srgb[0] * 0.0193 + srgb[1] * 0.1192 + srgb[2] * 0.9505) / 1.08883;
  const f = (t: number) => (t > 0.008856 ? Math.pow(t, 1 / 3) : 7.787 * t + 16 / 116);
  return [116 * f(y) - 16, 500 * (f(x) - f(y)), 200 * (f(y) - f(z))];
}
function deltaE76(l1: [number, number, number], l2: [number, number, number]) {
  return Math.sqrt((l1[0] - l2[0]) ** 2 + (l1[1] - l2[1]) ** 2 + (l1[2] - l2[2]) ** 2);
}

function paletteDistance(modelHex: string, palette: { hex: string; weight: number }[]): number {
  if (!palette.length) return 50;
  const ml = rgbToLab(hexToRgb(modelHex));
  let total = 0, w = 0;
  for (const p of palette) {
    const pl = rgbToLab(hexToRgb(p.hex));
    total += deltaE76(ml, pl) * p.weight;
    w += p.weight;
  }
  return total / Math.max(0.01, w);
}

function styleSimilarity(modelTags: string[], roomTags: string[]): number {
  if (!modelTags.length || !roomTags.length) return 0.3;
  const set = new Set(modelTags.map((t) => t.toLowerCase()));
  let hits = 0;
  for (const t of roomTags) if (set.has(t.toLowerCase())) hits++;
  return Math.min(1, hits / roomTags.length + 0.15);
}

function fitScore(bbox: [number, number, number], roomDims: { width: number; depth: number; height: number }): number {
  const [w, d, h] = bbox;
  if (h > roomDims.height - 50) return 0;
  // Penalize if footprint exceeds 60% of any wall length
  const wallShare = Math.max(w / roomDims.width, d / roomDims.depth);
  if (wallShare > 0.95) return 0.05;
  if (wallShare > 0.7) return 0.4;
  if (wallShare > 0.4) return 0.85;
  return 1.0;
}

function adaptParams(defaultParams: Record<string, number>, paramSchema: any, roomDims: { width: number; depth: number; height: number }): Record<string, number> {
  const out = { ...defaultParams };
  // Cap height to ceiling - 100mm
  if ("H" in out && paramSchema.H) {
    out.H = Math.min(out.H, Math.max(paramSchema.H.min, roomDims.height - 100));
    const step = paramSchema.H.step || 10;
    out.H = Math.round(out.H / step) * step;
  }
  // Try expanding W toward wall length if model supports it
  if ("W" in out && paramSchema.W) {
    const target = Math.min(roomDims.width * 0.6, paramSchema.W.max);
    if (target > out.W) {
      const step = paramSchema.W.step || 50;
      out.W = Math.round(target / step) * step;
    }
  }
  return out;
}

export async function recommendForRoom(analysis: RoomAnalysis, topK = 8): Promise<Recommendation[]> {
  const models = await db.furnitureModel.findMany({ where: { status: "published" } });
  const dims = analysis.estimatedDimensionsMm;
  const dominantHex = analysis.colorPalette[0]?.hex || "#FFFFFF";

  const W = { style: 0.3, fit: 0.3, color: 0.15, function: 0.2, conflict: 0.5 };

  const scored: Recommendation[] = models.map((m) => {
    const compat = safeJson<Record<string, number>>(m.roomCompat, {});
    const styleTags = safeJson<string[]>(m.styleTags, []);
    const paramSchema = safeJson<any>(m.paramSchema, {});
    const defaults = safeJson<Record<string, number>>(m.defaultParams, {});
    const bbox: [number, number, number] = [m.bboxW, m.bboxD, m.bboxH];

    const sStyle = styleSimilarity(styleTags, analysis.styleTags);
    const sFit = fitScore(bbox, dims);
    const dE = paletteDistance("#F2EFEA", analysis.colorPalette); // default white body
    const sColor = Math.max(0, 1 - dE / 80);
    const sFunc = compat[analysis.roomType] ?? 0.1;
    const conflict = sFit === 0 ? 1 : 0;

    const score = W.style * sStyle + W.fit * sFit + W.color * sColor + W.function * sFunc - W.conflict * conflict;

    const adapted = adaptParams(defaults, paramSchema, dims);
    const reason = buildReason({ sStyle, sFit, sColor, sFunc, roomType: analysis.roomType, bbox, dims });

    return {
      modelId: m.id,
      sku: m.sku,
      nameUz: m.nameUz,
      thumbnailUrl: m.thumbnailUrl,
      bbox,
      score,
      breakdown: { style: sStyle, fit: sFit, color: sColor, function: sFunc, conflict },
      adaptedParams: adapted,
      reason,
      baseCostUzs: m.baseCostUzs,
    };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topK);
}

function buildReason(x: { sStyle: number; sFit: number; sColor: number; sFunc: number; roomType: string; bbox: number[]; dims: any }): string {
  const parts: string[] = [];
  if (x.sFunc > 0.7) parts.push(`${x.roomType} xonasi uchun mos`);
  if (x.sStyle > 0.6) parts.push("uslubga juda mos");
  else if (x.sStyle > 0.3) parts.push("uslubga qisman mos");
  if (x.sFit > 0.8) parts.push("o'lchamlar bemalol joylashadi");
  else if (x.sFit > 0.4) parts.push("zich joylashadi");
  if (x.sColor > 0.7) parts.push("rang palitrasi mos keladi");
  return parts.join(", ") || "umumiy moslik";
}
