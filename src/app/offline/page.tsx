"use client";
import { WifiOff, RefreshCw } from "lucide-react";

export default function OfflinePage() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center px-6">
      <WifiOff className="w-12 h-12 text-muted" />
      <h1 className="text-2xl font-bold">Internet aloqasi yo'q</h1>
      <p className="text-muted max-w-sm">
        Ba'zi sahifalar keshda saqlangan va oflayn rejimda ishlaydi. Katalog va Studio ko'rish imkoniyatlari cheklangan.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="btn-primary"
      >
        <RefreshCw className="w-4 h-4" /> Qayta yuklash
      </button>
    </div>
  );
}
