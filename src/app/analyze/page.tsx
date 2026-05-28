"use client";
import { useState, useCallback, useEffect } from "react";
import { Upload, Loader2, Sparkles, Image as ImageIcon, Eye, Box, Layers, Star, Wand2 } from "lucide-react";
import Link from "next/link";
import { fmtMm, fmtMoney, safeJson } from "@/lib/utils";

export default function AnalyzePage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const onPick = useCallback((f: File | undefined) => {
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setResult(null);
    setError(null);
  }, []);

  const onSubmit = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("image", file);
      const res = await fetch("/api/analyze-room", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Tahlil muvaffaqiyatsiz");
      setResult(json);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Xona rasm tahlili</h1>
        <p className="text-muted">Rasm yuklang — AI xonangizga eng mos mebellarni tanlab beradi</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Upload */}
        <div className="card p-6">
          <h2 className="font-semibold mb-4 flex items-center gap-2"><Upload className="w-4 h-4" /> Rasm yuklash</h2>
          <label
            onDragOver={(e) => { e.preventDefault(); }}
            onDrop={(e) => { e.preventDefault(); onPick(e.dataTransfer.files[0]); }}
            className="block border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-accent transition-colors"
          >
            <input type="file" accept="image/*" className="hidden" onChange={(e) => onPick(e.target.files?.[0])} />
            {preview ? (
              <div className="relative">
                <img src={preview} alt="preview" className="max-h-80 mx-auto rounded-lg" />
                <p className="text-xs text-muted mt-3">Boshqa rasm tanlash uchun bosing</p>
              </div>
            ) : (
              <div className="py-8">
                <ImageIcon className="w-12 h-12 mx-auto text-muted mb-3" />
                <p className="font-medium mb-1">Rasm tashlang yoki bosing</p>
                <p className="text-xs text-muted">JPG, PNG, WEBP — max 10MB</p>
              </div>
            )}
          </label>

          <button onClick={onSubmit} disabled={!file || loading} className="btn-primary w-full mt-4 disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Tahlil qilinmoqda...</> : <><Sparkles className="w-4 h-4" /> AI bilan tahlil qilish</>}
          </button>
          {error && <div className="mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400">{error}</div>}
        </div>

        {/* Results */}
        <div className="card p-6">
          <h2 className="font-semibold mb-4 flex items-center gap-2"><Eye className="w-4 h-4" /> Tahlil natijasi</h2>
          {!result && !loading && (
            <div className="text-muted text-sm py-8 text-center">Tahlil natijasi shu yerda ko'rsatiladi</div>
          )}
          {loading && (
            <div className="space-y-3 py-4">
              {["Xonani aniqlash...", "O'lchamlarni baholash...", "Uslubni tahlil qilish...", "Mos mebellarni tanlash..."].map((t, i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <Loader2 className="w-4 h-4 animate-spin text-accent" /> <span className="text-muted">{t}</span>
                </div>
              ))}
            </div>
          )}
          {result && <AnalysisResult data={result} />}
        </div>
      </div>

      {result && <MatchingSets analysis={result.analysis} />}
      {result && <Recommendations recs={result.recommendations} analysisId={result.analysisId} />}
    </div>
  );
}

