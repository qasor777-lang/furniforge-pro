"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, Box } from "lucide-react";
import { fmtMm, fmtMoney, safeJson } from "@/lib/utils";

const ROOMS = ["", "kitchen", "bedroom", "living", "office", "child", "dining", "hallway"];
const STYLES = ["", "modern", "classic", "minimalist", "scandinavian", "japandi"];

export default function Catalog() {
  const [models, setModels] = useState<any[]>([]);
  const [q, setQ] = useState("");
  const [room, setRoom] = useState("");
  const [style, setStyle] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (room) params.set("room", room);
    if (style) params.set("style", style);
    fetch(`/api/models?${params}`)
      .then((r) => r.json())
      .then((d) => setModels(d.models || []))
      .finally(() => setLoading(false));
  }, [q, room, style]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Mebel katalogi</h1>
        <p className="text-muted">{models.length} ta parametric model · har biri to'liq sozlanadi</p>
      </div>

      <div className="card p-4 mb-6 flex flex-col sm:flex-row flex-wrap gap-3">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Qidiruv..." className="input pl-9 w-full" />
        </div>
        <div className="flex gap-2">
          <select aria-label="Xona filtri" value={room} onChange={(e) => setRoom(e.target.value)} className="input w-full sm:w-44">
            {ROOMS.map((r) => <option key={r} value={r}>{r ? r : "Barcha xonalar"}</option>)}
          </select>
          <select aria-label="Uslub filtri" value={style} onChange={(e) => setStyle(e.target.value)} className="input w-full sm:w-44">
            {STYLES.map((s) => <option key={s} value={s}>{s ? s : "Barcha uslublar"}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="card p-4 animate-pulse">
              <div className="aspect-square bg-white/5 rounded-lg mb-3" />
              <div className="h-4 bg-white/5 rounded w-3/4 mb-2" />
              <div className="h-3 bg-white/5 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {models.map((m) => {
            const tags = safeJson<string[]>(m.styleTags, []);
            return (
              <Link key={m.id} href={`/designer/${m.id}`} className="card p-4 hover:border-accent/40 transition-colors block">
                <div className="aspect-square bg-gradient-to-br from-bg to-panel rounded-lg overflow-hidden flex items-center justify-center mb-3 border border-border relative group">
                  {m.thumbnailUrl ? (
                    <Image
                      src={m.thumbnailUrl}
                      alt={m.nameUz}
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={() => { /* next/image handles errors via fallback */ }}
                    />
                  ) : (
                    <Box className="w-10 h-10 text-muted" />
                  )}
                </div>
                <h3 className="font-semibold text-sm mb-1 line-clamp-2">{m.nameUz}</h3>
                <div className="text-xs text-muted mb-2">{m.sku}</div>
                <div className="flex flex-wrap gap-1 mb-2">
                  {tags.slice(0, 3).map((t) => <span key={t} className="pill text-[10px]">{t}</span>)}
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted">{fmtMm(m.bboxW)} × {fmtMm(m.bboxD)}</span>
                  <span className="font-semibold text-accent">{fmtMoney(m.baseCostUzs)}</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
