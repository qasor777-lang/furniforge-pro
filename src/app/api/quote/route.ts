import { NextRequest, NextResponse } from "next/server";
import { computeQuote } from "@/lib/pricing";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const items = body.items;
  const profile = body.profile || "STANDARD";
  if (!items?.length) return NextResponse.json({ error: "items required" }, { status: 400 });
  const quote = await computeQuote(items, profile);
  return NextResponse.json({ quote, profile });
}
