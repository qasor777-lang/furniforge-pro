"use client";
import { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowLeft, Scissors, Loader2, Palette, Wrench, Camera } from "lucide-react";
import type { Decor3D, Furniture3DHandle } from "@/components/Furniture3D";
import { fmtMm, fmtMoney, safeJson } from "@/lib/utils";

const Furniture3D = dynamic(() => import("@/components/Furniture3D"), { ssr: false });

const COLORS = [
  { name: "White", hex: "#F2EFEA" },
  { name: "Sand Oak", hex: "#D9C9B6" },
  { name: "Walnut", hex: "#5B3A29" },
  { name: "Black", hex: "#1F1F1F" },
  { name: "Grey", hex: "#9B9B9B" },
];

export default function Designer({ params }: { params: { id: string } }) {
  const { id } = params;
  const [model, setModel] = useState<any>(null);
  const [paramVals, setParamVals] = useState<Record<string, number>>({});
  const [body, setBody] = useState(COLORS[0].hex);
  const [front, setFront] = useState(COLORS[1].hex);
  const f3dRef = useRef<Furniture3DHandle | null>(null);
  const [decor, setDecor] = useState<Decor3D>({
    handle: "bar", handleColor: "#9aa0a6",
    leg: "none", legColor: "#2c2c2c", legHeight: 100,
    countertop: false, countertopColor: "#2a2a2a",
  });

  useEffect(() => {
    fetch(`/api/models/${id}`).then((r) => r.json()).then((d) => {
      setModel(d.model);
      setParamVals(safeJson<Record<string, number>>(d.model?.defaultParams, {}));
    });
  }, [id]);

  if (!model) return <div className="p-10 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div>;

  const schema = safeJson<Record<string, any>>(model.paramSchema, {});
  const dsl = safeJson<any>(model.geometryDsl, { parts: [] });

  return (
    <div className="max-w-7xl mx-auto px-6 py-6">
      <Link href="/catalog" className="inline-flex items-center gap-1 text-sm text-muted hover:text-white mb-4"><ArrowLeft className="w-3.5 h-3.5" /> Katalogga qaytish</Link>

      <div className="grid lg:grid-cols-[1fr_360px] gap-6">
        {/* Viewport */}
        <div className="card overflow-hidden h-[640px] relative">
          <div className="absolute top-3 left-3 z-10 px-3 py-1.5 rounded-lg bg-bg/80 backdrop-blur border border-border text-sm">
            <div className="font-semibold">{model.nameUz}</div>
            <div className="text-xs text-muted">{model.sku}</div>
          </div>
          <div className="absolute top-3 right-3 z-10">
            <button
              onClick={() => {
                const url = f3dRef.current?.exportImage(3);
                if (url) {
                  const a = document.createElement("a");
                  a.href = url; a.download = `${model.sku || "model"}_design.png`; a.click();
                }
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-bg/80 backdrop-blur border border-border text-xs hover:border-accent/60"
              title="Foto eksport (PNG)"
            >
              <Camera className="w-3.5 h-3.5" /> Foto eksport
            </button>
          </div>
          <Furniture3D ref={f3dRef} geometryDsl={dsl} params={paramVals} bodyColor={body} frontColor={front} decor={decor} />
        </div>

        {/* Controls */}
        <div className="space-y-4">
          <div className="card p-4">
            <h3 className="font-semibold mb-3">Parametrlar</h3>
            <div className="space-y-3">
              {Object.entries(schema).map(([key, def]: [string, any]) => (
                <div key={key}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted">{key} {def.label && `(${def.label})`}</span>
                    <span className="font-mono">{paramVals[key] ?? def.default}</span>
                  </div>
                  <input
                    aria-label={key}
                    type="range"
                    min={def.min} max={def.max} step={def.step}
                    value={paramVals[key] ?? def.default}
                    onChange={(e) => setParamVals((p) => ({ ...p, [key]: parseFloat(e.target.value) }))}
                    className="w-full accent-accent"
                  />
                  <div className="flex justify-between text-[10px] text-muted">
                    <span>{def.min}</span><span>{def.max}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2"><Palette className="w-4 h-4" /> Ranglar</h3>
            <div className="text-xs text-muted mb-1.5">Korpus</div>
            <div className="flex gap-1.5 mb-3">
              {COLORS.map((c) => (
                <button key={"b" + c.hex} onClick={() => setBody(c.hex)} title={c.name}
                  className={`w-8 h-8 rounded border-2 ${body === c.hex ? "border-accent" : "border-border"}`}
                  style={{ background: c.hex }} />
              ))}
            </div>
            <div className="text-xs text-muted mb-1.5">Old qism</div>
            <div className="flex gap-1.5">
              {COLORS.map((c) => (
                <button key={"f" + c.hex} onClick={() => setFront(c.hex)} title={c.name}
                  className={`w-8 h-8 rounded border-2 ${front === c.hex ? "border-accent" : "border-border"}`}
                  style={{ background: c.hex }} />
              ))}
            </div>
          </div>

          <DecorPanel decor={decor} setDecor={setDecor} />

          <div className="card p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-muted text-sm">Bazaviy narx</span>
              <span className="font-bold gradient-text">{fmtMoney(model.baseCostUzs)}</span>
            </div>
            <div className="flex justify-between text-xs text-muted">
              <span>Habar: {Object.values(paramVals).filter(Boolean).length} parametr</span>
            </div>
          </div>

          <Link href={`/manufacturing?modelId=${model.id}&params=${encodeURIComponent(JSON.stringify(paramVals))}`} className="btn-primary w-full">
            <Scissors className="w-4 h-4" /> Ishlab chiqarishga yuborish
          </Link>
        </div>
      </div>
    </div>
  );
}

const HANDLE_OPTIONS: { value: NonNullable<Decor3D["handle"]>; label: string }[] = [
  { value: "none", label: "Yo'q" },
  { value: "bar", label: "Qisqa bar" },
  { value: "long_bar", label: "Uzun bar" },
  { value: "knob", label: "Tugma" },
  { value: "recessed", label: "Push-to-open" },
];
const LEG_OPTIONS: { value: NonNullable<Decor3D["leg"]>; label: string }[] = [
  { value: "none", label: "Yo'q" },
  { value: "block", label: "Tsokol (plinth)" },
  { value: "tapered", label: "Konus oyoq" },
  { value: "hairpin", label: "Hairpin metal" },
  { value: "metal_round", label: "Yumaloq metal" },
];
const HANDLE_COLORS = ["#9aa0a6", "#1f1f1f", "#d4af37", "#b87333", "#cd7f32"];
const LEG_COLORS = ["#2c2c2c", "#9aa0a6", "#5B3A29", "#d4af37"];
const COUNTERTOP_COLORS = ["#2a2a2a", "#f0eee5", "#d9c9b6", "#5B3A29", "#0f0f12"];

function DecorPanel({ decor, setDecor }: { decor: Decor3D; setDecor: (d: Decor3D) => void }) {
  const upd = (patch: Partial<Decor3D>) => setDecor({ ...decor, ...patch });
  return (
    <div className="card p-4">
      <h3 className="font-semibold mb-3 flex items-center gap-2"><Wrench className="w-4 h-4" /> Bezaklar &amp; detallar</h3>

      <div className="text-xs text-muted mb-1.5">Tutqich uslubi</div>
      <div className="grid grid-cols-2 gap-1.5 mb-2">
        {HANDLE_OPTIONS.map((o) => (
          <button key={o.value} onClick={() => upd({ handle: o.value })}
            className={`px-2 py-1.5 rounded text-xs border ${decor.handle === o.value ? "border-accent bg-accent/10 text-white" : "border-border text-muted hover:text-white"}`}>
            {o.label}
          </button>
        ))}
      </div>
      {decor.handle && decor.handle !== "none" && decor.handle !== "recessed" && (
        <div className="flex gap-1.5 mb-3">
          {HANDLE_COLORS.map((c) => (
            <button key={c} onClick={() => upd({ handleColor: c })} title={c}
              aria-label={`Tutqich rangi ${c}`}
              className={`w-7 h-7 rounded border-2 ${decor.handleColor === c ? "border-accent" : "border-border"}`}
              style={{ background: c }} />
          ))}
        </div>
      )}

      <div className="text-xs text-muted mb-1.5 mt-2">Oyoq / tsokol</div>
      <div className="grid grid-cols-2 gap-1.5 mb-2">
        {LEG_OPTIONS.map((o) => (
          <button key={o.value} onClick={() => upd({ leg: o.value })}
            className={`px-2 py-1.5 rounded text-xs border ${decor.leg === o.value ? "border-accent bg-accent/10 text-white" : "border-border text-muted hover:text-white"}`}>
            {o.label}
          </button>
        ))}
      </div>
      {decor.leg && decor.leg !== "none" && (
        <>
          <div className="flex gap-1.5 mb-2">
            {LEG_COLORS.map((c) => (
              <button key={c} onClick={() => upd({ legColor: c })} title={c}
                aria-label={`Oyoq rangi ${c}`}
                className={`w-7 h-7 rounded border-2 ${decor.legColor === c ? "border-accent" : "border-border"}`}
                style={{ background: c }} />
            ))}
          </div>
          <div className="flex justify-between text-[11px] mb-0.5">
            <span className="text-muted">Balandlik</span>
            <span className="font-mono">{decor.legHeight} mm</span>
          </div>
          <input aria-label="Oyoq balandligi" type="range" min={50} max={250} step={10}
            value={decor.legHeight || 100}
            onChange={(e) => upd({ legHeight: parseInt(e.target.value) })}
            className="w-full accent-accent mb-3" />
        </>
      )}

      <label className="flex items-center gap-2 text-xs cursor-pointer mt-2">
        <input type="checkbox" checked={!!decor.countertop}
          onChange={(e) => upd({ countertop: e.target.checked })}
          className="accent-accent" />
        <span>Stoleshnitsa qo'shish (oshxona uchun)</span>
      </label>
      {decor.countertop && (
        <div className="flex gap-1.5 mt-2">
          {COUNTERTOP_COLORS.map((c) => (
            <button key={c} onClick={() => upd({ countertopColor: c })} title={c}
              aria-label={`Stoleshnitsa rangi ${c}`}
              className={`w-7 h-7 rounded border-2 ${decor.countertopColor === c ? "border-accent" : "border-border"}`}
              style={{ background: c }} />
          ))}
        </div>
      )}
    </div>
  );
}
