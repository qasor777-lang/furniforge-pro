"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, Scissors, Layers, Download, FileText, Box, Cpu, Receipt, Wallet } from "lucide-react";
import { fmtMm, fmtMoney } from "@/lib/utils";

function ManufacturingInner() {
  const sp = useSearchParams();
  const modelId = sp.get("modelId");
  const paramsStr = sp.get("params");
  const projectMode = sp.get("project") !== null;

  const [data, setData] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [quote, setQuote] = useState<any>(null);
  const [profile, setProfile] = useState("STANDARD");
  const [customerName, setCustomerName] = useState("");

  useEffect(() => {
    let payload: any[] = [];
    if (projectMode) {
      const stored = sessionStorage.getItem("ff_nest_items");
      if (stored) payload = JSON.parse(stored);
    } else if (modelId) {
      const params = paramsStr ? JSON.parse(paramsStr) : {};
      payload = [{ modelId: parseInt(modelId), params, qty: 1 }];
    }
    if (!payload.length) return;
    setItems(payload);
    setLoading(true);
    fetch("/api/nest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: payload }),
    })
      .then((r) => r.json())
      .then((d) => setData(d))
      .finally(() => setLoading(false));
  }, [modelId, paramsStr, projectMode]);

  const download = async (endpoint: string, ext: string, contentType?: string) => {
    const res = await fetch(`/api/export/${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items, projectName: "FurniForge Loyiha" }),
    });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `furniforge-${Date.now()}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const openHtml = async (endpoint: string, extraBody: any = {}) => {
    const res = await fetch(`/api/export/${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items, profile, customerName, projectName: "FurniForge Loyiha", ...extraBody }),
    });
    const html = await res.text();
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  };

  const computeQuote = async () => {
    setLoading(true);
    const res = await fetch("/api/quote", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items, profile }),
    });
    const d = await res.json();
    setQuote(d.quote);
    setLoading(false);
  };

  useEffect(() => { if (items.length) computeQuote(); /* eslint-disable-next-line */ }, [items, profile]);

  if (!modelId && !projectMode) return <div className="p-10 text-center text-muted">Designer yoki Studio'dan kelishingiz kerak</div>;

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-1 flex items-center gap-2"><Scissors className="w-7 h-7 text-accent" /> Ishlab chiqarish rejasi</h1>
        <p className="text-muted">Cutting list, nesting va edging hisoblari</p>
      </div>

      {loading && <div className="card p-12 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-accent" /><div className="mt-3 text-muted">Hisoblanmoqda...</div></div>}

      {data && (
        <div className="space-y-6">
          {/* Summary */}
          <div className="grid grid-cols-3 gap-4">
            <Card label="Jami detallar" value={data.summary.totalParts} />
            <Card label="Listlar soni" value={data.summary.totalSheets} />
            <Card label="Material foydalanish" value={`${(data.summary.avgUtilization * 100).toFixed(1)}%`} />
          </div>

          {/* Quote panel */}
          {quote && (
            <div className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold flex items-center gap-2"><Wallet className="w-4 h-4 text-accent" /> Smeta va tijoriy taklif</h2>
                <div className="flex gap-2">
                  <select value={profile} onChange={(e) => setProfile(e.target.value)} className="input text-xs w-32" title="Pricing profile">
                    <option value="STANDARD">Standart</option>
                    <option value="PREMIUM">Premium</option>
                    <option value="ECONOMY">Iqtisodiy</option>
                  </select>
                  <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Mijoz ismi" className="input text-xs w-40" />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                <PriceRow label="Material" v={quote.totals.material} />
                <PriceRow label="Edging" v={quote.totals.edging} />
                <PriceRow label="Aksessuar" v={quote.totals.hardware} />
                <PriceRow label="Ish haqi" v={quote.totals.labor} />
              </div>

              <div className="border-t border-border pt-3 grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                <div><span className="text-muted text-xs">Tannarx:</span><br/><b>{fmtMoney(quote.totals.cost)}</b></div>
                <div><span className="text-muted text-xs">Foyda:</span><br/><b>{fmtMoney(quote.totals.margin)}</b></div>
                <div><span className="text-muted text-xs">QQS:</span><br/><b>{fmtMoney(quote.totals.vat)}</b></div>
                <div><span className="text-muted text-xs">JAMI:</span><br/><b className="gradient-text text-lg">{fmtMoney(quote.totals.grandTotal)}</b></div>
              </div>

              <button onClick={() => openHtml("quote", { customerName: customerName || "Mijoz" })} className="btn-primary w-full mt-4 text-xs">
                <Receipt className="w-3.5 h-3.5" /> Mijoz uchun tijoriy taklif (PDF)
              </button>
            </div>
          )}

          {/* Export buttons */}
          <div className="card p-4">
            <div className="text-sm font-semibold mb-2">Texnik eksport</div>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => download("csv", "csv")} className="btn-ghost text-xs"><Download className="w-3.5 h-3.5" /> CSV (cutting list)</button>
              <button onClick={() => openHtml("report")} className="btn-ghost text-xs"><FileText className="w-3.5 h-3.5" /> PDF hisobot (ishlab chiqarish)</button>
              <button onClick={() => download("gltf", "glb")} className="btn-ghost text-xs"><Box className="w-3.5 h-3.5" /> GLTF / GLB (3D)</button>
              <button onClick={() => download("cnc", "nc")} className="btn-ghost text-xs"><Cpu className="w-3.5 h-3.5" /> CNC G-code</button>
            </div>
          </div>

          {/* Cutting list */}
          <div className="card p-5">
            <div className="flex justify-between items-center mb-3">
              <h2 className="font-semibold flex items-center gap-2"><Layers className="w-4 h-4" /> Cutting List</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-muted text-xs uppercase">
                  <tr className="border-b border-border">
                    <th className="py-2 px-2">SKU / Detal</th>
                    <th className="py-2 px-2">L (mm)</th>
                    <th className="py-2 px-2">W (mm)</th>
                    <th className="py-2 px-2">T</th>
                    <th className="py-2 px-2">Qty</th>
                    <th className="py-2 px-2">Material</th>
                    <th className="py-2 px-2">Edge</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {data.cuttingList.map((p: any, i: number) => (
                    <tr key={i} className="hover:bg-white/5">
                      <td className="py-2 px-2 font-mono text-xs">{p.modelSku} / {p.partCode}</td>
                      <td className="py-2 px-2">{p.length}</td>
                      <td className="py-2 px-2">{p.width}</td>
                      <td className="py-2 px-2">{p.thickness}</td>
                      <td className="py-2 px-2">{p.qty}</td>
                      <td className="py-2 px-2 text-xs text-muted">{p.decor}</td>
                      <td className="py-2 px-2 text-xs">{Object.values(p.edges || {}).filter(Boolean).join(",") || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Nesting visualization */}
          {data.nesting.map((nest: any, gi: number) => (
            <div key={gi} className="card p-5">
              <h2 className="font-semibold mb-1">Material: {nest.materialCode} · {nest.thickness}mm</h2>
              <p className="text-xs text-muted mb-4">{nest.totalSheets} list × {fmtMm(nest.sheetWidth)} × {fmtMm(nest.sheetHeight)} · Foydalanish: {(nest.avgUtilization * 100).toFixed(1)}%</p>
              <div className="grid md:grid-cols-2 gap-4">
                {nest.sheets.map((s: any) => (
                  <SheetSvg key={s.sheetIndex} sheet={s} sheetW={nest.sheetWidth} sheetH={nest.sheetHeight} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Manufacturing() {
  return (
    <Suspense fallback={<div className="p-10 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div>}>
      <ManufacturingInner />
    </Suspense>
  );
}

function Card({ label, value }: { label: string; value: any }) {
  return (
    <div className="card p-4">
      <div className="text-xs text-muted">{label}</div>
      <div className="text-2xl font-bold gradient-text">{value}</div>
    </div>
  );
}

function PriceRow({ label, v }: { label: string; v: number }) {
  return (
    <div className="bg-bg/60 border border-border rounded p-2">
      <div className="text-[10px] text-muted uppercase">{label}</div>
      <div className="text-sm font-semibold">{fmtMoney(v)}</div>
    </div>
  );
}

function SheetSvg({ sheet, sheetW, sheetH }: { sheet: any; sheetW: number; sheetH: number }) {
  const scale = 380 / sheetW;
  const colors = ["#7c5cff", "#22d3ee", "#22c55e", "#f59e0b", "#ec4899", "#a855f7", "#10b981", "#ef4444"];
  return (
    <div>
      <div className="text-xs text-muted mb-1">List #{sheet.sheetIndex + 1} · {(sheet.utilization * 100).toFixed(1)}% to'la</div>
      <svg width={sheetW * scale} height={sheetH * scale} className="border border-border bg-bg rounded">
        {sheet.placed.map((p: any, i: number) => (
          <g key={i}>
            <rect x={p.x * scale} y={p.y * scale} width={p.w * scale} height={p.h * scale}
              fill={colors[i % colors.length]} fillOpacity="0.35" stroke={colors[i % colors.length]} strokeWidth="1" />
            <text x={(p.x + p.w / 2) * scale} y={(p.y + p.h / 2) * scale}
              textAnchor="middle" dominantBaseline="middle" fontSize="9" fill="#fff">
              {p.w}×{p.h}{p.rotated ? " ↻" : ""}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
