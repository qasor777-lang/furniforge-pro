import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { getTelegramConfig, setTelegramConfig, sendTelegramMessage } from "@/lib/telegram";
import { db } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  try { await requireRole(["admin"]); } catch { return NextResponse.json({ error: "forbidden" }, { status: 403 }); }
  const cfg = await getTelegramConfig();
  // Don't return the full token — only mask it
  const masked = cfg.token ? `${cfg.token.slice(0, 8)}...${cfg.token.slice(-4)}` : "";
  const recent = await db.loginLog.findMany({ orderBy: { id: "desc" }, take: 20 });
  return NextResponse.json({
    enabled: cfg.enabled,
    hasToken: !!cfg.token,
    tokenMasked: masked,
    chatIds: cfg.chatIds,
    recentLogins: recent,
  });
}

export async function POST(req: NextRequest) {
  try { await requireRole(["admin"]); } catch { return NextResponse.json({ error: "forbidden" }, { status: 403 }); }
  const body = await req.json();
  const action = body.action;

  if (action === "save") {
    const updates: any = {};
    if (typeof body.token === "string" && body.token.trim() && !body.token.includes("...")) {
      updates.token = body.token.trim();
    }
    if (typeof body.chatIds === "string") {
      updates.chatIds = body.chatIds.split(/[,\s]+/).map((s: string) => s.trim()).filter(Boolean);
    }
    if (typeof body.enabled === "boolean") {
      updates.enabled = body.enabled;
    }
    await setTelegramConfig(updates);
    return NextResponse.json({ ok: true });
  }

  if (action === "test") {
    const r = await sendTelegramMessage(
      "🤖 <b>Test xabari</b>\n\nFurniForge Pro Telegram integratsiyasi <b>ishlamoqda</b>. ✅\n\n<i>Endi har safar tizimga kirish vaqtida shu yerga xabar keladi.</i>",
    );
    return NextResponse.json(r);
  }

  return NextResponse.json({ error: "unknown action" }, { status: 400 });
}
