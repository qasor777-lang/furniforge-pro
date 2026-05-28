// Build the mesh box list from a parametric model — used by both 3D viewer and exporters.
import { resolveParts, type ParamValues } from "./geometry";

export interface MeshBox {
  size: [number, number, number]; // meters
  position: [number, number, number];
  role: "carcass" | "door" | "front";
  color: string;
}

export function buildFurnitureMesh(
  geometryDsl: any,
  params: ParamValues,
  bodyColor = "#F2EFEA",
  frontColor = "#D9C9B6"
): MeshBox[] {
  const kind = geometryDsl?.type || "carcass_box";
  let meshes: MeshBox[] = [];

  const W = (params.W || 600) / 1000;
  const H = (params.H || 720) / 1000;
  const D = (params.D || 560) / 1000;
  const T = (params.T || 18) / 1000;

  if (kind === "bed_platform") {
    const Wb = (params.W || 1600) / 1000;
    const L = (params.L || 2000) / 1000;
    const Hb = (params.H || 380) / 1000;
    const headH = (params.headH || 900) / 1000;
    const Tb = (params.T || 18) / 1000;
    return [
      { size: [Tb, Hb, L], position: [-Wb / 2 + Tb / 2, Hb / 2, 0], role: "carcass", color: bodyColor },
      { size: [Tb, Hb, L], position: [Wb / 2 - Tb / 2, Hb / 2, 0], role: "carcass", color: bodyColor },
      { size: [Wb, Hb, Tb], position: [0, Hb / 2, L / 2 - Tb / 2], role: "carcass", color: bodyColor },
      { size: [Wb, headH, Tb], position: [0, headH / 2, -L / 2 + Tb / 2], role: "front", color: frontColor },
      { size: [Wb - 0.04, 0.18, L - 0.04], position: [0, Hb + 0.09, 0], role: "front", color: frontColor },
    ];
  }

  if (kind === "table") {
    const Wt = (params.W || 1600) / 1000;
    const Dt = (params.D || 900) / 1000;
    const Ht = (params.H || 740) / 1000;
    const Tt = (params.T || 25) / 1000;
    const legW = 0.06;
    const inset = 0.1;
    const arr: MeshBox[] = [{ size: [Wt, Tt, Dt], position: [0, Ht - Tt / 2, 0], role: "front", color: frontColor }];
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
      arr.push({ size: [legW, Ht - Tt, legW], position: [sx * (Wt / 2 - inset), (Ht - Tt) / 2, sz * (Dt / 2 - inset)], role: "carcass", color: bodyColor });
    }
    return arr;
  }

  // Carcass / shelf
  const back = 0.003;
  meshes.push({ size: [T, H, D], position: [-W / 2 + T / 2, H / 2, 0], role: "carcass", color: bodyColor });
  meshes.push({ size: [T, H, D], position: [W / 2 - T / 2, H / 2, 0], role: "carcass", color: bodyColor });
  meshes.push({ size: [W - 2 * T, T, D], position: [0, T / 2, 0], role: "carcass", color: bodyColor });
  if (kind === "open_shelf" || H > 1.2) {
    meshes.push({ size: [W - 2 * T, T, D], position: [0, H - T / 2, 0], role: "carcass", color: bodyColor });
  } else {
    meshes.push({ size: [W - 2 * T, T, 0.1], position: [0, H - T / 2, -D / 2 + 0.05], role: "carcass", color: bodyColor });
  }
  meshes.push({ size: [W - 0.004, H - 0.004, back], position: [0, H / 2, -D / 2 + back / 2], role: "carcass", color: bodyColor });

  const shelves = Math.max(0, Math.round(params.shelves || 0));
  for (let i = 1; i <= shelves; i++) {
    const y = (H / (shelves + 1)) * i;
    meshes.push({ size: [W - 2 * T, T, D - 0.03], position: [0, y, 0], role: "carcass", color: bodyColor });
  }
  const doors = Math.max(0, Math.round(params.doors || 0));
  if (doors > 0) {
    const dw = (W - 0.008) / doors;
    const dh = H - 0.008;
    for (let i = 0; i < doors; i++) {
      const x = -W / 2 + 0.004 + dw / 2 + i * dw;
      meshes.push({ size: [dw - 0.004, dh, T], position: [x, H / 2, D / 2 + T / 2], role: "door", color: frontColor });
    }
  }
  return meshes;
}
