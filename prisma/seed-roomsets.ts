// Curated full-room furniture bundles ("Komplektlar")
// Each set references real SKUs from the catalog and provides a ready-made room layout.

import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const PHOTO = (id: string) => `https://images.unsplash.com/photo-${id}?w=1200&q=85&auto=format&fit=crop`;

type SetItem = {
  sku: string;
  params?: Record<string, number>;
  position: [number, number, number]; // mm, in room coords (0,0 = back-left corner; +x right, +z forward, y up)
  rotationY?: number; // radians
  bodyColor?: string;
  frontColor?: string;
};

type RoomSetDef = {
  code: string;
  nameUz: string;
  description: string;
  roomType: string;
  styleTags: string[];
  thumb: string;
  minRoomW: number;
  minRoomD: number;
  featured?: boolean;
  items: SetItem[];
};

const COL = {
  white: "#F2EFEA", oak: "#D9C9B6", walnut: "#5B3A29", black: "#1F1F1F", grey: "#9B9B9B",
};

const SETS: RoomSetDef[] = [
  // ─── BEDROOM SETS ─────────────────────────────────────────────────────────
  {
    code: "BED-MASTER-MODERN-01",
    nameUz: "Modern usuldagi yotoqxona (Master)",
    description: "King karavot, 2 tungi tumba, kupe garderob, komod va pardoz stoli — modern minimalist uslub.",
    roomType: "bedroom",
    styleTags: ["modern", "minimalist"],
    thumb: PHOTO("1505693416388-ac5ce068fe85"),
    minRoomW: 4000, minRoomD: 4500,
    featured: true,
    items: [
      { sku: "BED-PL-1800-2000", position: [2000, 0, 1500], rotationY: 0, bodyColor: COL.white, frontColor: COL.oak },
      { sku: "NS-V2-WHITE-450",  position: [900, 0, 1100], bodyColor: COL.white, frontColor: COL.white },
      { sku: "NS-V2-WHITE-450",  position: [3100, 0, 1100], bodyColor: COL.white, frontColor: COL.white },
      { sku: "WS-SL-2400",       position: [200, 0, 4150], bodyColor: COL.white, frontColor: COL.white },
      { sku: "DR-V2-1300-5",     position: [3500, 0, 4250], bodyColor: COL.white, frontColor: COL.oak },
      { sku: "VAN-1100",         position: [2700, 0, 4350], bodyColor: COL.white, frontColor: COL.white },
    ],
  },
  {
    code: "BED-MASTER-CLASSIC-01",
    nameUz: "Klassik master yotoqxona",
    description: "Yog'och eman ranglarda, queen karavot va katta garderob bilan to'liq komplekt.",
    roomType: "bedroom", styleTags: ["classic"],
    thumb: PHOTO("1540518614846-7eded433c457"),
    minRoomW: 3800, minRoomD: 4200,
    items: [
      { sku: "BED-ST-1600-2000", position: [1900, 0, 1500], bodyColor: COL.oak, frontColor: COL.walnut },
      { sku: "NS-V2-OAK-500",  position: [900, 0, 1200], bodyColor: COL.oak, frontColor: COL.oak },
      { sku: "NS-V2-OAK-500",  position: [2900, 0, 1200], bodyColor: COL.oak, frontColor: COL.oak },
      { sku: "WS-SW-OAK-2100-4", position: [200, 0, 4050], bodyColor: COL.oak, frontColor: COL.walnut },
      { sku: "DR-V2-1500-6",     position: [2800, 0, 4150], bodyColor: COL.oak, frontColor: COL.oak },
    ],
  },
  {
    code: "BED-COMPACT-SCAND-01",
    nameUz: "Skandinav uslub yotoqxona (kompakt)",
    description: "Kichik xonalar uchun: 1.4m karavot, ixcham garderob, tumba va pardoz stoli.",
    roomType: "bedroom", styleTags: ["scandinavian", "minimalist"],
    thumb: PHOTO("1505691938895-1758d7feb511"),
    minRoomW: 3000, minRoomD: 3500,
    items: [
      { sku: "BED-PL-1400-2000", position: [1500, 0, 1100], bodyColor: COL.white, frontColor: COL.oak },
      { sku: "NS-V2-WHITE-400", position: [700, 0, 800], bodyColor: COL.white, frontColor: COL.white },
      { sku: "WS-SW-WHITE-1500-3", position: [200, 0, 3250], bodyColor: COL.white, frontColor: COL.white },
      { sku: "VAN-900", position: [2100, 0, 3300], bodyColor: COL.white, frontColor: COL.white },
    ],
  },
  {
    code: "BED-TEEN-01",
    nameUz: "O'smir yotoqxonasi",
    description: "1.2m karavot, ish stoli, garderob va javon — barchasi o'sayotgan farzand uchun.",
    roomType: "child", styleTags: ["modern", "scandinavian"],
    thumb: PHOTO("1571508601891-ca5e7a713859"),
    minRoomW: 2800, minRoomD: 3500,
    items: [
      { sku: "BED-PL-1200-2000", position: [1400, 0, 1200], bodyColor: COL.white, frontColor: COL.oak },
      { sku: "NS-V2-WHITE-400", position: [700, 0, 900], bodyColor: COL.white, frontColor: COL.white },
      { sku: "KID-DESK-1000-1", position: [400, 0, 3100], bodyColor: COL.white, frontColor: COL.white },
      { sku: "KID-WARDROBE-1200-7", position: [1700, 0, 3200], bodyColor: COL.white, frontColor: COL.oak },
      { sku: "SHF-V2-800-1200", position: [400, 0, 600], bodyColor: COL.white, frontColor: COL.white },
    ],
  },
  {
    code: "BED-CHILD-01",
    nameUz: "Bolalar xonasi (5-10 yosh)",
    description: "Bolalar karavoti, ixcham ish stoli, ochiq javon va kichik garderob.",
    roomType: "child", styleTags: ["modern", "scandinavian"],
    thumb: PHOTO("1522444690501-83ea7ad5a98c"),
    minRoomW: 2500, minRoomD: 3000,
    items: [
      { sku: "KID-BED-900-3", position: [1200, 0, 1100], bodyColor: COL.white, frontColor: COL.oak },
      { sku: "KID-DESK-800-0", position: [400, 0, 2700], bodyColor: COL.white, frontColor: COL.white },
      { sku: "KID-WARDROBE-900-6", position: [1600, 0, 2750], bodyColor: COL.white, frontColor: COL.oak },
      { sku: "SHF-V2-600-1500", position: [350, 0, 600], bodyColor: COL.white, frontColor: COL.white },
    ],
  },

  // ─── KITCHEN SETS ─────────────────────────────────────────────────────────
  {
    code: "KIT-LSHAPE-MODERN-01",
    nameUz: "L-shape modern oshxona (3.0×2.4m)",
    description: "L shaklidagi bazaviy va yuqori shkaflar, balandligi 2.1m, oq glyans uslub.",
    roomType: "kitchen", styleTags: ["modern", "minimalist"],
    thumb: PHOTO("1556909114-f6e7ad7d3136"),
    minRoomW: 3000, minRoomD: 2400, featured: true,
    items: [
      // base linear (left wall)
      { sku: "KB-WHITE-600", position: [0, 0, 280], rotationY: 0, bodyColor: COL.white, frontColor: COL.white },
      { sku: "KB-WHITE-800", position: [600, 0, 280], bodyColor: COL.white, frontColor: COL.white },
      { sku: "KB-DR-600", params: { drawers: 3 }, position: [1400, 0, 280], bodyColor: COL.white, frontColor: COL.white },
      { sku: "KB-WHITE-900", position: [2000, 0, 280], bodyColor: COL.white, frontColor: COL.white },
      // wall cabinets
      { sku: "KW-WHITE-600-720", position: [0, 1500, 160], bodyColor: COL.white, frontColor: COL.white },
      { sku: "KW-WHITE-800-720", position: [600, 1500, 160], bodyColor: COL.white, frontColor: COL.white },
      { sku: "KW-WHITE-1000-720", position: [1400, 1500, 160], bodyColor: COL.white, frontColor: COL.white },
      // tall side
      { sku: "KT-FRIDGE-WHITE", position: [2900, 0, 290], bodyColor: COL.white, frontColor: COL.white },
    ],
  },
  {
    code: "KIT-LINEAR-OAK-01",
    nameUz: "Chiziqli oshxona Eman (2.4m)",
    description: "Eman uslubdagi chiziqli oshxona, klassik kichik kvartiralar uchun.",
    roomType: "kitchen", styleTags: ["scandinavian", "japandi"],
    thumb: PHOTO("1556912167-f556f1f39fdf"),
    minRoomW: 2500, minRoomD: 2200,
    items: [
      { sku: "KB-OAK-600", position: [0, 0, 280], bodyColor: COL.white, frontColor: COL.oak },
      { sku: "KB-OAK-800", position: [600, 0, 280], bodyColor: COL.white, frontColor: COL.oak },
      { sku: "KB-SINK-800", position: [1400, 0, 280], bodyColor: COL.white, frontColor: COL.oak },
      { sku: "KB-OAK-400", position: [2200, 0, 280], bodyColor: COL.white, frontColor: COL.oak },
      { sku: "KW-OAK-600-720", position: [0, 1500, 160], bodyColor: COL.white, frontColor: COL.oak },
      { sku: "KW-OAK-800-720", position: [600, 1500, 160], bodyColor: COL.white, frontColor: COL.oak },
      { sku: "KW-OAK-1000-720", position: [1400, 1500, 160], bodyColor: COL.white, frontColor: COL.oak },
    ],
  },
  {
    code: "KIT-ISLAND-PREMIUM-01",
    nameUz: "Premium oroli oshxona (4.0×3.5m)",
    description: "Markaziy orol, balandlikdagi shkaflar, 3 ta bar stuli — premium uslub.",
    roomType: "kitchen", styleTags: ["modern", "minimalist"],
    thumb: PHOTO("1556909212-d5b604d0c90d"),
    minRoomW: 4000, minRoomD: 3500, featured: true,
    items: [
      // back wall
      { sku: "KB-WHITE-600", position: [0, 0, 280], bodyColor: COL.white, frontColor: COL.white },
      { sku: "KB-WHITE-1000", position: [600, 0, 280], bodyColor: COL.white, frontColor: COL.white },
      { sku: "KB-DR-1000", params: { drawers: 4 }, position: [1600, 0, 280], bodyColor: COL.white, frontColor: COL.white },
      { sku: "KT-OVEN-WHITE", position: [2600, 0, 290], bodyColor: COL.white, frontColor: COL.white },
      { sku: "KT-FRIDGE-WHITE", position: [3300, 0, 290], bodyColor: COL.white, frontColor: COL.white },
      { sku: "KW-WHITE-1000-720", position: [600, 1500, 160], bodyColor: COL.white, frontColor: COL.white },
      { sku: "KW-WHITE-800-720", position: [1600, 1500, 160], bodyColor: COL.white, frontColor: COL.white },
      // island
      { sku: "KIS-2000", position: [1500, 0, 1900], bodyColor: COL.walnut, frontColor: COL.walnut },
      // bar stools at island
      { sku: "CH-V2-BAR-1", position: [1700, 0, 2700], bodyColor: COL.black },
      { sku: "CH-V2-BAR-1", position: [2200, 0, 2700], bodyColor: COL.black },
      { sku: "CH-V2-BAR-1", position: [2700, 0, 2700], bodyColor: COL.black },
    ],
  },
  {
    code: "KIT-COMPACT-WHITE-01",
    nameUz: "Kompakt oshxona Oq (1.8m)",
    description: "Studio uchun ixcham komplekt — 1.8m chiziqli oshxona.",
    roomType: "kitchen", styleTags: ["modern", "minimalist"],
    thumb: PHOTO("1556910103-1c02745aae4d"),
    minRoomW: 2000, minRoomD: 2000,
    items: [
      { sku: "KB-WHITE-600", position: [0, 0, 280], bodyColor: COL.white, frontColor: COL.white },
      { sku: "KB-SINK-800", position: [600, 0, 280], bodyColor: COL.white, frontColor: COL.white },
      { sku: "KB-WHITE-400", position: [1400, 0, 280], bodyColor: COL.white, frontColor: COL.white },
      { sku: "KW-WHITE-600-720", position: [0, 1500, 160], bodyColor: COL.white, frontColor: COL.white },
      { sku: "KW-WHITE-800-720", position: [600, 1500, 160], bodyColor: COL.white, frontColor: COL.white },
      { sku: "KW-WHITE-400-720", position: [1400, 1500, 160], bodyColor: COL.white, frontColor: COL.white },
    ],
  },

  // ─── LIVING ROOM SETS ─────────────────────────────────────────────────────
  {
    code: "LIV-MODERN-MED-01",
    nameUz: "Modern mehmonxona (3.5×4.5m)",
    description: "3 o'rinli divan, 2 ta yumshoq kreslo, jurnal stol, TV tumba va devor javoni.",
    roomType: "living", styleTags: ["modern", "minimalist"],
    thumb: PHOTO("1555041469-a586c61ea9bc"),
    minRoomW: 3500, minRoomD: 4500, featured: true,
    items: [
      { sku: "SOFA-V2-2200-3", position: [400, 0, 1500], rotationY: 0, bodyColor: COL.grey, frontColor: COL.grey },
      { sku: "CH-V2-ARM-1", position: [3000, 0, 1500], rotationY: -Math.PI/2, bodyColor: COL.grey },
      { sku: "TBL-COF-V2-1100", position: [1300, 0, 2700], bodyColor: COL.walnut, frontColor: COL.walnut },
      { sku: "TV-V2-2000", position: [800, 0, 4250], bodyColor: COL.black, frontColor: COL.black },
      { sku: "SHF-V2-1200-2200", position: [3100, 0, 4150], bodyColor: COL.white, frontColor: COL.white },
    ],
  },
  {
    code: "LIV-CLASSIC-LARGE-01",
    nameUz: "Klassik mehmonxona (5.0×6.0m)",
    description: "Katta zal uchun: katta divan, 2 ta kreslo, jurnal stol, TV markaz va katta javon.",
    roomType: "living", styleTags: ["classic"],
    thumb: PHOTO("1540574163026-643ea20ade25"),
    minRoomW: 5000, minRoomD: 6000,
    items: [
      { sku: "SOFA-V2-2800-6", position: [600, 0, 2000], bodyColor: COL.oak, frontColor: COL.walnut },
      { sku: "CH-V2-ARM-2", position: [3800, 0, 1900], rotationY: -Math.PI/2, bodyColor: COL.oak },
      { sku: "CH-V2-ARM-2", position: [3800, 0, 2700], rotationY: -Math.PI/2, bodyColor: COL.oak },
      { sku: "TBL-COF-V2-1400", position: [1700, 0, 3000], bodyColor: COL.walnut },
      { sku: "TV-V2-2400", position: [1300, 0, 5750], bodyColor: COL.walnut, frontColor: COL.walnut },
      { sku: "SHF-V2-1500-1800", position: [3500, 0, 5650], bodyColor: COL.walnut, frontColor: COL.walnut },
    ],
  },
  {
    code: "LIV-COMPACT-SCAND-01",
    nameUz: "Skandinav mehmonxona (3.0×3.5m)",
    description: "Kichik kvartiralar uchun: 2 o'rinli divan, jurnal stol, ochiq javon va TV tumba.",
    roomType: "living", styleTags: ["scandinavian", "minimalist"],
    thumb: PHOTO("1567538096630-e0c55bd6374c"),
    minRoomW: 3000, minRoomD: 3500,
    items: [
      { sku: "SOFA-V2-1800-1", position: [600, 0, 900], bodyColor: COL.white, frontColor: COL.white },
      { sku: "TBL-COF-V2-900", position: [800, 0, 1900], bodyColor: COL.oak },
      { sku: "TV-V2-1400", position: [800, 0, 3300], bodyColor: COL.white, frontColor: COL.oak },
      { sku: "SHF-V2-800-1800", position: [2100, 0, 3300], bodyColor: COL.white, frontColor: COL.white },
    ],
  },

  // ─── DINING ──────────────────────────────────────────────────────────────
  {
    code: "DIN-FAMILY-6-01",
    nameUz: "Oilaviy ovqat xonasi (6 kishilik)",
    description: "1.6m to'g'ri stol va 6 ta stul — oilaviy ovqatlanish uchun.",
    roomType: "dining", styleTags: ["modern", "scandinavian"],
    thumb: PHOTO("1617104551722-3b2d51366400"),
    minRoomW: 3000, minRoomD: 3500,
    items: [
      { sku: "TBL-DIN-1600-900", position: [1500, 0, 1750], bodyColor: COL.oak, frontColor: COL.oak },
      { sku: "CH-V2-DIN-1", position: [900, 0, 1450], bodyColor: COL.oak },
      { sku: "CH-V2-DIN-1", position: [1500, 0, 1450], bodyColor: COL.oak },
      { sku: "CH-V2-DIN-1", position: [2100, 0, 1450], bodyColor: COL.oak },
      { sku: "CH-V2-DIN-1", position: [900, 0, 2050], rotationY: Math.PI, bodyColor: COL.oak },
      { sku: "CH-V2-DIN-1", position: [1500, 0, 2050], rotationY: Math.PI, bodyColor: COL.oak },
      { sku: "CH-V2-DIN-1", position: [2100, 0, 2050], rotationY: Math.PI, bodyColor: COL.oak },
    ],
  },
  {
    code: "DIN-LARGE-8-01",
    nameUz: "Katta ovqat xonasi (8 kishilik)",
    description: "2.0m premium stol va 8 ta yumshoq stul — mehmondo'st xonadon uchun.",
    roomType: "dining", styleTags: ["classic", "modern"],
    thumb: PHOTO("1604578762246-41134e37f9cc"),
    minRoomW: 3500, minRoomD: 4500,
    items: [
      { sku: "TBL-DIN-2000-1000", position: [1750, 0, 2250], bodyColor: COL.walnut, frontColor: COL.walnut },
      ...[800, 1400, 2000, 2600].flatMap((x): SetItem[] => ([
        { sku: "CH-V2-DIN-2", position: [x, 0, 1700], bodyColor: COL.walnut },
        { sku: "CH-V2-DIN-2", position: [x, 0, 2800], rotationY: Math.PI, bodyColor: COL.walnut },
      ])),
    ],
  },
  {
    code: "DIN-COMPACT-4-01",
    nameUz: "Kichik ovqat zonasi (4 kishilik)",
    description: "1.2m yumaloq stol va 4 stul — studio yoki kichik xonadon uchun.",
    roomType: "dining", styleTags: ["scandinavian", "minimalist"],
    thumb: PHOTO("1615874959474-d609969a20ed"),
    minRoomW: 2400, minRoomD: 2400,
    items: [
      { sku: "TBL-DIN-1100-1100", position: [1200, 0, 1200], bodyColor: COL.white, frontColor: COL.oak },
      { sku: "CH-V2-DIN-3", position: [600, 0, 1200], rotationY: Math.PI/2, bodyColor: COL.oak },
      { sku: "CH-V2-DIN-3", position: [1800, 0, 1200], rotationY: -Math.PI/2, bodyColor: COL.oak },
      { sku: "CH-V2-DIN-3", position: [1200, 0, 600], bodyColor: COL.oak },
      { sku: "CH-V2-DIN-3", position: [1200, 0, 1800], rotationY: Math.PI, bodyColor: COL.oak },
    ],
  },

  // ─── OFFICE ──────────────────────────────────────────────────────────────
  {
    code: "OFF-HOME-01",
    nameUz: "Uy ofisi (3.0×3.0m)",
    description: "Ish stoli, ofis stuli, kitob javoni va kichik komod.",
    roomType: "office", styleTags: ["modern", "minimalist"],
    thumb: PHOTO("1593062096033-9a26b09da705"),
    minRoomW: 3000, minRoomD: 3000, featured: true,
    items: [
      { sku: "TBL-OFF-V2-1600", position: [800, 0, 600], bodyColor: COL.white, frontColor: COL.oak },
      { sku: "CH-V2-OFF-2", position: [800, 0, 1400], bodyColor: COL.black },
      { sku: "BK-800-2000", position: [200, 0, 2750], bodyColor: COL.white, frontColor: COL.white },
      { sku: "DR-V2-1100-4", position: [1700, 0, 2700], bodyColor: COL.white, frontColor: COL.oak },
    ],
  },
  {
    code: "OFF-EXEC-01",
    nameUz: "Direktor kabineti",
    description: "Burchak ish stoli, premium ofis stuli, katta kitob javoni.",
    roomType: "office", styleTags: ["classic", "modern"],
    thumb: PHOTO("1518455027359-f3f8164ba6bd"),
    minRoomW: 4000, minRoomD: 4000,
    items: [
      { sku: "TBL-OFF-L-1800", position: [600, 0, 800], bodyColor: COL.walnut, frontColor: COL.walnut },
      { sku: "CH-V2-OFF-2", position: [1300, 0, 1900], bodyColor: COL.black },
      { sku: "BK-1200-2200", position: [2800, 0, 3650], bodyColor: COL.walnut, frontColor: COL.walnut },
      { sku: "BK-1200-2200", position: [200, 0, 3650], bodyColor: COL.walnut, frontColor: COL.walnut },
      { sku: "DR-V2-1500-6", position: [1500, 0, 3700], bodyColor: COL.walnut, frontColor: COL.walnut },
    ],
  },

  // ─── HALLWAY ─────────────────────────────────────────────────────────────
  {
    code: "HW-COMPACT-01",
    nameUz: "Yo'lak komplekti (kompakt)",
    description: "Kavush tumbasi, devor garderobi va o'rindiqli javon.",
    roomType: "hallway", styleTags: ["modern", "minimalist"],
    thumb: PHOTO("1616627388303-1c5cd33d4884"),
    minRoomW: 2000, minRoomD: 1200,
    items: [
      { sku: "HW-700-1000", position: [200, 0, 800], bodyColor: COL.white, frontColor: COL.white },
      { sku: "HW-800-2100", position: [1000, 0, 800], bodyColor: COL.white, frontColor: COL.oak },
    ],
  },
  {
    code: "HW-LARGE-01",
    nameUz: "Yo'lak komplekti (kengaytirilgan)",
    description: "Katta yo'lak: kavush, garderob, oyna shkafi va konsol.",
    roomType: "hallway", styleTags: ["modern"],
    thumb: PHOTO("1558997519-83ea9252edf8"),
    minRoomW: 3500, minRoomD: 1500,
    items: [
      { sku: "HW-1000-2100", position: [200, 0, 1100], bodyColor: COL.white, frontColor: COL.white },
      { sku: "HW-1100-1200", position: [1300, 0, 800], bodyColor: COL.white, frontColor: COL.white },
      { sku: "CON-1200", position: [2500, 0, 575], bodyColor: COL.walnut, frontColor: COL.walnut },
    ],
  },

  // ─── EXTRA: BUDGET BEDROOM, LUXURY VARIANTS ──────────────────────────────
  {
    code: "BED-BUDGET-01",
    nameUz: "Tejamkor yotoqxona",
    description: "Bir kishilik karavot, ixcham garderob va ishchi stol.",
    roomType: "bedroom", styleTags: ["modern", "minimalist"],
    thumb: PHOTO("1551776235-dde6d482980b"),
    minRoomW: 2500, minRoomD: 3000,
    items: [
      { sku: "BED-PL-900-1900", position: [1200, 0, 1000], bodyColor: COL.white, frontColor: COL.oak },
      { sku: "WS-SW-WHITE-1000-2", position: [200, 0, 2700], bodyColor: COL.white, frontColor: COL.white },
      { sku: "TBL-OFF-V2-1000", position: [1700, 0, 2700], bodyColor: COL.white, frontColor: COL.white },
    ],
  },
  {
    code: "BED-LUX-MIRROR-01",
    nameUz: "Lyuks yotoqxona (kupe + pardoz)",
    description: "King karavot, oynali kupe garderob, premium pardoz stoli va 2 tungi tumba.",
    roomType: "bedroom", styleTags: ["modern", "classic"],
    thumb: PHOTO("1505693416388-ac5ce068fe85"),
    minRoomW: 4500, minRoomD: 5000, featured: true,
    items: [
      { sku: "BED-ST-1800-2000", position: [2250, 0, 1500], bodyColor: COL.white, frontColor: COL.walnut },
      { sku: "NS-V2-WHITE-550", position: [1100, 0, 1100], bodyColor: COL.white, frontColor: COL.white },
      { sku: "NS-V2-WHITE-550", position: [3400, 0, 1100], bodyColor: COL.white, frontColor: COL.white },
      { sku: "WS-SL-3000", position: [200, 0, 4350], bodyColor: COL.white, frontColor: COL.white },
      { sku: "VAN-1400", position: [3200, 0, 4580], bodyColor: COL.white, frontColor: COL.white },
      { sku: "DR-V2-1200-8", position: [3600, 0, 1500], rotationY: -Math.PI/2, bodyColor: COL.white, frontColor: COL.walnut },
    ],
  },

  // ─── LIVING + DINING (Studio combo) ──────────────────────────────────────
  {
    code: "STUDIO-COMBO-01",
    nameUz: "Studio: mehmonxona + ovqat zonasi",
    description: "Bir xonali studio uchun mukammal yechim: divan, jurnal stol, ovqat stoli va TV markaz.",
    roomType: "living", styleTags: ["modern", "scandinavian"],
    thumb: PHOTO("1493663284031-b7e3aefcae8e"),
    minRoomW: 4500, minRoomD: 5500,
    items: [
      { sku: "SOFA-V2-2000-2", position: [400, 0, 1300], bodyColor: COL.grey },
      { sku: "TBL-COF-V2-1000", position: [800, 0, 2400], bodyColor: COL.oak },
      { sku: "TV-V2-1800", position: [700, 0, 5250], bodyColor: COL.black, frontColor: COL.black },
      { sku: "TBL-DIN-1400-800", position: [3300, 0, 1400], bodyColor: COL.oak },
      { sku: "CH-V2-DIN-3", position: [2800, 0, 1100], bodyColor: COL.white },
      { sku: "CH-V2-DIN-3", position: [3800, 0, 1100], bodyColor: COL.white },
      { sku: "CH-V2-DIN-3", position: [2800, 0, 1700], rotationY: Math.PI, bodyColor: COL.white },
      { sku: "CH-V2-DIN-3", position: [3800, 0, 1700], rotationY: Math.PI, bodyColor: COL.white },
      { sku: "SHF-V2-1000-2000", position: [3300, 0, 5300], bodyColor: COL.white, frontColor: COL.white },
    ],
  },

  // ─── Two more bedroom variants ───────────────────────────────────────────
  {
    code: "BED-JAPANDI-01",
    nameUz: "Japandi yotoqxona",
    description: "Past karavot, mineral ranglar, eman aksent — japandi falsafasi.",
    roomType: "bedroom", styleTags: ["japandi", "minimalist"],
    thumb: PHOTO("1540518614846-7eded433c457"),
    minRoomW: 3500, minRoomD: 4000,
    items: [
      { sku: "BED-PL-1600-2000", position: [1900, 0, 1500], bodyColor: COL.oak, frontColor: COL.oak },
      { sku: "NS-V2-OAK-400", position: [1000, 0, 1100], bodyColor: COL.oak, frontColor: COL.oak },
      { sku: "NS-V2-OAK-400", position: [2900, 0, 1100], bodyColor: COL.oak, frontColor: COL.oak },
      { sku: "WS-SW-OAK-1500-3", position: [200, 0, 3850], bodyColor: COL.oak, frontColor: COL.oak },
      { sku: "VAN-1000", position: [2100, 0, 3850], bodyColor: COL.oak, frontColor: COL.oak },
    ],
  },
];

