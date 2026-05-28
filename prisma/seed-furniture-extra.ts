// Extra catalog expansion — pushes total models from 83 → 250+.
// Adds variants, finishes, sizes and a few new categories.
// Run AFTER seed.ts + seed-furniture.ts.

import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const PHOTO = (id: string) => `https://images.unsplash.com/photo-${id}?w=800&q=80&auto=format&fit=crop`;

// Wider photo pool per room context
const POOL = {
  kitchen: [
    "1556909114-f6e7ad7d3136", "1556912167-f556f1f39fdf", "1583847268964-b28dc8f51f92",
    "1556910103-1c02745aae4d", "1565538810643-b5bdb714032a", "1556909212-d5b604d0c90d",
    "1600585154340-be6161a56a0c", "1631679706909-1844bbd07221", "1556909114-f6e7ad7d3136",
  ],
  kitchen_island: [
    "1556909212-d5b604d0c90d", "1556909114-f6e7ad7d3136", "1631679706909-1844bbd07221",
  ],
  wardrobe: [
    "1558997519-83ea9252edf8", "1595428774223-ef52624120d2", "1631889993959-b9b2dcdd8d0d",
    "1594620302200-9a762244a156", "1616627388303-1c5cd33d4884",
  ],
  bed: [
    "1505693416388-ac5ce068fe85", "1505691938895-1758d7feb511", "1540518614846-7eded433c457",
    "1551776235-dde6d482980b", "1522444690501-83ea7ad5a98c", "1571508601891-ca5e7a713859",
  ],
  table_dining: [
    "1617104551722-3b2d51366400", "1604578762246-41134e37f9cc", "1615875221167-0b9ec0c46e7e",
    "1615874959474-d609969a20ed", "1567538096630-e0c55bd6374c",
  ],
  table_coffee: [
    "1554995207-c18c203602cb", "1555041469-a586c61ea9bc", "1540574163026-643ea20ade25",
    "1567538096630-e0c55bd6374c", "1493663284031-b7e3aefcae8e",
  ],
  table_office: [
    "1518455027359-f3f8164ba6bd", "1593062096033-9a26b09da705", "1611269154421-4e27233ac5c7",
    "1593642632559-0c6d3fc62b89", "1542435503-956c469947f6",
  ],
  shelf: [
    "1507842217343-583bb7270b66", "1521587760476-6c12a4b040da", "1594620302200-9a762244a156",
    "1507168261361-5b6ae2cd66d2",
  ],
  tv_stand: [
    "1565538810643-b5bdb714032a", "1567538096630-e0c55bd6374c", "1493663284031-b7e3aefcae8e",
  ],
  sofa: [
    "1555041469-a586c61ea9bc", "1540574163026-643ea20ade25", "1567538096630-e0c55bd6374c",
    "1493663284031-b7e3aefcae8e", "1583847268964-b28dc8f51f92",
  ],
  chair: [
    "1503602642458-232111445657", "1581539250439-c96689b516dd", "1592078615290-033ee584e267",
    "1506439773649-6e0eb8cfb237",
  ],
  nightstand: [
    "1505691938895-1758d7feb511", "1540518614846-7eded433c457", "1571508601891-ca5e7a713859",
  ],
  hallway: [
    "1616627388303-1c5cd33d4884", "1558997519-83ea9252edf8", "1594620302200-9a762244a156",
  ],
  child: [
    "1522444690501-83ea7ad5a98c", "1571508601891-ca5e7a713859", "1505691938895-1758d7feb511",
  ],
  vanity: [
    "1571508601891-ca5e7a713859", "1505691938895-1758d7feb511", "1540518614846-7eded433c457",
  ],
};

const pick = (arr: string[], i: number) => PHOTO(arr[i % arr.length]);

const ps = (params: Record<string, any>) => JSON.stringify(params);
const dp = (params: Record<string, number>) => JSON.stringify(params);

// ─── DSL templates (re-declared for self-containment) ──────────────────────
const carcassDoorsDsl = () => JSON.stringify({
  type: "carcass_box",
  parts: [
    { code: "side_L",  L: "H - T",         W: "D",       T: 18, edges: { front: "2.0" } },
    { code: "side_R",  L: "H - T",         W: "D",       T: 18, edges: { front: "2.0" } },
    { code: "bottom",  L: "W - 2*T",       W: "D",       T: 18, edges: { front: "2.0" } },
    { code: "top_rail",L: "W - 2*T",       W: 100,       T: 18, edges: {} },
    { code: "back",    L: "W - 4",         W: "H - 4",   T: 3,  edges: {} },
    { code: "shelf",   L: "W - 2*T",       W: "D - 30",  T: 18, edges: { front: "0.4" }, qty: "shelves" },
    { code: "door",    L: "(W - 4)/doors", W: "H - 4",   T: 18, edges: { all: "2.0" }, qty: "doors" },
  ],
});

const carcassDrawersDsl = () => JSON.stringify({
  type: "carcass_drawers",
  parts: [
    { code: "side_L",  L: "H - T",         W: "D",       T: 18, edges: { front: "2.0" } },
    { code: "side_R",  L: "H - T",         W: "D",       T: 18, edges: { front: "2.0" } },
    { code: "bottom",  L: "W - 2*T",       W: "D",       T: 18, edges: { front: "2.0" } },
    { code: "top_rail",L: "W - 2*T",       W: 100,       T: 18, edges: {} },
    { code: "back",    L: "W - 4",         W: "H - 4",   T: 3,  edges: {} },
    { code: "drawer_front", L: "W - 4",    W: "(H - 4)/drawers - 4", T: 18, edges: { all: "2.0" }, qty: "drawers" },
    { code: "drawer_box_side", L: "D - 50", W: "(H - 4)/drawers - 30", T: 16, edges: {}, qty: "drawers * 2" },
    { code: "drawer_box_back", L: "W - 80", W: "(H - 4)/drawers - 30", T: 16, edges: {}, qty: "drawers" },
    { code: "drawer_bottom", L: "W - 80",   W: "D - 50",  T: 12, edges: {}, qty: "drawers" },
  ],
});

