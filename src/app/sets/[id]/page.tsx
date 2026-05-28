"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Layers, Star, Box, Loader2, Wand2, Receipt } from "lucide-react";
import { fmtMm, fmtMoney, safeJson } from "@/lib/utils";

const ROOM_NAMES: Record<string, string> = {
  kitchen: "Oshxona", bedroom: "Yotoqxona", living: "Mehmonxona",
  dining: "Ovqat", office: "Ofis", child: "Bolalar", hallway: "Yo'lak",
};

export default function SetDetail({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    fetch(`/api/sets/${params.id}`).then((r) => r.json()).then((d) => {
      setData(d);
      setLoading(false);
    });
  }, [params.id]);

  const onApply = async () => {
    if (!data) return;
    setApplying(true);
    // Create a Project pre-loaded with this set's instances, then open Studio.
    const set = data.set;
    const items = data.items as any[];
    // Convert set items (mm room coords) to PlacedInstance format used by Studio.
    const instances = items.map((it: any, i: number) => {
      const defaults = JSON.parse(it.model.defaultParams || "{}");
      const dsl = JSON.parse(it.model.geometryDsl || "{}");
      const mergedParams = { ...defaults, ...(it.params || {}) };
      // Studio uses meters for position, origin at room center, y on floor.
      const W = (set.minRoomW || 4000) / 1000;
      const D = (set.minRoomD || 4000) / 1000;
      const px = (it.position[0] || 0) / 1000 - W / 2;
      const pz = (it.position[2] || 0) / 1000 - D / 2;
      return {
        instanceId: `set-${i}-${Date.now()}`,
        modelId: it.model.id,
        modelName: it.model.nameUz,
        geometryDsl: dsl,
        params: mergedParams,
        bbox: [it.model.bboxW, it.model.bboxH, it.model.bboxD] as [number, number, number],
        position: [px, 0, pz] as [number, number, number],
        rotationY: it.rotationY || 0,
        bodyColor: it.bodyColor || "#F2EFEA",
        frontColor: it.frontColor || "#D9C9B6",
      };
    });
    const projectRes = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: set.nameUz,
        layoutJson: instances,
        roomSize: { width: set.minRoomW, depth: set.minRoomD, height: 2700 },
      }),
    });
    const projectData = await projectRes.json();
    setApplying(false);
    if (projectData.project?.id) {
      router.push(`/studio?project=${projectData.project.id}`);
    } else {
      alert("Loyiha yaratilmadi");
    }
  };

  if (loading) return <div className="p-10 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div>;
  if (!data?.set) return <div className="p-10 text-center">Komplekt topilmadi</div>;

  const { set, items } = data;
  const tags = safeJson<string[]>(set.styleTags, []);

  return (
    <div className="max-w-7xl mx-auto px-6 py-6">
      <Link href="/sets" className="inline-flex items-center gap-1 text-sm text-muted hover:text-white mb-4">
        <ArrowLeft className="w-3.5 h-3.5" /> Komplektlar ro'yxatiga
      </Link>

      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-6 mb-6">
        {/* Hero image */}
        <div className="card overflow-hidden">
          <div className="aspect-[16/10] bg-bg relative">
            {set.thumbnailUrl ? (
              <img src={set.thumbnailUrl} alt={set.nameUz} className="w-full h-full object-cover" />
            ) : (
              <div className="flex items-center justify-center h-full text-muted">
                <Layers className="w-16 h-16" />
              </div>
            )}
            {set.isFeatured && (
              <div className="absolute top-4 left-4 px-3 py-1.5 rounded-lg bg-accent/90 backdrop-blur text-white text-sm font-medium flex items-center gap-1.5">
                <Star className="w-4 h-4 fill-current" /> Tavsiya etiladi
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="card p-6 flex flex-col">
          <div className="text-sm text-accent2 font-medium mb-2">{ROOM_NAMES[set.roomType] || set.roomType}</div>
          <h1 className="text-2xl font-bold mb-2">{set.nameUz}</h1>
          <p className="text-sm text-muted mb-4">{set.description}</p>

          <div className="flex flex-wrap gap-1.5 mb-5">
            {tags.map((t) => <span key={t} className="pill">{t}</span>)}
          </div>

          <div className="grid grid-cols-2 gap-3 mb-5 text-sm">
            <div className="bg-bg/60 border border-border rounded-lg p-3">
              <div className="text-xs text-muted mb-1">Min xona</div>
              <div className="font-semibold">{fmtMm(set.minRoomW)} × {fmtMm(set.minRoomD)}</div>
            </div>
            <div className="bg-bg/60 border border-border rounded-lg p-3">
              <div className="text-xs text-muted mb-1">Mebellar soni</div>
              <div className="font-semibold">{items.length} ta</div>
            </div>
          </div>

          <div className="bg-accent/10 border border-accent/30 rounded-lg p-4 mb-5">
            <div className="text-xs text-accent mb-1">Umumiy narx</div>
            <div className="text-3xl font-bold gradient-text">{fmtMoney(set.totalCostUzs)}</div>
          </div>

          <button
            onClick={onApply}
            disabled={applying}
            className="btn-primary w-full mb-2"
          >
            {applying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
            Studioda ochish va sozlash
          </button>
          <Link
            href={`/manufacturing?project=set-${set.id}`}
            className="btn-secondary w-full text-center"
            onClick={(e) => { e.preventDefault(); alert("Avval 'Studioda ochish' tugmasini bosing"); }}
          >
            <Receipt className="w-4 h-4" /> Smeta ko'rish
          </Link>
        </div>
      </div>

      {/* Items list */}
      <div className="card p-5">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Box className="w-5 h-5 text-accent" /> Komplektga kiruvchi mebellar
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {items.map((it: any, i: number) => (
            <Link
              key={i}
              href={`/designer/${it.model.id}`}
              className="flex gap-3 p-3 bg-bg/60 border border-border rounded-lg hover:border-accent/40 transition-colors"
            >
              <div className="w-20 h-20 shrink-0 bg-panel rounded overflow-hidden">
                {it.model.thumbnailUrl ? (
                  <img src={it.model.thumbnailUrl} alt={it.model.nameUz} className="w-full h-full object-cover" />
                ) : (
                  <div className="flex items-center justify-center h-full"><Box className="w-6 h-6 text-muted" /></div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs text-muted">{it.model.sku}</div>
                <div className="text-sm font-medium line-clamp-2">{it.model.nameUz}</div>
                <div className="text-xs text-accent mt-1">{fmtMoney(it.model.baseCostUzs)}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
