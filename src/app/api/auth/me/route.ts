import { NextResponse } from "next/server";
import { readSessionFromCookie } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET() {
  const u = await readSessionFromCookie();
  if (!u) return NextResponse.json({ user: null });
  return NextResponse.json({ user: u });
}