const wardrobeDsl = () => JSON.stringify({
  type: "carcass_box",
  parts: [
    { code: "side_L",  L: "H",             W: "D",       T: 18, edges: { front: "2.0" } },
    { code: "side_R",  L: "H",             W: "D",       T: 18, edges: { front: "2.0" } },
    { code: "top",     L: "W - 2*T",       W: "D",       T: 18, edges: { front: "2.0" } },
    { code: "bottom",  L: "W - 2*T",       W: "D",       T: 18, edges: { front: "2.0" } },
    { code: "back",    L: "W - 4",         W: "H - 4",   T: 3,  edges: {} },
    { code: "shelf",   L: "W - 2*T",       W: "D - 30",  T: 18, edges: { front: "0.4" }, qty: "shelves" },
    { code: "rod_panel", L: "W - 2*T",     W: 80,        T: 18, edges: {} },
    { code: "door",    L: "(W - 4)/doors", W: "H - 4",   T: 18, edges: { all: "2.0" }, qty: "doors" },
  ],
});

const bedDsl = () => JSON.stringify({
  type: "bed_platform",
  parts: [
    { code: "head",    L: "W",             W: "headH",   T: 18, edges: { all: "2.0" } },
    { code: "foot",    L: "W",             W: 200,       T: 18, edges: { all: "2.0" } },
    { code: "side_L",  L: "L",             W: 200,       T: 18, edges: { top: "2.0" } },
    { code: "side_R",  L: "L",             W: 200,       T: 18, edges: { top: "2.0" } },
    { code: "slat",    L: "W - 36",        W: 70,        T: 18, edges: {}, qty: 14 },
  ],
});

const tableDsl = () => JSON.stringify({
  type: "table",
  parts: [
    { code: "top",     L: "W",             W: "D",       T: 25, edges: { all: "2.0" } },
    { code: "leg",     L: "H - T",         W: 80,        T: 80, edges: {}, qty: 4 },
  ],
});

const shelfDsl = () => JSON.stringify({
  type: "open_shelf",
  parts: [
    { code: "side_L",  L: "H",             W: "D",       T: 18, edges: { all: "2.0" } },
    { code: "side_R",  L: "H",             W: "D",       T: 18, edges: { all: "2.0" } },
    { code: "shelf",   L: "W - 2*T",       W: "D",       T: 18, edges: { front: "2.0" }, qty: "shelves" },
    { code: "back",    L: "W - 4",         W: "H - 4",   T: 3,  edges: {} },
  ],
});

const chairDsl = () => JSON.stringify({
  type: "chair",
  parts: [
    { code: "seat",    L: "W",             W: "D",       T: 18, edges: { all: "2.0" } },
    { code: "back",    L: "W",             W: "backH",   T: 18, edges: { all: "2.0" } },
    { code: "leg",     L: "H",             W: 40,        T: 40, edges: {}, qty: 4 },
  ],
});

const sofaDsl = () => JSON.stringify({
  type: "sofa",
  parts: [
    { code: "frame_seat", L: "W - 60",     W: "D - 100", T: 18, edges: {} },
    { code: "frame_bottom", L: "W - 60",   W: "D",       T: 18, edges: {} },
    { code: "leg",        L: 150,          W: 80,        T: 80, edges: {}, qty: 6 },
  ],
});

// ─── Catalog items ─────────────────────────────────────────────────────────
type Item = {
  sku: string; cat: string; nameUz: string; style: string[];
  paramSchema: string; defaults: string; dsl: string;
  bbox: [number, number, number]; compat: Record<string, number>;
  cost: number; thumb: string;
};

const MODELS: Item[] = [];

// ── KITCHEN BASE — finish variants (8 widths × 3 finishes = 24 SKUs) ───────
const FINISHES = ["WHITE", "OAK", "BLACK"] as const;
const STYLE_BY_FINISH: Record<string, string[]> = {
  WHITE: ["modern", "scandinavian", "minimalist"],
  OAK:   ["modern", "scandinavian", "japandi"],
  BLACK: ["modern", "minimalist"],
};
const FINISH_NAME: Record<string, string> = { WHITE: "Oq", OAK: "Eman", BLACK: "Qora" };

[300, 400, 500, 600, 700, 800, 900, 1000].forEach((w, i) => {
  FINISHES.forEach((f, fi) => {
    const doors = w <= 500 ? 1 : 2;
    MODELS.push({
      sku: `KB-${f}-${w}`, cat: "kitchen.base",
      nameUz: `Oshxona pastki shkaf ${FINISH_NAME[f]} ${w}mm`,
      style: STYLE_BY_FINISH[f],
      paramSchema: ps({
        W: { min: 300, max: 1200, step: 50, default: w },
        H: { min: 600, max: 900, step: 10, default: 720 },
        D: { min: 400, max: 650, step: 10, default: 560 },
        T: { min: 16, max: 25, step: 2, default: 18 },
        doors: { min: 1, max: 2, step: 1, default: doors },
        shelves: { min: 0, max: 3, step: 1, default: 1 },
      }),
      defaults: dp({ W: w, H: 720, D: 560, T: 18, doors, shelves: 1 }),
      dsl: carcassDoorsDsl(),
      bbox: [w, 560, 720],
      compat: { kitchen: 0.95 },
      cost: 600000 + w * 700 + fi * 80000,
      thumb: pick(POOL.kitchen, i * 3 + fi),
    });
  });
});

