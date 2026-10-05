'use server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { seriesSchema } from '@/lib/validations/series'

export async function upsertSeries(input, id = null) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const parsed = seriesSchema.safeParse(input)
  if (!parsed.success) {
    const first = parsed.error.issues[0]
    return { error: first ? `${first.path.join('.')}: ${first.message}` : 'Invalid input' }
  }

  const payload = { ...parsed.data, user_id: user.id }

  const { data, error } = id
    ? await supabase.from('content_series').update(payload).eq('id', id).eq('user_id', user.id).select('id').single()
    : await supabase.from('content_series').insert(payload).select('id').single()

  if (error) return { error: error.message }

  revalidatePath('/series')
  return { success: true, id: data.id }
}

export async function deleteSeries(id) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase.from('content_series').delete().eq('id', id).eq('user_id', user.id)
  if (error) return { error: error.message }

  revalidatePath('/series')
  return { success: true }
}