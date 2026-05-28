// 2D Cutting Optimization — Greedy Guillotine (Best-Fit Decreasing Height)
// Production version would add GA + OR-Tools CP-SAT portfolio (see architecture doc).

export interface NestPart {
  id: string;
  code: string;
  length: number;   // along grain (X)
  width: number;
  qty: number;
  grain?: "X" | "Y" | "none";
}

export interface NestSheet {
  width: number;
  height: number;
  thickness: number;
  materialCode: string;
}

export interface PlacedPart {
  partId: string;
  code: string;
  x: number;
  y: number;
  w: number;
  h: number;
  rotated: boolean;
}

export interface NestSheetResult {
  sheetIndex: number;
  width: number;
  height: number;
  placed: PlacedPart[];
  utilization: number;
}

export interface NestResult {
  sheets: NestSheetResult[];
  totalParts: number;
  totalSheets: number;
  avgUtilization: number;
  wasteArea: number;
}

interface FreeRect { x: number; y: number; w: number; h: number; }

const KERF = 4; // mm saw kerf

function expandQty(parts: NestPart[]): { id: string; code: string; w: number; h: number; canRotate: boolean }[] {
  const out: { id: string; code: string; w: number; h: number; canRotate: boolean }[] = [];
  for (const p of parts) {
    for (let i = 0; i < p.qty; i++) {
      out.push({
        id: `${p.id}#${i}`,
        code: p.code,
        w: p.length + KERF,
        h: p.width + KERF,
        canRotate: !p.grain || p.grain === "none",
      });
    }
  }
  return out;
}

export function nestGreedyGuillotine(parts: NestPart[], sheet: NestSheet): NestResult {
  const expanded = expandQty(parts);
  // Sort by area desc (BFD)
  expanded.sort((a, b) => b.w * b.h - a.w * a.h);

  const sheets: NestSheetResult[] = [];
  let sheetFree: FreeRect[][] = [];

  function addSheet() {
    sheets.push({ sheetIndex: sheets.length, width: sheet.width, height: sheet.height, placed: [], utilization: 0 });
    sheetFree.push([{ x: 0, y: 0, w: sheet.width, h: sheet.height }]);
  }
  addSheet();

  function tryPlace(sheetIdx: number, w: number, h: number): { rect: FreeRect; idx: number; rotated: boolean } | null {
    const free = sheetFree[sheetIdx];
    let best: { rect: FreeRect; idx: number; rotated: boolean; score: number } | null = null;
    for (let i = 0; i < free.length; i++) {
      const r = free[i];
      // Try normal
      if (w <= r.w && h <= r.h) {
        const score = r.w * r.h - w * h; // best short side fit approx
        if (!best || score < best.score) best = { rect: r, idx: i, rotated: false, score };
      }
      // Try rotated
      if (h <= r.w && w <= r.h) {
        const score = r.w * r.h - w * h;
        if (!best || score < best.score) best = { rect: r, idx: i, rotated: true, score };
      }
    }
    if (!best) return null;
    return { rect: best.rect, idx: best.idx, rotated: best.rotated };
  }

  function splitFree(free: FreeRect[], idx: number, used: { x: number; y: number; w: number; h: number }) {
    const r = free[idx];
    free.splice(idx, 1);
    // Right strip
    const rightW = r.w - used.w;
    if (rightW > 0) free.push({ x: r.x + used.w, y: r.y, w: rightW, h: r.h });
    // Bottom strip (under used, full width of `used`)
    const bottomH = r.h - used.h;
    if (bottomH > 0) free.push({ x: r.x, y: r.y + used.h, w: used.w, h: bottomH });
  }

  for (const item of expanded) {
    let placed = false;
    for (let s = 0; s < sheets.length && !placed; s++) {
      let p = tryPlace(s, item.w, item.h);
      if (p) {
        const w = p.rotated ? item.h : item.w;
        const h = p.rotated ? item.w : item.h;
        const used = { x: p.rect.x, y: p.rect.y, w, h };
        sheets[s].placed.push({
          partId: item.id, code: item.code,
          x: used.x, y: used.y, w: w - KERF, h: h - KERF,
          rotated: p.rotated,
        });
        splitFree(sheetFree[s], p.idx, used);
        placed = true;
      } else if (!item.canRotate) {
        // already tried both
      }
    }
    if (!placed) {
      addSheet();
      const s = sheets.length - 1;
      const p = tryPlace(s, item.w, item.h);
      if (!p) {
        // Part bigger than sheet — skip with warning
        console.warn(`Part ${item.id} (${item.w}x${item.h}) exceeds sheet ${sheet.width}x${sheet.height}`);
        continue;
      }
      const w = p.rotated ? item.h : item.w;
      const h = p.rotated ? item.w : item.h;
      sheets[s].placed.push({
        partId: item.id, code: item.code,
        x: p.rect.x, y: p.rect.y, w: w - KERF, h: h - KERF,
        rotated: p.rotated,
      });
      splitFree(sheetFree[s], p.idx, { x: p.rect.x, y: p.rect.y, w, h });
    }
  }

  // Compute utilization
  const sheetArea = sheet.width * sheet.height;
  let totalUsed = 0;
  for (const s of sheets) {
    const used = s.placed.reduce((acc, p) => acc + p.w * p.h, 0);
    s.utilization = used / sheetArea;
    totalUsed += used;
  }

  return {
    sheets,
    totalParts: expanded.length,
    totalSheets: sheets.length,
    avgUtilization: sheets.length ? totalUsed / (sheets.length * sheetArea) : 0,
    wasteArea: sheets.length * sheetArea - totalUsed,
  };
}
