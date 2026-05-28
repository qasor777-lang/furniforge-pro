// Telegram Bot integration — admin notifications.
// Token + chat IDs stored in AppSetting table (managed via /admin/settings).

import { db } from "./db";

export interface TelegramConfig {
  token: string;
  chatIds: string[];   // multiple admins possible (comma-separated)
  enabled: boolean;
}

export async function getTelegramConfig(): Promise<TelegramConfig> {
  const rows = await db.appSetting.findMany({
    where: { key: { in: ["tg.token", "tg.chatIds", "tg.enabled"] } },
  });
  const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  // Fallback to .env
  const token = (map["tg.token"] || process.env.TELEGRAM_BOT_TOKEN || "").trim();
  const chatStr = (map["tg.chatIds"] || process.env.TELEGRAM_ADMIN_CHAT_ID || "").trim();
  const chatIds = chatStr.split(/[,\s]+/).map((s) => s.trim()).filter(Boolean);
  const enabled = (map["tg.enabled"] ?? "true") !== "false" && !!token && chatIds.length > 0;
  return { token, chatIds, enabled };
}

export async function setTelegramConfig(cfg: Partial<TelegramConfig>) {
  const ops: { key: string; value: string }[] = [];
  if (cfg.token !== undefined) ops.push({ key: "tg.token", value: cfg.token });
  if (cfg.chatIds !== undefined) ops.push({ key: "tg.chatIds", value: cfg.chatIds.join(",") });
  if (cfg.enabled !== undefined) ops.push({ key: "tg.enabled", value: String(cfg.enabled) });
  for (const o of ops) {
    await db.appSetting.upsert({
      where: { key: o.key }, update: { value: o.value }, create: o,
    });
  }
}

export async function sendTelegramMessage(text: string, opts: { silent?: boolean } = {}): Promise<{ ok: boolean; sent: number; errors: string[] }> {
  const cfg = await getTelegramConfig();
  if (!cfg.enabled) return { ok: false, sent: 0, errors: ["telegram disabled or not configured"] };

  const errors: string[] = [];
  let sent = 0;
  for (const chatId of cfg.chatIds) {
    try {
      const res = await fetch(`https://api.telegram.org/bot${cfg.token}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: "HTML",
          disable_notification: !!opts.silent,
        }),
      });
      const d = await res.json();
      if (d.ok) sent++;
      else errors.push(`chat ${chatId}: ${d.description}`);
    } catch (e: any) {
      errors.push(`chat ${chatId}: ${e.message}`);
    }
  }
  return { ok: sent > 0, sent, errors };
}

// Helper: build a login notification message
export function buildLoginNotification(args: {
  username: string;
  fullName?: string;
  role?: string;
  success: boolean;
  ip?: string;
  userAgent?: string;
}): string {
  const time = new Date().toLocaleString("uz-UZ", { timeZone: "Asia/Tashkent" });
  const icon = args.success ? "✅" : "❌";
  const status = args.success ? "Tizimga kirildi" : "Kirish urinishi (parol noto'g'ri)";

  const lines = [
    `${icon} <b>${status}</b>`,
    "",
    `👤 <b>Login:</b> <code>${args.username}</code>`,
    args.fullName ? `📛 <b>Ism:</b> ${escapeHtml(args.fullName)}` : "",
    args.role ? `🔰 <b>Rol:</b> ${args.role}` : "",
    `🕒 <b>Vaqt:</b> ${time}`,
    args.ip ? `🌐 <b>IP:</b> <code>${args.ip}</code>` : "",
    args.userAgent ? `💻 <b>Qurilma:</b> <i>${escapeHtml(shortUA(args.userAgent))}</i>` : "",
    "",
    "<i>FurniForge Pro · Security Alert</i>",
  ].filter(Boolean);
  return lines.join("\n");
}

function escapeHtml(s: string): string {
  return s.replace(/[<>&"']/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&#39;" }[c]!));
}

function shortUA(ua: string): string {
  // Detect platform/browser briefly
  const browser = /Chrome\/(\d+)/.test(ua) ? "Chrome" : /Firefox\/(\d+)/.test(ua) ? "Firefox" : /Safari/.test(ua) ? "Safari" : /Edg/.test(ua) ? "Edge" : "Browser";
  const os = /Windows/.test(ua) ? "Windows" : /Mac OS/.test(ua) ? "macOS" : /Android/.test(ua) ? "Android" : /iPhone|iPad/.test(ua) ? "iOS" : /Linux/.test(ua) ? "Linux" : "Unknown";
  const isMobile = /Mobile|Android|iPhone|iPad/.test(ua);
  return `${browser} · ${os}${isMobile ? " · Mobile" : ""}`;
}
