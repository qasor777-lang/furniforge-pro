"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Code, FileJson } from "lucide-react";

export default function ApiDocsPage() {
  const [spec, setSpec] = useState<any>(null);
  useEffect(() => {
    fetch("/api/docs").then((r) => r.json()).then(setSpec);
  }, []);

  if (!spec) return <div className="p-10 text-center text-muted">Yuklanmoqda...</div>;

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <Link href="/" className="inline-flex items-center gap-1 text-sm text-muted hover:text-white mb-4">
        <ArrowLeft className="w-3.5 h-3.5" /> Bosh sahifaga
      </Link>
      <h1 className="text-3xl font-bold mb-2 flex items-center gap-2"><Code className="w-7 h-7 text-accent" /> API hujjatlari</h1>
      <p className="text-muted mb-8">{spec.info?.description} · Versiya {spec.info?.version}</p>

      <div className="space-y-4">
        {Object.entries(spec.paths || {}).map(([path, methods]: [string, any]) => (
          <div key={path} className="card p-4">
            <div className="flex items-center gap-2 mb-2">
              <FileJson className="w-4 h-4 text-accent" />
              <span className="font-mono text-sm">{path}</span>
            </div>
            {Object.entries(methods).map(([method, def]: [string, any]) => (
              <div key={method} className="mb-2">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded ${method === "get" ? "bg-green-500/20 text-green-400" : method === "post" ? "bg-blue-500/20 text-blue-400" : "bg-amber-500/20 text-amber-400"}`}>
                    {method}
                  </span>
                  <span className="text-sm">{def.summary}</span>
                </div>
                {def.parameters && (
                  <div className="mt-1 text-xs text-muted">Params: {def.parameters.map((p: any) => p.name).join(", ")}</div>
                )}
                {def.requestBody && (
                  <div className="mt-1 text-xs text-muted">Body: {Object.keys(def.requestBody.content)[0]}</div>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
