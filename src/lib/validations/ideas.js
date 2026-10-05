import { z } from 'zod'
import { IDEA_STATUSES, SERIES_POTENTIAL, DIFFICULTY } from '@/lib/constants'

export const ideaSchema = z.object({
  idea: z.string().min(1).max(500),
  pillar_id: z.string().uuid().optional().nullable(),
  format: z.string().max(64).optional().nullable(),
  hook: z.string().max(500).optional().nullable(),
  series_potential: z.enum(SERIES_POTENTIAL).optional().nullable(),
  difficulty: z.enum(DIFFICULTY).optional().nullable(),
  status: z.enum(IDEA_STATUSES).default('IDEA'),
  expected_outcome: z.string().max(2000).optional().nullable(),
  result: z.string().max(2000).optional().nullable(),
  follow_up_idea: z.string().max(2000).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
})