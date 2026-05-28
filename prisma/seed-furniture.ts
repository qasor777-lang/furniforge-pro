// Extended furniture catalog: 80+ realistic templates with Unsplash photos.
// Replaces basic seed.ts content for FurnitureModel/Module/AtomicPart only.
// Run AFTER prisma/seed.ts (categories + materials must exist).

import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

// ───────────────────────────────────────────────────────────────────────────
// PHOTOS — curated stable Unsplash URLs by category
// ───────────────────────────────────────────────────────────────────────────
const PHOTO = (id: string) => `https://images.unsplash.com/photo-${id}?w=800&q=80&auto=format&fit=crop`;

const PHOTOS = {
  kitchen_base: [
    PHOTO("1556909114-f6e7ad7d3136"),
    PHOTO("1556912167-f556f1f39fdf"),
    PHOTO("1583847268964-b28dc8f51f92"),
    PHOTO("1556910103-1c02745aae4d"),
  ],
  kitchen_wall: [
    PHOTO("1556909114-f6e7ad7d3136"),
    PHOTO("1565538810643-b5bdb714032a"),
  ],
  kitchen_tall: [
    PHOTO("1556912167-f556f1f39fdf"),
    PHOTO("1583847268964-b28dc8f51f92"),
  ],
  wardrobe_swing: [
    PHOTO("1558997519-83ea9252edf8"),
    PHOTO("1595428774223-ef52624120d2"),
    PHOTO("1631889993959-b9b2dcdd8d0d"),
  ],
  wardrobe_slide: [
    PHOTO("1595428774223-ef52624120d2"),
    PHOTO("1631889993959-b9b2dcdd8d0d"),
    PHOTO("1558997519-83ea9252edf8"),
  ],
  bed_platform: [
    PHOTO("1505693416388-ac5ce068fe85"),
    PHOTO("1505691938895-1758d7feb511"),
    PHOTO("1540518614846-7eded433c457"),
    PHOTO("1551776235-dde6d482980b"),
  ],
  bed_classic: [
    PHOTO("1505693416388-ac5ce068fe85"),
    PHOTO("1551776235-dde6d482980b"),
  ],
  table_dining: [
    PHOTO("1617104551722-3b2d51366400"),
    PHOTO("1604578762246-41134e37f9cc"),
    PHOTO("1615875221167-0b9ec0c46e7e"),
  ],
  table_coffee: [
    PHOTO("1554995207-c18c203602cb"),
    PHOTO("1555041469-a586c61ea9bc"),
    PHOTO("1540574163026-643ea20ade25"),
  ],
  table_office: [
    PHOTO("1518455027359-f3f8164ba6bd"),
    PHOTO("1593062096033-9a26b09da705"),
    PHOTO("1611269154421-4e27233ac5c7"),
  ],
  shelf_open: [
    PHOTO("1507842217343-583bb7270b66"),
    PHOTO("1521587760476-6c12a4b040da"),
    PHOTO("1594620302200-9a762244a156"),
  ],
  tv_stand: [
    PHOTO("1565538810643-b5bdb714032a"),
    PHOTO("1567538096630-e0c55bd6374c"),
  ],
  sofa_straight: [
    PHOTO("1555041469-a586c61ea9bc"),
    PHOTO("1540574163026-643ea20ade25"),
    PHOTO("1567538096630-e0c55bd6374c"),
  ],
  chair_dining: [
    PHOTO("1503602642458-232111445657"),
    PHOTO("1581539250439-c96689b516dd"),
  ],
  nightstand: [
    PHOTO("1505691938895-1758d7feb511"),
    PHOTO("1540518614846-7eded433c457"),
  ],
};

const pick = (arr: string[], i: number) => arr[i % arr.length];

// ───────────────────────────────────────────────────────────────────────────
// DSL builders
// ───────────────────────────────────────────────────────────────────────────
const ps = (params: Record<string, any>) => JSON.stringify(params);
const dp = (params: Record<string, number>) => JSON.stringify(params);

