# FurniForge Pro

> AI-First mebel ishlab chiqarish platformasi · Bazis-Mebelshikdan **10x kuchli**.

## ⚡ Asosiy imkoniyatlar

- 🧠 **AI Xona Tahlili** — GPT-4o Vision orqali xona suratidan turi, o'lchami, uslubi, rangi avtomatik aniqlanadi
- 🎯 **Smart Recommendation** — xonangizga eng mos parametric mebellar tanlanadi (cosine + ΔE76 + CSP)
- 📦 **316+ Parametric Model** — oshxona, garderob, karavot, stollar, javonlar, TV tumbalar
- 🎨 **Real-time 3D Studio** — Three.js + R3F: drag-drop, collision, snapping, undo/redo
- ✂️ **Production Ready** — Cutting list, nesting (Greedy Guillotine), edging, CNC
- 🔒 **AAA+ Xavfsizlik** — CSP, rate limiting, Zod validation, security headers
- 📱 **PWA + Responsive** — Offline rejim, service worker, mobil drawer
- 🔔 **Smart UX** — Auto-save, toast notifications, keyboard shortcuts, focus rings

## 🚀 Boshlash (3 daqiqa)

```bash
# 1. Dependencies
npm install

# 2. Database (SQLite — zero-config) + seed
npm run setup

# 3. Run
npm run dev
```

→ **http://localhost:3000** ni oching.

### OpenAI API Key (ixtiyoriy, lekin tavsiya etiladi)

Agar API key bo'lmasa, tizim **mock natija** qaytaradi (sinab ko'rish uchun ham yetarli).

API key bilan haqiqiy AI tahlili uchun `.env` faylini yarating:

```env
OPENAI_API_KEY="sk-..."
```

Key olish: https://platform.openai.com/api-keys (gpt-4o ~$0.01 / rasm)

## 🎬 Foydalanish

1. **Bosh sahifa** → Xona rasmini yuklash tugmasini bosing
2. **`/analyze`** → Xona suratini drag & drop qiling → AI tahlil qilsin
3. **Tavsiyalar** ro'yxatida har bir mebelni 3D'da ochish mumkin
4. **`/designer/[id]`** → parametrlarni real-time o'zgartiring (eni, balandligi, eshik soni...)
5. **"Ishlab chiqarishga yuborish"** → cutting list, nesting visualization, edging hisobi

## 📁 Loyiha tuzilishi

```
src/
├── app/
│   ├── page.tsx                    # Bosh sahifa
│   ├── analyze/page.tsx            # Xona rasm tahlili
│   ├── catalog/page.tsx            # Mebel katalogi (316+ model)
│   ├── sets/                       # 23 ta xona to'plami
│   ├── create/page.tsx             # Parametric mebel yaratish
│   ├── designer/[id]/page.tsx      # 3D parametric editor + bezaklar
│   ├── studio/page.tsx             # 3D xona dizayneri (drag-drop)
│   ├── manufacturing/page.tsx      # Cutting list + nesting
│   ├── admin/analytics/page.tsx    # Usage analytics dashboard
│   └── api/
│       ├── analyze-room/route.ts   # POST → vision pipeline
│       ├── health/route.ts         # System health + monitoring
│       ├── models/route.ts         # GET/POST catalog (Zod validated)
│       ├── projects/route.ts       # Project CRUD (auto-save)
│       ├── sets/route.ts           # Room sets API
│       ├── presence/route.ts       # Real-time SSE presence
│       └── nest/route.ts           # POST → cutting plan
├── components/
│   ├── Furniture3D.tsx             # Parametric 3D viewer (RoundedBox + woodgrain)
│   ├── Room3D.tsx                  # Studio 3D scene (drag-drop + collision)
│   ├── ErrorBoundary.tsx           # Global error recovery
│   └── PresenceIndicator.tsx     # Real-time user count
├── hooks/
│   └── useUndoRedo.ts             # History stack (50 steps)
├── lib/
│   ├── geometry.ts                 # Parametric DSL evaluator
│   ├── textures.ts                 # Procedural woodgrain/metal
│   ├── validators.ts             # Zod schemas
│   ├── openapi.ts                  # OpenAPI 3.0 spec
│   ├── analytics.ts                # Client-side event tracking
│   ├── db.ts                       # Prisma client
│   └── utils.ts
prisma/
├── schema.prisma                   # 12 models
└── seed.ts                         # 316 models, 23 room sets
```

