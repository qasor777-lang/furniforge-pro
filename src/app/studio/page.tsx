"use client";
import { Suspense, useEffect, useState, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import { useSearchParams, useRouter } from "next/navigation";
import { Plus, Save, Trash2, RotateCw, Move, Loader2, Scissors, Package, Box, Camera, Menu, X, Undo2, Redo2, Keyboard } from "lucide-react";
import type { Room3DHandle } from "@/components/Room3D";
import { fmtMm, fmtMoney, safeJson } from "@/lib/utils";
import type { PlacedInstance } from "@/components/Room3D";
import { useUndoRedo } from "@/hooks/useUndoRedo";
import { toast } from "sonner";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { track } from "@/lib/analytics";
import { PresenceIndicator } from "@/components/PresenceIndicator";

const Room3D = dynamic(() => import("@/components/Room3D"), { ssr: false }) as any;

const COLORS = [
  { name: "White", hex: "#F2EFEA" },
  { name: "Sand Oak", hex: "#D9C9B6" },
  { name: "Walnut", hex: "#5B3A29" },
  { name: "Black", hex: "#1F1F1F" },
];

function StudioInner() {
  const sp = useSearchParams();
  const router = useRouter();
  const projectId = sp.get("project");
  const analysisId = sp.get("analysis");

  const [roomSize, setRoomSize] = useState({ width: 4000, depth: 5000, height: 2700 });
  const {
    state: instances,
    setState: setInstances,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useUndoRedo<PlacedInstance[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [models, setModels] = useState<any[]>([]);
  const [analysis, setAnalysis] = useState<any>(null);
  const [name, setName] = useState("Untitled Loyiha");
  const [savedId, setSavedId] = useState<number | null>(projectId ? parseInt(projectId) : null);
  const [saving, setSaving] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);
  const [mobilePanel, setMobilePanel] = useState<"none" | "catalog" | "props">("none");
  const [rendering, setRendering] = useState(false);
  const r3dRef = useRef<Room3DHandle>(null);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Analytics tracking
  useEffect(() => {
    track("page_view", { page: "studio", projectId });
  }, [projectId]);

  // Load catalog
  useEffect(() => {
    fetch("/api/models").then((r) => r.json()).then((d) => setModels(d.models || []));
  }, []);

  // Load project
  useEffect(() => {
    if (!projectId) return;
    fetch(`/api/projects/${projectId}`).then((r) => r.json()).then((d) => {
      if (d.project) {
        setName(d.project.name);
        const loaded = JSON.parse(d.project.layoutJson || "[]");
        setInstances(loaded);
        if (d.project.roomW) {
          setRoomSize({ width: d.project.roomW, depth: d.project.roomD, height: d.project.roomH });
        }
        if (d.roomAnalysis) {
          setAnalysis(d.roomAnalysis);
          setRoomSize({
            width: d.roomAnalysis.estimatedW || 4000,
            depth: d.roomAnalysis.estimatedD || 5000,
            height: d.roomAnalysis.estimatedH || 2700,
          });
        }
      }
    });
  }, [projectId]);

  // Load room analysis from URL — auto-populate recommended furniture
  useEffect(() => {
    if (!analysisId || projectId) return;
    fetch(`/api/room-analysis/${analysisId}`).then((r) => r.json()).then((d) => {
      if (!d.analysis) return;
      setAnalysis(d.analysis);
      setRoomSize({
        width: d.analysis.estimatedW || 4000,
        depth: d.analysis.estimatedD || 5000,
        height: d.analysis.estimatedH || 2700,
      });
      // auto-place top 4 recommendations along the back wall
      const top = (d.recommendations || []).slice(0, 4);
      const newInstances: PlacedInstance[] = [];
      let xOffset = -((d.analysis.estimatedW || 4000) / 2 - 600) / 1000;
      const zBack = -((d.analysis.estimatedD || 5000) / 2) / 1000;
      for (const rec of top) {
        const m = rec.model;
        if (!m) continue;
        const params = { ...JSON.parse(m.defaultParams), ...JSON.parse(rec.adaptedParams || "{}") };
        const dsl = JSON.parse(m.geometryDsl);
        const w = (m.bboxW) / 1000;
        const d2 = (m.bboxD) / 1000;
        newInstances.push({
          instanceId: `inst_${Date.now()}_${Math.floor(Math.random() * 1000)}_${m.id}`,
          modelId: m.id, modelName: m.nameUz,
          geometryDsl: dsl, params,
          bbox: [m.bboxW, m.bboxD, m.bboxH],
          position: [xOffset + w / 2, 0, zBack + d2 / 2],
          rotationY: 0,
          bodyColor: COLORS[0].hex, frontColor: COLORS[1].hex,
        });
        xOffset += w + 0.1;
      }
      setInstances(newInstances);
      setName(`${d.analysis.roomType} loyihasi`);
    });
  }, [analysisId, projectId]);

  const addModel = useCallback((modelId: number) => {
    const m = models.find((x) => x.id === modelId);
    if (!m) return;
    const params = safeJson<Record<string, number>>(m.defaultParams, {});
    const dsl = safeJson<any>(m.geometryDsl, { parts: [] });
    const inst: PlacedInstance = {
      instanceId: `inst_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      modelId: m.id,
      modelName: m.nameUz,
      geometryDsl: dsl,
      params,
      bbox: [m.bboxW, m.bboxD, m.bboxH],
      position: [0, 0, 0],
      rotationY: 0,
      bodyColor: COLORS[0].hex,
      frontColor: COLORS[1].hex,
    };
    setInstances([...instances, inst]);
    setSelectedId(inst.instanceId);
    track("add_model", { modelId: m.id, modelName: m.nameUz });
  }, [models, instances]);

  const updateInst = (id: string, patch: Partial<PlacedInstance>) => {
    setInstances(instances.map((x) => (x.instanceId === id ? { ...x, ...patch } : x)));
  };

  const removeInst = (id: string) => {
    setInstances(instances.filter((x) => x.instanceId !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const doSave = async (showToast = true) => {
    setSaving(true);
    setAutoSaving(true);
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: savedId,
        name,
        roomAnalysisId: analysis?.id || (analysisId ? parseInt(analysisId) : null),
        layoutJson: instances,
        roomSize,
      }),
    });
    const d = await res.json();
    if (d.project) {
      setSavedId(d.project.id);
      router.replace(`/studio?project=${d.project.id}`);
      if (showToast) toast.success("Loyiha saqlandi");
    } else if (showToast) {
      toast.error(d.error || "Saqlashda xatolik");
    }
    setSaving(false);
    setAutoSaving(false);
  };

  const onSave = () => { doSave(true); track("save", { projectId: savedId }); };

  // Auto-save debounced
  useEffect(() => {
    if (!savedId && !analysisId) return;
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => {
      doSave(false);
    }, 5000);
    return () => { if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current); };
  }, [instances, roomSize, name, savedId]); // eslint-disable-line react-hooks/exhaustive-deps

  const onMoveInstance = (id: string, pos: [number, number, number]) => {
    setInstances(instances.map((x) => (x.instanceId === id ? { ...x, position: pos } : x)));
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if ((e.key === "Delete" || e.key === "Backspace") && selectedId) {
        e.preventDefault();
        removeInst(selectedId);
        toast.info("O'chirildi");
      }
      if (e.key === "z" && (e.ctrlKey || e.metaKey) && !e.shiftKey) {
        e.preventDefault();
        undo();
        track("undo");
        toast.info("Bekor qilindi");
      }
      if ((e.key === "y" && (e.ctrlKey || e.metaKey)) || (e.key === "z" && (e.ctrlKey || e.metaKey) && e.shiftKey)) {
        e.preventDefault();
        redo();
        track("redo");
        toast.info("Qayta bajarildi");
      }
      if (e.key === "s" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        onSave();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [selectedId, instances, undo, redo]); // eslint-disable-line react-hooks/exhaustive-deps

  const onRender = () => {
    setRendering(true);
    setTimeout(() => {
      const url = r3dRef.current?.exportImage(2);
      if (url) {
        const a = document.createElement("a");
        a.href = url;
        a.download = `${name || "loyiha"}-${Date.now()}.png`;
        a.click();
        track("export", { type: "photo", projectId: savedId });
      }
      setRendering(false);
    }, 50);
  };

  const onSendToProduction = () => {
    const items = instances.map((i) => ({ modelId: i.modelId, params: i.params, qty: 1 }));
    sessionStorage.setItem("ff_nest_items", JSON.stringify(items));
    router.push(`/manufacturing?project=${savedId || ""}`);
  };

  const totalCost = instances.reduce((acc, i) => {
    const m = models.find((x) => x.id === i.modelId);
    return acc + (m?.baseCostUzs || 0);
  }, 0);

  const selected = instances.find((x) => x.instanceId === selectedId);

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-4">
      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-3 flex-wrap">
        <input value={name} onChange={(e) => setName(e.target.value)} className="input max-w-xs font-semibold" placeholder="Loyiha nomi" />
        <div className="flex-1" />
        <div className="text-sm text-muted flex items-center gap-3">
          <span>{instances.length} mebel · {fmtMoney(totalCost)} {autoSaving && "· Avto-saqlash..."}</span>
          <PresenceIndicator roomId={savedId ? `studio_${savedId}` : "studio_anon"} />
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => { undo(); track("undo"); }} disabled={!canUndo} className="btn-ghost p-1.5 disabled:opacity-30" title="Bekor qilish (Ctrl+Z)"><Undo2 className="w-4 h-4" /></button>
          <button onClick={() => { redo(); track("redo"); }} disabled={!canRedo} className="btn-ghost p-1.5 disabled:opacity-30" title="Qayta bajarish (Ctrl+Y)"><Redo2 className="w-4 h-4" /></button>
        </div>
        <button onClick={onSave} disabled={saving} className="btn-ghost">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Saqlash
        </button>
        <button onClick={onSendToProduction} disabled={!instances.length} className="btn-primary disabled:opacity-50">
          <Scissors className="w-4 h-4" /> Ishlab chiqarish
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr_300px] gap-3 h-[calc(100vh-180px)]">
        {/* Sidebar: catalog (desktop) / drawer (mobile) */}
        <div className={`card p-3 overflow-y-auto ${mobilePanel === "catalog" ? "fixed inset-0 z-50 lg:relative lg:inset-auto" : "hidden lg:block"}`}>
          <div className="flex items-center justify-between mb-2 lg:block">
            <h3 className="font-semibold flex items-center gap-1.5 text-sm"><Package className="w-3.5 h-3.5" /> Mebel qo'shish</h3>
            <button className="lg:hidden" onClick={() => setMobilePanel("none")} aria-label="Yopish"><X className="w-5 h-5" /></button>
          </div>
          <input placeholder="Qidiruv..." className="input text-xs mb-2" id="studio-search" />
          <div className="space-y-1.5">
            {models.map((m) => (
              <button key={m.id} onClick={() => addModel(m.id)}
                className="w-full text-left p-2 rounded-lg bg-bg/60 border border-border hover:border-accent/40 transition-colors flex items-center gap-2">
                <div className="w-8 h-8 rounded bg-panel flex items-center justify-center shrink-0">
                  <Box className="w-4 h-4 text-muted" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-medium truncate">{m.nameUz}</div>
                  <div className="text-[10px] text-muted">{m.bboxW}×{m.bboxD}×{m.bboxH}</div>
                </div>
                <Plus className="w-3.5 h-3.5 text-accent shrink-0" />
              </button>
            ))}
          </div>
        </div>

        {/* Viewport */}
        <div className="card overflow-hidden relative min-h-[400px]">
          <ErrorBoundary fallback={<div className="flex items-center justify-center h-full text-muted text-sm">3D sahna yuklanmadi. Yangilab ko'ring.</div>}>
            <Room3D ref={r3dRef} roomSize={roomSize} instances={instances} selectedId={selectedId} onSelect={setSelectedId} onMove={onMoveInstance} />
          </ErrorBoundary>
          <div className="absolute bottom-3 left-3 px-2 py-1 rounded bg-bg/80 backdrop-blur text-xs text-muted border border-border">
            Xona: {fmtMm(roomSize.width)} × {fmtMm(roomSize.depth)} × {fmtMm(roomSize.height)}
          </div>
          <div className="absolute top-3 right-3 flex gap-2">
            <button
              onClick={onRender}
              disabled={rendering || !instances.length}
              className="px-3 py-1.5 rounded-lg bg-bg/80 backdrop-blur border border-border hover:border-accent/40 text-xs flex items-center gap-1.5 disabled:opacity-50"
            >
              {rendering ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
              Foto eksport
            </button>
          </div>
          {/* Mobile floating buttons */}
          <div className="lg:hidden absolute bottom-3 right-3 flex flex-col gap-2">
            <button onClick={() => setMobilePanel("catalog")}
              className="w-12 h-12 rounded-full bg-accent text-white shadow-lg flex items-center justify-center" aria-label="Katalog">
              <Plus className="w-5 h-5" />
            </button>
            <button onClick={() => setMobilePanel("props")}
              className="w-12 h-12 rounded-full bg-bg/80 backdrop-blur border border-border flex items-center justify-center" aria-label="Sozlamalar">
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Right panel (desktop) / drawer (mobile) */}
        <div className={`card p-3 overflow-y-auto ${mobilePanel === "props" ? "fixed inset-0 z-50 lg:relative lg:inset-auto" : "hidden lg:block"}`}>
          <button className="lg:hidden absolute top-3 right-3" onClick={() => setMobilePanel("none")} aria-label="Yopish">
            <X className="w-5 h-5" />
          </button>
          {!selected ? (
            <RoomPanel roomSize={roomSize} setRoomSize={setRoomSize} analysis={analysis} />
          ) : (
            <InstancePanel
              inst={selected}
              roomSize={roomSize}
              onUpdate={(patch) => updateInst(selected.instanceId, patch)}
              onRemove={() => removeInst(selected.instanceId)}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default function Studio() {
  return (
    <Suspense fallback={<div className="p-10 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div>}>
      <StudioInner />
    </Suspense>
  );
}

function RoomPanel({ roomSize, setRoomSize, analysis }: any) {
  return (
    <div>
      <h3 className="font-semibold mb-3 text-sm">Xona o'lchamlari</h3>
      <Slider label="Eni (mm)" value={roomSize.width} min={2000} max={8000} step={100} onChange={(v) => setRoomSize({ ...roomSize, width: v })} />
      <Slider label="Bo'yi (mm)" value={roomSize.depth} min={2000} max={10000} step={100} onChange={(v) => setRoomSize({ ...roomSize, depth: v })} />
      <Slider label="Balandligi (mm)" value={roomSize.height} min={2200} max={3500} step={50} onChange={(v) => setRoomSize({ ...roomSize, height: v })} />
      {analysis && (
        <div className="mt-4 p-3 bg-accent/10 border border-accent/30 rounded-lg text-xs">
          <div className="font-medium text-accent mb-1">AI tahlil natijasi</div>
          <div>Xona turi: {analysis.roomType}</div>
          <div>Uslub: {analysis.styleLabel}</div>
        </div>
      )}
      <div className="mt-4 text-xs text-muted">
        💡 Mebel tanlash uchun chap paneldan biror narsani bosing yoki sahnadagi mebelga bosing.
      </div>
    </div>
  );
}

function InstancePanel({ inst, roomSize, onUpdate, onRemove }: { inst: PlacedInstance; roomSize: any; onUpdate: (p: any) => void; onRemove: () => void }) {
  const W = roomSize.width / 1000;
  const D = roomSize.depth / 1000;
  return (
    <div>
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <h3 className="font-semibold text-sm">{inst.modelName}</h3>
          <div className="text-xs text-muted">{inst.bbox.join("×")} mm</div>
        </div>
        <button onClick={onRemove} title="O'chirish" className="p-1.5 rounded hover:bg-red-500/20 text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
      </div>

      <div className="text-xs font-medium text-muted mb-2 flex items-center gap-1"><Move className="w-3 h-3" /> Joylashuv (m)</div>
      <Slider label="X" value={inst.position[0]} min={-W / 2} max={W / 2} step={0.05} fmt={(v) => v.toFixed(2)}
        onChange={(v) => onUpdate({ position: [v, inst.position[1], inst.position[2]] })} />
      <Slider label="Z" value={inst.position[2]} min={-D / 2} max={D / 2} step={0.05} fmt={(v) => v.toFixed(2)}
        onChange={(v) => onUpdate({ position: [inst.position[0], inst.position[1], v] })} />

      <div className="text-xs font-medium text-muted mb-2 mt-3 flex items-center gap-1"><RotateCw className="w-3 h-3" /> Aylantirish</div>
      <div className="grid grid-cols-4 gap-1 mb-3">
        {[0, 90, 180, 270].map((deg) => (
          <button key={deg} onClick={() => onUpdate({ rotationY: (deg * Math.PI) / 180 })}
            className={`py-1.5 rounded text-xs border ${Math.round((inst.rotationY * 180) / Math.PI) === deg ? "border-accent bg-accent/20 text-accent" : "border-border bg-bg hover:border-accent/40"}`}>
            {deg}°
          </button>
        ))}
      </div>

      <div className="text-xs font-medium text-muted mb-2 mt-3">Korpus rang</div>
      <div className="flex gap-1 mb-3">
        {COLORS.map((c) => (
          <button key={"b" + c.hex} onClick={() => onUpdate({ bodyColor: c.hex })} title={c.name}
            className={`w-7 h-7 rounded border-2 ${inst.bodyColor === c.hex ? "border-accent" : "border-border"}`}
            style={{ background: c.hex }} />
        ))}
      </div>
      <div className="text-xs font-medium text-muted mb-2">Old qism rang</div>
      <div className="flex gap-1">
        {COLORS.map((c) => (
          <button key={"f" + c.hex} onClick={() => onUpdate({ frontColor: c.hex })} title={c.name}
            className={`w-7 h-7 rounded border-2 ${inst.frontColor === c.hex ? "border-accent" : "border-border"}`}
            style={{ background: c.hex }} />
        ))}
      </div>
    </div>
  );
}

function Slider({ label, value, min, max, step, onChange, fmt }: { label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void; fmt?: (v: number) => string }) {
  return (
    <div className="mb-2.5">
      <div className="flex justify-between text-[11px] mb-0.5">
        <span className="text-muted">{label}</span>
        <span className="font-mono">{fmt ? fmt(value) : Math.round(value)}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(parseFloat(e.target.value))} className="w-full accent-accent" />
    </div>
  );
}
