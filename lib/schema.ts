// lib/schema.ts
import { z } from "zod";

export const BeadInstanceSchema = z.object({
  id: z.string(),
  defId: z.string(),
  layer: z.string(),
  sMm: z.number(),
  diameterMm: z.number().optional(),
  rotation: z.number().optional(),
});

export const LayerSchema = z.object({
  id: z.string(),
  name: z.string(),
  lengthMm: z.number(),
  cordMaterial: z.enum(["steel", "silk", "nylon"]),
  cordPrice: z.number(),
});

export const NecklaceConfigSchema = z.object({
  version: z.literal(1),
  layers: z.array(LayerSchema),
  beads: z.array(BeadInstanceSchema),
  previewDataUrl: z.string().url().optional(),
});

export type NecklaceConfigZ = z.infer<typeof NecklaceConfigSchema>;
