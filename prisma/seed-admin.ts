import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
  const username = "admin";
  const password = "admin123"; // Birinchi kirgandan keyin parolni o'zgartiring!

  const existing = await db.user.findUnique({ where: { username } });
  if (existing) {
    console.log(`✓ admin allaqachon mavjud (id=${existing.id}). Parolni qaytadan o'rnatish uchun avval o'chiring.`);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const u = await db.user.create({
    data: {
      username,
      fullName: "Bosh administrator",
      passwordHash,
      role: "admin",
      isActive: true,
    },
  });

  console.log("\n┌─────────────────────────────────────────────┐");
  console.log("│  🔐 Birinchi admin yaratildi                 │");
  console.log("├─────────────────────────────────────────────┤");
  console.log(`│  Username:  ${username.padEnd(32)}│`);
  console.log(`│  Parol:     ${password.padEnd(32)}│`);
  console.log("│                                             │");
  console.log("│  ⚠️  Birinchi kirgandan keyin parolni        │");
  console.log("│     /admin/users orqali o'zgartiring        │");
  console.log("└─────────────────────────────────────────────┘\n");
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => db.$disconnect());
