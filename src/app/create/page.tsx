"use client";
import { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Save, Loader2, Wand2, Palette, Wrench, Camera } from "lucide-react";
import type { Decor3D, Furniture3DHandle } from "@/components/Furniture3D";

const Furniture3D = dynamic(() => import("@/components/Furniture3D"), { ssr: false });

// ─── Templates ───────────────────────────────────────────────────────────
type Template = {
  key: string;
  name: string;
  category: string; // category code
  type: "carcass_box" | "carcass_drawers" | "open_shelf" | "bed_platform" | "table" | "chair" | "sofa";
  defaults: Record<string, number>;
  schema: Record<string, { min: number; max: number; step: number; default: number; label?: string }>;
  bbox: [number, number, number]; // W, D, H
};

const TEMPLATES: Template[] = [
  {
    key: "doors",
    name: "Eshikli shkaf",
    category: "kitchen.base",
    type: "carcass_box",
    defaults: { W: 800, H: 720, D: 560, T: 18, doors: 2, shelves: 1 },
    schema: {
      W: { min: 300, max: 2400, step: 50, default: 800 },
      H: { min: 400, max: 2400, step: 50, default: 720 },
      D: { min: 280, max: 700, step: 10, default: 560 },
      T: { min: 16, max: 25, step: 2, default: 18 },
      doors: { min: 0, max: 4, step: 1, default: 2 },
      shelves: { min: 0, max: 5, step: 1, default: 1 },
    },
    bbox: [800, 560, 720],
  },
  {
    key: "drawers",
    name: "Tortmali shkaf (komod)",
    category: "nightstand",
    type: "carcass_drawers",
    defaults: { W: 1000, H: 800, D: 450, T: 18, drawers: 4 },
    schema: {
      W: { min: 400, max: 1800, step: 50, default: 1000 },
      H: { min: 400, max: 1200, step: 50, default: 800 },
      D: { min: 350, max: 600, step: 10, default: 450 },
      T: { min: 16, max: 25, step: 2, default: 18 },
      drawers: { min: 1, max: 8, step: 1, default: 4 },
    },
    bbox: [1000, 450, 800],
  },
  {
    key: "shelf",
    name: "Ochiq javon",
    category: "shelf.open",
    type: "open_shelf",
    defaults: { W: 800, H: 1800, D: 300, T: 18, shelves: 4 },
    schema: {
      W: { min: 300, max: 1800, step: 50, default: 800 },
      H: { min: 400, max: 2400, step: 50, default: 1800 },
      D: { min: 250, max: 450, step: 10, default: 300 },
      T: { min: 16, max: 25, step: 2, default: 18 },
      shelves: { min: 1, max: 8, step: 1, default: 4 },
    },
    bbox: [800, 300, 1800],
  },
  {
    key: "wardrobe",
    name: "Garderob",
    category: "wardrobe.swing",
    type: "carcass_box",
    defaults: { W: 1200, H: 2200, D: 580, T: 18, doors: 3, shelves: 3 },
    schema: {
      W: { min: 600, max: 4000, step: 50, default: 1200 },
      H: { min: 1800, max: 2600, step: 50, default: 2200 },
      D: { min: 500, max: 700, step: 10, default: 580 },
      T: { min: 16, max: 25, step: 2, default: 18 },
      doors: { min: 1, max: 4, step: 1, default: 3 },
      shelves: { min: 1, max: 6, step: 1, default: 3 },
    },
    bbox: [1200, 580, 2200],
  },
  {
    key: "table",
    name: "Stol",
    category: "table.dining",
    type: "table",
    defaults: { W: 1400, H: 740, D: 800, T: 25 },
    schema: {
      W: { min: 600, max: 2400, step: 50, default: 1400 },
      H: { min: 400, max: 1100, step: 10, default: 740 },
      D: { min: 500, max: 1400, step: 50, default: 800 },
      T: { min: 18, max: 35, step: 2, default: 25 },
    },
    bbox: [1400, 800, 740],
  },
  {
    key: "bed",
    name: "Karavot",
    category: "bed.platform",
    type: "bed_platform",
    defaults: { W: 1600, L: 2000, H: 380, headH: 1000, T: 18 },
    schema: {
      W: { min: 800, max: 2000, step: 50, default: 1600 },
      L: { min: 1800, max: 2200, step: 50, default: 2000 },
      H: { min: 250, max: 500, step: 10, default: 380 },
      headH: { min: 600, max: 1400, step: 50, default: 1000 },
      T: { min: 16, max: 25, step: 2, default: 18 },
    },
    bbox: [1600, 2000, 1000],
  },
];

