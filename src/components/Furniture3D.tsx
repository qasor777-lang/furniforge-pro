"use client";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Grid, Environment, ContactShadows, RoundedBox, SoftShadows } from "@react-three/drei";
import { Suspense, useMemo, useRef, useImperativeHandle, forwardRef } from "react";
import * as THREE from "three";
import { resolveParts } from "@/lib/geometry";
import { woodTexture } from "@/lib/textures";

type Mesh3D = {
  size: [number, number, number];
  position: [number, number, number];
  role: "carcass" | "door" | "front" | "handle" | "leg" | "cushion" | "mattress" | "glass";
  rotation?: [number, number, number];
  shape?: "box" | "cylinder";
};

export type Decor3D = {
  handle?: "none" | "bar" | "knob" | "long_bar" | "recessed";
  handleColor?: string;
  leg?: "none" | "block" | "tapered" | "hairpin" | "metal_round";
  legColor?: string;
  legHeight?: number; // mm
  countertop?: boolean;
  countertopColor?: string;
};

interface Props {
  geometryDsl: any;
  params: Record<string, number>;
  bodyColor?: string;
  frontColor?: string;
  decor?: Decor3D;
}

export interface Furniture3DHandle {
  exportImage: (scale?: number) => string | null;
}

const Furniture3D = forwardRef<Furniture3DHandle, Props>(function Furniture3D(
  { geometryDsl, params, bodyColor = "#F2EFEA", frontColor = "#D9C9B6", decor },
  ref,
) {
  const meshes = useMemo(() => {
    try {
      const parts = resolveParts(geometryDsl, params);
      return buildMeshes(parts, params, geometryDsl?.type || "carcass_box", decor);
    } catch (e) {
      console.error("Geometry build failed:", e);
      return [];
    }
  }, [geometryDsl, params, decor]);

  // mm → meters for THREE
  const W = (params.W || 600) / 1000;
  const H = (params.H || 720) / 1000;
  const D = (params.D || 560) / 1000;
  const camDist = Math.max(W, H, D) * 2.2;

  const glRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const camRef = useRef<THREE.Camera | null>(null);

  useImperativeHandle(ref, () => ({
    exportImage: (scale = 2) => {
      const gl = glRef.current; const scene = sceneRef.current; const cam = camRef.current;
      if (!gl || !scene || !cam) return null;
      const oldRatio = gl.getPixelRatio();
      gl.setPixelRatio(Math.min(oldRatio * scale, 4));
      gl.render(scene, cam);
      const url = gl.domElement.toDataURL("image/png");
      gl.setPixelRatio(oldRatio);
      gl.render(scene, cam);
      return url;
    },
  }));

  return (
    <Canvas
      shadows dpr={[1, 2]}
      camera={{ position: [camDist, camDist * 0.8, camDist], fov: 38 }}
      gl={{ preserveDrawingBuffer: true, antialias: true }}
      className="rounded-lg"
      onCreated={({ gl, scene, camera }) => {
        glRef.current = gl; sceneRef.current = scene; camRef.current = camera;
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.05;
      }}
    >
      <color attach="background" args={["#0a0a0b"]} />
      <SoftShadows size={28} samples={10} focus={0} />
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 8, 5]} intensity={1.4} castShadow shadow-mapSize={[2048, 2048]} shadow-bias={-0.0005} />
      <directionalLight position={[-5, 3, -5]} intensity={0.45} color="#bcd9ff" />
      <directionalLight position={[0, 4, -8]} intensity={0.35} color="#ffd9a8" />
      <Suspense fallback={null}>
        <Environment preset="apartment" />
      </Suspense>
      <Grid args={[20, 20]} cellSize={0.5} cellThickness={0.5} sectionSize={1} sectionThickness={1} sectionColor="#7c5cff" cellColor="#222" position={[0, -0.001, 0]} fadeDistance={15} infiniteGrid />
      <ContactShadows position={[0, 0, 0]} opacity={0.55} scale={Math.max(W, D) * 6} blur={2.4} far={4} />
      <group position={[0, 0, 0]}>
        {meshes.map((m, i) => {
          const color = m.role === "door" || m.role === "front" ? frontColor
            : m.role === "handle" ? (decor?.handleColor || "#9aa0a6")
            : m.role === "leg" ? (decor?.legColor || "#2c2c2c")
            : m.role === "cushion" ? frontColor
            : m.role === "mattress" ? "#ECE6DC"
            : m.role === "glass" ? "#bcd9e8"
            : (m.role as string) === "countertop" ? (decor?.countertopColor || "#2a2a2a")
            : bodyColor;
          const rough = m.role === "handle" ? 0.25 : m.role === "cushion" || m.role === "mattress" ? 0.85 : m.role === "glass" ? 0.05 : 0.55;
          const metal = m.role === "handle" ? 0.85 : m.role === "leg" ? 0.4 : 0.04;
          const opacity = m.role === "glass" ? 0.35 : 1;
          // Apply wood texture to wooden carcass/door/front parts (not metal/cushion/glass)
          const useWood = (m.role === "carcass" || m.role === "door" || m.role === "front") &&
            color !== "#1F1F1F" && color !== "#000000" && m.shape !== "cylinder";
          const tex = useWood ? woodTexture(color, { repeat: [Math.max(1, m.size[0] / 0.4), Math.max(1, m.size[1] / 0.4)] }) : null;
          if (m.shape === "cylinder") {
            return (
              <mesh key={i} position={m.position} rotation={m.rotation || [0, 0, 0]} castShadow receiveShadow>
                <cylinderGeometry args={[m.size[0] / 2, m.size[0] / 2, m.size[1], 16]} />
                <meshStandardMaterial color={color} roughness={rough} metalness={metal} transparent={opacity < 1} opacity={opacity} />
              </mesh>
            );
          }
          return (
            <RoundedBox
              key={i}
              args={m.size}
              position={m.position}
              rotation={m.rotation || [0, 0, 0]}
              radius={Math.min(0.008, Math.min(...m.size) / 4)}
              smoothness={2}
              castShadow
              receiveShadow
            >
              <meshStandardMaterial color={color} map={tex || undefined} roughness={rough} metalness={metal} transparent={opacity < 1} opacity={opacity} />
            </RoundedBox>
          );
        })}
      </group>
      <OrbitControls makeDefault enableDamping target={[0, H / 2, 0]} />
    </Canvas>
  );
});

