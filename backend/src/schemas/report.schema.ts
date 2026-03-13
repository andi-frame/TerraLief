import { z } from 'zod'

export const createReportSchema = z.object({
  routeId: z.string().uuid(),
  isManualStart: z.boolean().default(false),
  startLabel: z.string().max(255).optional(),
  notes: z.string().optional(),
})

export type CreateReportInput = z.infer<typeof createReportSchema>
