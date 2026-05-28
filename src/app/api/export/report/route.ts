import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { resolveParts } from "@/lib/geometry";
import { nestGreedyGuillotine, type NestPart } from "@/lib/nesting";

// Returns a printable HTML page (auto-prints to PDF on open).
export async function POST(req: NextRequest) {
  const body = await req.json();
  const items = body.items as { modelId: number; params?: any; qty?: number }[];
  const projectName = body.projectName || "FurniForge Loyiha";

  type Row = { sku: string; name: string; partCode: string; L: number; W: number; T: number; qty: number; mat: string; decor: string };
  const rows: Row[] = [];
  let totalCost = 0;

  type Bucket = { code: string; thickness: number; sheetW: number; sheetH: number; parts: NestPart[] };
  const buckets = new Map<string, Bucket>();
  let edgeMm = 0;

  for (const item of items || []) {
    const m = await db.furnitureModel.findUnique({
      where: { id: item.modelId },
      include: { modules: { include: { parts: { include: { material: true } } } } },
    });
    if (!m) continue;
    totalCost += (m.baseCostUzs || 0) * (item.qty || 1);
    const dsl = JSON.parse(m.geometryDsl);
    const params = { ...JSON.parse(m.defaultParams), ...(item.params || {}) };
    const resolved = resolveParts(dsl, params);
    const qty = item.qty || 1;

    for (const mod of m.modules) {
      for (const part of mod.parts) {
        const r = resolved.find((x) => x.code === part.code);
        if (!r || r.length <= 0 || r.width <= 0) continue;
        rows.push({
          sku: m.sku, name: m.nameUz, partCode: part.code,
          L: r.length, W: r.width, T: part.thickness,
          qty: r.qty * qty, mat: part.material.code, decor: part.material.decor || "",
        });
        const k = `${part.material.code}_${part.thickness}`;
        if (!buckets.has(k)) buckets.set(k, { code: part.material.code, thickness: part.thickness, sheetW: part.material.sheetW, sheetH: part.material.sheetH, parts: [] });
        buckets.get(k)!.parts.push({ id: `${part.id}`, code: part.code, length: r.length, width: r.width, qty: r.qty * qty, grain: part.material.hasGrain ? "X" : "none" });
        // edging mm: each declared edge = perimeter side
        const edges = r.edges;
        if (edges.top && edges.top !== "0") edgeMm += r.length * (r.qty * qty);
        if (edges.bottom && edges.bottom !== "0") edgeMm += r.length * (r.qty * qty);
        if (edges.left && edges.left !== "0") edgeMm += r.width * (r.qty * qty);
        if (edges.right && edges.right !== "0") edgeMm += r.width * (r.qty * qty);
      }
    }
  }

  // Nest summary
  const nestSummary: { code: string; thickness: number; sheets: number; util: number }[] = [];
  for (const [, b] of buckets) {
    const r = nestGreedyGuillotine(b.parts, { width: b.sheetW, height: b.sheetH, thickness: b.thickness, materialCode: b.code });
    nestSummary.push({ code: b.code, thickness: b.thickness, sheets: r.totalSheets, util: r.avgUtilization });
  }

  const fmtMoney = (n: number) => new Intl.NumberFormat("uz-UZ").format(n) + " so'm";
  const today = new Date().toLocaleDateString("uz-UZ");

  const html = `<!doctype html><html><head><meta charset="utf-8"><title>${projectName} — Report</title>
<style>
  @page { size: A4; margin: 15mm; }
  body { font-family: -apple-system, Segoe UI, Roboto, sans-serif; color: #1a1a1a; font-size: 11px; }
  h1 { color: #7c5cff; margin: 0 0 4px; font-size: 22px; }
  h2 { font-size: 13px; color: #444; margin: 18px 0 6px; border-bottom: 2px solid #7c5cff; padding-bottom: 3px; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #7c5cff; padding-bottom: 10px; margin-bottom: 14px; }
  .meta { text-align: right; color: #666; font-size: 10px; line-height: 1.5; }
  .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin: 10px 0 16px; }
  .stat { border: 1px solid #ddd; padding: 8px; border-radius: 6px; }
  .stat-label { color: #888; font-size: 9px; text-transform: uppercase; }
  .stat-value { font-size: 16px; font-weight: 700; color: #7c5cff; }
  table { width: 100%; border-collapse: collapse; }
  th { background: #f5f3ff; text-align: left; padding: 6px 5px; font-size: 9px; text-transform: uppercase; color: #555; }
  td { border-bottom: 1px solid #eee; padding: 5px; }
  tr:nth-child(even) td { background: #fafafa; }
  .total { font-weight: 700; font-size: 13px; color: #7c5cff; text-align: right; padding-top: 10px; }
  .small { color: #888; font-size: 9px; }
  .print-btn { position: fixed; top: 10px; right: 10px; padding: 8px 14px; background: #7c5cff; color: white; border: 0; border-radius: 6px; cursor: pointer; font-size: 12px; }
  @media print { .print-btn { display: none; } }
</style></head><body>
<button class="print-btn" onclick="window.print()">📄 PDF saqlash</button>
<div class="header">
  <div>
    <h1>${projectName}</h1>
    <div class="small">FurniForge Pro — Ishlab chiqarish hisoboti</div>
  </div>
  <div class="meta">
    Sana: ${today}<br/>
    Hujjat: REP-${Date.now().toString(36).toUpperCase()}<br/>
    Holat: <b>Ishlab chiqarishga tayyor</b>
  </div>
</div>

<div class="stats">
  <div class="stat"><div class="stat-label">Mebellar</div><div class="stat-value">${items.length}</div></div>
  <div class="stat"><div class="stat-label">Detallar</div><div class="stat-value">${rows.reduce((a, b) => a + b.qty, 0)}</div></div>
  <div class="stat"><div class="stat-label">Listlar</div><div class="stat-value">${nestSummary.reduce((a, b) => a + b.sheets, 0)}</div></div>
  <div class="stat"><div class="stat-label">Edge tape</div><div class="stat-value">${(edgeMm / 1000).toFixed(1)} m</div></div>
</div>

<h2>Cutting List</h2>
<table>
  <thead><tr>
    <th>#</th><th>Mebel</th><th>Detal</th><th style="text-align:right">L (mm)</th><th style="text-align:right">W (mm)</th><th style="text-align:right">T</th><th style="text-align:right">Soni</th><th>Material</th>
  </tr></thead>
  <tbody>
    ${rows.map((r, i) => `<tr>
      <td>${i + 1}</td>
      <td>${r.name}<br/><span class="small">${r.sku}</span></td>
      <td>${r.partCode}</td>
      <td style="text-align:right">${r.L}</td>
      <td style="text-align:right">${r.W}</td>
      <td style="text-align:right">${r.T}</td>
      <td style="text-align:right">${r.qty}</td>
      <td>${r.decor}<br/><span class="small">${r.mat}</span></td>
    </tr>`).join("")}
  </tbody>
</table>

<h2>Material va nesting</h2>
<table>
  <thead><tr><th>Material</th><th style="text-align:right">Qalinligi</th><th style="text-align:right">Listlar</th><th style="text-align:right">Foydalanish</th></tr></thead>
  <tbody>
    ${nestSummary.map((n) => `<tr>
      <td>${n.code}</td>
      <td style="text-align:right">${n.thickness} mm</td>
      <td style="text-align:right">${n.sheets}</td>
      <td style="text-align:right">${(n.util * 100).toFixed(1)}%</td>
    </tr>`).join("")}
  </tbody>
</table>

<div class="total">Bazaviy narx: ${fmtMoney(totalCost)}</div>
<div class="small" style="margin-top:30px; text-align:center; border-top:1px solid #eee; padding-top:10px;">
  FurniForge Pro · AI-Powered Furniture Manufacturing Platform · ${new Date().getFullYear()}
</div>
</body></html>`;

  return new Response(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
