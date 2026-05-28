import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const CATEGORIES = [
  { code: "kitchen.base",    path: "furniture.kitchen.base",    nameUz: "Oshxona pastki shkaf",  rooms: ["kitchen"],  styles: ["modern","classic","scandinavian","minimalist"] },
  { code: "kitchen.wall",    path: "furniture.kitchen.wall",    nameUz: "Oshxona yuqori shkaf",  rooms: ["kitchen"],  styles: ["modern","classic","scandinavian"] },
  { code: "kitchen.tall",    path: "furniture.kitchen.tall",    nameUz: "Oshxona baland shkaf",  rooms: ["kitchen"],  styles: ["modern","classic"] },
  { code: "wardrobe.swing",  path: "furniture.wardrobe.swing",  nameUz: "Garderob (oddiy eshik)", rooms: ["bedroom","hallway"], styles: ["classic","modern"] },
  { code: "wardrobe.slide",  path: "furniture.wardrobe.slide",  nameUz: "Kupe garderob",         rooms: ["bedroom","hallway"], styles: ["modern","minimalist"] },
  { code: "bed.platform",    path: "furniture.bed.platform",    nameUz: "Karavot (platforma)",   rooms: ["bedroom","child"],   styles: ["modern","minimalist","japandi","scandinavian"] },
  { code: "bed.classic",     path: "furniture.bed.classic",     nameUz: "Karavot (klassik)",     rooms: ["bedroom"],            styles: ["classic"] },
  { code: "table.dining",    path: "furniture.table.dining",    nameUz: "Ovqat stoli",           rooms: ["kitchen","dining","living"], styles: ["modern","classic","scandinavian"] },
  { code: "table.coffee",    path: "furniture.table.coffee",    nameUz: "Jurnal stol",           rooms: ["living"],             styles: ["modern","minimalist","japandi"] },
  { code: "table.office",    path: "furniture.table.office",    nameUz: "Ish stoli",             rooms: ["office","child"],     styles: ["modern","minimalist"] },
  { code: "shelf.open",      path: "furniture.shelf.open",      nameUz: "Ochiq javon",           rooms: ["living","office","child"], styles: ["modern","minimalist","scandinavian"] },
  { code: "tv.stand",        path: "furniture.tv.stand",        nameUz: "TV tumba",              rooms: ["living"],             styles: ["modern","minimalist"] },
  { code: "sofa.straight",   path: "furniture.sofa.straight",   nameUz: "Divan (to'g'ri)",       rooms: ["living"],             styles: ["modern","classic","scandinavian"] },
  { code: "chair.dining",    path: "furniture.chair.dining",    nameUz: "Stul",                  rooms: ["kitchen","dining"],   styles: ["modern","classic","scandinavian"] },
  { code: "nightstand",      path: "furniture.nightstand",      nameUz: "Tungi tumba",           rooms: ["bedroom"],            styles: ["modern","classic","scandinavian"] },
];

const MATERIALS = [
  { code: "EGGER_W1000_18", type: "LDSP", vendor: "Egger", decor: "Premium White W1000", colorHex: "#F2EFEA", sheetW: 2800, sheetH: 2070, thickness: 18, hasGrain: false, costPerM2: 95000, stockM2: 1200 },
  { code: "EGGER_H1334_18", type: "LDSP", vendor: "Egger", decor: "Sand Grey Sorano Oak H1334", colorHex: "#D9C9B6", sheetW: 2800, sheetH: 2070, thickness: 18, hasGrain: true, costPerM2: 135000, stockM2: 800 },
  { code: "EGGER_U999_18",  type: "LDSP", vendor: "Egger", decor: "Black U999", colorHex: "#1F1F1F", sheetW: 2800, sheetH: 2070, thickness: 18, hasGrain: false, costPerM2: 110000, stockM2: 600 },
  { code: "KRONO_8508_18",  type: "LDSP", vendor: "Kronospan", decor: "Walnut Pacific 8508", colorHex: "#5B3A29", sheetW: 2800, sheetH: 2070, thickness: 18, hasGrain: true, costPerM2: 120000, stockM2: 500 },
  { code: "MDF_WHITE_16",   type: "MDF",  vendor: "Kastamonu", decor: "MDF White Lacquer", colorHex: "#FFFFFF", sheetW: 2800, sheetH: 2070, thickness: 16, hasGrain: false, costPerM2: 180000, stockM2: 300 },
  { code: "HDF_BACK_3",     type: "HDF",  vendor: "Generic", decor: "Back panel", colorHex: "#C9B79C", sheetW: 2800, sheetH: 2070, thickness: 3, hasGrain: false, costPerM2: 35000, stockM2: 1000 },
];

