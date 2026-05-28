// Full furniture quote engine.
// Cost = materials + edging + hardware + labor + delivery + install
// Final = Cost × (1 + margin) × (1 + VAT)

import { db } from "./db";
import { resolveParts, type ResolvedPart } from "./geometry";
import { nestGreedyGuillotine, type NestPart } from "./nesting";

export interface QuoteItem {
  modelId: number;
  params?: Record<string, number>;
  qty?: number;
}

export interface HardwareLine {
  code: string;
  description: string;
  qty: number;
  unitPriceUzs: number;
  totalUzs: number;
}

export interface QuoteBreakdown {
  modelLines: {
    sku: string;
    name: string;
    qty: number;
    materialCost: number;
    edgingCost: number;
    hardwareCost: number;
    laborCost: number;
    subtotal: number;
  }[];
  totals: {
    material: number;
    edging: number;
    hardware: number;
    labor: number;
    delivery: number;
    install: number;
    cost: number;
    margin: number;
    subtotal: number;     // cost + margin (pre-VAT)
    vat: number;
    grandTotal: number;
  };
  hardwareSummary: HardwareLine[];
  metrics: {
    totalParts: number;
    totalSheets: number;
    avgUtilization: number;
    edgeMeters: number;
  };
}

// Hardware estimation per model (rule-based — could be in DB per-model in production)
function estimateHardware(model: any, params: Record<string, number>, qty: number): HardwareLine[] {
  const lines: { code: string; qty: number }[] = [];
  const doors = Math.round(params.doors || 0);
  const shelves = Math.round(params.shelves || 0);
  const drawers = Math.round(params.drawers || 0);
  const W = params.W || 600;
  const H = params.H || 720;
  const cat = model.category?.code || "";

  // Hinges: 2 per door (3 if H > 1500)
  if (doors > 0) {
    const hingesPerDoor = H > 1500 ? 3 : 2;
    lines.push({ code: H > 2000 ? "HETTICH-SENSYS" : "BLUM-CLIP-110", qty: doors * hingesPerDoor });
    lines.push({ code: "SCR-EURO-6X13", qty: doors * hingesPerDoor * 4 });
  }

  // Drawer slides: 1 pair per drawer
  if (drawers > 0) {
    lines.push({ code: "BLUM-TBOX-450", qty: drawers });
  }

  // Handles: 1 per door + 1 per drawer
  if (doors + drawers > 0) {
    const handleCode = W > 600 ? "HND-BAR-192" : "HND-BAR-128";
    lines.push({ code: handleCode, qty: doors + drawers });
  }

  // Shelf pins: 4 per shelf
  if (shelves > 0) {
    lines.push({ code: "PIN-5X12", qty: shelves * 4 });
  }

  // Confirmats: ~6 per cabinet
  lines.push({ code: "SCR-CONF-7X50", qty: 6 });
  lines.push({ code: "DOWEL-8X35", qty: 8 });

  // Legs: 4 per cabinet for floor-standing kitchen/wardrobe
  if (cat.includes("kitchen.base") || cat.includes("wardrobe")) {
    lines.push({ code: "LEG-ADJ-100", qty: 4 });
  }

  return lines.map((l) => ({ ...l, qty: l.qty * qty })) as any;
}