const CATEGORIES = [
  { code: "kitchen.base", name: "Oshxona pastki" },
  { code: "kitchen.wall", name: "Oshxona yuqori" },
  { code: "kitchen.tall", name: "Oshxona baland" },
  { code: "wardrobe.swing", name: "Garderob (eshikli)" },
  { code: "wardrobe.slide", name: "Kupe garderob" },
  { code: "bed.platform", name: "Karavot" },
  { code: "table.dining", name: "Ovqat stoli" },
  { code: "table.coffee", name: "Jurnal stoli" },
  { code: "table.office", name: "Ish stoli" },
  { code: "shelf.open", name: "Ochiq javon" },
  { code: "tv.stand", name: "TV tumba" },
  { code: "sofa.straight", name: "Divan" },
  { code: "chair.dining", name: "Stul" },
  { code: "nightstand", name: "Komod / tungi tumba" },
];

const COLORS = [
  { name: "White", hex: "#F2EFEA" },
  { name: "Sand Oak", hex: "#D9C9B6" },
  { name: "Walnut", hex: "#5B3A29" },
  { name: "Black", hex: "#1F1F1F" },
  { name: "Grey", hex: "#9B9B9B" },
];

const DSL_BY_TYPE: Record<string, any> = {
  carcass_box: {
    type: "carcass_box",
    parts: [
      { code: "side_L",  L: "H", W: "D", T: 18, edges: { front: "2.0" } },
      { code: "side_R",  L: "H", W: "D", T: 18, edges: { front: "2.0" } },
      { code: "bottom",  L: "W - 2*T", W: "D", T: 18, edges: { front: "2.0" } },
      { code: "top",     L: "W - 2*T", W: "D", T: 18, edges: { front: "2.0" } },
      { code: "back",    L: "W - 4", W: "H - 4", T: 3, edges: {} },
      { code: "shelf",   L: "W - 2*T", W: "D - 30", T: 18, edges: { front: "0.4" }, qty: "shelves" },
      { code: "door",    L: "(W - 4)/doors", W: "H - 4", T: 18, edges: { all: "2.0" }, qty: "doors" },
    ],
  },
  carcass_drawers: {
    type: "carcass_drawers",
    parts: [
      { code: "side_L", L: "H", W: "D", T: 18, edges: { front: "2.0" } },
      { code: "side_R", L: "H", W: "D", T: 18, edges: { front: "2.0" } },
      { code: "bottom", L: "W - 2*T", W: "D", T: 18, edges: { front: "2.0" } },
      { code: "top",    L: "W - 2*T", W: "D", T: 18, edges: { front: "2.0" } },
      { code: "back",   L: "W - 4", W: "H - 4", T: 3, edges: {} },
      { code: "drawer_front", L: "W - 4", W: "(H - 4)/drawers - 4", T: 18, edges: { all: "2.0" }, qty: "drawers" },
    ],
  },
  open_shelf: {
    type: "open_shelf",
    parts: [
      { code: "side_L", L: "H", W: "D", T: 18, edges: { all: "2.0" } },
      { code: "side_R", L: "H", W: "D", T: 18, edges: { all: "2.0" } },
      { code: "shelf",  L: "W - 2*T", W: "D", T: 18, edges: { front: "2.0" }, qty: "shelves" },
      { code: "back",   L: "W - 4", W: "H - 4", T: 3, edges: {} },
    ],
  },
  bed_platform: {
    type: "bed_platform",
    parts: [
      { code: "head", L: "W", W: "headH", T: 18, edges: { all: "2.0" } },
      { code: "side_L", L: "L", W: 200, T: 18, edges: { top: "2.0" } },
      { code: "side_R", L: "L", W: 200, T: 18, edges: { top: "2.0" } },
      { code: "slat", L: "W - 36", W: 70, T: 18, edges: {}, qty: 14 },
    ],
  },
  table: {
    type: "table",
    parts: [
      { code: "top", L: "W", W: "D", T: 25, edges: { all: "2.0" } },
      { code: "leg", L: "H - T", W: 80, T: 80, edges: {}, qty: 4 },
    ],
  },
  chair: {
    type: "chair",
    parts: [
      { code: "seat", L: "W", W: "D", T: 18, edges: { all: "2.0" } },
      { code: "back", L: "W", W: "backH", T: 18, edges: { all: "2.0" } },
      { code: "leg", L: "H", W: 40, T: 40, edges: {}, qty: 4 },
    ],
  },
  sofa: {
    type: "sofa",
    parts: [
      { code: "frame_seat", L: "W - 60", W: "D - 100", T: 18, edges: {} },
      { code: "frame_bottom", L: "W - 60", W: "D", T: 18, edges: {} },
      { code: "leg", L: 150, W: 80, T: 80, edges: {}, qty: 6 },
    ],
  },
};

