import { NextRequest } from "next/server";
import { computeQuote } from "@/lib/pricing";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const items = body.items || [];
  const profile = body.profile || "STANDARD";
  const customerName = body.customerName || "Mijoz";
  const projectName = body.projectName || "Mebel taklifi";

  const q = await computeQuote(items, profile);
  const fm = (n: number) => new Intl.NumberFormat("uz-UZ").format(n) + " so'm";
  const today = new Date().toLocaleDateString("uz-UZ");
  const validUntil = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString("uz-UZ");

  const html = `<!doctype html><html lang="uz"><head><meta charset="utf-8">
<title>${projectName} — Tijoriy taklif</title>
<style>
  @page { size: A4; margin: 18mm; }
  * { box-sizing: border-box; }
  body { font-family: -apple-system, Segoe UI, Roboto, sans-serif; color: #1a1a1a; font-size: 11px; line-height: 1.5; }
  h1 { color: #7c5cff; margin: 0; font-size: 26px; letter-spacing: -0.5px; }
  h2 { font-size: 14px; color: #444; margin: 22px 0 8px; padding-bottom: 4px; border-bottom: 2px solid #7c5cff; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
  .logo-row { display: flex; align-items: center; gap: 10px; }
  .logo { width: 40px; height: 40px; border-radius: 8px; background: linear-gradient(135deg, #7c5cff, #22d3ee); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 18px; }
  .meta { text-align: right; color: #555; font-size: 10px; line-height: 1.7; }
  .meta b { color: #1a1a1a; }
  .customer-block { background: #f8f7ff; border-left: 4px solid #7c5cff; padding: 12px 14px; border-radius: 4px; margin-bottom: 18px; }
  table { width: 100%; border-collapse: collapse; margin: 8px 0; }
  th { background: #f5f3ff; text-align: left; padding: 8px 6px; font-size: 9px; text-transform: uppercase; color: #555; font-weight: 600; }
  td { border-bottom: 1px solid #ececec; padding: 7px 6px; }
  tr:nth-child(even) td { background: #fbfbfb; }
  .right { text-align: right; }
  .totals { width: 320px; margin-left: auto; margin-top: 14px; }
  .totals tr td { padding: 5px 8px; border: 0; font-size: 11px; }
  .totals .grand { font-size: 16px; font-weight: 700; color: #7c5cff; border-top: 2px solid #7c5cff !important; padding-top: 10px !important; }
  .terms { margin-top: 24px; font-size: 10px; color: #666; line-height: 1.7; }
  .signature { display: flex; justify-content: space-between; margin-top: 36px; }
  .sig-block { width: 45%; border-top: 1px solid #999; padding-top: 6px; font-size: 10px; color: #666; }
  .print-btn { position: fixed; top: 14px; right: 14px; padding: 10px 18px; background: #7c5cff; color: white; border: 0; border-radius: 8px; cursor: pointer; font-size: 12px; font-weight: 600; box-shadow: 0 4px 12px rgba(124,92,255,0.3); }
  @media print { .print-btn { display: none; } body { font-size: 10.5px; } }
</style></head><body>
<button class="print-btn" onclick="window.print()">📄 PDF saqlash</button>

<div class="header">
  <div class="logo-row">
    <div class="logo">F</div>
    <div>
      <h1>FurniForge<span style="color:#22d3ee">.Pro</span></h1>
      <div style="color:#666; font-size:10px;">AI-Powered Furniture Manufacturing</div>
    </div>
  </div>
  <div class="meta">
    <b>Tijoriy taklif №:</b> Q-${Date.now().toString(36).toUpperCase()}<br/>
    <b>Sana:</b> ${today}<br/>
    <b>Amal qilish muddati:</b> ${validUntil}<br/>
    <b>Profil:</b> ${profile}
  </div>
</div>

<div class="customer-block">
  <div style="font-size:9px; color:#888; text-transform:uppercase; letter-spacing:0.5px;">Mijoz</div>
  <div style="font-size:14px; font-weight:600; margin-top:2px;">${customerName}</div>
  <div style="font-size:11px; color:#555; margin-top:2px;">Loyiha: <b>${projectName}</b></div>
</div>

<h2>Mebel ro'yxati</h2>
<table>
  <thead><tr>
    <th>#</th><th>Mebel</th><th>SKU</th><th class="right">Soni</th><th class="right">Narxi</th>
  </tr></thead>
  <tbody>
    ${q.modelLines.map((m, i) => `<tr>
      <td>${i + 1}</td>
      <td>${m.name}</td>
      <td style="font-family:monospace; color:#666;">${m.sku}</td>
      <td class="right">${m.qty}</td>
      <td class="right">${fm(m.subtotal)}</td>
    </tr>`).join("")}
  </tbody>
</table>

<h2>Aksessuarlar</h2>
<table>
  <thead><tr>
    <th>Kod</th><th>Tavsif</th><th class="right">Soni</th><th class="right">Birlik narxi</th><th class="right">Jami</th>
  </tr></thead>
  <tbody>
    ${q.hardwareSummary.map((h) => `<tr>
      <td style="font-family:monospace; color:#666; font-size:10px;">${h.code}</td>
      <td>${h.description}</td>
      <td class="right">${h.qty}</td>
      <td class="right">${fm(h.unitPriceUzs)}</td>
      <td class="right">${fm(h.totalUzs)}</td>
    </tr>`).join("")}
  </tbody>
</table>

<h2>Smeta</h2>
<table class="totals">
  <tr><td>Material (LDSP/MDF):</td><td class="right">${fm(q.totals.material)}</td></tr>
  <tr><td>Edging (chetlanish):</td><td class="right">${fm(q.totals.edging)}</td></tr>
  <tr><td>Aksessuarlar:</td><td class="right">${fm(q.totals.hardware)}</td></tr>
  <tr><td>Ish haqi (CNC + montaj):</td><td class="right">${fm(q.totals.labor)}</td></tr>
  <tr><td>Yetkazib berish:</td><td class="right">${fm(q.totals.delivery)}</td></tr>
  <tr><td>O'rnatish:</td><td class="right">${fm(q.totals.install)}</td></tr>
  <tr><td style="color:#888; padding-top:8px !important; border-top:1px solid #eee !important;">Tannarx:</td><td class="right" style="color:#888; padding-top:8px !important; border-top:1px solid #eee !important;">${fm(q.totals.cost)}</td></tr>
  <tr><td>Foyda:</td><td class="right">${fm(q.totals.margin)}</td></tr>
  <tr><td>QQS (12%):</td><td class="right">${fm(q.totals.vat)}</td></tr>
  <tr><td class="grand">JAMI:</td><td class="right grand">${fm(q.totals.grandTotal)}</td></tr>
</table>

<div class="terms">
  <h2 style="font-size:12px; margin-top:18px;">Shartlar</h2>
  <ul style="margin:0; padding-left:18px;">
    <li>Taklif <b>${validUntil}</b> gacha amal qiladi</li>
    <li>30% oldindan to'lov, qolgan summa mebel topshirilgandan keyin 7 ish kuni ichida</li>
    <li>Tayyorlash muddati: <b>${q.metrics.totalParts > 100 ? "21" : "14"} ish kuni</b></li>
    <li>Material: ${q.metrics.totalSheets} list · ${(q.metrics.avgUtilization * 100).toFixed(0)}% foydalanish · ${q.metrics.edgeMeters.toFixed(1)} m edge tape</li>
    <li>Kafolat: korpusga 24 oy, aksessuarlarga ishlab chiqaruvchi kafolati</li>
  </ul>
</div>

<div class="signature">
  <div class="sig-block">Buyurtmachi (imzo)</div>
  <div class="sig-block">Bajaruvchi (imzo, muhr)</div>
</div>

<div style="text-align:center; margin-top:28px; font-size:9px; color:#aaa;">
  FurniForge Pro · ${new Date().getFullYear()} · AI-Powered Furniture Manufacturing Platform
</div>
</body></html>`;

  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}