export async function computeQuote(items: QuoteItem[], pricingProfileCode = "STANDARD"): Promise<QuoteBreakdown> {
  const profile = await db.pricingProfile.findUnique({ where: { code: pricingProfileCode } })
    || await db.pricingProfile.findFirst({ where: { isDefault: true } })
    || { laborPerPartUzs: 12000, marginPercent: 0.3, vatPercent: 0.12, edgingPerMUzs: 8000, deliveryUzs: 0, installUzs: 0 };

  let totalMaterial = 0;
  let totalEdging = 0;
  let totalEdgeMm = 0;
  let totalLabor = 0;
  let totalParts = 0;

  type Bucket = { code: string; thickness: number; sheetW: number; sheetH: number; sheetArea: number; sheetCostPerM2: number; parts: NestPart[] };
  const buckets = new Map<string, Bucket>();
  const hwAggregated = new Map<string, number>();
  const modelLines: QuoteBreakdown["modelLines"] = [];

  for (const item of items) {
    const m = await db.furnitureModel.findUnique({
      where: { id: item.modelId },
      include: { category: true, modules: { include: { parts: { include: { material: true } } } } },
    });
    if (!m) continue;
    const dsl = JSON.parse(m.geometryDsl);
    const params = { ...JSON.parse(m.defaultParams), ...(item.params || {}) };
    const resolved = resolveParts(dsl, params);
    const qty = item.qty || 1;

    let modelMat = 0, modelEdge = 0, modelLabor = 0, modelEdgeMm = 0, modelParts = 0;

    for (const mod of m.modules) {
      for (const part of mod.parts) {
        const r = resolved.find((x) => x.code === part.code);
        if (!r || r.length <= 0 || r.width <= 0) continue;
        const totalQty = r.qty * qty;
        modelParts += totalQty;
        totalParts += totalQty;

        const k = `${part.material.code}_${part.thickness}`;
        if (!buckets.has(k)) {
          buckets.set(k, {
            code: part.material.code, thickness: part.thickness,
            sheetW: part.material.sheetW, sheetH: part.material.sheetH,
            sheetArea: (part.material.sheetW * part.material.sheetH) / 1_000_000, // m²
            sheetCostPerM2: part.material.costPerM2,
            parts: [],
          });
        }
        buckets.get(k)!.parts.push({
          id: `${m.id}_${part.id}`, code: part.code,
          length: r.length, width: r.width,
          qty: totalQty,
          grain: part.material.hasGrain ? "X" : "none",
        });

        // Edging meters per part
        let edgeMm = 0;
        if (r.edges.top && r.edges.top !== "0") edgeMm += r.length;
        if (r.edges.bottom && r.edges.bottom !== "0") edgeMm += r.length;
        if (r.edges.left && r.edges.left !== "0") edgeMm += r.width;
        if (r.edges.right && r.edges.right !== "0") edgeMm += r.width;
        const edgeMeters = (edgeMm * totalQty) / 1000;
        modelEdgeMm += edgeMm * totalQty;
        totalEdgeMm += edgeMm * totalQty;
        modelEdge += edgeMeters * profile.edgingPerMUzs;

        // Labor per part
        modelLabor += totalQty * profile.laborPerPartUzs;
      }
    }

    // Material cost via nesting
    let modelMatCost = 0;
    // (will compute per-bucket below; here we accumulate model parts list separately)
    // We'll redo material at end after all items aggregated.

    // Hardware
    const hw = estimateHardware(m, params, qty);
    let modelHw = 0;
    for (const h of hw) {
      hwAggregated.set(h.code, (hwAggregated.get(h.code) || 0) + h.qty);
    }

    modelLines.push({
      sku: m.sku, name: m.nameUz, qty,
      materialCost: 0, // filled later
      edgingCost: Math.round(modelEdge),
      hardwareCost: 0, // filled later
      laborCost: modelLabor,
      subtotal: 0,
    });

    totalEdging += modelEdge;
    totalLabor += modelLabor;
  }

  // Material — nest per bucket and compute cost
  let totalSheets = 0;
  let utilSum = 0;
  let bucketCount = 0;
  for (const [, b] of buckets) {
    const r = nestGreedyGuillotine(b.parts, { width: b.sheetW, height: b.sheetH, thickness: b.thickness, materialCode: b.code });
    totalSheets += r.totalSheets;
    utilSum += r.avgUtilization;
    bucketCount++;
    totalMaterial += r.totalSheets * b.sheetArea * b.sheetCostPerM2;
  }

  // Hardware summary + cost
  const hardwareSummary: HardwareLine[] = [];
  let totalHardware = 0;
  for (const [code, qty] of hwAggregated) {
    const hw = await db.hardware.findUnique({ where: { code } });
    if (!hw) continue;
    const total = hw.unitPriceUzs * qty;
    totalHardware += total;
    hardwareSummary.push({
      code: hw.code, description: hw.description, qty,
      unitPriceUzs: hw.unitPriceUzs, totalUzs: total,
    });
  }

  // Distribute totals to model lines proportionally to labor (rough proxy)
  const totalLaborForDistribution = totalLabor || 1;
  for (const ml of modelLines) {
    const share = ml.laborCost / totalLaborForDistribution;
    ml.materialCost = Math.round(totalMaterial * share);
    ml.hardwareCost = Math.round(totalHardware * share);
    ml.subtotal = ml.materialCost + ml.edgingCost + ml.hardwareCost + ml.laborCost;
  }

  const cost = totalMaterial + totalEdging + totalHardware + totalLabor + profile.deliveryUzs + profile.installUzs;
  const margin = cost * profile.marginPercent;
  const subtotal = cost + margin;
  const vat = subtotal * profile.vatPercent;
  const grandTotal = subtotal + vat;

  return {
    modelLines,
    totals: {
      material: Math.round(totalMaterial),
      edging: Math.round(totalEdging),
      hardware: Math.round(totalHardware),
      labor: Math.round(totalLabor),
      delivery: profile.deliveryUzs,
      install: profile.installUzs,
      cost: Math.round(cost),
      margin: Math.round(margin),
      subtotal: Math.round(subtotal),
      vat: Math.round(vat),
      grandTotal: Math.round(grandTotal),
    },
    hardwareSummary,
    metrics: {
      totalParts,
      totalSheets,
      avgUtilization: bucketCount ? utilSum / bucketCount : 0,
      edgeMeters: totalEdgeMm / 1000,
    },
  };
}