function MatchingSets({ analysis }: { analysis: any }) {
  const [sets, setSets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const room = analysis?.roomType;
    const url = new URL("/api/sets", location.origin);
    if (room) url.searchParams.set("room", room);
    fetch(url.toString()).then((r) => r.json()).then((d) => {
      const all: any[] = d.sets || [];
      // Score sets by style overlap with detected style tags
      const detectedTags: string[] = analysis?.styleTags || [];
      const scored = all.map((s) => {
        const tags = safeJson<string[]>(s.styleTags, []);
        const overlap = tags.filter((t) => detectedTags.includes(t)).length;
        return { ...s, _score: overlap + (s.isFeatured ? 0.5 : 0) };
      }).sort((a, b) => b._score - a._score);
      setSets(scored.slice(0, 6));
      setLoading(false);
    });
  }, [analysis]);

  if (loading) return null;
  if (!sets.length) return null;

  return (
    <div className="mt-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Layers className="w-6 h-6 text-accent2" /> Sizning xonangizga mos komplektlar
        </h2>
        <Link href="/sets" className="text-sm text-accent hover:underline">Barcha komplektlar →</Link>
      </div>
      <p className="text-sm text-muted mb-5">
        AI sizning xonangizning turi va uslubiga moslab quyidagi tayyor mebel to'plamlarini topdi. Bir bosishda butun komplektni studioda oching.
      </p>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sets.map((s) => {
          const tags = safeJson<string[]>(s.styleTags, []);
          const itemCount = (() => {
            try { return JSON.parse(s.itemsJson).length; } catch { return 0; }
          })();
          return (
            <Link
              key={s.id}
              href={`/sets/${s.id}`}
              className="card overflow-hidden hover:border-accent/50 transition-all hover:-translate-y-0.5 animate-slide-up"
            >
              <div className="aspect-[16/10] bg-bg relative overflow-hidden">
                {s.thumbnailUrl && (
                  <img src={s.thumbnailUrl} alt={s.nameUz} loading="lazy"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                )}
                {s._score > 0 && (
                  <div className="absolute top-2 left-2 px-2 py-1 rounded-md bg-accent/90 backdrop-blur text-white text-xs font-medium flex items-center gap-1">
                    <Star className="w-3 h-3 fill-current" /> {s._score >= 2 ? "Yuqori moslik" : "Mos"}
                  </div>
                )}
                <div className="absolute top-2 right-2 px-2 py-1 rounded-md bg-bg/80 backdrop-blur text-xs">
                  {itemCount} ta mebel
                </div>
              </div>
              <div className="p-3">
                <h3 className="font-semibold text-sm mb-1 line-clamp-1">{s.nameUz}</h3>
                <div className="flex flex-wrap gap-1 mb-2">
                  {tags.slice(0, 3).map((t) => <span key={t} className="pill text-[10px]">{t}</span>)}
                </div>
                <div className="flex justify-between items-center text-xs pt-2 border-t border-border">
                  <span className="text-muted">{fmtMm(s.minRoomW)}×{fmtMm(s.minRoomD)}</span>
                  <span className="font-semibold gradient-text">{fmtMoney(s.totalCostUzs)}</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function AnalysisResult({ data }: { data: any }) {
  const a = data.analysis;
  return (
    <div className="space-y-4 text-sm animate-fade-in">
      {data.isMock && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-xs text-amber-400">
          ⚠️ Mock natija (OPENAI_API_KEY o'rnatilmagan). .env fayliga API key qo'shing.
        </div>
      )}
      <div className="grid grid-cols-2 gap-3">
        <Stat label="Xona turi" value={a.roomType} hint={`${(a.roomTypeConfidence * 100).toFixed(0)}% ishonch`} />
        <Stat label="Uslub" value={a.styleLabel} />
        <Stat label="Eni" value={fmtMm(a.estimatedDimensionsMm.width)} />
        <Stat label="Bo'yi" value={fmtMm(a.estimatedDimensionsMm.depth)} />
        <Stat label="Balandligi" value={fmtMm(a.estimatedDimensionsMm.height)} />
        <Stat label="Yoritilish" value={`${a.lighting.intensity} · ${a.lighting.tempK}K`} />
      </div>

      <div>
        <div className="text-xs text-muted mb-1.5">Rang palitrasi</div>
        <div className="flex gap-1">
          {a.colorPalette.map((c: any, i: number) => (
            <div key={i} className="flex-1 h-10 rounded" style={{ background: c.hex, opacity: 0.5 + c.weight }} title={c.hex} />
          ))}
        </div>
      </div>

      <div>
        <div className="text-xs text-muted mb-1.5">Uslub teglari</div>
        <div className="flex flex-wrap gap-1">
          {a.styleTags.map((t: string) => <span key={t} className="pill">{t}</span>)}
        </div>
      </div>

      {a.reasoning && (
        <div className="text-xs text-muted italic border-l-2 border-accent/40 pl-3">{a.reasoning}</div>
      )}
      <div className="text-xs text-muted">⚡ {data.latencyMs} ms · {data.recommendations?.length || 0} tavsiya</div>
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: any; hint?: string }) {
  return (
    <div className="bg-bg/60 border border-border rounded-lg p-3">
      <div className="text-xs text-muted">{label}</div>
      <div className="font-semibold capitalize">{value}</div>
      {hint && <div className="text-xs text-muted mt-0.5">{hint}</div>}
    </div>
  );
}

function Recommendations({ recs, analysisId }: { recs: any[]; analysisId: number }) {
  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2"><Sparkles className="w-5 h-5 text-accent" /> Tavsiya etilgan mebellar</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {recs.map((r) => (
          <div key={r.modelId} className="card p-4 hover:border-accent/40 transition-colors animate-slide-up">
            <div className="aspect-square bg-gradient-to-br from-bg to-panel rounded-lg flex items-center justify-center mb-3 border border-border">
              <Box className="w-10 h-10 text-muted" />
            </div>
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className="font-semibold text-sm leading-snug">{r.nameUz}</h3>
              <span className="pill text-accent border-accent/30 bg-accent/10 shrink-0">{(r.score * 100).toFixed(0)}%</span>
            </div>
            <div className="text-xs text-muted mb-2">{r.sku}</div>
            <div className="text-xs text-muted mb-3 line-clamp-2 italic">{r.reason}</div>
            <div className="flex justify-between items-center gap-2">
              <div className="text-xs">
                <div className="text-muted">{r.bbox[0]}×{r.bbox[1]}×{r.bbox[2]}</div>
                <div className="font-semibold">{fmtMoney(r.baseCostUzs)}</div>
              </div>
              <Link href={`/designer/${r.modelId}?fromRoom=${analysisId}`} className="btn-primary text-xs px-3 py-1.5">3D ochish</Link>
            </div>
            <Link href={`/studio?analysis=${analysisId}`} className="btn-ghost w-full mt-2 text-xs">Studio'da ochish</Link>
          </div>
        ))}
      </div>
    </div>
  );
}
