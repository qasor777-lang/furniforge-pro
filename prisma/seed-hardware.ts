import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const HARDWARE = [
  // Hinges (Blum, Hettich, GTV)
  { code: "BLUM-CLIP-110",   type: "hinge",   vendor: "Blum",     model: "CLIP top 110°",        description: "To'g'ri petlya 110°, soft-close",          unitPriceUzs: 38000,  stockQty: 500, specs: { angle: 110, softClose: true } },
  { code: "BLUM-CLIP-95",    type: "hinge",   vendor: "Blum",     model: "CLIP top 95° corner",  description: "Burchak petlya 95°",                       unitPriceUzs: 42000,  stockQty: 200, specs: { angle: 95, corner: true } },
  { code: "HETTICH-SENSYS",  type: "hinge",   vendor: "Hettich",  model: "Sensys 8645i",         description: "Premium soft-close 110°",                  unitPriceUzs: 55000,  stockQty: 150 },
  { code: "GTV-110",         type: "hinge",   vendor: "GTV",      model: "Standard 110°",        description: "Iqtisodiy petlya",                         unitPriceUzs: 12000,  stockQty: 1000 },

  // Drawer slides
  { code: "BLUM-TBOX-450",   type: "slide",   vendor: "Blum",     model: "TANDEMBOX 450mm",      description: "To'liq tortma, soft-close, 30kg",          unitPriceUzs: 280000, stockQty: 80, specs: { length: 450, capacity: 30 } },
  { code: "BLUM-TBOX-500",   type: "slide",   vendor: "Blum",     model: "TANDEMBOX 500mm",      description: "To'liq tortma, soft-close, 30kg",          unitPriceUzs: 310000, stockQty: 60 },
  { code: "GTV-BS-450",      type: "slide",   vendor: "GTV",      model: "Ball-bearing 450mm",   description: "Sharikli yo'naltiruvchi, 25kg",            unitPriceUzs: 65000,  stockQty: 200 },
  { code: "GTV-BS-500",      type: "slide",   vendor: "GTV",      model: "Ball-bearing 500mm",   description: "Sharikli yo'naltiruvchi 500mm, 25kg",      unitPriceUzs: 75000,  stockQty: 150 },

  // Handles
  { code: "HND-BAR-128",     type: "handle",  vendor: "GTV",      model: "Aluminum bar 128mm",   description: "Alumin profil dasta 128mm",                unitPriceUzs: 18000,  stockQty: 400 },
  { code: "HND-BAR-192",     type: "handle",  vendor: "GTV",      model: "Aluminum bar 192mm",   description: "Alumin profil dasta 192mm",                unitPriceUzs: 24000,  stockQty: 300 },
  { code: "HND-INTEGR",      type: "handle",  vendor: "Generic",  model: "Integrated J-pull",    description: "Integrated yashirin dasta (handleless)",   unitPriceUzs: 35000,  stockQty: 500 },
  { code: "KNB-ROUND-30",    type: "knob",    vendor: "GTV",      model: "Round knob 30mm",      description: "Yumaloq tugma 30mm",                       unitPriceUzs: 8000,   stockQty: 800 },

  // Shelf pins / cam locks
  { code: "PIN-5X12",        type: "pin",     vendor: "Generic",  model: "Shelf pin 5×12",       description: "Polka tirgagi (1000 ta paket)",            unitPriceUzs: 200,    stockQty: 5000 },
  { code: "DOWEL-8X35",      type: "pin",     vendor: "Generic",  model: "Wood dowel 8×35",      description: "Yog'och dowel 8×35mm",                     unitPriceUzs: 150,    stockQty: 10000 },
  { code: "CAM-MINIFIX-25",  type: "pin",     vendor: "Hafele",   model: "Minifix 25mm",         description: "Eksentrik birikma",                        unitPriceUzs: 1200,   stockQty: 2000 },

  // Screws
  { code: "SCR-EURO-6X13",   type: "screw",   vendor: "Generic",  model: "Euro screw 6×13",      description: "Petlya vintlari 6×13",                     unitPriceUzs: 250,    stockQty: 5000 },
  { code: "SCR-CONF-7X50",   type: "screw",   vendor: "Generic",  model: "Confirmat 7×50",       description: "Konfirmat vint 7×50",                      unitPriceUzs: 400,    stockQty: 3000 },

  // Legs
  { code: "LEG-ADJ-100",     type: "leg",     vendor: "GTV",      model: "Adjustable leg 100mm", description: "Sozlanadigan oyoq 100mm (±15mm)",          unitPriceUzs: 6500,   stockQty: 600 },
  { code: "LEG-ADJ-150",     type: "leg",     vendor: "GTV",      model: "Adjustable leg 150mm", description: "Sozlanadigan oyoq 150mm",                  unitPriceUzs: 8000,   stockQty: 400 },
];

const PRICING = [
  { code: "STANDARD", name: "Standart",   laborPerPartUzs: 12000, marginPercent: 0.30, vatPercent: 0.12, edgingPerMUzs: 8000,  deliveryUzs: 150000, installUzs: 300000, isDefault: true  },
  { code: "PREMIUM",  name: "Premium",    laborPerPartUzs: 22000, marginPercent: 0.45, vatPercent: 0.12, edgingPerMUzs: 12000, deliveryUzs: 250000, installUzs: 600000, isDefault: false },
  { code: "ECONOMY",  name: "Iqtisodiy",  laborPerPartUzs: 7000,  marginPercent: 0.20, vatPercent: 0.12, edgingPerMUzs: 5000,  deliveryUzs: 100000, installUzs: 150000, isDefault: false },
];

async function main() {
  console.log("🔧 Seeding hardware + pricing profiles...");
  for (const h of HARDWARE) {
    await db.hardware.upsert({
      where: { code: h.code },
      update: {},
      create: { ...h, specs: JSON.stringify(h.specs || {}) },
    });
  }
  for (const p of PRICING) {
    await db.pricingProfile.upsert({ where: { code: p.code }, update: {}, create: p });
  }
  console.log(`✅ Seeded ${HARDWARE.length} hardware items, ${PRICING.length} pricing profiles`);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => db.$disconnect());
