import { db } from "../src/lib/db";

async function main() {
  const token = "8850062243:AAGwoRUpMi2twuYrhqNzZBhLPvZjHAfeROo";

  await db.appSetting.upsert({
    where: { key: "tg.token" },
    update: { value: token },
    create: { key: "tg.token", value: token },
  });

  // Default enabled true (will auto-disable if no chatIds)
  await db.appSetting.upsert({
    where: { key: "tg.enabled" },
    update: { value: "true" },
    create: { key: "tg.enabled", value: "true" },
  });

  console.log("Telegram bot token database'ga saqlandi.");
  console.log("Eslatma: Admin chat ID qo'shish uchun /admin/telegram sahifasiga o'ting.");
}

main().catch((e) => { console.error(e); process.exit(1); });
