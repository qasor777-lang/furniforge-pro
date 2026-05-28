"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { FolderOpen, Plus, Trash2, Clock } from "lucide-react";

export default function Projects() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    fetch("/api/projects").then((r) => r.json()).then((d) => setProjects(d.projects || [])).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const onDelete = async (id: number) => {
    if (!confirm("Loyihani o'chirishni tasdiqlaysizmi?")) return;
    await fetch(`/api/projects/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-1">Mening loyihalarim</h1>
          <p className="text-muted">{projects.length} ta saqlangan loyiha</p>
        </div>
        <Link href="/studio" className="btn-primary"><Plus className="w-4 h-4" /> Yangi loyiha</Link>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted">Yuklanmoqda...</div>
      ) : projects.length === 0 ? (
        <div className="card p-12 text-center">
          <FolderOpen className="w-12 h-12 mx-auto text-muted mb-3" />
          <p className="text-muted mb-4">Hozircha loyihalar yo'q</p>
          <Link href="/studio" className="btn-primary">Birinchi loyihani yaratish</Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((p) => {
            const layout = JSON.parse(p.layoutJson || "[]");
            return (
              <div key={p.id} className="card p-4 hover:border-accent/40 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <Link href={`/studio?project=${p.id}`} className="font-semibold hover:text-accent flex-1">{p.name}</Link>
                  <button onClick={() => onDelete(p.id)} title="O'chirish" className="p-1 hover:bg-red-500/20 rounded text-red-400">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="text-xs text-muted mb-2 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {new Date(p.updatedAt).toLocaleString("uz-UZ")}
                </div>
                <div className="text-xs text-muted">{layout.length} ta mebel</div>
                <Link href={`/studio?project=${p.id}`} className="btn-ghost w-full mt-3 text-xs">Ochish</Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
