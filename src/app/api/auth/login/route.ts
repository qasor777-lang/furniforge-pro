import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyPassword, createSession } from "@/lib/auth";
import { sendTelegramMessage, buildLoginNotification } from "@/lib/telegram";

export const runtime = "nodejs";

function getClientIp(req: NextRequest): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "—";
}

async function notify(args: { username: string; fullName?: string; role?: string; success: boolean; ip?: string; userAgent?: string }) {
  // Fire-and-forget — never block login on telegram errors
  try {
    const text = buildLoginNotification(args);
    await sendTelegramMessage(text, { silent: false });
  } catch (e) {
    console.error("Telegram notify failed:", e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const username = String(body.username || "").trim().toLowerCase();
    const password = String(body.password || "");
    const ip = getClientIp(req);
    const userAgent = req.headers.get("user-agent") || "";

    if (!username || !password) {
      return NextResponse.json({ error: "username and password required" }, { status: 400 });
    }

    const user = await db.user.findUnique({ where: { username } });
    if (!user || !user.isActive) {
      await db.loginLog.create({ data: { username, success: false, ip, userAgent } }).catch(() => {});
      notify({ username, success: false, ip, userAgent });
      return NextResponse.json({ error: "Login yoki parol noto'g'ri" }, { status: 401 });
    }

    const ok = await verifyPassword(password, user.passwordHash);
    if (!ok) {
      await db.loginLog.create({ data: { username, success: false, ip, userAgent } }).catch(() => {});
      notify({ username, fullName: user.fullName, success: false, ip, userAgent });
      return NextResponse.json({ error: "Login yoki parol noto'g'ri" }, { status: 401 });
    }

    await db.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
    await db.loginLog.create({ data: { username, success: true, ip, userAgent } }).catch(() => {});

    await createSession({
      uid: user.id,
      username: user.username,
      role: user.role as any,
      fullName: user.fullName,
    });

    notify({
      username: user.username,
      fullName: user.fullName,
      role: user.role,
      success: true,
      ip, userAgent,
    });

    return NextResponse.json({
      user: { id: user.id, username: user.username, role: user.role, fullName: user.fullName },
    });
  } catch (e: any) {
    console.error("Login error:", e);
    return NextResponse.json({ error: "Server xatosi: " + e.message }, { status: 500 });
  }
}