// Sink base, microwave housing, bin pull-out (3)
[
  { sku: "KB-SINK-800", w: 800, name: "Rakovina ostidagi shkaf", h: 720 },
  { sku: "KB-MICRO-600", w: 600, name: "Mikroto'lqinli pech shkafi", h: 720 },
  { sku: "KB-BIN-400", w: 400, name: "Chiqindi tortma", h: 720 },
].forEach((v, i) => {
  MODELS.push({
    sku: v.sku, cat: "kitchen.base",
    nameUz: v.name,
    style: ["modern", "minimalist"],
    paramSchema: ps({
      W: { min: 300, max: 1000, step: 50, default: v.w },
      H: { min: 600, max: 900, step: 10, default: v.h },
      D: { min: 400, max: 650, step: 10, default: 560 },
      T: { min: 16, max: 25, step: 2, default: 18 },
      doors: { min: 1, max: 2, step: 1, default: v.w >= 600 ? 2 : 1 },
      shelves: { min: 0, max: 2, step: 1, default: 0 },
    }),
    defaults: dp({ W: v.w, H: v.h, D: 560, T: 18, doors: v.w >= 600 ? 2 : 1, shelves: 0 }),
    dsl: carcassDoorsDsl(),
    bbox: [v.w, 560, v.h],
    compat: { kitchen: 0.9 },
    cost: 850000 + v.w * 600,
    thumb: pick(POOL.kitchen, i + 6),
  });
});

// ── KITCHEN WALL — 5 widths × 2 heights × 2 finishes (20) ──────────────────
[300, 400, 600, 800, 1000].forEach((w, wi) => {
  [600, 720, 920].forEach((h, hi) => {
    ["WHITE", "OAK"].forEach((f, fi) => {
      const doors = w <= 500 ? 1 : 2;
      MODELS.push({
        sku: `KW-${f}-${w}-${h}`, cat: "kitchen.wall",
        nameUz: `Oshxona yuqori shkaf ${FINISH_NAME[f]} ${w}×${h}mm`,
        style: STYLE_BY_FINISH[f],
        paramSchema: ps({
          W: { min: 300, max: 1200, step: 50, default: w },
          H: { min: 400, max: 1000, step: 20, default: h },
          D: { min: 280, max: 400, step: 10, default: 320 },
          T: { min: 16, max: 25, step: 2, default: 18 },
          doors: { min: 1, max: 2, step: 1, default: doors },
          shelves: { min: 1, max: 3, step: 1, default: h >= 720 ? 2 : 1 },
        }),
        defaults: dp({ W: w, H: h, D: 320, T: 18, doors, shelves: h >= 720 ? 2 : 1 }),
        dsl: carcassDoorsDsl(),
        bbox: [w, 320, h],
        compat: { kitchen: 0.95 },
        cost: 450000 + w * 500 + fi * 60000,
        thumb: pick(POOL.kitchen, wi + hi + fi),
      });
    });
  });
});

// ── KITCHEN ISLAND (5) — new category-like, mapped to kitchen.base ─────────
[
  { w: 1200, d: 800, name: "Oshxona oroli (kompakt)" },
  { w: 1600, d: 900, name: "Oshxona oroli (o'rta)" },
  { w: 1800, d: 900, name: "Oshxona oroli (kengaytirilgan)" },
  { w: 2000, d: 1000, name: "Oshxona oroli (katta)" },
  { w: 2400, d: 1100, name: "Oshxona oroli (premium)" },
].forEach((v, i) => {
  MODELS.push({
    sku: `KIS-${v.w}`, cat: "kitchen.base",
    nameUz: `${v.name} ${v.w}×${v.d}mm`,
    style: ["modern", "minimalist"],
    paramSchema: ps({
      W: { min: 1200, max: 2600, step: 100, default: v.w },
      H: { min: 850, max: 1050, step: 10, default: 900 },
      D: { min: 700, max: 1200, step: 50, default: v.d },
      T: { min: 18, max: 30, step: 2, default: 25 },
      doors: { min: 2, max: 4, step: 1, default: 3 },
      drawers: { min: 0, max: 3, step: 1, default: 2 },
      shelves: { min: 1, max: 2, step: 1, default: 1 },
    }),
    defaults: dp({ W: v.w, H: 900, D: v.d, T: 25, doors: 3, drawers: 2, shelves: 1 }),
    dsl: carcassDoorsDsl(),
    bbox: [v.w, v.d, 900],
    compat: { kitchen: 0.98 },
    cost: 2800000 + v.w * 1500,
    thumb: pick(POOL.kitchen_island, i),
  });
});

// ── KITCHEN TALL — finish variants (3 base × 3 finishes = 9) ───────────────
const TALL = [
  { sku: "KT-PENCIL", w: 600, name: "Pencil shkaf", shelves: 5 },
  { sku: "KT-OVEN",   w: 600, name: "Pech shkafi", shelves: 2 },
  { sku: "KT-FRIDGE", w: 700, name: "Muzlatgich shkafi", shelves: 1 },
];
TALL.forEach((v, i) => {
  FINISHES.forEach((f, fi) => {
    MODELS.push({
      sku: `${v.sku}-${f}`, cat: "kitchen.tall",
      nameUz: `${v.name} ${FINISH_NAME[f]}`,
      style: STYLE_BY_FINISH[f],
      paramSchema: ps({
        W: { min: 400, max: 900, step: 50, default: v.w },
        H: { min: 1800, max: 2400, step: 50, default: 2100 },
        D: { min: 560, max: 650, step: 10, default: 580 },
        T: { min: 16, max: 25, step: 2, default: 18 },
        doors: { min: 1, max: 2, step: 1, default: 2 },
        shelves: { min: 1, max: 6, step: 1, default: v.shelves },
      }),
      defaults: dp({ W: v.w, H: 2100, D: 580, T: 18, doors: 2, shelves: v.shelves }),
      dsl: carcassDoorsDsl(),
      bbox: [v.w, 580, 2100],
      compat: { kitchen: 0.9 },
      cost: 1800000 + v.w * 1200 + fi * 120000,
      thumb: pick(POOL.kitchen, i * 3 + fi + 2),
    });
  });
});

