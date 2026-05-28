"use client";
import { useEffect, useState } from "react";
import { BarChart3, Users, MousePointer, Save, Eye } from "lucide-react";

interface Metric {
  key: string;
  label: string;
  value: number;
  delta: number;
  icon: any;
}

export default function AnalyticsPage() {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [events, setEvents] = useState<{ action: string; page: string; ts: string }[]>([]);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("ff_analytics") || "[]");
    // Aggregate
    const pageViews = data.filter((d: any) => d.action === "page_view").length;
    const saves = data.filter((d: any) => d.action === "save").length;
    const interactions = data.filter((d: any) => d.action === "3d_interact").length;
    const exports = data.filter((d: any) => d.action === "export").length;

    setMetrics([
      { key: "pv", label: "Sahifa ko'rishlari", value: pageViews, delta: 0, icon: Eye },
      { key: "save", label: "Saqlashlar", value: saves, delta: 0, icon: Save },
      { key: "interact", label: "3D interaksiyalar", value: interactions, delta: 0, icon: MousePointer },
      { key: "export", label: "Foto eksportlar", value: exports, delta: 0, icon: BarChart3 },
    ]);
    setEvents(data.slice(-20).reverse());
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2"><BarChart3 className="w-7 h-7 text-accent" /> Analytics</h1>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {metrics.map((m) => (
          <div key={m.key} className="card p-4">
            <div className="flex items-center justify-between mb-2">
              <m.icon className="w-5 h-5 text-accent" />
              <span className={`text-xs ${m.delta >= 0 ? "text-green-400" : "text-red-400"}`}>{m.delta > 0 ? "+" : ""}{m.delta}%</span>
            </div>
            <div className="text-2xl font-bold">{m.value}</div>
            <div className="text-xs text-muted">{m.label}</div>
          </div>
        ))}
      </div>

      <div className="card p-4">
        <h3 className="font-semibold mb-3">So'nggi hodisalar (local)</h3>
        {events.length === 0 ? (
          <p className="text-sm text-muted">Hali ma'lumot yo'q. Foydalanuvchilar dasturdan foydalanishni boshlashadi.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted border-b border-border">
                  <th className="pb-2 pr-4">Harakat</th>
                  <th className="pb-2 pr-4">Sahifa</th>
                  <th className="pb-2">Vaqt</th>
                </tr>
              </thead>
              <tbody>
                {events.map((e, i) => (
                  <tr key={i} className="border-b border-border/50">
                    <td className="py-2 pr-4"><span className="pill">{e.action}</span></td>
                    <td className="py-2 pr-4 text-muted">{e.page}</td>
                    <td className="py-2 text-muted">{new Date(e.ts).toLocaleString("uz-UZ")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
