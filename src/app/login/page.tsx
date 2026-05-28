"use client";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Sparkles, Loader2, LogIn, AlertCircle } from "lucide-react";

function LoginPageInner() {
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get("next") || "/";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Login failed");
      router.push(next);
      router.refresh();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-100px)] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-br from-accent to-accent2 flex items-center justify-center mb-3 shadow-lg shadow-accent/30">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold">FurniForge<span className="text-accent2">.Pro</span></h1>
          <p className="text-muted text-sm mt-1">Tizimga kirish</p>
        </div>

        <form onSubmit={onSubmit} className="card p-6 space-y-4">
          <div>
            <label className="text-xs text-muted block mb-1.5">Foydalanuvchi nomi</label>
            <input
              type="text" autoComplete="username" required
              value={username} onChange={(e) => setUsername(e.target.value)}
              className="input" placeholder="admin"
            />
          </div>
          <div>
            <label className="text-xs text-muted block mb-1.5">Parol</label>
            <input
              type="password" autoComplete="current-password" required
              value={password} onChange={(e) => setPassword(e.target.value)}
              className="input" placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
            Kirish
          </button>

          <div className="text-xs text-muted text-center pt-2 border-t border-border">
            Akkountingiz yo'qmi? <span className="text-accent">Administrator bilan bog'laning</span>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div>}>
      <LoginPageInner />
    </Suspense>
  );
}
