import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const existing = await db.user.findUnique({ where: { username: "admin" } });
    if (existing) {
      return NextResponse.json({ ok: true, message: "Database already seeded. Admin exists." });
    }

    // Seed furniture categories
    await db.furnitureCategory.upsert({
      where: { code: "furniture" },
      update: {},
      create: { code: "furniture", path: "furniture", nameUz: "Mebel", nameRu: "Мебель", nameEn: "Furniture" },
    });

    await db.furnitureCategory.upsert({
      where: { code: "furniture.kitchen" },
      update: {},
      create: { code: "furniture.kitchen", path: "furniture.kitchen", nameUz: "Oshxona mebeli", nameRu: "Кухонная мебель", nameEn: "Kitchen Furniture" },
    });

    await db.furnitureCategory.upsert({
      where: { code: "furniture.bedroom" },
      update: {},
      create: { code: "furniture.bedroom", path: "furniture.bedroom", nameUz: "Yotoqxona mebeli", nameRu: "Спальная мебель", nameEn: "Bedroom Furniture" },
    });

    await db.furnitureCategory.upsert({
      where: { code: "furniture.living" },
      update: {},
      create: { code: "furniture.living", path: "furniture.living", nameUz: "Mehmonxona mebeli", nameRu: "Гостиная мебель", nameEn: "Living Room Furniture" },
    });

    await db.furnitureCategory.upsert({
      where: { code: "furniture.office" },
      update: {},
      create: { code: "furniture.office", path: "furniture.office", nameUz: "Ofis mebeli", nameRu: "Офисная мебель", nameEn: "Office Furniture" },
    });

    // Create admin user
    const hash = await hashPassword("admin123");
    await db.user.create({
      data: {
        username: "admin",
        passwordHash: hash,
        fullName: "Admin",
        role: "admin",
        isActive: true,
      },
    });

    return NextResponse.json({
      ok: true,
      message: "Database seeded successfully!",
      login: { username: "admin", password: "admin123" },
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