async function main() {
  console.log(`🌱 Seeding ${SETS.length} room sets...`);
  let inserted = 0, updated = 0, missing = 0;
  for (const s of SETS) {
    // Validate all SKUs exist
    const skus = s.items.map((i) => i.sku);
    const found = await db.furnitureModel.findMany({ where: { sku: { in: skus } } });
    const foundSkus = new Set(found.map((f) => f.sku));
    const missingSkus = skus.filter((sk) => !foundSkus.has(sk));
    if (missingSkus.length) {
      console.warn(`⚠️  ${s.code}: SKU topilmadi - ${missingSkus.join(", ")}`);
      missing++;
      continue;
    }
    const total = s.items.reduce((sum, it) => {
      const m = found.find((f) => f.sku === it.sku);
      return sum + (m?.baseCostUzs || 0);
    }, 0);
    const data = {
      nameUz: s.nameUz,
      description: s.description,
      roomType: s.roomType,
      styleTags: JSON.stringify(s.styleTags),
      thumbnailUrl: s.thumb,
      minRoomW: s.minRoomW,
      minRoomD: s.minRoomD,
      totalCostUzs: total,
      itemsJson: JSON.stringify(s.items),
      isFeatured: !!s.featured,
    };
    const existing = await db.roomSet.findUnique({ where: { code: s.code } });
    if (existing) {
      await db.roomSet.update({ where: { id: existing.id }, data });
      updated++;
    } else {
      await db.roomSet.create({ data: { code: s.code, ...data } });
      inserted++;
    }
  }
  const count = await db.roomSet.count();
  console.log(`✅ ${inserted} new, ${updated} updated, ${missing} skipped · DB jami: ${count} komplekt`);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => db.$disconnect());
