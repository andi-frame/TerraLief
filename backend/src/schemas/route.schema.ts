import { z } from 'zod'

// ─── Route Point ──────────────────────────────────────────────────────────────

const routePointSchema = z.object({
  pointOrder: z.number().int().min(0),
  lat: z.number(),
  lng: z.number(),
})

// ─── Important Point ──────────────────────────────────────────────────────────

const importantPointSchema = z.object({
  lat: z.number(),
  lng: z.number(),
  category: z.enum(['hazard', 'tip', 'obstacle']).default('tip'),
  message: z.string().min(1),
})

// ─── Route ────────────────────────────────────────────────────────────────────

export const createRouteSchema = z.object({
  startLat: z.number(),
  startLng: z.number(),
  targetShelterId: z.string().uuid(),
  name: z.string().max(100).optional(),
  distanceKm: z.number().positive().optional(),
  etaMin: z.number().int().positive().optional(),
  vehicleType: z.string().max(50).optional(),
  isAiGenerated: z.boolean().default(false),
  summary: z.string().optional(),
  points: z.array(routePointSchema).min(1, 'At least one route point is required'),
  importantPoints: z.array(importantPointSchema).default([]),
})

export type CreateRouteInput = z.infer<typeof createRouteSchema>