// Param schema helper
const ps = (params: Record<string, { min: number; max: number; step: number; default: number; label?: string }>) => JSON.stringify(params);
const dp = (params: Record<string, number>) => JSON.stringify(params);

// Build a kitchen base cabinet
function kitchenBaseDsl() {
  return JSON.stringify({
    type: "carcass_box",
    parts: [
      { code: "side_L",  L: "H - T",       W: "D",         T: 18, edges: { front: "2.0" } },
      { code: "side_R",  L: "H - T",       W: "D",         T: 18, edges: { front: "2.0" } },
      { code: "bottom",  L: "W - 2*T",     W: "D",         T: 18, edges: { front: "2.0" } },
      { code: "top_rail",L: "W - 2*T",     W: 100,         T: 18, edges: {} },
      { code: "back",    L: "W - 4",       W: "H - 4",     T: 3,  edges: {} },
      { code: "shelf",   L: "W - 2*T",     W: "D - 30",    T: 18, edges: { front: "0.4" }, qty: "shelves" },
      { code: "door",    L: "(W - 4)/doors", W: "H - 4",   T: 18, edges: { all: "2.0" }, qty: "doors" },
    ],
  });
}

function wardrobeDsl() {
  return JSON.stringify({
    type: "carcass_box",
    parts: [
      { code: "side_L",  L: "H",           W: "D",         T: 18, edges: { front: "2.0" } },
      { code: "side_R",  L: "H",           W: "D",         T: 18, edges: { front: "2.0" } },
      { code: "top",     L: "W - 2*T",     W: "D",         T: 18, edges: { front: "2.0" } },
      { code: "bottom",  L: "W - 2*T",     W: "D",         T: 18, edges: { front: "2.0" } },
      { code: "back",    L: "W - 4",       W: "H - 4",     T: 3,  edges: {} },
      { code: "shelf",   L: "W - 2*T",     W: "D - 30",    T: 18, edges: { front: "0.4" }, qty: "shelves" },
      { code: "door",    L: "(W - 4)/doors", W: "H - 4",   T: 18, edges: { all: "2.0" }, qty: "doors" },
    ],
  });
}

function bedDsl() {
  return JSON.stringify({
    type: "bed_platform",
    parts: [
      { code: "head",    L: "W",           W: "headH",     T: 18, edges: { all: "2.0" } },
      { code: "foot",    L: "W",           W: 200,         T: 18, edges: { all: "2.0" } },
      { code: "side_L",  L: "L",           W: 200,         T: 18, edges: { top: "2.0" } },
      { code: "side_R",  L: "L",           W: 200,         T: 18, edges: { top: "2.0" } },
      { code: "slat_support", L: "L - 36", W: 80,          T: 18, edges: {} },
      { code: "slat",    L: "W - 36",      W: 70,          T: 18, edges: {}, qty: 14 },
    ],
  });
}

function tableDsl() {
  return JSON.stringify({
    type: "table",
    parts: [
      { code: "top",     L: "W",           W: "D",         T: 25, edges: { all: "2.0" } },
      { code: "leg",     L: "H - T",       W: 80,          T: 80, edges: {}, qty: 4 },
      { code: "apron_L", L: "W - 200",     W: 100,         T: 18, edges: {}, qty: 2 },
      { code: "apron_S", L: "D - 200",     W: 100,         T: 18, edges: {}, qty: 2 },
    ],
  });
}

function shelfDsl() {
  return JSON.stringify({
    type: "open_shelf",
    parts: [
      { code: "side_L",  L: "H",           W: "D",         T: 18, edges: { all: "2.0" } },
      { code: "side_R",  L: "H",           W: "D",         T: 18, edges: { all: "2.0" } },
      { code: "shelf",   L: "W - 2*T",     W: "D",         T: 18, edges: { front: "2.0" }, qty: "shelves" },
      { code: "back",    L: "W - 4",       W: "H - 4",     T: 3,  edges: {} },
    ],
  });
}

