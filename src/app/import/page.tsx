"use client";
import { useState } from "react";
import { Sparkles, Link as LinkIcon, Loader2, CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function ImportPage() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [promoted, setPromoted] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const onAnalyze = async () => {
    if (!url) return;
    setLoading(true); setError(null); setResult(null); setPromoted(null);
    try {
      const r = await fetch("/api/import-design", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "import failed");
      setResult(d);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  const onPromote = async () => {
    if (!result?.id) return;
    setLoading(true);
    try {
      const r = await fetch("/api/import-design", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: result.id }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setPromoted(d);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold mb-2 flex items-center gap-2"><Sparkles className="w-7 h-7 text-accent" /> AI Dizayn Import</h1>
      <p className="text-muted mb-6">Pinterest, Houzz, Behance va boshqa saytlardan mebel rasmini parametric modelga aylantiring</p>

      <div className="card p-6 mb-6">
        <label className="text-sm font-medium mb-2 block flex items-center gap-1.5"><LinkIcon className="w-4 h-4" /> Rasm URL manzili</label>
        <div className="flex gap-2">
          <input
            value={url} onChange={(e) => setUrl(e.target.value)}
            placeholder="https://i.pinimg.com/.../wardrobe.jpg"
            className="input flex-1"
          />
          <button onClick={onAnalyze} disabled={loading || !url} className="btn-primary disabled:opacity-50">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            Tahlil
          </button>
        </div>
        <div className="text-xs text-muted mt-2">URL rasmga to'g'ridan-to'g'ri ishora qilishi kerak (.jpg/.png)</div>
        {error && <div className="mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded text-sm text-red-400">{error}</div>}
      </div>

      {result && (
        <div className="grid md:grid-cols-2 gap-4 animate-slide-up">
          <div className="card overflow-hidden">
            <img src={url} alt="imported" className="w-full aspect-square object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
          </div>
          <div className="card p-5">
            {result.isMock && (
              <div className="p-2 mb-3 bg-amber-500/10 border border-amber-500/30 rounded text-xs text-amber-400">
                Mock natija — API key qo'shilsa real tahlil
              </div>
            )}
            <div className="text-xs text-muted">Aniqlangan kategoriya</div>
            <div className="font-semibold mb-3">{result.result.detectedCategory}</div>

            <div className="text-xs text-muted">Nomi</div>
            <div className="font-semibold mb-3">{result.result.nameUz}</div>

            <div className="text-xs text-muted">SKU</div>
            <div className="font-mono text-sm mb-3">{result.result.suggestedSku}</div>

            <div className="text-xs text-muted">O'lchamlar</div>
            <div className="text-sm mb-3">
              {result.result.estimatedDimensionsMm.width} × {result.result.estimatedDimensionsMm.depth} × {result.result.estimatedDimensionsMm.height} mm
            </div>

            <div className="text-xs text-muted mb-1">Uslub teglari</div>
            <div className="flex flex-wrap gap-1 mb-3">
              {(result.result.styleTags || []).map((t: string) => <span key={t} className="pill">{t}</span>)}
            </div>

            <div className="text-xs text-muted mb-1">Ranglar</div>
            <div className="flex gap-1 mb-4">
              {(result.result.dominantColors || []).map((c: string) => (
                <div key={c} className="w-7 h-7 rounded border border-border" style={{ background: c }} title={c} />
              ))}
            </div>

            <div className="text-xs italic text-muted mb-3 border-l-2 border-accent/40 pl-3">{result.result.description}</div>
            <div className="text-xs">Ishonch: <b>{(result.result.confidence * 100).toFixed(0)}%</b> · {result.latencyMs} ms</div>

            {!promoted ? (
              <button onClick={onPromote} disabled={loading} className="btn-primary w-full mt-4">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                Katalogga qo'shish
              </button>
            ) : (
              <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded text-sm">
                <div className="text-emerald-400 font-medium flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> Katalogga qo'shildi: {promoted.sku}</div>
                <Link href={`/designer/${promoted.modelId}`} className="text-accent text-xs flex items-center gap-1 mt-1">3D'da ochish <ArrowRight className="w-3 h-3" /></Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