// ── WARDROBE SWING — multi-width × 2-4 doors × 2 finishes (24) ─────────────
[800, 1000, 1200, 1500, 1800, 2100].forEach((w, wi) => {
  ["WHITE", "OAK"].forEach((f, fi) => {
    [2, 3, 4].forEach((doors, di) => {
      if (w < 1000 && doors > 2) return;
      if (w < 1500 && doors > 3) return;
      MODELS.push({
        sku: `WS-SW-${f}-${w}-${doors}`, cat: "wardrobe.swing",
        nameUz: `Garderob ${FINISH_NAME[f]} ${w}mm (${doors} eshik)`,
        style: STYLE_BY_FINISH[f],
        paramSchema: ps({
          W: { min: 800, max: 2400, step: 100, default: w },
          H: { min: 2000, max: 2400, step: 50, default: 2200 },
          D: { min: 500, max: 650, step: 10, default: 580 },
          T: { min: 16, max: 25, step: 2, default: 18 },
          doors: { min: 2, max: 4, step: 1, default: doors },
          shelves: { min: 2, max: 5, step: 1, default: 3 },
        }),
        defaults: dp({ W: w, H: 2200, D: 580, T: 18, doors, shelves: 3 }),
        dsl: wardrobeDsl(),
        bbox: [w, 580, 2200],
        compat: { bedroom: 0.95, hallway: 0.5 },
        cost: 2200000 + w * 1500 + fi * 200000,
        thumb: pick(POOL.wardrobe, wi + fi + di),
      });
    });
  });
});

// ── WARDROBE SLIDE — kupe (10) ─────────────────────────────────────────────
[
  { w: 1500, doors: 2 }, { w: 1800, doors: 2 }, { w: 2000, doors: 2 },
  { w: 2200, doors: 3 }, { w: 2400, doors: 3 }, { w: 2700, doors: 3 },
  { w: 3000, doors: 3 }, { w: 3200, doors: 4 }, { w: 3600, doors: 4 },
  { w: 4000, doors: 4 },
].forEach((v, i) => {
  MODELS.push({
    sku: `WS-SL-${v.w}`, cat: "wardrobe.slide",
    nameUz: `Kupe garderob ${v.w}mm (${v.doors} eshik)`,
    style: ["modern", "minimalist"],
    paramSchema: ps({
      W: { min: 1200, max: 4200, step: 100, default: v.w },
      H: { min: 2000, max: 2600, step: 50, default: 2400 },
      D: { min: 600, max: 700, step: 10, default: 650 },
      T: { min: 16, max: 25, step: 2, default: 18 },
      doors: { min: 2, max: 4, step: 1, default: v.doors },
      shelves: { min: 3, max: 6, step: 1, default: 4 },
    }),
    defaults: dp({ W: v.w, H: 2400, D: 650, T: 18, doors: v.doors, shelves: 4 }),
    dsl: wardrobeDsl(),
    bbox: [v.w, 650, 2400],
    compat: { bedroom: 0.98, hallway: 0.7 },
    cost: 2800000 + v.w * 1600,
    thumb: pick(POOL.wardrobe, i),
  });
});

// ── BED — more sizes + storage (12) ────────────────────────────────────────
[
  { w: 900, l: 1900, name: "Bir kishilik karavot" },
  { w: 1200, l: 2000, name: "Yarim ikki kishilik" },
  { w: 1400, l: 2000, name: "Yarim ikki kishilik+" },
  { w: 1600, l: 2000, name: "Queen karavot" },
  { w: 1800, l: 2000, name: "King karavot" },
  { w: 2000, l: 2000, name: "Super King" },
].forEach((v, i) => {
  // Standard platform
  MODELS.push({
    sku: `BED-PL-${v.w}-${v.l}`, cat: "bed.platform",
    nameUz: `${v.name} ${v.w}×${v.l}`,
    style: ["modern", "minimalist", "scandinavian"],
    paramSchema: ps({
      W: { min: 900, max: 2000, step: 100, default: v.w },
      L: { min: 1900, max: 2200, step: 50, default: v.l },
      H: { min: 300, max: 450, step: 10, default: 380 },
      headH: { min: 700, max: 1200, step: 50, default: 1000 },
      T: { min: 16, max: 25, step: 2, default: 18 },
    }),
    defaults: dp({ W: v.w, L: v.l, H: 380, headH: 1000, T: 18 }),
    dsl: bedDsl(),
    bbox: [v.w, v.l, 1000],
    compat: { bedroom: 0.98 },
    cost: 2500000 + v.w * 800,
    thumb: pick(POOL.bed, i),
  });
  // With storage
  MODELS.push({
    sku: `BED-ST-${v.w}-${v.l}`, cat: "bed.platform",
    nameUz: `${v.name} (saqlash bilan) ${v.w}×${v.l}`,
    style: ["modern", "minimalist"],
    paramSchema: ps({
      W: { min: 900, max: 2000, step: 100, default: v.w },
      L: { min: 1900, max: 2200, step: 50, default: v.l },
      H: { min: 400, max: 500, step: 10, default: 450 },
      headH: { min: 700, max: 1200, step: 50, default: 1100 },
      T: { min: 16, max: 25, step: 2, default: 18 },
    }),
    defaults: dp({ W: v.w, L: v.l, H: 450, headH: 1100, T: 18 }),
    dsl: bedDsl(),
    bbox: [v.w, v.l, 1100],
    compat: { bedroom: 0.95 },
    cost: 3200000 + v.w * 1000,
    thumb: pick(POOL.bed, i + 1),
  });
});

// ── DINING TABLE — round, rect, extending (10) ─────────────────────────────
[
  { w: 1000, d: 1000, seats: 4, name: "Ovqat stoli kvadrat" },
  { w: 1200, d: 800, seats: 4, name: "Ovqat stoli to'g'ri" },
  { w: 1400, d: 800, seats: 6, name: "Ovqat stoli to'g'ri" },
  { w: 1600, d: 900, seats: 6, name: "Ovqat stoli to'g'ri" },
  { w: 1800, d: 900, seats: 8, name: "Ovqat stoli katta" },
  { w: 2000, d: 1000, seats: 8, name: "Ovqat stoli premium" },
  { w: 1100, d: 1100, seats: 4, name: "Ovqat stoli yumaloq" },
  { w: 1300, d: 1300, seats: 6, name: "Ovqat stoli yumaloq" },
  { w: 1500, d: 900, seats: 6, name: "Ovqat stoli (cho'ziluvchi)" },
  { w: 2200, d: 1000, seats: 10, name: "Ovqat stoli mehmonxona" },
].forEach((v, i) => {
  MODELS.push({
    sku: `TBL-DIN-${v.w}-${v.d}`, cat: "table.dining",
    nameUz: `${v.name} ${v.w}×${v.d}`,
    style: ["modern", "scandinavian", "classic"],
    paramSchema: ps({
      W: { min: 800, max: 2400, step: 100, default: v.w },
      D: { min: 800, max: 1400, step: 50, default: v.d },
      H: { min: 720, max: 770, step: 5, default: 740 },
      T: { min: 18, max: 35, step: 2, default: 25 },
    }),
    defaults: dp({ W: v.w, D: v.d, H: 740, T: 25 }),
    dsl: tableDsl(),
    bbox: [v.w, v.d, 740],
    compat: { dining: 0.98, kitchen: 0.7, living: 0.5 },
    cost: 1400000 + v.w * 900,
    thumb: pick(POOL.table_dining, i),
  });
});

