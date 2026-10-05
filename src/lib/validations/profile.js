import { z } from 'zod'

export const profileSchema = z.object({
  instagram_username: z.string().min(1).max(64).optional().nullable(),
  starting_followers: z.coerce.number().int().min(0).max(100_000_000),
  target_followers:   z.coerce.number().int().min(1).max(1_000_000_000),
  starting_date:      z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  deadline:           z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  timezone:           z.string().min(1).max(64).optional(),
})