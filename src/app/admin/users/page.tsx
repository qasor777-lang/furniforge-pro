"use client";
import { useEffect, useState } from "react";
import { Users, UserPlus, Trash2, Shield, Loader2, Check, X, KeyRound } from "lucide-react";

const ROLES = [
  { value: "admin", label: "Administrator" },
  { value: "manager", label: "Menejer" },
  { value: "designer", label: "Dizayner" },
];

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [resetTarget, setResetTarget] = useState<any>(null);

  const load = () => {
    setLoading(true);
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then((d) => setUsers(d.users || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const onToggleActive = async (u: any) => {
    await fetch(`/api/admin/users/${u.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !u.isActive }),
    });
    load();
  };

  const onDelete = async (u: any) => {
    if (!confirm(`${u.username} foydalanuvchisini o'chirishni tasdiqlaysizmi?`)) return;
    await fetch(`/api/admin/users/${u.id}`, { method: "DELETE" });
    load();
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2"><Users className="w-7 h-7" /> Foydalanuvchilar</h1>
          <p className="text-muted text-sm mt-1">{users.length} ta foydalanuvchi · faqat admin yangi yarata oladi</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary"><UserPlus className="w-4 h-4" /> Yangi foydalanuvchi</button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted"><Loader2 className="w-6 h-6 mx-auto animate-spin" /></div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-bg/60">
              <tr className="text-left text-muted text-xs uppercase">
                <th className="py-3 px-4">Username</th>
                <th className="py-3 px-4">F.I.O</th>
                <th className="py-3 px-4">Rol</th>
                <th className="py-3 px-4">Holat</th>
                <th className="py-3 px-4">Oxirgi kirish</th>
                <th className="py-3 px-4 text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-white/5">
                  <td className="py-3 px-4 font-mono text-xs">{u.username}</td>
                  <td className="py-3 px-4">{u.fullName}</td>
                  <td className="py-3 px-4">
                    <span className={`pill ${u.role === "admin" ? "bg-accent/15 text-accent border-accent/30" : ""}`}>
                      {u.role === "admin" && <Shield className="w-3 h-3 mr-1" />}
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <button onClick={() => onToggleActive(u)} className={`pill ${u.isActive ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" : "bg-red-500/15 text-red-400 border-red-500/30"}`}>
                      {u.isActive ? <Check className="w-3 h-3 mr-1" /> : <X className="w-3 h-3 mr-1" />}
                      {u.isActive ? "Faol" : "Bloklangan"}
                    </button>
                  </td>
                  <td className="py-3 px-4 text-xs text-muted">
                    {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString("uz-UZ") : "—"}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button onClick={() => setResetTarget(u)} title="Parolni tiklash" className="p-1.5 hover:bg-white/10 rounded text-muted">
                      <KeyRound className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => onDelete(u)} title="O'chirish" className="p-1.5 hover:bg-red-500/20 rounded text-red-400 ml-1">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && <CreateUserModal onClose={() => setShowForm(false)} onCreated={() => { setShowForm(false); load(); }} />}
      {resetTarget && <ResetPasswordModal user={resetTarget} onClose={() => setResetTarget(null)} onDone={() => { setResetTarget(null); load(); }} />}
    </div>
  );
}

function CreateUserModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("designer");
  const [password, setPassword] = useState(genPassword());
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); setLoading(true);
    const res = await fetch("/api/admin/users", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, fullName, role, password }),
    });
    const d = await res.json();
    setLoading(false);
    if (!res.ok) { setError(d.error); return; }
    alert(`Foydalanuvchi yaratildi!\n\nUsername: ${username}\nParol: ${password}\n\nBu ma'lumotlarni saqlab oling — parol qaytadan ko'rinmaydi.`);
    onCreated();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="card p-6 w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><UserPlus className="w-5 h-5" /> Yangi foydalanuvchi</h2>
        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label htmlFor="username" className="text-xs text-muted block mb-1">Username (lotin, raqam, _)</label>
            <input id="username" value={username} onChange={(e) => setUsername(e.target.value)} required pattern="[a-z0-9_.\-]{3,30}" className="input" placeholder="masalan: dilshod" />
          </div>
          <div>
            <label htmlFor="fullname" className="text-xs text-muted block mb-1">F.I.O</label>
            <input id="fullname" value={fullName} onChange={(e) => setFullName(e.target.value)} required className="input" placeholder="Karimov Dilshod" />
          </div>
          <div>
            <label htmlFor="role" className="text-xs text-muted block mb-1">Rol</label>
            <select id="role" value={role} onChange={(e) => setRole(e.target.value)} className="input">
              {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="password" className="text-xs text-muted block mb-1">Boshlang'ich parol</label>
            <div className="flex gap-2">
              <input id="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="input flex-1 font-mono" placeholder="Parol kiriting" />
              <button type="button" onClick={() => setPassword(genPassword())} className="btn-ghost text-xs whitespace-nowrap">Tasodifiy</button>
            </div>
          </div>

          {error && <div className="p-2 bg-red-500/10 border border-red-500/30 rounded text-xs text-red-400">{error}</div>}

          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="btn-ghost flex-1">Bekor</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Yaratish"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ResetPasswordModal({ user, onClose, onDone }: { user: any; onClose: () => void; onDone: () => void }) {
  const [password, setPassword] = useState(genPassword());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); setLoading(true);
    const res = await fetch(`/api/admin/users/${user.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const d = await res.json();
    setLoading(false);
    if (!res.ok) { setError(d.error); return; }
    alert(`${user.username} uchun yangi parol:\n\n${password}`);
    onDone();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="card p-6 w-full max-w-sm">
        <h2 className="text-lg font-semibold mb-2 flex items-center gap-2"><KeyRound className="w-5 h-5" /> Parolni tiklash</h2>
        <p className="text-xs text-muted mb-4">{user.username} ({user.fullName})</p>
        <form onSubmit={onSubmit} className="space-y-3">
          <div className="flex gap-2">
            <input value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="input flex-1 font-mono" />
            <button type="button" onClick={() => setPassword(genPassword())} className="btn-ghost text-xs whitespace-nowrap">Tasodifiy</button>
          </div>
          {error && <div className="p-2 bg-red-500/10 border border-red-500/30 rounded text-xs text-red-400">{error}</div>}
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="btn-ghost flex-1">Bekor</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Tiklash"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function genPassword(len = 10): string {
  const chars = "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}