// ── COFFEE TABLE — more sizes (8) ──────────────────────────────────────────
[600, 800, 900, 1000, 1100, 1200, 1400, 1600].forEach((w, i) => {
  MODELS.push({
    sku: `TBL-COF-V2-${w}`, cat: "table.coffee",
    nameUz: `Jurnal stol ${w}×600`,
    style: ["modern", "minimalist", "japandi"],
    paramSchema: ps({
      W: { min: 500, max: 1800, step: 50, default: w },
      D: { min: 500, max: 800, step: 50, default: 600 },
      H: { min: 350, max: 500, step: 10, default: 420 },
      T: { min: 18, max: 30, step: 2, default: 22 },
    }),
    defaults: dp({ W: w, D: 600, H: 420, T: 22 }),
    dsl: tableDsl(),
    bbox: [w, 600, 420],
    compat: { living: 0.95 },
    cost: 600000 + w * 500,
    thumb: pick(POOL.table_coffee, i),
  });
});

// ── OFFICE DESK — corner + sizes (8) ───────────────────────────────────────
[1000, 1200, 1400, 1600, 1800, 2000].forEach((w, i) => {
  MODELS.push({
    sku: `TBL-OFF-V2-${w}`, cat: "table.office",
    nameUz: `Ish stoli ${w}×700`,
    style: ["modern", "minimalist"],
    paramSchema: ps({
      W: { min: 1000, max: 2200, step: 100, default: w },
      D: { min: 600, max: 900, step: 50, default: 700 },
      H: { min: 720, max: 780, step: 10, default: 750 },
      T: { min: 18, max: 30, step: 2, default: 25 },
    }),
    defaults: dp({ W: w, D: 700, H: 750, T: 25 }),
    dsl: tableDsl(),
    bbox: [w, 700, 750],
    compat: { office: 0.98 },
    cost: 1100000 + w * 700,
    thumb: pick(POOL.table_office, i),
  });
});
// L-shape corner desks
[
  { w: 1600, d: 1400, name: "Burchak ish stoli (L-shape)" },
  { w: 1800, d: 1600, name: "Burchak ish stoli katta" },
].forEach((v, i) => {
  MODELS.push({
    sku: `TBL-OFF-L-${v.w}`, cat: "table.office",
    nameUz: `${v.name} ${v.w}×${v.d}`,
    style: ["modern", "minimalist"],
    paramSchema: ps({
      W: { min: 1400, max: 2000, step: 100, default: v.w },
      D: { min: 1200, max: 1800, step: 100, default: v.d },
      H: { min: 720, max: 780, step: 10, default: 750 },
      T: { min: 18, max: 30, step: 2, default: 25 },
    }),
    defaults: dp({ W: v.w, D: v.d, H: 750, T: 25 }),
    dsl: tableDsl(),
    bbox: [v.w, v.d, 750],
    compat: { office: 0.95 },
    cost: 2200000 + v.w * 900,
    thumb: pick(POOL.table_office, i + 3),
  });
});

// ── SHELF — ladder, cube, wall (10) ────────────────────────────────────────
[
  { w: 600, h: 1500, shelves: 4, name: "Javon kichik" },
  { w: 800, h: 1800, shelves: 5, name: "Javon o'rta" },
  { w: 1000, h: 2000, shelves: 5, name: "Javon keng" },
  { w: 1200, h: 2200, shelves: 6, name: "Javon baland" },
  { w: 800, h: 1200, shelves: 3, name: "Javon past" },
  { w: 1500, h: 1800, shelves: 5, name: "Javon panoramic" },
  { w: 600, h: 1800, shelves: 4, name: "Narvon javon" },
  { w: 900, h: 900, shelves: 3, name: "Kub javon 3×3" },
  { w: 1200, h: 1200, shelves: 4, name: "Kub javon 4×4" },
  { w: 800, h: 400, shelves: 1, name: "Devor javon" },
].forEach((v, i) => {
  MODELS.push({
    sku: `SHF-V2-${v.w}-${v.h}`, cat: "shelf.open",
    nameUz: `${v.name} ${v.w}×${v.h}mm`,
    style: ["modern", "minimalist", "scandinavian"],
    paramSchema: ps({
      W: { min: 400, max: 1600, step: 100, default: v.w },
      H: { min: 400, max: 2400, step: 100, default: v.h },
      D: { min: 250, max: 400, step: 10, default: 300 },
      T: { min: 16, max: 25, step: 2, default: 18 },
      shelves: { min: 1, max: 7, step: 1, default: v.shelves },
    }),
    defaults: dp({ W: v.w, H: v.h, D: 300, T: 18, shelves: v.shelves }),
    dsl: shelfDsl(),
    bbox: [v.w, 300, v.h],
    compat: { living: 0.85, office: 0.9, child: 0.7 },
    cost: 700000 + v.w * 600 + v.h * 300,
    thumb: pick(POOL.shelf, i),
  });
});

