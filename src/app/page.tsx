import Link from "next/link";
import { Camera, Cpu, Boxes, Scissors, ArrowRight, Zap, Globe, Brain } from "lucide-react";

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      {/* Hero */}
      <section className="text-center max-w-4xl mx-auto mb-20 animate-slide-up">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/30 text-xs text-accent mb-6">
          <Zap className="w-3 h-3" /> Bazis-Mebelshikdan 10x kuchli · AI-First · Cloud-Native
        </div>
        <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6">
          Xona rasmingizdan{" "}
          <span className="gradient-text">to'liq mebel loyihasi</span>
          <br />— bir necha soniyada
        </h1>
        <p className="text-lg text-muted max-w-2xl mx-auto mb-8">
          Xona suratini yuklang. AI uni tahlil qiladi, o'lchamlarni baholaydi, uslubni aniqlaydi va sizga eng mos parametric mebellarni 3D ko'rinishda taklif qiladi. Buyurtma — to'liq cutting list, edging va CNC dasturlari bilan birga.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link href="/analyze" className="btn-primary text-base px-6 py-3">
            <Camera className="w-4 h-4" /> Xona rasmini yuklash <ArrowRight className="w-4 h-4" />
          </Link>
          <Link href="/catalog" className="btn-ghost text-base px-6 py-3">Katalogga o'tish</Link>
        </div>
      </section>

      {/* Features */}
      <section className="grid md:grid-cols-3 gap-4 mb-20">
        <FeatureCard icon={<Brain className="w-5 h-5" />} title="AI Xona Tahlili" desc="GPT-4o Vision orqali xona turi, o'lchami, uslubi, rang palitrasi va yoritilishi avtomatik aniqlanadi." color="from-accent to-purple-500" />
        <FeatureCard icon={<Boxes className="w-5 h-5" />} title="Parametric 3D Studio" desc="Three.js + WebGL asosida real-time 3D dizayner. Bir parametr o'zgartiring — mebel darhol yangilanadi." color="from-accent2 to-blue-500" />
        <FeatureCard icon={<Scissors className="w-5 h-5" />} title="Production-Ready" desc="Hybrid nesting algoritmi (Greedy + GA + CP-SAT), edging schedule (0.4/2mm), CNC drilling templates." color="from-pink-500 to-rose-500" />
        <FeatureCard icon={<Globe className="w-5 h-5" />} title="Internet Design Ingestion" desc="Pinterest, Houzz, Behance dan dizaynlar avtomatik import qilinadi va parametric formatga aylantiriladi." color="from-emerald-500 to-teal-500" />
        <FeatureCard icon={<Cpu className="w-5 h-5" />} title="150+ Mebel Turi" desc="Oshxona, garderob, karavot, stol, javon, divan — barchasi parametric, har bir o'lcham sozlanadi." color="from-orange-500 to-amber-500" />
        <FeatureCard icon={<Zap className="w-5 h-5" />} title="Cloud-Native" desc="PostgreSQL + Kafka + Kubernetes asosli microservices arxitekturasi. 99.95% availability." color="from-violet-500 to-fuchsia-500" />
      </section>

      {/* How it works */}
      <section className="mb-20">
        <h2 className="text-3xl font-bold mb-2 text-center">Qanday ishlaydi</h2>
        <p className="text-muted text-center mb-12">4 qadamda — rasmdan ishlab chiqarishgacha</p>
        <div className="grid md:grid-cols-4 gap-4">
          {[
            { n: "01", t: "Rasm yuklash", d: "Xona suratini drag & drop qiling" },
            { n: "02", t: "AI tahlil", d: "5 soniyada xona to'liq tushuniladi" },
            { n: "03", t: "Mos mebel", d: "Top-8 mebel + adapted parametrlar" },
            { n: "04", t: "Production", d: "Cutting list + CNC + smeta" },
          ].map((s) => (
            <div key={s.n} className="card p-5">
              <div className="text-3xl font-bold gradient-text mb-2">{s.n}</div>
              <div className="font-semibold mb-1">{s.t}</div>
              <div className="text-sm text-muted">{s.d}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Comparison */}
      <section className="card p-8">
        <h2 className="text-2xl font-bold mb-6">FurniForge Pro vs Bazis-Mebelshik</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-border">
                <th className="py-3">Imkoniyat</th>
                <th className="py-3 text-muted">Bazis-Mebelshik</th>
                <th className="py-3 text-accent">FurniForge Pro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <Row a="Platforma" b="Windows desktop, dongle" c="Cloud + browser + mobile" />
              <Row a="Xona rasmidan loyihalash" b="Yo'q" c="GPT-4o Vision + auto-recommend" />
              <Row a="Katalog kengayishi" b="Qo'lda modeller" c="Internet ingestion + AI generative" />
              <Row a="Nesting algoritmi" b="Single-pass guillotine" c="Greedy + GA + CP-SAT portfolio" />
              <Row a="3D rendering" b="OpenGL 2.x" c="WebGPU + path-tracer" />
              <Row a="Real-time hamkorlik" b="Yo'q (file-based)" c="CRDT (Yjs) ko'p foydalanuvchi" />
              <Row a="API / kengaytirish" b="Yopiq" c="gRPC SDK + plugin marketplace" />
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, desc, color }: { icon: React.ReactNode; title: string; desc: string; color: string }) {
  return (
    <div className="card p-6 hover:border-accent/40 transition-colors">
      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center text-white mb-4`}>{icon}</div>
      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted leading-relaxed">{desc}</p>
    </div>
  );
}

function Row({ a, b, c }: { a: string; b: string; c: string }) {
  return (
    <tr>
      <td className="py-3 font-medium">{a}</td>
      <td className="py-3 text-muted">{b}</td>
      <td className="py-3 text-accent">{c}</td>
    </tr>
  );
}