export default function CreateFurniture() {
  const router = useRouter();
  const [tpl, setTpl] = useState<Template>(TEMPLATES[0]);
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [category, setCategory] = useState("kitchen.base");
  const [params, setParams] = useState<Record<string, number>>({ ...TEMPLATES[0].defaults });
  const [body, setBody] = useState(COLORS[0].hex);
  const [front, setFront] = useState(COLORS[1].hex);
  const f3dRef = useRef<Furniture3DHandle | null>(null);
  const [decor, setDecor] = useState<Decor3D>({
    handle: "bar", handleColor: "#9aa0a6",
    leg: "none", legColor: "#2c2c2c", legHeight: 100,
    countertop: false, countertopColor: "#2a2a2a",
  });
  const [cost, setCost] = useState(800000);
  const [saving, setSaving] = useState(false);

  // When template changes, reset params + category
  useEffect(() => {
    setParams({ ...tpl.defaults });
    setCategory(tpl.category);
    if (!sku) setSku(`CUSTOM-${tpl.key.toUpperCase()}-${Date.now().toString(36).slice(-5).toUpperCase()}`);
  }, [tpl]); // eslint-disable-line react-hooks/exhaustive-deps

  const dsl = DSL_BY_TYPE[tpl.type];

  const onSave = async () => {
    if (!name.trim() || !sku.trim()) {
      alert("Nom va SKU kerak");
      return;
    }
    setSaving(true);
    const res = await fetch("/api/models", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sku: sku.trim(),
        nameUz: name.trim(),
        categoryCode: category,
        paramSchema: tpl.schema,
        defaultParams: params,
        geometryDsl: dsl,
        bboxW: tpl.bbox[0],
        bboxD: tpl.bbox[1],
        bboxH: tpl.bbox[2],
        baseCostUzs: cost,
        styleTags: ["custom", "user_made"],
        roomCompat: { [tpl.category.split(".")[0] === "kitchen" ? "kitchen" : "any"]: 0.9 },
        source: "manual",
      }),
    });
    const d = await res.json();
    setSaving(false);
    if (d.model?.id) {
      router.push(`/designer/${d.model.id}`);
    } else {
      alert(d.error || "Saqlashda xato");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-6">
      <Link href="/catalog" className="inline-flex items-center gap-1 text-sm text-muted hover:text-white mb-4">
        <ArrowLeft className="w-3.5 h-3.5" /> Katalogga qaytish
      </Link>

      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2 mb-1">
          <Wand2 className="w-7 h-7 text-accent" /> Yangi mebel yaratish
        </h1>
        <p className="text-sm text-muted">Andazani tanlang, o'lchamlarni belgilang, bezaklarni qo'shing va saqlang.</p>
      </div>

      <div className="grid lg:grid-cols-[1fr_400px] gap-6">
        {/* Viewport */}
        <div className="card overflow-hidden h-[640px] relative">
          <div className="absolute top-3 left-3 z-10 px-3 py-1.5 rounded-lg bg-bg/80 backdrop-blur border border-border text-sm">
            <div className="font-semibold">{name || "Yangi mebel"}</div>
            <div className="text-xs text-muted">{sku || "SKU..."}</div>
          </div>
          <div className="absolute top-3 right-3 z-10">
            <button
              onClick={() => {
                const url = f3dRef.current?.exportImage(3);
                if (url) {
                  const a = document.createElement("a");
                  a.href = url; a.download = `${sku || "custom"}_create.png`; a.click();
                }
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-bg/80 backdrop-blur border border-border text-xs hover:border-accent/60"
              title="Foto eksport (PNG)"
            >
              <Camera className="w-3.5 h-3.5" /> Foto eksport
            </button>
          </div>
          <Furniture3D ref={f3dRef} geometryDsl={dsl} params={params} bodyColor={body} frontColor={front} decor={decor} />
        </div>

        {/* Controls */}
        <div className="space-y-4">
          {/* Template picker */}
          <div className="card p-4">
            <h3 className="font-semibold mb-3">Andaza</h3>
            <div className="grid grid-cols-2 gap-1.5">
              {TEMPLATES.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTpl(t)}
                  className={`px-3 py-2 rounded text-xs border ${tpl.key === t.key ? "border-accent bg-accent/10 text-white" : "border-border text-muted hover:text-white"}`}
                >
                  {t.name}
                </button>
              ))}
            </div>
          </div>

          {/* Identity */}
          <div className="card p-4 space-y-2.5">
            <h3 className="font-semibold mb-2">Asosiy ma'lumot</h3>
            <label className="block">
              <span className="text-xs text-muted">Nomi</span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Masalan: Mening shkafim 800"
                className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm mt-1"
              />
            </label>
            <label className="block">
              <span className="text-xs text-muted">SKU (artikul)</span>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value.toUpperCase())}
                className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm font-mono mt-1"
              />
            </label>
            <label className="block">
              <span className="text-xs text-muted">Kategoriya</span>
              <select
                aria-label="Kategoriya"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm mt-1"
              >
                {CATEGORIES.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="text-xs text-muted">Bazaviy narx (so'm)</span>
              <input
                type="number"
                value={cost}
                onChange={(e) => setCost(parseInt(e.target.value) || 0)}
                min={0} step={50000}
                className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm font-mono mt-1"
              />
            </label>
          </div>

          {/* Parameters */}
          <div className="card p-4">
            <h3 className="font-semibold mb-3">Parametrlar</h3>
            <div className="space-y-2.5">
              {Object.entries(tpl.schema).map(([key, def]) => (
                <div key={key}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted">{key}</span>
                    <span className="font-mono">{params[key] ?? def.default}</span>
                  </div>
                  <input
                    aria-label={key}
                    type="range"
                    min={def.min} max={def.max} step={def.step}
                    value={params[key] ?? def.default}
                    onChange={(e) => setParams({ ...params, [key]: parseFloat(e.target.value) })}
                    className="w-full accent-accent"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Colors */}
          <div className="card p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2"><Palette className="w-4 h-4" /> Ranglar</h3>
            <div className="text-xs text-muted mb-1.5">Korpus</div>
            <div className="flex gap-1.5 mb-3">
              {COLORS.map((c) => (
                <button key={"b" + c.hex} onClick={() => setBody(c.hex)} title={c.name}
                  aria-label={`Korpus rangi ${c.name}`}
                  className={`w-8 h-8 rounded border-2 ${body === c.hex ? "border-accent" : "border-border"}`}
                  style={{ background: c.hex }} />
              ))}
            </div>
            <div className="text-xs text-muted mb-1.5">Old qism</div>
            <div className="flex gap-1.5">
              {COLORS.map((c) => (
                <button key={"f" + c.hex} onClick={() => setFront(c.hex)} title={c.name}
                  aria-label={`Old rang ${c.name}`}
                  className={`w-8 h-8 rounded border-2 ${front === c.hex ? "border-accent" : "border-border"}`}
                  style={{ background: c.hex }} />
              ))}
            </div>
          </div>

          {/* Decor */}
          <DecorPanelMini decor={decor} setDecor={setDecor} />

          <button
            onClick={onSave}
            disabled={saving || !name.trim()}
            className="btn-primary w-full"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Saqlash va katalogga qo'shish
          </button>
        </div>
      </div>
    </div>
  );
}

const HANDLE_OPTIONS: { value: NonNullable<Decor3D["handle"]>; label: string }[] = [
  { value: "none", label: "Yo'q" },
  { value: "bar", label: "Bar" },
  { value: "long_bar", label: "Uzun" },
  { value: "knob", label: "Tugma" },
];
const LEG_OPTIONS: { value: NonNullable<Decor3D["leg"]>; label: string }[] = [
  { value: "none", label: "Yo'q" },
  { value: "block", label: "Tsokol" },
  { value: "tapered", label: "Konus" },
  { value: "hairpin", label: "Hairpin" },
  { value: "metal_round", label: "Metal" },
];
const HANDLE_COLORS = ["#9aa0a6", "#1f1f1f", "#d4af37", "#b87333"];
const LEG_COLORS = ["#2c2c2c", "#9aa0a6", "#5B3A29", "#d4af37"];

function DecorPanelMini({ decor, setDecor }: { decor: Decor3D; setDecor: (d: Decor3D) => void }) {
  const upd = (patch: Partial<Decor3D>) => setDecor({ ...decor, ...patch });
  return (
    <div className="card p-4">
      <h3 className="font-semibold mb-3 flex items-center gap-2"><Wrench className="w-4 h-4" /> Bezaklar</h3>

      <div className="text-xs text-muted mb-1.5">Tutqich</div>
      <div className="grid grid-cols-2 gap-1.5 mb-2">
        {HANDLE_OPTIONS.map((o) => (
          <button key={o.value} onClick={() => upd({ handle: o.value })}
            className={`px-2 py-1.5 rounded text-xs border ${decor.handle === o.value ? "border-accent bg-accent/10 text-white" : "border-border text-muted"}`}>
            {o.label}
          </button>
        ))}
      </div>
      {decor.handle && decor.handle !== "none" && (
        <div className="flex gap-1.5 mb-3">
          {HANDLE_COLORS.map((c) => (
            <button key={c} onClick={() => upd({ handleColor: c })}
              aria-label={`Tutqich rangi ${c}`}
              className={`w-7 h-7 rounded border-2 ${decor.handleColor === c ? "border-accent" : "border-border"}`}
              style={{ background: c }} />
          ))}
        </div>
      )}

      <div className="text-xs text-muted mb-1.5">Oyoq</div>
      <div className="grid grid-cols-2 gap-1.5 mb-2">
        {LEG_OPTIONS.map((o) => (
          <button key={o.value} onClick={() => upd({ leg: o.value })}
            className={`px-2 py-1.5 rounded text-xs border ${decor.leg === o.value ? "border-accent bg-accent/10 text-white" : "border-border text-muted"}`}>
            {o.label}
          </button>
        ))}
      </div>
      {decor.leg && decor.leg !== "none" && (
        <div className="flex gap-1.5 mb-3">
          {LEG_COLORS.map((c) => (
            <button key={c} onClick={() => upd({ legColor: c })}
              aria-label={`Oyoq rangi ${c}`}
              className={`w-7 h-7 rounded border-2 ${decor.legColor === c ? "border-accent" : "border-border"}`}
              style={{ background: c }} />
          ))}
        </div>
      )}

      <label className="flex items-center gap-2 text-xs cursor-pointer">
        <input type="checkbox" checked={!!decor.countertop}
          onChange={(e) => upd({ countertop: e.target.checked })}
          className="accent-accent" />
        <span>Stoleshnitsa (oshxona)</span>
      </label>
    </div>
  );
}
