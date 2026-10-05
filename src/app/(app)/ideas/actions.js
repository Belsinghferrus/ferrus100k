'use server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { ideaSchema } from '@/lib/validations/ideas'

export async function upsertIdea(input, id = null) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const parsed = ideaSchema.safeParse(input)
  if (!parsed.success) {
    const first = parsed.error.issues[0]
    return { error: first ? `${first.path.join('.')}: ${first.message}` : 'Invalid input' }
  }

  const payload = { ...parsed.data, user_id: user.id }

  const { data, error } = id
    ? await supabase.from('content_ideas').update(payload).eq('id', id).eq('user_id', user.id).select('id').single()
    : await supabase.from('content_ideas').insert(payload).select('id').single()

  if (error) return { error: error.message }

  revalidatePath('/ideas')
  return { success: true, id: data.id }
}

export async function deleteIdea(id) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase.from('content_ideas').delete().eq('id', id).eq('user_id', user.id)
  if (error) return { error: error.message }

  revalidatePath('/ideas')
  return { success: true }
}

export async function duplicateIdea(id) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: source, error: fetchErr } = await supabase
    .from('content_ideas')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (fetchErr || !source) return { error: 'Idea not found' }

  const { id: _drop, created_at, updated_at, converted_reel_id, ...rest } = source

  const { error: insertErr } = await supabase
    .from('content_ideas')
    .insert({ ...rest, idea: `${rest.idea} (copy)`, status: 'IDEA', user_id: user.id })

  if (insertErr) return { error: insertErr.message }

  revalidatePath('/ideas')
  return { success: true }
}

export async function setIdeaStatus(id, status) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('content_ideas')
    .update({ status })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/ideas')
  return { success: true }
}