export default Furniture3D;

// Layout parts inside the carcass envelope.
function buildMeshes(parts: ReturnType<typeof resolveParts>, params: Record<string, number>, kind: string, decor?: Decor3D): Mesh3D[] {
  if (kind === "bed_platform") return buildBed(params);
  if (kind === "table") return buildTable(params, decor);
  if (kind === "chair") return buildChair(params);
  if (kind === "sofa") return buildSofa(params);
  if (kind === "carcass_drawers") return buildDrawerCarcass(params, decor);
  return buildCarcass(params, kind, decor);
}

function addHandle(meshes: Mesh3D[], cx: number, cy: number, frontZ: number, w: number, vertical = false) {
  const len = Math.min(0.16, Math.max(0.08, w * 0.45));
  const rot: [number, number, number] = vertical ? [0, 0, Math.PI / 2] : [Math.PI / 2, 0, 0];
  meshes.push({ size: [0.012, len, 0.012], position: [cx, cy, frontZ + 0.02], role: "handle", shape: "cylinder", rotation: rot });
}

function buildCarcass(params: Record<string, number>, kind: string, decor?: Decor3D): Mesh3D[] {
  const meshes: Mesh3D[] = [];
  const W = (params.W || params.width || 600) / 1000;
  const H = (params.H || params.height || 720) / 1000;
  const D = (params.D || params.depth || 560) / 1000;
  const T = (params.T || 18) / 1000;
  const back = 0.003;
  const isOpen = kind === "open_shelf";
  // Determine plinth/feet height: explicit decor leg, or default for wardrobes
  const userLeg = decor?.leg && decor.leg !== "none";
  const defaultFoot = !userLeg && H >= 1.6 ? 0.08 : 0;
  const footH = userLeg ? (decor!.legHeight || 100) / 1000 : defaultFoot;
  const yBase = footH;

  // Sides
  meshes.push({ size: [T, H, D], position: [-W / 2 + T / 2, yBase + H / 2, 0], role: "carcass" });
  meshes.push({ size: [T, H, D], position: [W / 2 - T / 2, yBase + H / 2, 0], role: "carcass" });
  // Bottom
  meshes.push({ size: [W - 2 * T, T, D], position: [0, yBase + T / 2, 0], role: "carcass" });
  // TOP — always full top panel for visible cabinets
  meshes.push({ size: [W - 2 * T, T, D], position: [0, yBase + H - T / 2, 0], role: "carcass" });
  // Back
  if (!isOpen) {
    meshes.push({ size: [W - 0.004, H - 0.004, back], position: [0, yBase + H / 2, -D / 2 + back / 2], role: "carcass" });
  }

  // Shelves
  const shelves = Math.max(0, Math.round(params.shelves || 0));
  for (let i = 1; i <= shelves; i++) {
    const y = yBase + (H / (shelves + 1)) * i;
    meshes.push({ size: [W - 2 * T, T, D - 0.03], position: [0, y, 0], role: "carcass" });
  }

  // Doors
  const doors = Math.max(0, Math.round(params.doors || 0));
  if (doors > 0) {
    const dw = (W - 0.008) / doors;
    const dh = H - 0.008;
    for (let i = 0; i < doors; i++) {
      const x = -W / 2 + 0.004 + dw / 2 + i * dw;
      meshes.push({ size: [dw - 0.004, dh, T], position: [x, yBase + H / 2, D / 2 + T / 2], role: "door" });
      // Handle (vertical bar near opening edge)
      const hx = x + (i === 0 && doors > 1 ? dw / 2 - 0.04 : i === doors - 1 && doors > 1 ? -dw / 2 + 0.04 : dw / 2 - 0.04);
      addHandle(meshes, hx, yBase + H / 2, D / 2 + T, dh, true);
    }
  }

  // Feet / plinth
  if (footH > 0) {
    addLegsF(meshes, W, D, footH, decor?.leg || (defaultFoot > 0 ? "block" : "none"));
  }
  // Countertop
  if (decor?.countertop) {
    const ct = 0.04;
    const overhang = 0.025;
    meshes.push({ size: [W + 2 * overhang, ct, D + overhang], position: [0, yBase + H + ct / 2, overhang / 2], role: "countertop" as any });
  }

  return meshes;
}

