// Convert an internet image URL → parametric furniture model via GPT-4o Vision.
// Production: cluster styles via embeddings, dedupe, schedule for human review.

import OpenAI from "openai";

export interface ImportedDesign {
  detectedCategory: string; // matches our category codes (e.g., "wardrobe.slide")
  suggestedSku: string;
  nameUz: string;
  styleTags: string[];
  estimatedDimensionsMm: { width: number; depth: number; height: number };
  parameters: {
    doors?: number;
    shelves?: number;
    drawers?: number;
  };
  dominantColors: string[];
  description: string;
  confidence: number;
}

const SYSTEM = `You are a furniture engineer. Analyze the image and extract a parametric furniture description.
Detect the category from this list ONLY:
kitchen.base, kitchen.wall, kitchen.tall, wardrobe.swing, wardrobe.slide, bed.platform, bed.classic,
table.dining, table.coffee, table.office, shelf.open, tv.stand, sofa.straight, chair.dining, nightstand.

Return STRICT JSON only:
{
  "detectedCategory": "<one of above>",
  "suggestedSku": "AI-<3-letter-prefix>-<3-digits>",
  "nameUz": "<short Uzbek name>",
  "styleTags": ["modern","minimalist",...],
  "estimatedDimensionsMm": {"width": int, "depth": int, "height": int},
  "parameters": {"doors": int, "shelves": int, "drawers": int},
  "dominantColors": ["#RRGGBB", ...],
  "description": "1-sentence Uzbek description",
  "confidence": 0.0-1.0
}`;

function mockImport(): ImportedDesign {
  return {
    detectedCategory: "wardrobe.slide",
    suggestedSku: "AI-WRB-001",
    nameUz: "AI import: Kupe garderob",
    styleTags: ["modern", "minimalist"],
    estimatedDimensionsMm: { width: 2400, depth: 600, height: 2400 },
    parameters: { doors: 3, shelves: 5 },
    dominantColors: ["#F2EFEA", "#5B3A29"],
    description: "Mock natija — OPENAI_API_KEY o'rnatilmagan.",
    confidence: 0.5,
  };
}

export async function importDesignFromUrl(imageUrl: string): Promise<{ result: ImportedDesign; isMock: boolean; latencyMs: number }> {
  const t0 = Date.now();
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) return { result: mockImport(), isMock: true, latencyMs: Date.now() - t0 };

  const client = new OpenAI({ apiKey });
  const resp = await client.chat.completions.create({
    model: "gpt-4o",
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: SYSTEM },
      {
        role: "user",
        content: [
          { type: "text", text: "Analyze this furniture image. Return ONLY the JSON." },
          { type: "image_url", image_url: { url: imageUrl, detail: "high" } },
        ],
      },
    ],
    temperature: 0.2,
    max_tokens: 600,
  });

  const raw = resp.choices[0]?.message?.content || "{}";
  let parsed: ImportedDesign;
  try {
    parsed = JSON.parse(raw) as ImportedDesign;
  } catch {
    parsed = mockImport();
  }
  return { result: parsed, isMock: false, latencyMs: Date.now() - t0 };
}
