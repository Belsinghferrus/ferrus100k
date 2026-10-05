import { z } from 'zod'

const nullableString = z.preprocess(
  (v) => (v === '' || v === undefined ? null : v),
  z.string().max(2000).nullable()
).optional()

const nullableInt = z.preprocess(
  (v) => (v === '' || v === undefined || v === null ? null : v),
  z.union([z.coerce.number().int().min(0), z.null()])
).optional()

const nullableUUID = z.preprocess(
  (v) => (v === '' || v === undefined || v === null || v === 'none' ? null : v),
  z.string().uuid().nullable()
).optional()

export const weeklySchema = z.object({
  week_number: z.coerce.number().int().min(1).max(500),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Pick a start date'),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Pick an end date'),
  starting_followers: z.coerce.number().int().min(0),
  ending_followers: z.coerce.number().int().min(0),
  reels_posted: nullableInt,
  total_views: nullableInt,
  total_follows: nullableInt,
  best_reel_id: nullableUUID,
  winning_pattern: nullableString,
  what_failed: nullableString,
  what_to_kill: nullableString,
  what_to_repeat: nullableString,
  next_week_experiment: nullableString,
  notes: nullableString,
}).refine((d) => d.end_date >= d.start_date, {
  message: 'End date must be after start date',
  path: ['end_date'],
})