function addLegsF(meshes: Mesh3D[], W: number, D: number, legH: number, style: string) {
  if (style === "none") return;
  if (style === "block") {
    meshes.push({ size: [W - 0.04, legH, 0.06], position: [0, legH / 2, -D / 2 + 0.06], role: "leg" });
    return;
  }
  const inset = 0.04;
  const positions: [number, number][] = [
    [-W / 2 + inset, -D / 2 + inset], [W / 2 - inset, -D / 2 + inset],
    [-W / 2 + inset, D / 2 - inset], [W / 2 - inset, D / 2 - inset],
  ];
  const w = style === "hairpin" ? 0.012 : style === "metal_round" ? 0.022 : 0.045;
  for (const [x, z] of positions) {
    meshes.push({ size: [w, legH, w], position: [x, legH / 2, z], role: "leg" });
  }
}

function buildDrawerCarcass(params: Record<string, number>, decor?: Decor3D): Mesh3D[] {
  const meshes: Mesh3D[] = [];
  const W = (params.W || 800) / 1000;
  const H = (params.H || 720) / 1000;
  const D = (params.D || 560) / 1000;
  const T = (params.T || 18) / 1000;
  const back = 0.003;
  const userLeg = decor?.leg && decor.leg !== "none";
  const footH = userLeg ? (decor!.legHeight || 100) / 1000 : 0;
  const yBase = footH;

  meshes.push({ size: [T, H, D], position: [-W / 2 + T / 2, yBase + H / 2, 0], role: "carcass" });
  meshes.push({ size: [T, H, D], position: [W / 2 - T / 2, yBase + H / 2, 0], role: "carcass" });
  meshes.push({ size: [W - 2 * T, T, D], position: [0, yBase + T / 2, 0], role: "carcass" });
  // Full top
  meshes.push({ size: [W - 2 * T, T, D], position: [0, yBase + H - T / 2, 0], role: "carcass" });
  meshes.push({ size: [W - 0.004, H - 0.004, back], position: [0, yBase + H / 2, -D / 2 + back / 2], role: "carcass" });

  const drawers = Math.max(1, Math.round(params.drawers || 3));
  const usableH = H - 0.008;
  const dh = usableH / drawers;
  for (let i = 0; i < drawers; i++) {
    const cy = yBase + 0.004 + dh / 2 + i * dh;
    meshes.push({ size: [W - 0.008, dh - 0.004, T], position: [0, cy, D / 2 + T / 2], role: "front" });
    addHandle(meshes, 0, cy, D / 2 + T, W * 0.5, false);
  }
  if (userLeg) addLegsF(meshes, W, D, footH, decor!.leg!);
  if (decor?.countertop) {
    const ct = 0.04, overhang = 0.025;
    meshes.push({ size: [W + 2 * overhang, ct, D + overhang], position: [0, yBase + H + ct / 2, overhang / 2], role: "countertop" as any });
  }
  return meshes;
}

function buildChair(params: Record<string, number>): Mesh3D[] {
  const W = (params.W || 420) / 1000;
  const D = (params.D || 420) / 1000;
  const H = (params.H || 450) / 1000;
  const backH = (params.backH || 450) / 1000;
  const T = 0.018;
  const meshes: Mesh3D[] = [];
  // Seat
  meshes.push({ size: [W, T, D], position: [0, H, 0], role: "front" });
  // Backrest
  meshes.push({ size: [W, backH, T], position: [0, H + backH / 2, -D / 2 + T / 2], role: "front" });
  // Legs
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    meshes.push({ size: [0.035, H, 0.035], position: [sx * (W / 2 - 0.025), H / 2, sz * (D / 2 - 0.025)], role: "leg" });
  }
  return meshes;
}