// ── TV STAND (8) ───────────────────────────────────────────────────────────
[1200, 1400, 1600, 1800, 2000, 2200, 2400, 2800].forEach((w, i) => {
  MODELS.push({
    sku: `TV-V2-${w}`, cat: "tv.stand",
    nameUz: `TV tumba ${w}mm`,
    style: ["modern", "minimalist"],
    paramSchema: ps({
      W: { min: 1000, max: 3000, step: 100, default: w },
      H: { min: 350, max: 600, step: 10, default: 450 },
      D: { min: 350, max: 500, step: 10, default: 400 },
      T: { min: 16, max: 25, step: 2, default: 18 },
      doors: { min: 0, max: 4, step: 1, default: 2 },
      drawers: { min: 0, max: 3, step: 1, default: 1 },
      shelves: { min: 0, max: 2, step: 1, default: 1 },
    }),
    defaults: dp({ W: w, H: 450, D: 400, T: 18, doors: 2, drawers: 1, shelves: 1 }),
    dsl: carcassDoorsDsl(),
    bbox: [w, 400, 450],
    compat: { living: 0.98 },
    cost: 1100000 + w * 700,
    thumb: pick(POOL.tv_stand, i),
  });
});

// ── SOFA — many configurations (10) ────────────────────────────────────────
[
  { w: 1400, name: "2 o'rinli divan", seats: 2 },
  { w: 1800, name: "2.5 o'rinli divan", seats: 2 },
  { w: 2000, name: "3 o'rinli divan", seats: 3 },
  { w: 2200, name: "3 o'rinli divan keng", seats: 3 },
  { w: 2400, name: "3.5 o'rinli divan", seats: 4 },
  { w: 2600, name: "4 o'rinli divan", seats: 4 },
  { w: 2800, name: "Katta divan", seats: 4 },
  { w: 3000, name: "Premium divan", seats: 4 },
  { w: 2400, name: "Burchakli divan (L)", seats: 4 },
  { w: 3000, name: "Burchakli divan katta", seats: 5 },
].forEach((v, i) => {
  MODELS.push({
    sku: `SOFA-V2-${v.w}-${i}`, cat: "sofa.straight",
    nameUz: `${v.name} ${v.w}mm`,
    style: ["modern", "classic", "scandinavian"],
    paramSchema: ps({
      W: { min: 1200, max: 3200, step: 100, default: v.w },
      D: { min: 800, max: 1100, step: 50, default: 950 },
      H: { min: 700, max: 900, step: 10, default: 850 },
      backH: { min: 700, max: 900, step: 10, default: 800 },
      armH: { min: 500, max: 800, step: 10, default: 650 },
    }),
    defaults: dp({ W: v.w, D: 950, H: 850, backH: 800, armH: 650 }),
    dsl: sofaDsl(),
    bbox: [v.w, 950, 850],
    compat: { living: 0.98 },
    cost: 3500000 + v.w * 1200,
    thumb: pick(POOL.sofa, i),
  });
});

// ── CHAIR — many variants (12) ─────────────────────────────────────────────
[
  { sku: "CH-V2-DIN-1", name: "Stul oddiy", style: ["modern"] },
  { sku: "CH-V2-DIN-2", name: "Stul yumshoq o'rindiqli", style: ["classic"] },
  { sku: "CH-V2-DIN-3", name: "Stul Scandinavian", style: ["scandinavian"] },
  { sku: "CH-V2-ARM-1", name: "Yumshoq kreslo", style: ["modern", "classic"] },
  { sku: "CH-V2-ARM-2", name: "Yumshoq kreslo katta", style: ["modern"] },
  { sku: "CH-V2-BAR-1", name: "Bar stuli past", style: ["modern", "minimalist"] },
  { sku: "CH-V2-BAR-2", name: "Bar stuli baland", style: ["modern", "minimalist"] },
  { sku: "CH-V2-OFF-1", name: "Ofis stuli oddiy", style: ["modern"] },
  { sku: "CH-V2-OFF-2", name: "Ofis stuli ergonomik", style: ["modern"] },
  { sku: "CH-V2-DIN-4", name: "Stul yog'och classic", style: ["classic", "japandi"] },
  { sku: "CH-V2-DIN-5", name: "Stul minimal metal", style: ["minimalist"] },
  { sku: "CH-V2-DIN-6", name: "Stul plastik modern", style: ["modern", "minimalist"] },
].forEach((v, i) => {
  const isBar = v.sku.includes("BAR");
  const isArm = v.sku.includes("ARM");
  MODELS.push({
    sku: v.sku, cat: "chair.dining",
    nameUz: v.name, style: v.style,
    paramSchema: ps({
      W: { min: 380, max: 600, step: 10, default: isArm ? 550 : 420 },
      D: { min: 380, max: 600, step: 10, default: isArm ? 550 : 420 },
      H: { min: 430, max: 800, step: 10, default: isBar ? 760 : 450 },
      backH: { min: 350, max: 600, step: 10, default: 450 },
    }),
    defaults: dp({ W: isArm ? 550 : 420, D: isArm ? 550 : 420, H: isBar ? 760 : 450, backH: 450 }),
    dsl: chairDsl(),
    bbox: [isArm ? 550 : 420, isArm ? 550 : 420, isBar ? 760 : 450],
    compat: isBar ? { kitchen: 0.9, dining: 0.7 } : { dining: 0.95, kitchen: 0.7, living: 0.5 },
    cost: 320000 + i * 30000,
    thumb: pick(POOL.chair, i),
  });
});

// ── NIGHTSTAND — more sizes × finishes (12) ────────────────────────────────
[400, 450, 500, 550].forEach((w, wi) => {
  FINISHES.forEach((f, fi) => {
    MODELS.push({
      sku: `NS-V2-${f}-${w}`, cat: "nightstand",
      nameUz: `Tungi tumba ${FINISH_NAME[f]} ${w}mm`,
      style: STYLE_BY_FINISH[f],
      paramSchema: ps({
        W: { min: 350, max: 700, step: 50, default: w },
        H: { min: 400, max: 700, step: 10, default: 500 },
        D: { min: 350, max: 500, step: 10, default: 400 },
        T: { min: 16, max: 25, step: 2, default: 18 },
        drawers: { min: 1, max: 3, step: 1, default: 2 },
        doors: { min: 0, max: 1, step: 1, default: 0 },
        shelves: { min: 0, max: 1, step: 1, default: 0 },
      }),
      defaults: dp({ W: w, H: 500, D: 400, T: 18, drawers: 2, doors: 0, shelves: 0 }),
      dsl: carcassDrawersDsl(),
      bbox: [w, 400, 500],
      compat: { bedroom: 0.98 },
      cost: 480000 + w * 400 + fi * 50000,
      thumb: pick(POOL.nightstand, wi + fi),
    });
  });
});

