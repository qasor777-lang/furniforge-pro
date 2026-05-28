import { db } from "../src/lib/db";

async function main() {
  const chatId = "6089586932";

  await db.appSetting.upsert({
    where: { key: "tg.chatIds" },
    update: { value: chatId },
    create: { key: "tg.chatIds", value: chatId },
  });

  console.log(`Admin chat ID (${chatId}) database'ga saqlandi.`);
  console.log("Bot endi faol. Test xabar yuborish uchun: npm run dev → /admin/telegram");
}

main().catch((e) => { console.error(e); process.exit(1); });
