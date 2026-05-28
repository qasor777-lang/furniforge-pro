import { z } from "zod";

export const CreateModelSchema = z.object({
  sku: z.string().min(1).max(60),
  nameUz: z.string().min(1).max(200),
  categoryCode: z.string().min(1),
  paramSchema: z.record(z.any()),
  defaultParams: z.record(z.number()),
  geometryDsl: z.record(z.any()),
  bboxW: z.number().int().positive(),
  bboxD: z.number().int().positive(),
  bboxH: z.number().int().positive(),
  baseCostUzs: z.number().int().nonnegative(),
  styleTags: z.array(z.string()).optional(),
  roomCompat: z.record(z.number()).optional(),
  source: z.string().optional(),
});

export const CreateProjectSchema = z.object({
  id: z.number().int().positive().optional(),
  name: z.string().min(1).max(200),
  roomAnalysisId: z.number().int().optional().nullable(),
  layoutJson: z.union([z.string().min(1), z.array(z.any())]),
  roomSize: z.object({
    roomW: z.number().int().positive(),
    roomD: z.number().int().positive(),
    roomH: z.number().int().positive(),
  }).optional(),
});

export const UpdateProjectSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1).max(200).optional(),
  layoutJson: z.string().min(1).optional(),
  roomSize: z.object({
    roomW: z.number().int().positive(),
    roomD: z.number().int().positive(),
    roomH: z.number().int().positive(),
  }).optional(),
});
