import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword, requireRole } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET() {
  try { await requireRole(["admin"]); } catch { return NextResponse.json({ error: "forbidden" }, { status: 403 }); }
  const users = await db.user.findMany({
    orderBy: { id: "asc" },
    select: { id: true, username: true, fullName: true, role: true, isActive: true, lastLoginAt: true, createdAt: true },
  });
  return NextResponse.json({ users });
}

export async function POST(req: NextRequest) {
  let admin;
  try { admin = await requireRole(["admin"]); } catch { return NextResponse.json({ error: "forbidden" }, { status: 403 }); }

  const body = await req.json();
  const username = String(body.username || "").trim().toLowerCase();
  const fullName = String(body.fullName || "").trim();
  const role = body.role || "designer";
  const password = String(body.password || "");

  if (!username || !fullName || !password) {
    return NextResponse.json({ error: "username, fullName, password majburiy" }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ error: "Parol kamida 6 belgi" }, { status: 400 });
  }
  if (!["admin", "manager", "designer"].includes(role)) {
    return NextResponse.json({ error: "noto'g'ri role" }, { status: 400 });
  }
  if (!/^[a-z0-9_.-]{3,30}$/.test(username)) {
    return NextResponse.json({ error: "username faqat lotin harf, raqam, _ . - dan iborat" }, { status: 400 });
  }

  const existing = await db.user.findUnique({ where: { username } });
  if (existing) return NextResponse.json({ error: "username band" }, { status: 409 });

  const passwordHash = await hashPassword(password);
  const created = await db.user.create({
    data: { username, fullName, role, passwordHash, createdBy: admin.uid },
    select: { id: true, username: true, fullName: true, role: true, isActive: true, createdAt: true },
  });
  return NextResponse.json({ user: created });
}
