import { z } from 'zod'
import { EXPERIMENT_STATUS, EXPERIMENT_WINNER } from '@/lib/constants'

const nullableString = z.preprocess(
  (v) => (v === '' || v === undefined ? null : v),
  z.string().max(2000).nullable()
).optional()

const nullableDate = z.preprocess(
  (v) => (v === '' || v === undefined ? null : v),
  z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable()
).optional()

export const experimentSchema = z.object({
  name: z.string().min(1, 'Experiment name is required').max(200),
  hypothesis: nullableString,
  start_date: nullableDate,
  end_date: nullableDate,
  variable: nullableString,
  control: nullableString,
  test: nullableString,
  expected_result: nullableString,
  actual_result: nullableString,
  winner: z.preprocess(
    (v) => (v === '' || v === undefined || v === null || v === 'none' ? null : v),
    z.enum(EXPERIMENT_WINNER).nullable()
  ).optional(),
  learning: nullableString,
  next_action: nullableString,
  status: z.enum(EXPERIMENT_STATUS).default('PLANNED'),
})