// ── DRESSER (6) ────────────────────────────────────────────────────────────
[
  { w: 900, drawers: 3, name: "Komod kompakt" },
  { w: 1100, drawers: 4, name: "Komod o'rta" },
  { w: 1300, drawers: 5, name: "Komod keng" },
  { w: 1500, drawers: 6, name: "Komod katta" },
  { w: 1700, drawers: 6, name: "Komod premium" },
  { w: 1200, drawers: 8, name: "Komod 2 qatorli" },
].forEach((v, i) => {
  MODELS.push({
    sku: `DR-V2-${v.w}-${v.drawers}`, cat: "nightstand",
    nameUz: `${v.name} ${v.w}mm (${v.drawers} tortma)`,
    style: ["modern", "classic", "scandinavian"],
    paramSchema: ps({
      W: { min: 800, max: 1800, step: 100, default: v.w },
      H: { min: 750, max: 1100, step: 10, default: 900 },
      D: { min: 400, max: 550, step: 10, default: 450 },
      T: { min: 16, max: 25, step: 2, default: 18 },
      drawers: { min: 3, max: 8, step: 1, default: v.drawers },
      doors: { min: 0, max: 0, step: 1, default: 0 },
      shelves: { min: 0, max: 0, step: 1, default: 0 },
    }),
    defaults: dp({ W: v.w, H: 900, D: 450, T: 18, drawers: v.drawers, doors: 0, shelves: 0 }),
    dsl: carcassDrawersDsl(),
    bbox: [v.w, 450, 900],
    compat: { bedroom: 0.95, living: 0.5 },
    cost: 1500000 + v.w * 900,
    thumb: pick(POOL.nightstand, i),
  });
});

// ── VANITY / MAKEUP DESK (5) ───────────────────────────────────────────────
[900, 1000, 1100, 1200, 1400].forEach((w, i) => {
  MODELS.push({
    sku: `VAN-${w}`, cat: "nightstand",
    nameUz: `Pardoz stoli ${w}mm`,
    style: ["modern", "classic", "scandinavian"],
    paramSchema: ps({
      W: { min: 800, max: 1500, step: 50, default: w },
      H: { min: 720, max: 780, step: 10, default: 750 },
      D: { min: 380, max: 500, step: 10, default: 420 },
      T: { min: 16, max: 25, step: 2, default: 18 },
      drawers: { min: 2, max: 5, step: 1, default: 3 },
      doors: { min: 0, max: 0, step: 1, default: 0 },
      shelves: { min: 0, max: 0, step: 1, default: 0 },
    }),
    defaults: dp({ W: w, H: 750, D: 420, T: 18, drawers: 3, doors: 0, shelves: 0 }),
    dsl: carcassDrawersDsl(),
    bbox: [w, 420, 750],
    compat: { bedroom: 0.92 },
    cost: 1700000 + w * 700,
    thumb: pick(POOL.vanity, i),
  });
});

// ── HALLWAY: shoe rack + hanger (8) ────────────────────────────────────────
[
  { w: 700, h: 1000, name: "Kavush tumba 700" },
  { w: 900, h: 1100, name: "Kavush tumba 900" },
  { w: 1100, h: 1200, name: "Kavush tumba 1100" },
  { w: 1300, h: 1300, name: "Kavush tumba katta" },
  { w: 600, h: 1900, name: "Yo'lak shkafi past" },
  { w: 800, h: 2100, name: "Yo'lak shkafi" },
  { w: 1000, h: 2100, name: "Yo'lak shkafi keng" },
  { w: 1200, h: 2200, name: "Yo'lak modul" },
].forEach((v, i) => {
  MODELS.push({
    sku: `HW-${v.w}-${v.h}`, cat: "wardrobe.swing",
    nameUz: `${v.name} ${v.w}×${v.h}mm`,
    style: ["modern", "minimalist"],
    paramSchema: ps({
      W: { min: 500, max: 1400, step: 50, default: v.w },
      H: { min: 600, max: 2400, step: 50, default: v.h },
      D: { min: 280, max: 400, step: 10, default: 320 },
      T: { min: 16, max: 25, step: 2, default: 18 },
      doors: { min: 1, max: 3, step: 1, default: v.w >= 900 ? 2 : 1 },
      shelves: { min: 2, max: 5, step: 1, default: 3 },
    }),
    defaults: dp({ W: v.w, H: v.h, D: 320, T: 18, doors: v.w >= 900 ? 2 : 1, shelves: 3 }),
    dsl: carcassDoorsDsl(),
    bbox: [v.w, 320, v.h],
    compat: { hallway: 0.98 },
    cost: 900000 + v.w * 600,
    thumb: pick(POOL.hallway, i),
  });
});

