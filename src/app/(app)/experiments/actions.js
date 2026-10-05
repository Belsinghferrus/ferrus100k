'use server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { experimentSchema } from '@/lib/validations/experiments'

export async function upsertExperiment(input, id = null) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const parsed = experimentSchema.safeParse(input)
  if (!parsed.success) {
    const first = parsed.error.issues[0]
    return { error: first ? `${first.path.join('.')}: ${first.message}` : 'Invalid input' }
  }

  const payload = { ...parsed.data, user_id: user.id }

  const { data, error } = id
    ? await supabase.from('experiments').update(payload).eq('id', id).eq('user_id', user.id).select('id').single()
    : await supabase.from('experiments').insert(payload).select('id').single()

  if (error) return { error: error.message }

  revalidatePath('/experiments')
  return { success: true, id: data.id }
}

export async function deleteExperiment(id) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase.from('experiments').delete().eq('id', id).eq('user_id', user.id)
  if (error) return { error: error.message }

  revalidatePath('/experiments')
  return { success: true }
}

export async function setExperimentStatus(id, status) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('experiments')
    .update({ status })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/experiments')
  return { success: true }
}