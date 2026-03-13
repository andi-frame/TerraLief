import { z } from 'zod'

// ─── Shelter ──────────────────────────────────────────────────────────────────

export const createShelterSchema = z.object({
  name: z.string().min(1).max(255),
  lat: z.number(),
  lng: z.number(),
  disasterType: z.string().min(1).max(50),
  managedBy: z.string().max(255).optional(),
  capacityStatus: z.enum(['available', 'limited', 'full']).default('available'),
})

export const updateShelterSchema = createShelterSchema.partial()

// ─── Shelter Population ───────────────────────────────────────────────────────

export const upsertPopulationSchema = z.object({
  male: z.number().int().min(0).default(0),
  female: z.number().int().min(0).default(0),
  children: z.number().int().min(0).default(0),
  elderly: z.number().int().min(0).default(0),
  medical: z.number().int().min(0).default(0),
})

// ─── Shelter Need ─────────────────────────────────────────────────────────────

export const createNeedSchema = z.object({
  item: z.string().min(1).max(255),
  quantity: z.number().int().min(0).default(0),
  fulfilled: z.number().int().min(0).default(0),
  priority: z.enum(['high', 'medium', 'low']).default('medium'),
})

export const updateNeedSchema = createNeedSchema.partial()

// ─── Shelter Checkin ──────────────────────────────────────────────────────────

export const createCheckinSchema = z.object({
  name: z.string().min(1).max(255),
  age: z.number().int().min(0).max(150).optional(),
  condition: z.string().max(100).optional(),
})

// ─── Inferred types ───────────────────────────────────────────────────────────

export type CreateShelterInput = z.infer<typeof createShelterSchema>
export type UpdateShelterInput = z.infer<typeof updateShelterSchema>
export type UpsertPopulationInput = z.infer<typeof upsertPopulationSchema>
export type CreateNeedInput = z.infer<typeof createNeedSchema>
export type UpdateNeedInput = z.infer<typeof updateNeedSchema>
export type CreateCheckinInput = z.infer<typeof createCheckinSchema>
