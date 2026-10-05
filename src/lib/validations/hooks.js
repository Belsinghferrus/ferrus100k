import { z } from 'zod'
import { HOOK_CATEGORIES } from '@/lib/constants'

const nullableString = z.preprocess(
  (v) => (v === '' || v === undefined ? null : v),
  z.string().max(2000).nullable()
).optional()

const nullableUUID = z.preprocess(
  (v) => (v === '' || v === undefined || v === null || v === 'none' ? null : v),
  z.string().uuid().nullable()
).optional()

export const hookSchema = z.object({
  hook: z.string().min(1, 'Hook text is required').max(500),
  category: z.enum(HOOK_CATEGORIES).default('Curiosity'),
  pillar_id: nullableUUID,
  format: nullableString,
  notes: nullableString,
})