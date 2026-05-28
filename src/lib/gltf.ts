// Build a glTF 2.0 file from parametric mesh boxes (no THREE.js dependency).
// Spec: https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html

interface MeshBox {
  size: [number, number, number];
  position: [number, number, number];
  color: string; // hex
}

function hexToRgb01(h: string): [number, number, number, number] {
  const m = h.replace("#", "").match(/.{2}/g);
  if (!m) return [1, 1, 1, 1];
  return [parseInt(m[0], 16) / 255, parseInt(m[1], 16) / 255, parseInt(m[2], 16) / 255, 1];
}

// Cube geometry (positions, normals, indices) — shared, scaled per mesh.
const CUBE_POS = new Float32Array([
  // +X
   0.5,-0.5,-0.5,  0.5, 0.5,-0.5,  0.5, 0.5, 0.5,  0.5,-0.5, 0.5,
  // -X
  -0.5,-0.5, 0.5, -0.5, 0.5, 0.5, -0.5, 0.5,-0.5, -0.5,-0.5,-0.5,
  // +Y
  -0.5, 0.5,-0.5, -0.5, 0.5, 0.5,  0.5, 0.5, 0.5,  0.5, 0.5,-0.5,
  // -Y
  -0.5,-0.5, 0.5, -0.5,-0.5,-0.5,  0.5,-0.5,-0.5,  0.5,-0.5, 0.5,
  // +Z
  -0.5,-0.5, 0.5,  0.5,-0.5, 0.5,  0.5, 0.5, 0.5, -0.5, 0.5, 0.5,
  // -Z
   0.5,-0.5,-0.5, -0.5,-0.5,-0.5, -0.5, 0.5,-0.5,  0.5, 0.5,-0.5,
]);

const CUBE_NRM = new Float32Array([
   1,0,0,  1,0,0,  1,0,0,  1,0,0,
  -1,0,0, -1,0,0, -1,0,0, -1,0,0,
   0,1,0,  0,1,0,  0,1,0,  0,1,0,
   0,-1,0, 0,-1,0, 0,-1,0, 0,-1,0,
   0,0,1,  0,0,1,  0,0,1,  0,0,1,
   0,0,-1, 0,0,-1, 0,0,-1, 0,0,-1,
]);

const CUBE_IDX = new Uint16Array([
  0,1,2, 0,2,3,
  4,5,6, 4,6,7,
  8,9,10, 8,10,11,
  12,13,14, 12,14,15,
  16,17,18, 16,18,19,
  20,21,22, 20,22,23,
]);

export function buildGltf(meshes: MeshBox[]): { json: any; bin: Uint8Array } {
  // Single shared cube primitive — instances via node TRS.
  const posBytes = CUBE_POS.byteLength;
  const nrmBytes = CUBE_NRM.byteLength;
  const idxBytes = CUBE_IDX.byteLength;
  const padded = (n: number) => Math.ceil(n / 4) * 4;
  const totalLen = padded(posBytes) + padded(nrmBytes) + padded(idxBytes);
  const bin = new Uint8Array(totalLen);
  bin.set(new Uint8Array(CUBE_POS.buffer), 0);
  bin.set(new Uint8Array(CUBE_NRM.buffer), padded(posBytes));
  bin.set(new Uint8Array(CUBE_IDX.buffer), padded(posBytes) + padded(nrmBytes));

  const bufferViews = [
    { buffer: 0, byteOffset: 0, byteLength: posBytes, target: 34962 },
    { buffer: 0, byteOffset: padded(posBytes), byteLength: nrmBytes, target: 34962 },
    { buffer: 0, byteOffset: padded(posBytes) + padded(nrmBytes), byteLength: idxBytes, target: 34963 },
  ];

  const accessors = [
    { bufferView: 0, componentType: 5126, count: 24, type: "VEC3", min: [-0.5,-0.5,-0.5], max: [0.5,0.5,0.5] },
    { bufferView: 1, componentType: 5126, count: 24, type: "VEC3" },
    { bufferView: 2, componentType: 5123, count: 36, type: "SCALAR" },
  ];

  // Materials (deduped by color)
  const colorMap = new Map<string, number>();
  const materials: any[] = [];
  for (const m of meshes) {
    if (!colorMap.has(m.color)) {
      colorMap.set(m.color, materials.length);
      materials.push({
        name: `mat_${m.color}`,
        pbrMetallicRoughness: {
          baseColorFactor: hexToRgb01(m.color),
          metallicFactor: 0.0,
          roughnessFactor: 0.5,
        },
      });
    }
  }

  // One mesh per material with cube primitive
  const meshesGltf = materials.map((_, i) => ({
    primitives: [{
      attributes: { POSITION: 0, NORMAL: 1 },
      indices: 2,
      material: i,
    }],
  }));

  // Node per box, referencing mesh by color
  const nodes = meshes.map((m) => ({
    mesh: colorMap.get(m.color)!,
    translation: m.position,
    scale: m.size,
  }));

  const json = {
    asset: { version: "2.0", generator: "FurniForge Pro" },
    scene: 0,
    scenes: [{ nodes: nodes.map((_, i) => i) }],
    nodes,
    meshes: meshesGltf,
    materials,
    accessors,
    bufferViews,
    buffers: [{ byteLength: totalLen }],
  };

  return { json, bin };
}

// Pack as GLB (binary glTF)
export function packGlb(json: any, bin: Uint8Array): Uint8Array {
  const jsonStr = JSON.stringify(json);
  const jsonBytes = new TextEncoder().encode(jsonStr);
  // Pad JSON to 4-byte boundary with spaces
  const jsonPad = (4 - (jsonBytes.length % 4)) % 4;
  const jsonChunkLen = jsonBytes.length + jsonPad;
  // Pad bin to 4-byte boundary with zeros
  const binPad = (4 - (bin.length % 4)) % 4;
  const binChunkLen = bin.length + binPad;

  const totalLen = 12 + 8 + jsonChunkLen + 8 + binChunkLen;
  const out = new Uint8Array(totalLen);
  const dv = new DataView(out.buffer);

  // Header
  dv.setUint32(0, 0x46546c67, true); // "glTF"
  dv.setUint32(4, 2, true);           // version
  dv.setUint32(8, totalLen, true);

  // JSON chunk
  dv.setUint32(12, jsonChunkLen, true);
  dv.setUint32(16, 0x4e4f534a, true); // "JSON"
  out.set(jsonBytes, 20);
  for (let i = 0; i < jsonPad; i++) out[20 + jsonBytes.length + i] = 0x20; // space

  // BIN chunk
  const binStart = 20 + jsonChunkLen;
  dv.setUint32(binStart, binChunkLen, true);
  dv.setUint32(binStart + 4, 0x004e4942, true); // "BIN\0"
  out.set(bin, binStart + 8);

  return out;
}
