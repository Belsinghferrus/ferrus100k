import { z } from 'zod'
import { VERDICTS, REEL_FORMATS } from '@/lib/constants'

const nullableInt = z.preprocess(
  (v) => (v === '' || v === undefined || v === null ? null : v),
  z.union([z.coerce.number().int().min(0), z.null()])
).optional()

const nullableFloat = z.preprocess(
  (v) => (v === '' || v === undefined || v === null ? null : v),
  z.union([z.coerce.number().min(0), z.null()])
).optional()

const nullableString = z.preprocess(
  (v) => (v === '' || v === undefined ? null : v),
  z.string().max(2000).nullable()
).optional()

const nullableUUID = z.preprocess(
  (v) => (v === '' || v === undefined || v === null || v === 'none' ? null : v),
  z.string().uuid().nullable()
).optional()

export const reelSchema = z.object({
  posted_at: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Pick a valid date'),
  reel_number: nullableInt,
  title: nullableString,
  pillar_id: nullableUUID,
  series_id: nullableUUID,
  series_episode: nullableInt,
  hook: nullableString,
  format: z.preprocess(
    (v) => (v === '' || v === undefined ? null : v),
    z.enum(REEL_FORMATS).nullable()
  ).optional(),
  views: z.coerce.number().int().min(0, 'Views must be ≥ 0').default(0),
  watch_time_seconds: nullableInt,
  avg_watch_time_seconds: nullableFloat,
  likes: z.coerce.number().int().min(0).default(0),
  comments: z.coerce.number().int().min(0).default(0),
  saves: z.coerce.number().int().min(0).default(0),
  shares: z.coerce.number().int().min(0).default(0),
  accounts_engaged: z.coerce.number().int().min(0).default(0),
  profile_visits: nullableInt,
  follows: nullableInt,
  non_follower_pct: z.preprocess(
    (v) => (v === '' || v === undefined || v === null ? null : v),
    z.union([z.coerce.number().min(0).max(100), z.null()])
  ).optional(),
  verdict: z.preprocess(
    (v) => (v === '' || v === undefined || v === null || v === 'none' ? null : v),
    z.enum(VERDICTS).nullable()
  ).optional(),
  verdict_override: z.boolean().optional(),
  what_worked: nullableString,
  what_didnt_work: nullableString,
  next_test: nullableString,
})