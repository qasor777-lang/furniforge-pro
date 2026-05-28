import { db } from "../src/lib/db";
import { hashPassword } from "../src/lib/auth";

async function main() {
  const username = "admin";
  const password = "admin123";
  const fullName = "Admin";

  const existing = await db.user.findUnique({ where: { username } });
  if (existing) {
    console.log("Admin foydalanuvchi allaqachon mavjud. Yangilash...");
    const hash = await hashPassword(password);
    await db.user.update({
      where: { id: existing.id },
      data: { passwordHash: hash, role: "admin", isActive: true },
    });
    console.log("Admin paroli yangilandi.");
  } else {
    const hash = await hashPassword(password);
    await db.user.create({
      data: { username, passwordHash: hash, fullName, role: "admin", isActive: true },
    });
    console.log("Admin foydalanuvchi yaratildi.");
  }

  console.log(`Login: ${username}`);
  console.log(`Parol: ${password}`);
  console.log(`Rol: admin`);
}

main().catch((e) => { console.error(e); process.exit(1); });