function buildSofa(params: Record<string, number>): Mesh3D[] {
  const W = (params.W || 2000) / 1000;
  const D = (params.D || 900) / 1000;
  const seatH = 0.42;
  const backH = (params.backH || 850) / 1000;
  const armH = (params.armH || 650) / 1000;
  const armW = 0.12;
  const meshes: Mesh3D[] = [];
  // Base
  meshes.push({ size: [W, 0.16, D], position: [0, 0.08, 0], role: "carcass" });
  // Arms
  meshes.push({ size: [armW, armH, D], position: [-W / 2 + armW / 2, armH / 2, 0], role: "cushion" });
  meshes.push({ size: [armW, armH, D], position: [W / 2 - armW / 2, armH / 2, 0], role: "cushion" });
  // Backrest
  meshes.push({ size: [W - armW * 2, backH, 0.18], position: [0, 0.16 + backH / 2, -D / 2 + 0.09], role: "cushion" });
  // Seat cushions
  const seats = Math.max(2, Math.round((W - armW * 2) / 0.6));
  const cushionW = (W - armW * 2 - 0.02 * (seats + 1)) / seats;
  for (let i = 0; i < seats; i++) {
    const cx = -W / 2 + armW + 0.02 + cushionW / 2 + i * (cushionW + 0.02);
    meshes.push({ size: [cushionW, 0.12, D - 0.22], position: [cx, seatH - 0.06, 0.04], role: "cushion" });
  }
  // Legs
  const lh = 0.08;
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    meshes.push({ size: [0.05, lh, 0.05], position: [sx * (W / 2 - 0.1), lh / 2 - 0.08, sz * (D / 2 - 0.1)], role: "leg" });
  }
  return meshes;
}

function buildBed(params: Record<string, number>): Mesh3D[] {
  const W = (params.W || 1600) / 1000;
  const L = (params.L || 2000) / 1000;
  const H = (params.H || 380) / 1000;
  const headH = (params.headH || 900) / 1000;
  const T = (params.T || 18) / 1000;
  const meshes: Mesh3D[] = [];
  meshes.push({ size: [T, H, L], position: [-W / 2 + T / 2, H / 2, 0], role: "carcass" });
  meshes.push({ size: [T, H, L], position: [W / 2 - T / 2, H / 2, 0], role: "carcass" });
  meshes.push({ size: [W, H, T], position: [0, H / 2, L / 2 - T / 2], role: "carcass" });
  meshes.push({ size: [W, headH, T], position: [0, headH / 2, -L / 2 + T / 2], role: "cushion" });
  meshes.push({ size: [W - 0.04, 0.20, L - 0.04], position: [0, H + 0.10, 0], role: "mattress" });
  // Pillows
  const pillowL = (W - 0.12) / 2;
  for (let i = 0; i < 2; i++) {
    const px = -W / 2 + 0.04 + pillowL / 2 + i * (pillowL + 0.04);
    meshes.push({ size: [pillowL, 0.08, 0.30], position: [px, H + 0.24, -L / 2 + 0.20], role: "mattress" });
  }
  return meshes;
}

function buildTable(params: Record<string, number>, decor?: Decor3D): Mesh3D[] {
  const W = (params.W || 1600) / 1000;
  const D = (params.D || 900) / 1000;
  const H = (params.H || 740) / 1000;
  const T = (params.T || 25) / 1000;
  const style = decor?.leg && decor.leg !== "none" ? decor.leg : "tapered";
  const legW = style === "hairpin" || style === "metal_round" ? 0.025 : 0.06;
  const meshes: Mesh3D[] = [];
  meshes.push({ size: [W, T, D], position: [0, H - T / 2, 0], role: "front" });
  // Apron only for non-metal legs
  if (style !== "hairpin" && style !== "metal_round") {
    meshes.push({ size: [W - 0.20, 0.08, 0.018], position: [0, H - T - 0.05, -D / 2 + 0.10], role: "carcass" });
    meshes.push({ size: [W - 0.20, 0.08, 0.018], position: [0, H - T - 0.05, D / 2 - 0.10], role: "carcass" });
  }
  const inset = 0.10;
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    meshes.push({ size: [legW, H - T, legW], position: [sx * (W / 2 - inset), (H - T) / 2, sz * (D / 2 - inset)], role: "leg" });
  }
  return meshes;
}