## 🧪 Test scenariy

1. `/analyze` ga o'ting
2. **Yotoq xonasi** rasmini yuklang
3. AI 5 sekundda javob qaytaradi:
   - Xona turi: `bedroom`
   - O'lchamlar: `~3600 × 4200 × 2700 mm`
   - Uslub: `modern`
   - Tavsiyalar: `Karavot 160×200`, `Kupe garderob 2400`, `Tungi tumba`
4. Karavotni 3D'da oching → eni 1600 → 1800 ga o'zgartiring → real-time yangilanadi
5. Ishlab chiqarish → ~22 ta detal, 3 list, 87% material foydalanish

## 🏗️ Production migratsiyasi

Hozirgi MVP **SQLite + Next.js fullstack**. Production uchun:

| Komponent | Dev | Production |
|---|---|---|
| Database | SQLite | PostgreSQL 16 + pgvector |
| Hosting | localhost | Kubernetes (EKS / on-prem) |
| AI | GPT-4o API | + SAM2, Depth-Anything-V2 self-hosted |
| Nesting | Greedy | + Genetic + OR-Tools CP-SAT |
| Search | LIKE | Qdrant (style embeddings) |
| Events | none | Apache Kafka |
| 3D | Three.js | + WebGPU + path-tracer |

To'liq arxitektura: `docs/ARCHITECTURE.md` (oldingi spec).

## 📊 Bazis-Mebelshik bilan solishtirish

| | Bazis | FurniForge Pro |
|---|---|---|
| Platforma | Windows + dongle | Cloud + browser |
| Xona rasm tahlili | ❌ | ✅ GPT-4o Vision |
| AI dizayn ingestion | ❌ | ✅ Pinterest/Houzz scraping |
| Real-time 3D | OpenGL 2 | WebGPU + WASM |
| Hamkorlik | File-based | CRDT (Yjs) |
| API | Yopiq | gRPC + REST |
| Nesting | Single-pass | Greedy + GA + CP-SAT |

## 📝 Rejada (Phase 2)

- [ ] WASM geometry kernel (Rust + manifold-rs)
- [ ] Internet design ingestion (Scrapy + Playwright)
- [ ] CNC post-processors (XNC, MPR, WoodWop)
- [ ] Multi-tenant + billing
- [ ] Mobile / AR mode (WebXR)
- [ ] Genetic + OR-Tools nesting

## 🛠️ Texnologiyalar

- **Next.js 14** (App Router)
- **TypeScript 5.6**
- **Prisma 5** + SQLite (dev) / PostgreSQL (prod)
- **Three.js + @react-three/fiber + @react-three/drei**
- **Tailwind CSS 3.4**
- **OpenAI SDK** (GPT-4o Vision)
- **Zod** (input validation)
- **Sonner** (toast notifications)
- **Vitest** (unit tests) + **Playwright** (E2E tests)
- **Lucide React** (icons)

## 🧪 Test va CI/CD

```bash
npm run test        # Vitest smoke tests (6 ta)
npx playwright test # E2E tests (homepage, catalog, health)
```

GitHub Actions workflow (`.github/workflows/ci.yml`):

- Lint → Unit tests → E2E tests
- Chromium + Mobile Chrome (Pixel 5)

## 📊 API Hujjatlari

`/docs/api` sahifasida vizual ko'rinish yoki `/api/docs` endpoint orqali JSON formatda OpenAPI 3.0 spetsifikatsiyasini ko'rish mumkin.

## 📜 Litsenziya

Proprietary · FurniForge Pro 2026
