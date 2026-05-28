# FurniForge Pro — GitHub + Vercel Deploy Qo'llanmasi

## 1-QADAM: Git o'rnatish (Windows)

1. [https://git-scm.com/download/win](https://git-scm.com/download/win) oching
2. `64-bit Git for Windows Setup` yuklab oling va o'rnating
3. O'rnatish davomida "Git from the command line and also from 3rd-party software" ni tanlang
4. IDEni qayta oching

Tekshirish:
```bash
git --version
```

## 2-QADAM: GitHub repo yaratish

1. [https://github.com](https://github.com) ga kiring (akkaunt yo'q bo'lsa ro'yxatdan o'ting)
2. Yashil **New** tugmasini bosing
3. Repository name: `furniforge-pro`
4. **Public** yoki **Private** tanlang
5. **Create repository** tugmasini bosing

## 3-QADAM: Kodni GitHub'ga yuklash

Terminal (PowerShell) oching va quyidagi buyruqlarni ketma-ket bajaring:

```bash
# 1. Loyiha papkasiga o'ting
cd "C:\Users\qasor\Desktop\mebil uz"

# 2. Git repo yaratish
git init

# 3. Barcha fayllarini qo'shish
git add .

# 4. Birinchi commit
git commit -m "FurniForge Pro - first commit"

# 5. GitHub bilan bog'lash
# Eslatma: quyidagi URL o'rniga o'zingizning GitHub repo URL'ingizni yozing
git remote add origin https://github.com/SIZNING_USERNAME/furniforge-pro.git

# 6. GitHub'ga yuborish
git branch -M main
git push -u origin main
```

## 4-QADAM: SQLite o'rniga PostgreSQL (Production uchun)

**MUHIM:** Netlify/Vercel kabi serverless platformalarda SQLite ishlamaydi (yozish imkoniyati yo'q). PostgreSQL'ga o'tish kerak.

### 4.1 Neon.tech'da bepul PostgreSQL yaratish

1. [https://neon.tech](https://neon.tech) ga kiring
2. Google/ GitHub akkaunt bilan ro'yxatdan o'ting
3. **New Project** → **Create database**
4. Database yaratilgach, **Connection string** ni nusxa oling:
   ```
   postgresql://user:password@ep-xxx.neon.tech/furniforge?sslmode=require
   ```

### 4.2 Prisma schema'ni yangilash

`prisma/schema.prisma` faylini oching va quyidagi qismni o'zgartiring:

```prisma
datasource db {
  provider = "postgresql"  // sqlite o'rniga
  url      = env("DATABASE_URL")
}
```

### 4.3 Migration yaratish

```bash
npx prisma migrate dev --name init
```

## 5-QADAM: Vercel'ga deploy

**Tavsiya:** Next.js uchun Vercel eng yaxshi platforma (Next.js'ni yaratuvchisi).

1. [https://vercel.com](https://vercel.com) ga kiring
2. **Add New Project** → **GitHub** bilan ulashing
3. `furniforge-pro` repo'ni tanlang
4. **Framework Preset:** Next.js (avtomatik tanlanadi)
5. **Environment Variables** qo'shing:
   - `DATABASE_URL` → Neon connection string
   - `AUTH_SECRET` → tasodifiy uzun matn (masalan: `furniforge-secret-2026-random`)
   - `TELEGRAM_BOT_TOKEN` → bot token (bo'sh qoldirish mumkin)
   - `TELEGRAM_ADMIN_CHAT_ID` → chat ID (bo'sh qoldirish mumkin)
6. **Deploy** tugmasini bosing

Deploy 2-3 daqiqa davom etadi. URL vercel'da ko'rsatiladi (masalan: `https://furniforge-pro.vercel.app`).

## 6-QADAM: Admin foydalanuvchi yaratish (Production)

Vercel'da admin yaratish uchun **Vercel Console** → **Functions** → **Playground** dan foydalaning, yoki lokalda:

```bash
# .env'ga Neon DATABASE_URL'ini qo'yib, local'da ishga tushiring
npx prisma db push
npx tsx scripts/create-admin.ts
```

## Netlify'ga deploy (ixtiyoriy)

Agar Vercel o'rniga Netlify shart bo'lsa:

1. [https://netlify.com](https://netlify.com) ga kiring
2. **Add new site** → **Import an existing project** → GitHub'dan tanlang
3. Build command: `npm run build`
4. Publish directory: `dist` yoki bo'sh qoldiring (Next.js avtomatik)
5. Environment Variables'da yuqoridagi o'zgaruvchilarni qo'shing
6. `netlify.toml` faylini loyihaga qo'shing (quyida)

### netlify.toml

```toml
[build]
  command = "npm run build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "20"
  NPM_VERSION = "10"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

**Diqqat:** Netlify'da Prisma binary muammolari bo'lishi mumkin. Vercel Next.js uchun tavsiya etiladi.

## Tekshirish ro'yxati

- [ ] Git o'rnatilgan
- [ ] GitHub repo yaratilgan
- [ ] Kod push qilingan
- [ ] Neon PostgreSQL yaratilgan
- [ ] `DATABASE_URL` environment variable to'g'ri
- [ ] `AUTH_SECRET` kuchli parol (kamida 32 ta belgi)
- [ ] Deploy muvaffaqiyatli
- [ ] Admin foydalanuvchi yaratilgan