// ── KIDS room — desk, bed, wardrobe (8) ────────────────────────────────────
[
  { w: 800, h: 750, d: 500, name: "Bolalar ish stoli kompakt", type: "desk" },
  { w: 1000, h: 750, d: 600, name: "Bolalar ish stoli", type: "desk" },
  { w: 1200, h: 750, d: 600, name: "Bolalar ish stoli keng", type: "desk" },
  { w: 900, h: 700, l: 1800, name: "Bolalar karavoti 900", type: "bed" },
  { w: 1000, h: 700, l: 1900, name: "Bolalar karavoti 1000", type: "bed" },
  { w: 1200, h: 700, l: 2000, name: "O'smir karavoti", type: "bed" },
  { w: 900, h: 1900, d: 500, name: "Bolalar garderobi", type: "wardrobe" },
  { w: 1200, h: 2000, d: 550, name: "Bolalar garderobi keng", type: "wardrobe" },
].forEach((v: any, i) => {
  const cat = v.type === "desk" ? "table.office" : v.type === "bed" ? "bed.platform" : "wardrobe.swing";
  const dsl = v.type === "desk" ? tableDsl() : v.type === "bed" ? bedDsl() : wardrobeDsl();
  const schema = v.type === "desk" ? ps({
    W: { min: 700, max: 1400, step: 50, default: v.w },
    D: { min: 400, max: 700, step: 50, default: v.d },
    H: { min: 700, max: 780, step: 10, default: v.h },
    T: { min: 18, max: 30, step: 2, default: 25 },
  }) : v.type === "bed" ? ps({
    W: { min: 800, max: 1400, step: 50, default: v.w },
    L: { min: 1700, max: 2100, step: 50, default: v.l },
    H: { min: 300, max: 450, step: 10, default: 380 },
    headH: { min: 500, max: 900, step: 50, default: 700 },
    T: { min: 16, max: 25, step: 2, default: 18 },
  }) : ps({
    W: { min: 800, max: 1400, step: 50, default: v.w },
    H: { min: 1800, max: 2200, step: 50, default: v.h },
    D: { min: 400, max: 600, step: 10, default: v.d },
    T: { min: 16, max: 25, step: 2, default: 18 },
    doors: { min: 1, max: 3, step: 1, default: 2 },
    shelves: { min: 2, max: 4, step: 1, default: 3 },
  });
  const defaults = v.type === "desk" ? dp({ W: v.w, D: v.d, H: v.h, T: 25 })
    : v.type === "bed" ? dp({ W: v.w, L: v.l, H: 380, headH: 700, T: 18 })
    : dp({ W: v.w, H: v.h, D: v.d, T: 18, doors: 2, shelves: 3 });
  MODELS.push({
    sku: `KID-${v.type.toUpperCase()}-${v.w}-${i}`, cat,
    nameUz: `${v.name} ${v.w}mm`,
    style: ["modern", "scandinavian"],
    paramSchema: schema,
    defaults,
    dsl,
    bbox: [v.w, v.d || v.l || 500, v.l || v.h || 750],
    compat: { child: 0.98 },
    cost: 1000000 + v.w * 600,
    thumb: pick(POOL.child, i),
  });
});

// ── BAR TABLE (3) ──────────────────────────────────────────────────────────
[1000, 1200, 1400].forEach((w, i) => {
  MODELS.push({
    sku: `BAR-TBL-${w}`, cat: "table.dining",
    nameUz: `Bar stoli ${w}×600`,
    style: ["modern", "minimalist"],
    paramSchema: ps({
      W: { min: 800, max: 1600, step: 50, default: w },
      D: { min: 500, max: 700, step: 50, default: 600 },
      H: { min: 1000, max: 1150, step: 10, default: 1100 },
      T: { min: 20, max: 35, step: 2, default: 30 },
    }),
    defaults: dp({ W: w, D: 600, H: 1100, T: 30 }),
    dsl: tableDsl(),
    bbox: [w, 600, 1100],
    compat: { kitchen: 0.85, dining: 0.7 },
    cost: 1300000 + w * 800,
    thumb: pick(POOL.table_dining, i + 2),
  });
});

// ───────────────────────────────────────────────────────────────────────────
async function main() {
  console.log(`🌱 Extra catalog seed: ${MODELS.length} additional models`);
  const cats = await db.furnitureCategory.findMany();
  const catMap = new Map(cats.map((c) => [c.code, c.id]));
  const materials = await db.material.findMany();
  if (!materials.length) throw new Error("Run seed.ts first.");
  const defaultMat = materials.find((m) => m.thickness === 18) || materials[0];
  const backMat = materials.find((m) => m.thickness === 3) || defaultMat;

  let inserted = 0, updated = 0, skipped = 0;
  for (const m of MODELS) {
    const catId = catMap.get(m.cat);
    if (!catId) { skipped++; continue; }
    const existing = await db.furnitureModel.findUnique({ where: { sku: m.sku } });
    const data = {
      categoryId: catId,
      nameUz: m.nameUz,
      paramSchema: m.paramSchema,
      defaultParams: m.defaults,
      geometryDsl: m.dsl,
      thumbnailUrl: m.thumb,
      styleTags: JSON.stringify(m.style),
      roomCompat: JSON.stringify(m.compat),
      bboxW: m.bbox[0], bboxD: m.bbox[1], bboxH: m.bbox[2],
      baseCostUzs: m.cost,
    };

    let model;
    if (existing) {
      model = await db.furnitureModel.update({ where: { id: existing.id }, data });
      await db.module.deleteMany({ where: { modelId: existing.id } });
      updated++;
    } else {
      model = await db.furnitureModel.create({ data: { sku: m.sku, ...data } });
      inserted++;
    }

    const mod = await db.module.create({
      data: { modelId: model.id, code: "main", role: "carcass", transform: JSON.stringify({ pos: [0, 0, 0], rot: [0, 0, 0] }) },
    });
    const dsl = JSON.parse(m.dsl) as { parts: any[] };
    for (const p of dsl.parts) {
      const isBack = p.code === "back" || p.code === "drawer_bottom";
      await db.atomicPart.create({
        data: {
          moduleId: mod.id,
          code: p.code,
          lengthExpr: String(p.L),
          widthExpr: String(p.W),
          thickness: Number(p.T) || 18,
          materialId: isBack ? backMat.id : defaultMat.id,
          edgeTop: p.edges?.all || p.edges?.top || null,
          edgeBottom: p.edges?.all || p.edges?.bottom || null,
          edgeLeft: p.edges?.all || p.edges?.left || null,
          edgeRight: p.edges?.all || p.edges?.right || p.edges?.front || null,
          qtyExpr: String(p.qty ?? 1),
        },
      });
    }
  }

  const total = await db.furnitureModel.count();
  console.log(`✅ ${inserted} new, ${updated} updated, ${skipped} skipped · DB jami: ${total} mebel`);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => db.$disconnect());
