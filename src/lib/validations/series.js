import { z } from 'zod'

const nullableString = z.preprocess(
  (v) => (v === '' || v === undefined ? null : v),
  z.string().max(2000).nullable()
).optional()

const nullableInt = z.preprocess(
  (v) => (v === '' || v === undefined || v === null ? null : v),
  z.union([z.coerce.number().int().min(1).max(1000), z.null()])
).optional()

const nullableDate = z.preprocess(
  (v) => (v === '' || v === undefined ? null : v),
  z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable()
).optional()

export const seriesSchema = z.object({
  name: z.string().min(1, 'Series name is required').max(200),
  description: nullableString,
  planned_episodes: nullableInt,
  status: z.enum(['active', 'paused', 'complete', 'archived']).default('active'),
  start_date: nullableDate,
})