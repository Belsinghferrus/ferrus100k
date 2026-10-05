import { z } from 'zod'

export const dailyEntrySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  start_followers: z.coerce.number().int().min(0),
  end_followers: z.coerce.number().int().min(0),
  notes: z.string().max(1000).optional().nullable(),
}).refine(d => d.end_followers >= 0, { message: 'Invalid end followers' })