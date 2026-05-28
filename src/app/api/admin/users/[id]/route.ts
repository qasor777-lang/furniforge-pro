import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword, requireRole } from "@/lib/auth";

export const runtime = "nodejs";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  let admin;
  try { admin = await requireRole(["admin"]); } catch { return NextResponse.json({ error: "forbidden" }, { status: 403 }); }

  const id = parseInt(params.id);
  const body = await req.json();
  const data: any = {};

  if (body.fullName !== undefined) data.fullName = String(body.fullName);
  if (body.role !== undefined && ["admin", "manager", "designer"].includes(body.role)) data.role = body.role;
  if (body.isActive !== undefined) data.isActive = !!body.isActive;
  if (body.password) {
    if (body.password.length < 6) return NextResponse.json({ error: "Parol kamida 6 belgi" }, { status: 400 });
    data.passwordHash = await hashPassword(body.password);
  }

  // Prevent admin from deactivating themselves
  if (id === admin.uid && data.isActive === false) {
    return NextResponse.json({ error: "O'z akkountingizni o'chira olmaysiz" }, { status: 400 });
  }

  const updated = await db.user.update({
    where: { id }, data,
    select: { id: true, username: true, fullName: true, role: true, isActive: true },
  });
  return NextResponse.json({ user: updated });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  let admin;
  try { admin = await requireRole(["admin"]); } catch { return NextResponse.json({ error: "forbidden" }, { status: 403 }); }

  const id = parseInt(params.id);
  if (id === admin.uid) {
    return NextResponse.json({ error: "O'zingizni o'chira olmaysiz" }, { status: 400 });
  }
  await db.user.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
