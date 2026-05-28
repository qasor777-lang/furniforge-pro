import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { buildFurnitureMesh, type MeshBox } from "@/lib/furniture-mesh";
import { buildGltf, packGlb } from "@/lib/gltf";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const items = body.items as { modelId: number; params?: any; position?: [number, number, number]; rotationY?: number; bodyColor?: string; frontColor?: string }[];

  const allMeshes: MeshBox[] = [];

  for (const item of items || []) {
    const m = await db.furnitureModel.findUnique({ where: { id: item.modelId } });
    if (!m) continue;
    const dsl = JSON.parse(m.geometryDsl);
    const params = { ...JSON.parse(m.defaultParams), ...(item.params || {}) };
    const meshes = buildFurnitureMesh(dsl, params, item.bodyColor || "#F2EFEA", item.frontColor || "#D9C9B6");

    const pos = item.position || [0, 0, 0];
    const rot = item.rotationY || 0;
    const cos = Math.cos(rot);
    const sin = Math.sin(rot);

    for (const mb of meshes) {
      // Rotate around Y axis, then translate
      const x = mb.position[0] * cos + mb.position[2] * sin + pos[0];
      const z = -mb.position[0] * sin + mb.position[2] * cos + pos[2];
      const y = mb.position[1] + pos[1];
      // Note: not rotating box dimensions for axis-aligned cases (90° increments swap X/Z)
      let size = mb.size;
      if (Math.abs(Math.abs(rot % Math.PI) - Math.PI / 2) < 0.01) {
        size = [mb.size[2], mb.size[1], mb.size[0]];
      }
      allMeshes.push({ size, position: [x, y, z], role: mb.role, color: mb.color });
    }
  }

  const { json, bin } = buildGltf(allMeshes);
  const glb = packGlb(json, bin);

  return new Response(new Uint8Array(glb.buffer, glb.byteOffset, glb.byteLength) as BodyInit, {
    headers: {
      "Content-Type": "model/gltf-binary",
      "Content-Disposition": `attachment; filename="furniforge-${Date.now()}.glb"`,
    },
  });
}