function carcassDoorsDsl() {
  return JSON.stringify({
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
}

function carcassDrawersDsl() {
  return JSON.stringify({
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
}

function wardrobeDsl() {
  return JSON.stringify({
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
}

function bedDsl() {
  return JSON.stringify({
    type: "bed_platform",
    parts: [
      { code: "head",    L: "W",             W: "headH",   T: 18, edges: { all: "2.0" } },
      { code: "foot",    L: "W",             W: 200,       T: 18, edges: { all: "2.0" } },
      { code: "side_L",  L: "L",             W: 200,       T: 18, edges: { top: "2.0" } },
      { code: "side_R",  L: "L",             W: 200,       T: 18, edges: { top: "2.0" } },
      { code: "slat_support", L: "L - 36",   W: 80,        T: 18, edges: {} },
      { code: "slat",    L: "W - 36",        W: 70,        T: 18, edges: {}, qty: 14 },
    ],
  });
}

function tableDsl() {
  return JSON.stringify({
    type: "table",
    parts: [
      { code: "top",     L: "W",             W: "D",       T: 25, edges: { all: "2.0" } },
      { code: "leg",     L: "H - T",         W: 80,        T: 80, edges: {}, qty: 4 },
      { code: "apron_L", L: "W - 200",       W: 100,       T: 18, edges: {}, qty: 2 },
      { code: "apron_S", L: "D - 200",       W: 100,       T: 18, edges: {}, qty: 2 },
    ],
  });
}

function shelfDsl() {
  return JSON.stringify({
    type: "open_shelf",
    parts: [
      { code: "side_L",  L: "H",             W: "D",       T: 18, edges: { all: "2.0" } },
      { code: "side_R",  L: "H",             W: "D",       T: 18, edges: { all: "2.0" } },
      { code: "shelf",   L: "W - 2*T",       W: "D",       T: 18, edges: { front: "2.0" }, qty: "shelves" },
      { code: "back",    L: "W - 4",         W: "H - 4",   T: 3,  edges: {} },
    ],
  });
}

function chairDsl() {
  return JSON.stringify({
    type: "chair",
    parts: [
      { code: "seat",    L: "W",             W: "D",       T: 18, edges: { all: "2.0" } },
      { code: "back",    L: "W",             W: "backH",   T: 18, edges: { all: "2.0" } },
      { code: "leg",     L: "H",             W: 40,        T: 40, edges: {}, qty: 4 },
      { code: "support", L: "W - 80",        W: 60,        T: 18, edges: {}, qty: 2 },
    ],
  });
}

function sofaDsl() {
  return JSON.stringify({
    type: "sofa",
    parts: [
      { code: "frame_back", L: "W",          W: "backH",   T: 18, edges: {} },
      { code: "frame_L",    L: "D",          W: "armH",    T: 18, edges: {} },
      { code: "frame_R",    L: "D",          W: "armH",    T: 18, edges: {} },
      { code: "frame_seat", L: "W - 60",     W: "D - 100", T: 18, edges: {} },
      { code: "frame_bottom", L: "W - 60",   W: "D",       T: 18, edges: {} },
      { code: "leg",        L: 150,          W: 80,        T: 80, edges: {}, qty: 6 },
    ],
  });
}

// ───────────────────────────────────────────────────────────────────────────
// Helper to build catalog items
// ───────────────────────────────────────────────────────────────────────────
type Item = {
  sku: string; cat: string; nameUz: string; style: string[];
  paramSchema: string; defaults: string; dsl: string;
  bbox: [number, number, number]; compat: Record<string, number>;
  cost: number; thumb: string;
};

const MODELS: Item[] = [];

// ─── KITCHEN BASE CABINETS (8 widths × 2 variants = 16) ────────────────────
const KITCHEN_BASE_WIDTHS = [300, 400, 500, 600, 700, 800, 900, 1000];
KITCHEN_BASE_WIDTHS.forEach((w, i) => {
  const doors = w <= 500 ? 1 : 2;
  MODELS.push({
    sku: `KB-LIN-${w}`, cat: "kitchen.base",
    nameUz: `Oshxona pastki shkaf ${w}mm`,
    style: ["modern", "scandinavian", "minimalist"],
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
    compat: { kitchen: 0.95, dining: 0.2 },
    cost: 600000 + w * 700,
    thumb: pick(PHOTOS.kitchen_base, i),
  });
});

// Drawer base cabinets (3 widths × 2-3 drawers)
[600, 800, 1000].forEach((w, i) => {
  const drawers = w === 600 ? 3 : w === 800 ? 3 : 4;
  MODELS.push({
    sku: `KB-DR-${w}`, cat: "kitchen.base",
    nameUz: `Oshxona tortmali shkaf ${w}mm (${drawers} ta tortma)`,
    style: ["modern", "minimalist"],
    paramSchema: ps({
      W: { min: 400, max: 1200, step: 50, default: w },
      H: { min: 600, max: 900, step: 10, default: 720 },
      D: { min: 400, max: 650, step: 10, default: 560 },
      T: { min: 16, max: 25, step: 2, default: 18 },
      drawers: { min: 2, max: 5, step: 1, default: drawers },
      doors: { min: 0, max: 0, step: 1, default: 0 },
      shelves: { min: 0, max: 0, step: 1, default: 0 },
    }),
    defaults: dp({ W: w, H: 720, D: 560, T: 18, drawers, doors: 0, shelves: 0 }),
    dsl: carcassDrawersDsl(),
    bbox: [w, 560, 720],
    compat: { kitchen: 0.95 },
    cost: 1100000 + w * 1100,
    thumb: pick(PHOTOS.kitchen_base, i + 1),
  });
});

// L-shape corner base
MODELS.push({
  sku: "KB-CORNER-L", cat: "kitchen.base",
  nameUz: "Oshxona burchak shkafi (L-shape)",
  style: ["modern"],
  paramSchema: ps({
    W: { min: 800, max: 1000, step: 50, default: 900 },
    H: { min: 720, max: 900, step: 10, default: 720 },
    D: { min: 560, max: 650, step: 10, default: 600 },
    T: { min: 16, max: 25, step: 2, default: 18 },
    doors: { min: 2, max: 2, step: 1, default: 2 },
    shelves: { min: 1, max: 2, step: 1, default: 1 },
  }),
  defaults: dp({ W: 900, H: 720, D: 600, T: 18, doors: 2, shelves: 1 }),
  dsl: carcassDoorsDsl(),
  bbox: [900, 900, 720],
  compat: { kitchen: 0.85 },
  cost: 1450000,
  thumb: pick(PHOTOS.kitchen_base, 3),
});

// ─── KITCHEN WALL CABINETS (5 widths) ───────────────────────────────────────
[300, 400, 600, 800, 1000].forEach((w, i) => {
  const doors = w <= 500 ? 1 : 2;
  MODELS.push({
    sku: `KW-${w}`, cat: "kitchen.wall",
    nameUz: `Oshxona yuqori shkaf ${w}mm`,
    style: ["modern", "scandinavian", "classic"],
    paramSchema: ps({
      W: { min: 300, max: 1200, step: 50, default: w },
      H: { min: 300, max: 900, step: 10, default: 720 },
      D: { min: 280, max: 400, step: 10, default: 320 },
      T: { min: 16, max: 25, step: 2, default: 18 },
      doors: { min: 1, max: 2, step: 1, default: doors },
      shelves: { min: 1, max: 3, step: 1, default: 2 },
    }),
    defaults: dp({ W: w, H: 720, D: 320, T: 18, doors, shelves: 2 }),
    dsl: carcassDoorsDsl(),
    bbox: [w, 320, 720],
    compat: { kitchen: 0.95 },
    cost: 500000 + w * 500,
    thumb: pick(PHOTOS.kitchen_wall, i),
  });
});

// Wall lift-up (single horizontal door)
MODELS.push({
  sku: "KW-LIFT-800", cat: "kitchen.wall",
  nameUz: "Oshxona yuqori shkaf (lift-up) 800mm",
  style: ["modern", "minimalist"],
  paramSchema: ps({
    W: { min: 600, max: 1200, step: 50, default: 800 },
    H: { min: 350, max: 500, step: 10, default: 400 },
    D: { min: 280, max: 400, step: 10, default: 320 },
    T: { min: 16, max: 25, step: 2, default: 18 },
    doors: { min: 1, max: 1, step: 1, default: 1 },
    shelves: { min: 1, max: 2, step: 1, default: 1 },
  }),
  defaults: dp({ W: 800, H: 400, D: 320, T: 18, doors: 1, shelves: 1 }),
  dsl: carcassDoorsDsl(),
  bbox: [800, 320, 400],
  compat: { kitchen: 0.9 },
  cost: 950000,
  thumb: pick(PHOTOS.kitchen_wall, 1),
});

// ─── KITCHEN TALL CABINETS (3) ──────────────────────────────────────────────
const TALL_VARIANTS = [
  { sku: "KT-PENCIL", w: 600, name: "Pencil shkaf (oziq-ovqat)", shelves: 5 },
  { sku: "KT-OVEN",   w: 600, name: "Pech shkafi (oven housing)", shelves: 2 },
  { sku: "KT-FRIDGE", w: 700, name: "Muzlatgich shkafi", shelves: 1 },
];
TALL_VARIANTS.forEach((v, i) => {
  MODELS.push({
    sku: v.sku, cat: "kitchen.tall",
    nameUz: `Oshxona ${v.name}`,
    style: ["modern", "classic"],
    paramSchema: ps({
      W: { min: 400, max: 800, step: 50, default: v.w },
      H: { min: 1800, max: 2400, step: 50, default: 2200 },
      D: { min: 400, max: 650, step: 10, default: 560 },
      T: { min: 16, max: 25, step: 2, default: 18 },
      doors: { min: 1, max: 2, step: 1, default: 2 },
      shelves: { min: 0, max: 6, step: 1, default: v.shelves },
    }),
    defaults: dp({ W: v.w, H: 2200, D: 560, T: 18, doors: 2, shelves: v.shelves }),
    dsl: carcassDoorsDsl(),
    bbox: [v.w, 560, 2200],
    compat: { kitchen: 0.9 },
    cost: 1800000 + v.w * 1500,
    thumb: pick(PHOTOS.kitchen_tall, i),
  });
});

// ─── WARDROBE SWING (3 sizes) ──────────────────────────────────────────────
const WARDROBE_SWING = [
  { w: 800,  doors: 2, shelves: 3, name: "Garderob 800 (2 eshik)" },
  { w: 1000, doors: 2, shelves: 4, name: "Garderob 1000 (2 eshik)" },
  { w: 1500, doors: 3, shelves: 5, name: "Garderob 1500 (3 eshik)" },
  { w: 2000, doors: 4, shelves: 6, name: "Garderob 2000 (4 eshik)" },
];
WARDROBE_SWING.forEach((v, i) => {
  MODELS.push({
    sku: `WS-SW-${v.w}`, cat: "wardrobe.swing",
    nameUz: v.name,
    style: ["classic", "modern"],
    paramSchema: ps({
      W: { min: 600, max: 2400, step: 100, default: v.w },
      H: { min: 1800, max: 2400, step: 50, default: 2200 },
      D: { min: 500, max: 700, step: 10, default: 600 },
      T: { min: 16, max: 25, step: 2, default: 18 },
      doors: { min: 2, max: 4, step: 1, default: v.doors },
      shelves: { min: 2, max: 6, step: 1, default: v.shelves },
    }),
    defaults: dp({ W: v.w, H: 2200, D: 600, T: 18, doors: v.doors, shelves: v.shelves }),
    dsl: wardrobeDsl(),
    bbox: [v.w, 600, 2200],
    compat: { bedroom: 0.95, hallway: 0.7 },
    cost: 2200000 + v.w * 1600,
    thumb: pick(PHOTOS.wardrobe_swing, i),
  });
});

// ─── WARDROBE SLIDE / KUPE (4 sizes) ───────────────────────────────────────
const WARDROBE_SLIDE = [
  { w: 1500, doors: 2, shelves: 4 },
  { w: 1800, doors: 2, shelves: 5 },
  { w: 2400, doors: 3, shelves: 6 },
  { w: 3000, doors: 3, shelves: 7 },
  { w: 3600, doors: 4, shelves: 8 },
];
WARDROBE_SLIDE.forEach((v, i) => {
  MODELS.push({
    sku: `WS-SL-${v.w}`, cat: "wardrobe.slide",
    nameUz: `Kupe garderob ${v.w}mm (${v.doors} eshik)`,
    style: ["modern", "minimalist"],
    paramSchema: ps({
      W: { min: 1200, max: 4000, step: 100, default: v.w },
      H: { min: 2200, max: 2800, step: 50, default: 2400 },
      D: { min: 550, max: 700, step: 10, default: 600 },
      T: { min: 16, max: 25, step: 2, default: 18 },
      doors: { min: 2, max: 4, step: 1, default: v.doors },
      shelves: { min: 3, max: 10, step: 1, default: v.shelves },
    }),
    defaults: dp({ W: v.w, H: 2400, D: 600, T: 18, doors: v.doors, shelves: v.shelves }),
    dsl: wardrobeDsl(),
    bbox: [v.w, 600, 2400],
    compat: { bedroom: 0.95, hallway: 0.6 },
    cost: 3500000 + v.w * 1800,
    thumb: pick(PHOTOS.wardrobe_slide, i),
  });
});

// ─── BEDS (Platform: 6 sizes) ──────────────────────────────────────────────
const BED_PLATFORM = [
  { w: 900,  l: 2000, name: "Bir kishilik 900x2000" },
  { w: 1200, l: 2000, name: "Bir-yarim kishilik 1200x2000" },
  { w: 1400, l: 2000, name: "1400x2000" },
  { w: 1600, l: 2000, name: "Ikki kishilik 1600x2000" },
  { w: 1800, l: 2000, name: "King size 1800x2000" },
  { w: 2000, l: 2000, name: "Super king 2000x2000" },
];
BED_PLATFORM.forEach((v, i) => {
  MODELS.push({
    sku: `BED-PLAT-${v.w}`, cat: "bed.platform",
    nameUz: `Karavot platforma ${v.name}`,
    style: ["modern", "minimalist", "japandi", "scandinavian"],
    paramSchema: ps({
      W: { min: 900, max: 2000, step: 100, default: v.w },
      L: { min: 1900, max: 2200, step: 100, default: v.l },
      H: { min: 300, max: 500, step: 10, default: 380 },
      headH: { min: 600, max: 1200, step: 50, default: v.w >= 1600 ? 1000 : 900 },
      T: { min: 16, max: 25, step: 2, default: 18 },
    }),
    defaults: dp({ W: v.w, L: v.l, H: 380, headH: v.w >= 1600 ? 1000 : 900, T: 18 }),
    dsl: bedDsl(),
    bbox: [v.w, v.l, 1000],
    compat: { bedroom: 0.98, child: v.w <= 1200 ? 0.85 : 0.4 },
    cost: 1800000 + v.w * 700,
    thumb: pick(PHOTOS.bed_platform, i),
  });
});

// Classic upholstered bed
[1600, 1800].forEach((w, i) => {
  MODELS.push({
    sku: `BED-CLS-${w}`, cat: "bed.classic",
    nameUz: `Karavot klassik (yumshoq) ${w}x2000`,
    style: ["classic"],
    paramSchema: ps({
      W: { min: 1400, max: 2000, step: 100, default: w },
      L: { min: 1900, max: 2200, step: 100, default: 2000 },
      H: { min: 350, max: 500, step: 10, default: 420 },
      headH: { min: 900, max: 1400, step: 50, default: 1200 },
      T: { min: 16, max: 25, step: 2, default: 18 },
    }),
    defaults: dp({ W: w, L: 2000, H: 420, headH: 1200, T: 18 }),
    dsl: bedDsl(),
    bbox: [w, 2000, 1200],
    compat: { bedroom: 0.95 },
    cost: 4500000 + w * 1000,
    thumb: pick(PHOTOS.bed_classic, i),
  });
});

// ─── DINING TABLES (5) ──────────────────────────────────────────────────────
const DINING_TABLES = [
  { w: 1200, d: 800,  seats: "4 kishilik" },
  { w: 1400, d: 850,  seats: "4-6 kishilik" },
  { w: 1600, d: 900,  seats: "6 kishilik" },
  { w: 2000, d: 1000, seats: "8 kishilik" },
  { w: 2400, d: 1100, seats: "10 kishilik" },
];
DINING_TABLES.forEach((v, i) => {
  MODELS.push({
    sku: `TBL-DIN-${v.w}`, cat: "table.dining",
    nameUz: `Ovqat stoli ${v.w}x${v.d} (${v.seats})`,
    style: ["modern", "scandinavian", "classic"],
    paramSchema: ps({
      W: { min: 1000, max: 2800, step: 100, default: v.w },
      D: { min: 700, max: 1200, step: 50, default: v.d },
      H: { min: 720, max: 760, step: 10, default: 740 },
      T: { min: 25, max: 40, step: 5, default: 25 },
    }),
    defaults: dp({ W: v.w, D: v.d, H: 740, T: 25 }),
    dsl: tableDsl(),
    bbox: [v.w, v.d, 740],
    compat: { kitchen: 0.7, dining: 0.95, living: 0.5 },
    cost: 1400000 + v.w * 400,
    thumb: pick(PHOTOS.table_dining, i),
  });
});

// ─── COFFEE TABLES (4) ──────────────────────────────────────────────────────
const COFFEE_TABLES = [800, 1000, 1200, 1400];
COFFEE_TABLES.forEach((w, i) => {
  MODELS.push({
    sku: `TBL-COF-${w}`, cat: "table.coffee",
    nameUz: `Jurnal stol ${w}x600`,
    style: ["modern", "minimalist", "japandi"],
    paramSchema: ps({
      W: { min: 600, max: 1500, step: 50, default: w },
      D: { min: 500, max: 800, step: 50, default: 600 },
      H: { min: 380, max: 480, step: 10, default: 420 },
      T: { min: 18, max: 30, step: 2, default: 25 },
    }),
    defaults: dp({ W: w, D: 600, H: 420, T: 25 }),
    dsl: tableDsl(),
    bbox: [w, 600, 420],
    compat: { living: 0.95 },
    cost: 700000 + w * 250,
    thumb: pick(PHOTOS.table_coffee, i),
  });
});

// ─── OFFICE DESKS (4) ───────────────────────────────────────────────────────
[1200, 1400, 1600, 1800].forEach((w, i) => {
  MODELS.push({
    sku: `TBL-OFF-${w}`, cat: "table.office",
    nameUz: `Ish stoli ${w}x700`,
    style: ["modern", "minimalist"],
    paramSchema: ps({
      W: { min: 1000, max: 2000, step: 50, default: w },
      D: { min: 600, max: 900, step: 50, default: 700 },
      H: { min: 720, max: 760, step: 10, default: 740 },
      T: { min: 18, max: 30, step: 2, default: 25 },
    }),
    defaults: dp({ W: w, D: 700, H: 740, T: 25 }),
    dsl: tableDsl(),
    bbox: [w, 700, 740],
    compat: { office: 0.95, child: 0.7 },
    cost: 950000 + w * 300,
    thumb: pick(PHOTOS.table_office, i),
  });
});

// ─── OPEN SHELVES (4) ───────────────────────────────────────────────────────
const SHELVES = [
  { w: 600,  h: 1800, shelves: 4, name: "Ochiq javon kichik" },
  { w: 800,  h: 1800, shelves: 5, name: "Ochiq javon" },
  { w: 1000, h: 2000, shelves: 5, name: "Ochiq javon katta" },
  { w: 1200, h: 2200, shelves: 6, name: "Kutubxona javoni" },
];
SHELVES.forEach((v, i) => {
  MODELS.push({
    sku: `SHF-${v.w}-${v.shelves}`, cat: "shelf.open",
    nameUz: `${v.name} ${v.w}mm`,
    style: ["modern", "minimalist", "scandinavian"],
    paramSchema: ps({
      W: { min: 400, max: 1600, step: 50, default: v.w },
      H: { min: 900, max: 2400, step: 50, default: v.h },
      D: { min: 250, max: 400, step: 10, default: 320 },
      T: { min: 16, max: 25, step: 2, default: 18 },
      shelves: { min: 2, max: 8, step: 1, default: v.shelves },
    }),
    defaults: dp({ W: v.w, H: v.h, D: 320, T: 18, shelves: v.shelves }),
    dsl: shelfDsl(),
    bbox: [v.w, 320, v.h],
    compat: { living: 0.9, office: 0.85, child: 0.7 },
    cost: 750000 + v.w * 350,
    thumb: pick(PHOTOS.shelf_open, i),
  });
});

// ─── TV STANDS (4) ──────────────────────────────────────────────────────────
const TV_STANDS = [
  { w: 1200, doors: 2, name: "ixcham" },
  { w: 1600, doors: 2, name: "" },
  { w: 1800, doors: 3, name: "" },
  { w: 2200, doors: 4, name: "uzun" },
];
TV_STANDS.forEach((v, i) => {
  MODELS.push({
    sku: `TV-${v.w}`, cat: "tv.stand",
    nameUz: `TV tumba ${v.w}mm ${v.name}`.trim(),
    style: ["modern", "minimalist"],
    paramSchema: ps({
      W: { min: 1000, max: 2400, step: 100, default: v.w },
      H: { min: 350, max: 550, step: 10, default: 450 },
      D: { min: 350, max: 500, step: 10, default: 400 },
      T: { min: 16, max: 25, step: 2, default: 18 },
      doors: { min: 0, max: 4, step: 1, default: v.doors },
      shelves: { min: 0, max: 3, step: 1, default: 1 },
    }),
    defaults: dp({ W: v.w, H: 450, D: 400, T: 18, doors: v.doors, shelves: 1 }),
    dsl: carcassDoorsDsl(),
    bbox: [v.w, 400, 450],
    compat: { living: 0.95 },
    cost: 1100000 + v.w * 400,
    thumb: pick(PHOTOS.tv_stand, i),
  });
});

// ─── SOFAS (4) ──────────────────────────────────────────────────────────────
const SOFAS = [
  { w: 1600, name: "2 kishilik" },
  { w: 2000, name: "3 kishilik" },
  { w: 2400, name: "3 kishilik (katta)" },
  { w: 2800, name: "4 kishilik" },
];
SOFAS.forEach((v, i) => {
  MODELS.push({
    sku: `SOFA-${v.w}`, cat: "sofa.straight",
    nameUz: `Divan to'g'ri ${v.name} ${v.w}mm`,
    style: ["modern", "classic", "scandinavian"],
    paramSchema: ps({
      W: { min: 1400, max: 3200, step: 100, default: v.w },
      D: { min: 800, max: 1100, step: 50, default: 900 },
      H: { min: 800, max: 950, step: 10, default: 850 },
      backH: { min: 600, max: 850, step: 10, default: 750 },
      armH: { min: 500, max: 700, step: 10, default: 600 },
      T: { min: 16, max: 25, step: 2, default: 18 },
    }),
    defaults: dp({ W: v.w, D: 900, H: 850, backH: 750, armH: 600, T: 18 }),
    dsl: sofaDsl(),
    bbox: [v.w, 900, 850],
    compat: { living: 0.95 },
    cost: 6500000 + v.w * 1500,
    thumb: pick(PHOTOS.sofa_straight, i),
  });
});

// ─── DINING CHAIRS (3) ──────────────────────────────────────────────────────
const CHAIRS = [
  { sku: "CH-CLS", name: "Stul klassik", style: ["classic"] },
  { sku: "CH-MOD", name: "Stul modern", style: ["modern", "minimalist"] },
  { sku: "CH-SCD", name: "Stul Scandinavian", style: ["scandinavian", "japandi"] },
];
CHAIRS.forEach((v, i) => {
  MODELS.push({
    sku: v.sku, cat: "chair.dining",
    nameUz: v.name, style: v.style,
    paramSchema: ps({
      W: { min: 380, max: 480, step: 10, default: 420 },
      D: { min: 400, max: 500, step: 10, default: 440 },
      H: { min: 420, max: 480, step: 10, default: 450 },
      backH: { min: 350, max: 500, step: 10, default: 420 },
      T: { min: 16, max: 20, step: 2, default: 18 },
    }),
    defaults: dp({ W: 420, D: 440, H: 450, backH: 420, T: 18 }),
    dsl: chairDsl(),
    bbox: [420, 440, 870],
    compat: { kitchen: 0.85, dining: 0.95 },
    cost: 380000,
    thumb: pick(PHOTOS.chair_dining, i),
  });
});

// ─── NIGHTSTANDS (3) ────────────────────────────────────────────────────────
[400, 450, 550].forEach((w, i) => {
  MODELS.push({
    sku: `NS-${w}`, cat: "nightstand",
    nameUz: `Tungi tumba ${w}mm`,
    style: ["modern", "classic", "scandinavian"],
    paramSchema: ps({
      W: { min: 350, max: 600, step: 50, default: w },
      H: { min: 400, max: 600, step: 10, default: 480 },
      D: { min: 350, max: 450, step: 10, default: 400 },
      T: { min: 16, max: 25, step: 2, default: 18 },
      doors: { min: 0, max: 1, step: 1, default: 1 },
      drawers: { min: 0, max: 2, step: 1, default: 1 },
      shelves: { min: 1, max: 2, step: 1, default: 1 },
    }),
    defaults: dp({ W: w, H: 480, D: 400, T: 18, doors: 1, drawers: 1, shelves: 1 }),
    dsl: carcassDoorsDsl(),
    bbox: [w, 400, 480],
    compat: { bedroom: 0.95 },
    cost: 480000 + w * 400,
    thumb: pick(PHOTOS.nightstand, i),
  });
});

// ─── DRESSERS / CHEST OF DRAWERS (4) ────────────────────────────────────────
[
  { w: 800, drawers: 3, name: "Komod 3 tortma" },
  { w: 1000, drawers: 4, name: "Komod 4 tortma" },
  { w: 1200, drawers: 5, name: "Komod 5 tortma" },
  { w: 1400, drawers: 6, name: "Komod keng 6 tortma" },
].forEach((v, i) => {
  MODELS.push({
    sku: `DR-${v.w}-${v.drawers}`, cat: "nightstand",
    nameUz: `${v.name} ${v.w}mm`,
    style: ["modern", "classic", "scandinavian"],
    paramSchema: ps({
      W: { min: 600, max: 1600, step: 50, default: v.w },
      H: { min: 700, max: 1100, step: 10, default: 850 },
      D: { min: 400, max: 500, step: 10, default: 450 },
      T: { min: 16, max: 25, step: 2, default: 18 },
      drawers: { min: 3, max: 7, step: 1, default: v.drawers },
      doors: { min: 0, max: 0, step: 1, default: 0 },
      shelves: { min: 0, max: 0, step: 1, default: 0 },
    }),
    defaults: dp({ W: v.w, H: 850, D: 450, T: 18, drawers: v.drawers, doors: 0, shelves: 0 }),
    dsl: carcassDrawersDsl(),
    bbox: [v.w, 450, 850],
    compat: { bedroom: 0.95, living: 0.6 },
    cost: 1200000 + v.w * 800,
    thumb: pick(PHOTOS.nightstand, i),
  });
});

// ─── BOOKSHELVES TALL (3) ───────────────────────────────────────────────────
[
  { w: 800, h: 2000, shelves: 5, name: "Kitob javoni baland" },
  { w: 600, h: 1800, shelves: 4, name: "Kitob javoni" },
  { w: 1200, h: 2200, shelves: 5, name: "Kitob javoni keng" },
].forEach((v, i) => {
  MODELS.push({
    sku: `BK-${v.w}-${v.h}`, cat: "shelf.open",
    nameUz: `${v.name} ${v.w}×${v.h}mm`,
    style: ["modern", "classic", "scandinavian"],
    paramSchema: ps({
      W: { min: 600, max: 1400, step: 50, default: v.w },
      H: { min: 1500, max: 2400, step: 50, default: v.h },
      D: { min: 280, max: 400, step: 10, default: 320 },
      T: { min: 16, max: 25, step: 2, default: 18 },
      shelves: { min: 3, max: 7, step: 1, default: v.shelves },
    }),
    defaults: dp({ W: v.w, H: v.h, D: 320, T: 18, shelves: v.shelves }),
    dsl: shelfDsl(),
    bbox: [v.w, 320, v.h],
    compat: { living: 0.9, office: 0.95 },
    cost: 900000 + v.w * 700,
    thumb: pick(PHOTOS.shelf_open, i),
  });
});

// ─── SHOE RACKS / HALLWAY (3) ───────────────────────────────────────────────
[
  { w: 700, h: 900, name: "Kavush shkafi" },
  { w: 900, h: 1100, name: "Kavush shkafi keng" },
  { w: 600, h: 600, name: "Kavush tumba past" },
].forEach((v, i) => {
  MODELS.push({
    sku: `SH-${v.w}-${v.h}`, cat: "wardrobe.swing",
    nameUz: `${v.name} ${v.w}mm`,
    style: ["modern", "minimalist"],
    paramSchema: ps({
      W: { min: 500, max: 1200, step: 50, default: v.w },
      H: { min: 500, max: 1300, step: 50, default: v.h },
      D: { min: 280, max: 400, step: 10, default: 320 },
      T: { min: 16, max: 25, step: 2, default: 18 },
      doors: { min: 1, max: 3, step: 1, default: v.w >= 800 ? 3 : 2 },
      shelves: { min: 2, max: 5, step: 1, default: 3 },
    }),
    defaults: dp({ W: v.w, H: v.h, D: 320, T: 18, doors: v.w >= 800 ? 3 : 2, shelves: 3 }),
    dsl: carcassDoorsDsl(),
    bbox: [v.w, 320, v.h],
    compat: { hallway: 0.95 },
    cost: 700000 + v.w * 500,
    thumb: pick(PHOTOS.wardrobe_swing, i),
  });
});

// ─── CONSOLE TABLES (2) ─────────────────────────────────────────────────────
[1000, 1200].forEach((w, i) => {
  MODELS.push({
    sku: `CON-${w}`, cat: "table.coffee",
    nameUz: `Konsol stol ${w}×350mm`,
    style: ["modern", "classic"],
    paramSchema: ps({
      W: { min: 800, max: 1600, step: 50, default: w },
      D: { min: 300, max: 450, step: 10, default: 350 },
      H: { min: 750, max: 850, step: 10, default: 800 },
      T: { min: 18, max: 30, step: 2, default: 25 },
    }),
    defaults: dp({ W: w, D: 350, H: 800, T: 25 }),
    dsl: tableDsl(),
    bbox: [w, 350, 800],
    compat: { hallway: 0.85, living: 0.8 },
    cost: 850000 + w * 500,
    thumb: pick(PHOTOS.table_coffee, i + 2),
  });
});

// ─── KIDS BEDS (2) ──────────────────────────────────────────────────────────
[
  { w: 900, l: 1900, name: "Bolalar karavoti" },
  { w: 1200, l: 2000, name: "O'smir karavoti" },
].forEach((v, i) => {
  MODELS.push({
    sku: `BED-KID-${v.w}`, cat: "bed.platform",
    nameUz: `${v.name} ${v.w}×${v.l}`,
    style: ["modern", "scandinavian"],
    paramSchema: ps({
      W: { min: 800, max: 1400, step: 50, default: v.w },
      L: { min: 1800, max: 2100, step: 50, default: v.l },
      H: { min: 300, max: 450, step: 10, default: 380 },
      headH: { min: 500, max: 900, step: 50, default: 700 },
      T: { min: 16, max: 25, step: 2, default: 18 },
    }),
    defaults: dp({ W: v.w, L: v.l, H: 380, headH: 700, T: 18 }),
    dsl: bedDsl(),
    bbox: [v.w, v.l, 700],
    compat: { child: 0.98, bedroom: 0.5 },
    cost: 1400000 + v.w * 600,
    thumb: pick(PHOTOS.bed_platform, i + 1),
  });
});

// ───────────────────────────────────────────────────────────────────────────
// MAIN
// ───────────────────────────────────────────────────────────────────────────
async function main() {
  console.log(`🌱 Extended catalog seed: ${MODELS.length} models`);

  // Get default materials
  const materials = await db.material.findMany();
  if (!materials.length) {
    throw new Error("No materials in DB. Run prisma/seed.ts first to seed categories + materials.");
  }
  const defaultMat = materials.find((m) => m.code === "EGGER_W1000_18") || materials[0];
  const backMat = materials.find((m) => m.code === "HDF_BACK_3") || materials[0];

  const cats = await db.furnitureCategory.findMany();
  const catMap = new Map(cats.map((c) => [c.code, c.id]));

  // Ensure required categories exist (defensive — usually seeded by main seed.ts)
  const requiredCats = Array.from(new Set(MODELS.map((m) => m.cat)));
  const missing = requiredCats.filter((c) => !catMap.has(c));
  if (missing.length) {
    console.warn("Missing categories (skipping models):", missing.join(", "));
  }

  let inserted = 0, updated = 0;

  for (const m of MODELS) {
    const catId = catMap.get(m.cat);
    if (!catId) continue;

    // Upsert model with thumbnail
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
      // Wipe old modules/parts for rebuild
      await db.module.deleteMany({ where: { modelId: existing.id } });
      updated++;
    } else {
      model = await db.furnitureModel.create({ data: { sku: m.sku, ...data } });
      inserted++;
    }

    // Build module + parts
    const mod = await db.module.create({
      data: {
        modelId: model.id,
        code: "main",
        role: "carcass",
        transform: JSON.stringify({ pos: [0, 0, 0], rot: [0, 0, 0] }),
      },
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

  console.log(`✅ ${inserted} new, ${updated} updated · Jami: ${MODELS.length} mebel`);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => db.$disconnect());
