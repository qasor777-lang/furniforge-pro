"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Layers, Sparkles, Star } from "lucide-react";
import { fmtMm, fmtMoney, safeJson } from "@/lib/utils";

const ROOMS = ["", "kitchen", "bedroom", "living", "dining", "office", "child", "hallway"];
const ROOM_NAMES: Record<string, string> = {
  "": "Barcha xonalar", kitchen: "Oshxona", bedroom: "Yotoqxona", living: "Mehmonxona",
  dining: "Ovqat", office: "Ofis", child: "Bolalar", hallway: "Yo'lak",
};

export default function SetsPage() {
  const [sets, setSets] = useState<any[]>([]);
  const [room, setRoom] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const url = new URL("/api/sets", location.origin);
    if (room) url.searchParams.set("room", room);
    fetch(url.toString()).then((r) => r.json()).then((d) => {
      setSets(d.sets || []);
      setLoading(false);
    });
  }, [room]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-6">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Layers className="w-7 h-7 text-accent" />
          <h1 className="text-3xl font-bold">Tayyor komplektlar</h1>
        </div>
        <p className="text-muted">{sets.length} ta to'liq xona komplekti · bir bosishda butun mebel to'plami</p>
      </div>

      <div className="card p-3 mb-6 flex flex-wrap gap-2">
        {ROOMS.map((r) => (
          <button
            key={r || "all"}
            onClick={() => setRoom(r)}
            className={`px-4 py-2 rounded-lg text-sm transition-colors ${
              room === r ? "bg-accent text-white" : "bg-panel hover:bg-white/5 text-muted hover:text-white"
            }`}
          >
            {ROOM_NAMES[r]}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card overflow-hidden animate-pulse">
              <div className="aspect-[4/3] bg-white/5" />
              <div className="p-4 space-y-2">
                <div className="h-5 bg-white/5 rounded w-3/4" />
                <div className="h-3 bg-white/5 rounded w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : sets.length === 0 ? (
        <div className="card p-10 text-center text-muted">Bu xona uchun komplekt topilmadi.</div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {sets.map((s) => {
            const tags = safeJson<string[]>(s.styleTags, []);
            const itemCount = (() => {
              try { return JSON.parse(s.itemsJson).length; } catch { return 0; }
            })();
            return (
              <Link
                key={s.id}
                href={`/sets/${s.id}`}
                className="card overflow-hidden hover:border-accent/50 transition-all hover:-translate-y-0.5"
              >
                <div className="aspect-[4/3] bg-bg relative overflow-hidden">
                  {s.thumbnailUrl ? (
                    <img
                      src={s.thumbnailUrl}
                      alt={s.nameUz}
                      loading="lazy"
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted">
                      <Layers className="w-10 h-10" />
                    </div>
                  )}
                  {s.isFeatured && (
                    <div className="absolute top-3 left-3 px-2 py-1 rounded-md bg-accent/90 backdrop-blur text-white text-xs font-medium flex items-center gap-1">
                      <Star className="w-3 h-3 fill-current" /> Tavsiya
                    </div>
                  )}
                  <div className="absolute top-3 right-3 px-2 py-1 rounded-md bg-bg/80 backdrop-blur text-xs">
                    {itemCount} ta mebel
                  </div>
                </div>
                <div className="p-4">
                  <div className="text-xs text-accent2 font-medium mb-1">{ROOM_NAMES[s.roomType] || s.roomType}</div>
                  <h3 className="font-semibold text-base mb-1.5 line-clamp-1">{s.nameUz}</h3>
                  <p className="text-xs text-muted line-clamp-2 mb-3">{s.description}</p>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {tags.slice(0, 4).map((t) => (
                      <span key={t} className="pill text-[10px]">{t}</span>
                    ))}
                  </div>
                  <div className="flex justify-between items-end pt-3 border-t border-border">
                    <div className="text-xs text-muted">
                      Min xona: <span className="text-white font-medium">{fmtMm(s.minRoomW)}×{fmtMm(s.minRoomD)}</span>
                    </div>
                    <div className="text-base font-bold gradient-text">{fmtMoney(s.totalCostUzs)}</div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
