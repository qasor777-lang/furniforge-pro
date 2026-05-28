// Procedural texture generators (no external assets).
// Cached per color so we don't re-create them on every render.

import * as THREE from "three";

const cache = new Map<string, THREE.Texture>();

/**
 * Generates a subtle wood-grain texture tinted with the given hex color.
 * Uses HTML canvas — fast, no network, no licensing.
 */
export function woodTexture(hex: string, opts: { repeat?: [number, number] } = {}): THREE.Texture {
  const key = `wood-${hex}-${opts.repeat?.[0] ?? 1}-${opts.repeat?.[1] ?? 1}`;
  if (cache.has(key)) return cache.get(key)!;

  const size = 512;
  const c = typeof document !== "undefined" ? document.createElement("canvas") : null;
  if (!c) {
    // SSR fallback: blank texture
    const t = new THREE.Texture();
    return t;
  }
  c.width = size; c.height = size;
  const ctx = c.getContext("2d")!;
  // base color
  ctx.fillStyle = hex;
  ctx.fillRect(0, 0, size, size);

  // Random grain lines
  const rng = mulberry32(hashStr(hex));
  ctx.globalAlpha = 0.07;
  for (let i = 0; i < 80; i++) {
    const y = rng() * size;
    const ampl = 4 + rng() * 14;
    const freq = 0.005 + rng() * 0.01;
    const dark = rng() > 0.5;
    ctx.strokeStyle = dark ? "#000" : "#fff";
    ctx.lineWidth = 0.6 + rng() * 1.6;
    ctx.beginPath();
    for (let x = 0; x <= size; x += 4) {
      const yy = y + Math.sin(x * freq + rng() * 6) * ampl;
      if (x === 0) ctx.moveTo(x, yy); else ctx.lineTo(x, yy);
    }
    ctx.stroke();
  }
  // Subtle noise
  ctx.globalAlpha = 0.04;
  for (let i = 0; i < 1500; i++) {
    ctx.fillStyle = rng() > 0.5 ? "#000" : "#fff";
    ctx.fillRect(rng() * size, rng() * size, 1, 1);
  }
  ctx.globalAlpha = 1;

  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  if (opts.repeat) tex.repeat.set(opts.repeat[0], opts.repeat[1]);
  tex.anisotropy = 8;
  cache.set(key, tex);
  return tex;
}

function hashStr(s: string): number {
  let h = 1779033703 ^ s.length;
  for (let i = 0; i < s.length; i++) {
    h = Math.imul(h ^ s.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return h >>> 0;
}

function mulberry32(a: number) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Brushed-metal look for handles. */
export function brushedMetalTexture(hex: string = "#9aa0a6"): THREE.Texture {
  const key = `metal-${hex}`;
  if (cache.has(key)) return cache.get(key)!;
  const size = 256;
  const c = typeof document !== "undefined" ? document.createElement("canvas") : null;
  if (!c) return new THREE.Texture();
  c.width = size; c.height = size;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = hex;
  ctx.fillRect(0, 0, size, size);
  ctx.globalAlpha = 0.06;
  for (let i = 0; i < 500; i++) {
    ctx.strokeStyle = i % 2 ? "#fff" : "#000";
    ctx.lineWidth = 0.3 + Math.random() * 0.6;
    ctx.beginPath();
    const y = Math.random() * size;
    ctx.moveTo(0, y); ctx.lineTo(size, y);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  cache.set(key, tex);
  return tex;
}
