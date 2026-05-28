"use client";
import { useEffect, useState } from "react";
import { Send, Bot, Save, CheckCircle2, XCircle, Loader2, Power, Activity, Copy } from "lucide-react";

export default function AdminTelegram() {
  const [data, setData] = useState<any>(null);
  const [token, setToken] = useState("");
  const [chatIds, setChatIds] = useState("");
  const [enabled, setEnabled] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [testing, setTesting] = useState(false);

  const load = () => {
    fetch("/api/admin/telegram").then((r) => r.json()).then((d) => {
      setData(d);
      setToken(d.tokenMasked || "");
      setChatIds((d.chatIds || []).join(", "));
      setEnabled(d.enabled);
    });
  };

  useEffect(() => { load(); }, []);

  const onSave = async () => {
    setSaving(true);
    await fetch("/api/admin/telegram", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "save", token, chatIds, enabled }),
    });
    setSaving(false);
    load();
  };

  const onTest = async () => {
    setTesting(true);
    setTestResult(null);
    const res = await fetch("/api/admin/telegram", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "test" }),
    });
    const d = await res.json();
    setTestResult(d);
    setTesting(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold mb-2 flex items-center gap-2"><Bot className="w-7 h-7 text-accent" /> Telegram Bot integratsiyasi</h1>
      <p className="text-muted text-sm mb-6">Har bir tizimga kirish vaqtida admin'ga avtomatik xabar yuboriladi</p>

      {/* Status */}
      {data && (
        <div className="card p-4 mb-4 flex items-center gap-3">
          {data.enabled ? (
            <><CheckCircle2 className="w-5 h-5 text-emerald-400" /><span className="font-medium text-emerald-400">Faol</span></>
          ) : (
            <><XCircle className="w-5 h-5 text-red-400" /><span className="font-medium text-red-400">O'chirilgan</span></>
          )}
          <span className="text-muted text-sm">·</span>
          <span className="text-sm text-muted">{data.chatIds.length} ta admin chat</span>
          {data.hasToken && <><span className="text-muted text-sm">·</span><span className="text-xs font-mono text-muted">{data.tokenMasked}</span></>}
        </div>
      )}

      {/* Setup instructions */}
      <details className="card p-4 mb-4 group">
        <summary className="cursor-pointer font-semibold text-sm">📖 Bot yaratish bo'yicha qo'llanma</summary>
        <div className="mt-3 space-y-3 text-sm text-muted">
          <ol className="list-decimal list-inside space-y-2">
            <li>Telegram'da <a href="https://t.me/BotFather" target="_blank" className="text-accent">@BotFather</a> ga kiring</li>
            <li><code className="bg-bg/60 px-1.5 rounded">/newbot</code> buyrug'ini yuboring</li>
            <li>Bot nomini va username'ni kiriting (masalan: <code className="bg-bg/60 px-1.5 rounded">FurniForgeAlertsBot</code>)</li>
            <li>BotFather sizga <b>token</b> beradi (masalan: <code className="bg-bg/60 px-1.5 rounded">7234567890:AAEaBcD...</code>) — quyidagi maydonga joylashtiring</li>
            <li><a href="https://t.me/userinfobot" target="_blank" className="text-accent">@userinfobot</a> ga kirib o'z <b>chat_id</b>ngizni oling</li>
            <li>Yaratgan botingizga shaxsan <code className="bg-bg/60 px-1.5 rounded">/start</code> yuboring (aks holda bot sizga xabar yubora olmaydi)</li>
            <li>Quyiga chat_id'ni kiriting va <b>Saqlash</b> bossangiz, keyin <b>Test xabari</b> tugmasi bilan tekshiring</li>
          </ol>
        </div>
      </details>

      {/* Form */}
      <div className="card p-5 space-y-4 mb-4">
        <div>
          <label className="text-xs text-muted block mb-1.5">Bot Token <span className="text-red-400">*</span></label>
          <input
            type="text" value={token} onChange={(e) => setToken(e.target.value)}
            placeholder="7234567890:AAEaBcDeFgHiJkLmNoPqRsTuVwXyZ"
            className="input font-mono text-xs"
          />
          <div className="text-[10px] text-muted mt-1">@BotFather'dan olingan token. Saqlangach maskirovka qilinadi.</div>
        </div>
        <div>
          <label className="text-xs text-muted block mb-1.5">Admin Chat ID(lar)</label>
          <input
            type="text" value={chatIds} onChange={(e) => setChatIds(e.target.value)}
            placeholder="123456789, 987654321"
            className="input font-mono text-xs"
          />
          <div className="text-[10px] text-muted mt-1">Vergul bilan ajratib bir nechta admin qo'shish mumkin. @userinfobot orqali ID olish.</div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setEnabled(!enabled)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs ${enabled ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30" : "bg-red-500/15 text-red-400 border border-red-500/30"}`}>
            <Power className="w-3.5 h-3.5" /> {enabled ? "Yoqilgan" : "O'chirilgan"}
          </button>
          <div className="flex-1" />
          <button onClick={onTest} disabled={testing || !data?.hasToken} className="btn-ghost text-sm disabled:opacity-50">
            {testing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Test xabari yuborish
          </button>
          <button onClick={onSave} disabled={saving} className="btn-primary text-sm">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Saqlash
          </button>
        </div>

        {testResult && (
          <div className={`p-3 rounded-lg text-sm ${testResult.ok ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400" : "bg-red-500/10 border border-red-500/30 text-red-400"}`}>
            {testResult.ok ? (
              <><CheckCircle2 className="w-4 h-4 inline mr-1.5" /> Xabar muvaffaqiyatli yuborildi ({testResult.sent} ta chatga). Telegramni tekshiring.</>
            ) : (
              <>
                <XCircle className="w-4 h-4 inline mr-1.5" /> Xato:
                <ul className="list-disc list-inside mt-1 text-xs">
                  {testResult.errors.map((e: string, i: number) => <li key={i}>{e}</li>)}
                </ul>
              </>
            )}
          </div>
        )}
      </div>

      {/* Recent logins */}
      <div className="card p-5">
        <h2 className="font-semibold mb-3 flex items-center gap-2"><Activity className="w-4 h-4" /> Oxirgi 20 ta kirish</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted text-xs uppercase border-b border-border">
                <th className="py-2 pr-3">Vaqt</th>
                <th className="py-2 pr-3">Username</th>
                <th className="py-2 pr-3">Holat</th>
                <th className="py-2 pr-3">IP</th>
                <th className="py-2 pr-3">Qurilma</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {(data?.recentLogins || []).map((l: any) => (
                <tr key={l.id} className="hover:bg-white/5">
                  <td className="py-2 pr-3 text-xs text-muted">{new Date(l.createdAt).toLocaleString("uz-UZ")}</td>
                  <td className="py-2 pr-3 font-mono text-xs">{l.username}</td>
                  <td className="py-2 pr-3">
                    {l.success
                      ? <span className="pill bg-emerald-500/15 text-emerald-400 border-emerald-500/30">✓ Muvaffaqiyatli</span>
                      : <span className="pill bg-red-500/15 text-red-400 border-red-500/30">✕ Bekor qilindi</span>}
                  </td>
                  <td className="py-2 pr-3 text-xs font-mono text-muted">{l.ip || "—"}</td>
                  <td className="py-2 pr-3 text-xs text-muted truncate max-w-[200px]">{shortUA(l.userAgent || "")}</td>
                </tr>
              ))}
              {!data?.recentLogins?.length && (
                <tr><td colSpan={5} className="text-center py-6 text-muted text-sm">Hali kirishlar yo'q</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function shortUA(ua: string): string {
  if (!ua) return "—";
  const browser = /Chrome\/(\d+)/.test(ua) ? "Chrome" : /Firefox/.test(ua) ? "Firefox" : /Safari/.test(ua) ? "Safari" : /Edg/.test(ua) ? "Edge" : "?";
  const os = /Windows/.test(ua) ? "Windows" : /Mac OS/.test(ua) ? "macOS" : /Android/.test(ua) ? "Android" : /iPhone|iPad/.test(ua) ? "iOS" : /Linux/.test(ua) ? "Linux" : "?";
  return `${browser} · ${os}`;
}
