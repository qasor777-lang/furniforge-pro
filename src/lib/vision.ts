// Room Image Analysis — GPT-4o Vision wrapper with mock fallback.
// Production: replace with full pipeline (SAM2 + Depth-Anything + LLaVA fusion).

import OpenAI from "openai";

export interface RoomAnalysis {
  roomType: "kitchen" | "bedroom" | "living" | "child" | "office" | "dining" | "hallway" | "bathroom" | "unknown";
  roomTypeConfidence: number;
  estimatedDimensionsMm: { width: number; depth: number; height: number };
  styleLabel: string;
  styleTags: string[];
  colorPalette: { hex: string; weight: number }[];
  lighting: { tempK: number; intensity: "low" | "medium" | "high"; mainSource: "window" | "ceiling" | "lamp" | "mixed" };
  freeFloorRegions: { description: string; approxAreaM2: number; bestForCategories: string[] }[];
  detectedFurniture: { label: string; confidence: number }[];
  missingFurnitureSuggestions: string[];
  reasoning: string;
}

const SYSTEM_PROMPT = `You are an expert interior designer and furniture engineer.
Analyze the user's room photograph and return a STRICT JSON object describing the room.
Estimate dimensions in millimeters using common references (door ~2050mm, ceiling ~2700mm).
Be conservative with confidence scores. Only return valid JSON, no prose.`;

const JSON_SCHEMA_HINT = `{
  "roomType": "kitchen|bedroom|living|child|office|dining|hallway|bathroom|unknown",
  "roomTypeConfidence": 0.0-1.0,
  "estimatedDimensionsMm": { "width": number, "depth": number, "height": number },
  "styleLabel": "modern|classic|minimalist|scandinavian|japandi|loft|...",
  "styleTags": ["modern","minimalist",...],
  "colorPalette": [{"hex":"#RRGGBB","weight":0..1}],
  "lighting": {"tempK":3000-6500,"intensity":"low|medium|high","mainSource":"window|ceiling|lamp|mixed"},
  "freeFloorRegions": [{"description":"along left wall","approxAreaM2":3.2,"bestForCategories":["kitchen.base","wardrobe.slide"]}],
  "detectedFurniture": [{"label":"bed","confidence":0.9}],
  "missingFurnitureSuggestions": ["nightstand","wardrobe.slide"],
  "reasoning": "short explanation"
}`;

function mockAnalysis(): RoomAnalysis {
  return {
    roomType: "bedroom",
    roomTypeConfidence: 0.55,
    estimatedDimensionsMm: { width: 3600, depth: 4200, height: 2700 },
    styleLabel: "modern",
    styleTags: ["modern", "minimalist"],
    colorPalette: [
      { hex: "#F2EFEA", weight: 0.45 },
      { hex: "#D9C9B6", weight: 0.25 },
      { hex: "#1F2D3D", weight: 0.15 },
      { hex: "#8B7355", weight: 0.15 },
    ],
    lighting: { tempK: 4000, intensity: "medium", mainSource: "window" },
    freeFloorRegions: [
      { description: "along long wall", approxAreaM2: 4.5, bestForCategories: ["wardrobe.slide", "wardrobe.swing"] },
      { description: "near window", approxAreaM2: 2.0, bestForCategories: ["table.office", "shelf.open"] },
    ],
    detectedFurniture: [{ label: "window", confidence: 0.9 }],
    missingFurnitureSuggestions: ["bed.platform", "wardrobe.slide", "nightstand"],
    reasoning: "MOCK natija — OPENAI_API_KEY o'rnatilmagan. .env fayliga API key qo'shing.",
  };
}

export async function analyzeRoomImage(imageDataUrlOrUrl: string): Promise<{ result: RoomAnalysis; latencyMs: number; modelUsed: string; isMock: boolean }> {
  const t0 = Date.now();
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return { result: mockAnalysis(), latencyMs: Date.now() - t0, modelUsed: "mock", isMock: true };
  }

  const client = new OpenAI({ apiKey });

  const response = await client.chat.completions.create({
    model: "gpt-4o",
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: SYSTEM_PROMPT + "\n\nReturn this exact shape:\n" + JSON_SCHEMA_HINT },
      {
        role: "user",
        content: [
          { type: "text", text: "Analyze this room. Return ONLY the JSON object." },
          { type: "image_url", image_url: { url: imageDataUrlOrUrl, detail: "high" } },
        ],
      },
    ],
    temperature: 0.2,
    max_tokens: 1500,
  });

  const raw = response.choices[0]?.message?.content || "{}";
  let parsed: RoomAnalysis;
  try {
    parsed = JSON.parse(raw) as RoomAnalysis;
  } catch {
    console.error("Vision JSON parse failed, raw:", raw);
    parsed = mockAnalysis();
  }

  // Sanity defaults
  parsed.styleTags = parsed.styleTags || [];
  parsed.colorPalette = parsed.colorPalette || [];
  parsed.freeFloorRegions = parsed.freeFloorRegions || [];
  parsed.detectedFurniture = parsed.detectedFurniture || [];
  parsed.missingFurnitureSuggestions = parsed.missingFurnitureSuggestions || [];

  return { result: parsed, latencyMs: Date.now() - t0, modelUsed: "gpt-4o", isMock: false };
}
