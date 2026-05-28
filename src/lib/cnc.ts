// CNC drilling template generator — produces standard 32mm system holes (Eurosystem)
// for cabinet sides, plus G-code preamble for 3-axis routers.

import type { ResolvedPart } from "./geometry";

export interface DrillHole {
  x: number;          // mm from origin (bottom-left of part)
  y: number;
  diameter: number;   // mm
  depth: number;
  type: "shelf_pin" | "hinge_cup" | "dowel" | "construction_screw";
}

export interface PartDrillingPlan {
  partCode: string;
  partLength: number;
  partWidth: number;
  thickness: number;
  holes: DrillHole[];
}

// Eurosystem 32mm shelf-pin pattern: holes every 32mm vertically, 37mm from front/back edges
export function generateShelfPinHoles(part: ResolvedPart, frontInset = 37, backInset = 37): DrillHole[] {
  if (!part.code.startsWith("side_")) return [];
  const holes: DrillHole[] = [];
  // Vertical strip from 100mm above bottom to 100mm below top, every 32mm
  for (let y = 100; y <= part.length - 100; y += 32) {
    holes.push({ x: frontInset, y, diameter: 5, depth: 12, type: "shelf_pin" });
    holes.push({ x: part.width - backInset, y, diameter: 5, depth: 12, type: "shelf_pin" });
  }
  return holes;
}

// Hinge cup holes for doors: 2 cups per door, 100mm from top/bottom, 22.5mm from edge
export function generateHingeCupHoles(part: ResolvedPart, sideHinged: "left" | "right" = "left"): DrillHole[] {
  if (part.code !== "door") return [];
  const x = sideHinged === "left" ? 22.5 : part.width - 22.5;
  return [
    { x, y: 100, diameter: 35, depth: 12, type: "hinge_cup" },
    { x, y: part.length - 100, diameter: 35, depth: 12, type: "hinge_cup" },
  ];
}

// Construction screw holes: connect bottom/top to sides — 4 per joint at 50mm from corners
export function generateConstructionHoles(part: ResolvedPart): DrillHole[] {
  if (part.code !== "bottom" && part.code !== "top") return [];
  return [
    { x: 50, y: 9, diameter: 5, depth: 30, type: "construction_screw" },
    { x: part.width - 50, y: 9, diameter: 5, depth: 30, type: "construction_screw" },
    { x: 50, y: part.length - 9, diameter: 5, depth: 30, type: "construction_screw" },
    { x: part.width - 50, y: part.length - 9, diameter: 5, depth: 30, type: "construction_screw" },
  ];
}

export function buildDrillingPlan(parts: ResolvedPart[]): PartDrillingPlan[] {
  return parts
    .filter((p) => p.length > 0 && p.width > 0)
    .map((p) => ({
      partCode: p.code,
      partLength: p.length,
      partWidth: p.width,
      thickness: p.thickness,
      holes: [
        ...generateShelfPinHoles(p),
        ...generateHingeCupHoles(p),
        ...generateConstructionHoles(p),
      ],
    }))
    .filter((p) => p.holes.length > 0);
}

// Minimal G-code (3-axis router) for one part
export function partToGcode(plan: PartDrillingPlan): string {
  const lines: string[] = [];
  lines.push("; FurniForge Pro — CNC Program");
  lines.push(`; Part: ${plan.partCode} (${plan.partLength}x${plan.partWidth}x${plan.thickness}mm)`);
  lines.push(`; Holes: ${plan.holes.length}`);
  lines.push("G21 ; mm");
  lines.push("G90 ; absolute");
  lines.push("G17 ; XY plane");
  lines.push("M03 S18000 ; spindle on");
  lines.push("G00 Z5.0");

  // Group by tool diameter
  const byTool = new Map<number, DrillHole[]>();
  for (const h of plan.holes) {
    if (!byTool.has(h.diameter)) byTool.set(h.diameter, []);
    byTool.get(h.diameter)!.push(h);
  }

  let toolNum = 1;
  for (const [dia, holes] of byTool) {
    lines.push(`T${toolNum} M06 ; tool ${dia}mm drill`);
    for (const h of holes) {
      lines.push(`G00 X${h.x.toFixed(2)} Y${h.y.toFixed(2)} Z5.0`);
      lines.push(`G01 Z${(-h.depth).toFixed(2)} F600`);
      lines.push("G00 Z5.0");
    }
    toolNum++;
  }

  lines.push("M05 ; spindle off");
  lines.push("M30 ; end");
  return lines.join("\n");
}
