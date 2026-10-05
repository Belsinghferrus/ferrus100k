import { z } from 'zod'
import { VERDICTS, REEL_FORMATS } from '@/lib/constants'

const nullableInt = z.union([z.coerce.number().int().min(0), z.null()]).optional()

export const reelSchema = z.object({
  posted_at: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  title: z.string().max(200).optional().nullable(),
  pillar_id: z.string().uuid().optional().nullable(),
  series_id: z.string().uuid().optional().nullable(),
  series_episode: nullableInt,
  hook: z.string().max(500).optional().nullable(),
  format: z.enum(REEL_FORMATS).optional().nullable(),
  views: z.coerce.number().int().min(0),
  likes: z.coerce.number().int().min(0).default(0),
  comments: z.coerce.number().int().min(0).default(0),
  saves: z.coerce.number().int().min(0).default(0),
  shares: z.coerce.number().int().min(0).default(0),
  accounts_engaged: z.coerce.number().int().min(0).default(0),
  profile_visits: nullableInt,
  follows: nullableInt,
  non_follower_pct: z.union([z.coerce.number().min(0).max(100), z.null()]).optional(),
  verdict: z.enum(VERDICTS).optional().nullable(),
  verdict_override: z.boolean().optional(),
  what_worked: z.string().max(2000).optional().nullable(),
  what_didnt_work: z.string().max(2000).optional().nullable(),
  next_test: z.string().max(2000).optional().nullable(),
})