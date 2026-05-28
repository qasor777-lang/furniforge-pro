"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogOut, Shield, User as UserIcon, ChevronDown, Bot } from "lucide-react";

export default function HeaderUser() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me").then((r) => r.json()).then((d) => setUser(d.user));
  }, []);

  const onLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  if (!user) return null;

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-white/5">
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-accent to-accent2 flex items-center justify-center text-xs font-bold">
          {user.fullName?.[0] || user.username?.[0] || "?"}
        </div>
        <div className="text-left hidden md:block">
          <div className="text-xs leading-tight">{user.fullName}</div>
          <div className="text-[10px] text-muted leading-tight">{user.role}</div>
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-muted" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-56 card p-1.5 z-50 shadow-xl">
            <div className="px-3 py-2 border-b border-border mb-1">
              <div className="text-sm font-medium">{user.fullName}</div>
              <div className="text-xs text-muted">@{user.username}</div>
            </div>
            {user.role === "admin" && (
              <>
                <Link href="/admin/users" onClick={() => setOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-sm rounded hover:bg-white/5 text-accent">
                  <Shield className="w-4 h-4" /> Foydalanuvchilar
                </Link>
                <Link href="/admin/telegram" onClick={() => setOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-sm rounded hover:bg-white/5 text-accent">
                  <Bot className="w-4 h-4" /> Telegram bot
                </Link>
              </>
            )}
            <button onClick={onLogout} className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded hover:bg-red-500/10 text-red-400">
              <LogOut className="w-4 h-4" /> Chiqish
            </button>
          </div>
        </>
      )}
    </div>
  );
}