const MODELS = [
  { sku: "KB-LIN-600",  cat: "kitchen.base",   nameUz: "Oshxona pastki shkaf 600 (chiziqli)", style: ["modern","scandinavian","minimalist"],
    paramSchema: ps({ W:{min:300,max:1200,step:50,default:600}, H:{min:600,max:900,step:10,default:720}, D:{min:400,max:650,step:10,default:560}, T:{min:16,max:25,step:2,default:18}, doors:{min:1,max:2,step:1,default:2}, shelves:{min:0,max:3,step:1,default:1} }),
    defaults: dp({W:600,H:720,D:560,T:18,doors:2,shelves:1}), dsl: kitchenBaseDsl(), bbox:[600,560,720], compat:{kitchen:0.95,dining:0.2}, cost: 850000 },
  { sku: "KB-LIN-800",  cat: "kitchen.base",   nameUz: "Oshxona pastki shkaf 800", style: ["modern","scandinavian"],
    paramSchema: ps({ W:{min:600,max:1200,step:50,default:800}, H:{min:600,max:900,step:10,default:720}, D:{min:400,max:650,step:10,default:560}, T:{min:16,max:25,step:2,default:18}, doors:{min:1,max:2,step:1,default:2}, shelves:{min:0,max:3,step:1,default:1} }),
    defaults: dp({W:800,H:720,D:560,T:18,doors:2,shelves:1}), dsl: kitchenBaseDsl(), bbox:[800,560,720], compat:{kitchen:0.95}, cost: 1050000 },
  { sku: "KW-600",      cat: "kitchen.wall",   nameUz: "Oshxona yuqori shkaf 600", style: ["modern","scandinavian"],
    paramSchema: ps({ W:{min:300,max:1200,step:50,default:600}, H:{min:300,max:900,step:10,default:720}, D:{min:280,max:400,step:10,default:320}, T:{min:16,max:25,step:2,default:18}, doors:{min:1,max:2,step:1,default:2}, shelves:{min:1,max:3,step:1,default:2} }),
    defaults: dp({W:600,H:720,D:320,T:18,doors:2,shelves:2}), dsl: kitchenBaseDsl(), bbox:[600,320,720], compat:{kitchen:0.95}, cost: 720000 },
  { sku: "KT-TALL",     cat: "kitchen.tall",   nameUz: "Oshxona baland shkaf (pencil)", style: ["modern"],
    paramSchema: ps({ W:{min:400,max:800,step:50,default:600}, H:{min:1800,max:2400,step:50,default:2200}, D:{min:400,max:650,step:10,default:560}, T:{min:16,max:25,step:2,default:18}, doors:{min:1,max:2,step:1,default:2}, shelves:{min:3,max:6,step:1,default:5} }),
    defaults: dp({W:600,H:2200,D:560,T:18,doors:2,shelves:5}), dsl: kitchenBaseDsl(), bbox:[600,560,2200], compat:{kitchen:0.9}, cost: 2200000 },
  { sku: "WS-SWING-2",  cat: "wardrobe.swing", nameUz: "Garderob 2 eshikli (oddiy)", style: ["classic","modern"],
    paramSchema: ps({ W:{min:800,max:1400,step:50,default:1000}, H:{min:1800,max:2400,step:50,default:2200}, D:{min:500,max:650,step:10,default:600}, T:{min:16,max:25,step:2,default:18}, doors:{min:2,max:2,step:1,default:2}, shelves:{min:2,max:5,step:1,default:3} }),
    defaults: dp({W:1000,H:2200,D:600,T:18,doors:2,shelves:3}), dsl: wardrobeDsl(), bbox:[1000,600,2200], compat:{bedroom:0.9,hallway:0.7}, cost: 3500000 },
  { sku: "WS-SLIDE-3",  cat: "wardrobe.slide", nameUz: "Kupe garderob 3 eshikli", style: ["modern","minimalist"],
    paramSchema: ps({ W:{min:1800,max:3600,step:100,default:2400}, H:{min:2200,max:2700,step:50,default:2400}, D:{min:550,max:700,step:10,default:600}, T:{min:16,max:25,step:2,default:18}, doors:{min:3,max:3,step:1,default:3}, shelves:{min:3,max:8,step:1,default:5} }),
    defaults: dp({W:2400,H:2400,D:600,T:18,doors:3,shelves:5}), dsl: wardrobeDsl(), bbox:[2400,600,2400], compat:{bedroom:0.95,hallway:0.6}, cost: 6800000 },
  { sku: "BED-PLAT-160", cat: "bed.platform",  nameUz: "Karavot platforma 160x200", style: ["modern","minimalist","japandi","scandinavian"],
    paramSchema: ps({ W:{min:900,max:2000,step:100,default:1600}, L:{min:1900,max:2200,step:100,default:2000}, H:{min:300,max:500,step:10,default:380}, headH:{min:600,max:1200,step:50,default:900}, T:{min:16,max:25,step:2,default:18} }),
    defaults: dp({W:1600,L:2000,H:380,headH:900,T:18}), dsl: bedDsl(), bbox:[1600,2000,900], compat:{bedroom:0.98,child:0.5}, cost: 2800000 },
  { sku: "BED-PLAT-180", cat: "bed.platform",  nameUz: "Karavot platforma 180x200", style: ["modern","minimalist","japandi"],
    paramSchema: ps({ W:{min:900,max:2000,step:100,default:1800}, L:{min:1900,max:2200,step:100,default:2000}, H:{min:300,max:500,step:10,default:380}, headH:{min:600,max:1200,step:50,default:1000}, T:{min:16,max:25,step:2,default:18} }),
    defaults: dp({W:1800,L:2000,H:380,headH:1000,T:18}), dsl: bedDsl(), bbox:[1800,2000,1000], compat:{bedroom:0.98}, cost: 3200000 },
  { sku: "TBL-DIN-1600", cat: "table.dining", nameUz: "Ovqat stoli 1600x900", style: ["modern","scandinavian"],
    paramSchema: ps({ W:{min:1200,max:2400,step:100,default:1600}, D:{min:800,max:1100,step:50,default:900}, H:{min:720,max:760,step:10,default:740}, T:{min:25,max:40,step:5,default:25} }),
    defaults: dp({W:1600,D:900,H:740,T:25}), dsl: tableDsl(), bbox:[1600,900,740], compat:{kitchen:0.7,dining:0.95,living:0.5}, cost: 1800000 },
  { sku: "TBL-COF-1200", cat: "table.coffee", nameUz: "Jurnal stol 1200x600", style: ["modern","minimalist","japandi"],
    paramSchema: ps({ W:{min:800,max:1500,step:50,default:1200}, D:{min:500,max:800,step:50,default:600}, H:{min:380,max:480,step:10,default:420}, T:{min:18,max:30,step:2,default:25} }),
    defaults: dp({W:1200,D:600,H:420,T:25}), dsl: tableDsl(), bbox:[1200,600,420], compat:{living:0.95}, cost: 950000 },
  { sku: "TBL-OFF-1400", cat: "table.office", nameUz: "Ish stoli 1400x700", style: ["modern","minimalist"],
    paramSchema: ps({ W:{min:1000,max:2000,step:50,default:1400}, D:{min:600,max:900,step:50,default:700}, H:{min:720,max:760,step:10,default:740}, T:{min:18,max:30,step:2,default:25} }),
    defaults: dp({W:1400,D:700,H:740,T:25}), dsl: tableDsl(), bbox:[1400,700,740], compat:{office:0.95,child:0.7}, cost: 1300000 },
  { sku: "SHF-OPN-5",   cat: "shelf.open",    nameUz: "Ochiq javon 5 polkali", style: ["modern","minimalist","scandinavian"],
    paramSchema: ps({ W:{min:600,max:1200,step:50,default:800}, H:{min:1500,max:2200,step:50,default:1800}, D:{min:280,max:400,step:10,default:320}, T:{min:16,max:25,step:2,default:18}, shelves:{min:3,max:6,step:1,default:5} }),
    defaults: dp({W:800,H:1800,D:320,T:18,shelves:5}), dsl: shelfDsl(), bbox:[800,320,1800], compat:{living:0.9,office:0.85,child:0.7}, cost: 1100000 },
  { sku: "TV-STD-1800", cat: "tv.stand",      nameUz: "TV tumba 1800", style: ["modern","minimalist"],
    paramSchema: ps({ W:{min:1200,max:2400,step:100,default:1800}, H:{min:350,max:550,step:10,default:450}, D:{min:350,max:500,step:10,default:400}, T:{min:16,max:25,step:2,default:18}, doors:{min:0,max:4,step:1,default:2}, shelves:{min:0,max:3,step:1,default:1} }),
    defaults: dp({W:1800,H:450,D:400,T:18,doors:2,shelves:1}), dsl: kitchenBaseDsl(), bbox:[1800,400,450], compat:{living:0.95}, cost: 1600000 },
  { sku: "NS-450",      cat: "nightstand",    nameUz: "Tungi tumba 450", style: ["modern","classic","scandinavian"],
    paramSchema: ps({ W:{min:400,max:600,step:50,default:450}, H:{min:400,max:600,step:10,default:480}, D:{min:350,max:450,step:10,default:400}, T:{min:16,max:25,step:2,default:18}, doors:{min:0,max:1,step:1,default:0}, shelves:{min:1,max:2,step:1,default:2} }),
    defaults: dp({W:450,H:480,D:400,T:18,doors:0,shelves:2}), dsl: kitchenBaseDsl(), bbox:[450,400,480], compat:{bedroom:0.95}, cost: 580000 },
  { sku: "WS-SLIDE-2",  cat: "wardrobe.slide", nameUz: "Kupe garderob 2 eshikli", style: ["modern","minimalist"],
    paramSchema: ps({ W:{min:1200,max:2200,step:100,default:1800}, H:{min:2200,max:2700,step:50,default:2400}, D:{min:550,max:700,step:10,default:600}, T:{min:16,max:25,step:2,default:18}, doors:{min:2,max:2,step:1,default:2}, shelves:{min:3,max:6,step:1,default:4} }),
    defaults: dp({W:1800,H:2400,D:600,T:18,doors:2,shelves:4}), dsl: wardrobeDsl(), bbox:[1800,600,2400], compat:{bedroom:0.92,hallway:0.6}, cost: 5200000 },
];

