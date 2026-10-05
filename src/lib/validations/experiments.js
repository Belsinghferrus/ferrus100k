import { z } from 'zod'
import { EXPERIMENT_STATUS, EXPERIMENT_WINNER } from '@/lib/constants'

export const experimentSchema = z.object({
  name: z.string().min(1).max(200),
  hypothesis: z.string().max(2000).optional().nullable(),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
  end_date:   z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
  variable: z.string().max(200).optional().nullable(),
  control:  z.string().max(2000).optional().nullable(),
  test:     z.string().max(2000).optional().nullable(),
  expected_result: z.string().max(2000).optional().nullable(),
  actual_result:   z.string().max(2000).optional().nullable(),
  winner: z.enum(EXPERIMENT_WINNER).optional().nullable(),
  learning: z.string().max(2000).optional().nullable(),
  next_action: z.string().max(2000).optional().nullable(),
  status: z.enum(EXPERIMENT_STATUS).default('PLANNED'),
})