async function main() {
  console.log("🌱 Seeding...");

  // Categories
  const catMap = new Map<string, number>();
  for (const c of CATEGORIES) {
    const cat = await db.furnitureCategory.upsert({
      where: { code: c.code },
      update: {},
      create: { code: c.code, path: c.path, nameUz: c.nameUz, styleTags: JSON.stringify(c.styles), roomTypes: JSON.stringify(c.rooms) },
    });
    catMap.set(c.code, cat.id);
  }

  // Materials
  const matMap = new Map<string, number>();
  for (const m of MATERIALS) {
    const mat = await db.material.upsert({
      where: { code: m.code },
      update: {},
      create: m,
    });
    matMap.set(m.code, mat.id);
  }

  const defaultMatId = matMap.get("EGGER_W1000_18")!;
  const backMatId = matMap.get("HDF_BACK_3")!;

  // Models + a default carcass module + parts
  for (const m of MODELS) {
    const catId = catMap.get(m.cat)!;
    const created = await db.furnitureModel.upsert({
      where: { sku: m.sku },
      update: {},
      create: {
        sku: m.sku,
        categoryId: catId,
        nameUz: m.nameUz,
        paramSchema: m.paramSchema,
        defaultParams: m.defaults,
        geometryDsl: m.dsl,
        styleTags: JSON.stringify(m.style),
        roomCompat: JSON.stringify(m.compat),
        bboxW: m.bbox[0], bboxD: m.bbox[1], bboxH: m.bbox[2],
        baseCostUzs: m.cost,
      },
    });

    // Build parts from DSL
    const dsl = JSON.parse(m.dsl) as { parts: any[] };
    const moduleRow = await db.module.upsert({
      where: { id: -1 }, // never matches
      update: {},
      create: {
        modelId: created.id,
        code: "main",
        role: "carcass",
        transform: JSON.stringify({ pos: [0, 0, 0], rot: [0, 0, 0] }),
      },
    }).catch(async () => {
      return db.module.create({
        data: {
          modelId: created.id,
          code: "main",
          role: "carcass",
          transform: JSON.stringify({ pos: [0, 0, 0], rot: [0, 0, 0] }),
        },
      });
    });

    for (const p of dsl.parts) {
      const isBack = p.code === "back";
      await db.atomicPart.create({
        data: {
          moduleId: moduleRow.id,
          code: p.code,
          lengthExpr: String(p.L),
          widthExpr: String(p.W),
          thickness: Number(p.T) || 18,
          materialId: isBack ? backMatId : defaultMatId,
          edgeTop: p.edges?.all || p.edges?.top || null,
          edgeBottom: p.edges?.all || p.edges?.bottom || null,
          edgeLeft: p.edges?.all || p.edges?.left || null,
          edgeRight: p.edges?.all || p.edges?.right || p.edges?.front || null,
          qtyExpr: String(p.qty ?? 1),
        },
      });
    }
  }

  console.log(`✅ Seeded ${CATEGORIES.length} categories, ${MATERIALS.length} materials, ${MODELS.length} models`);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => db.$disconnect());
