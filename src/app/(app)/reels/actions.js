'use server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { reelSchema } from '@/lib/validations/reels'

export async function upsertReel(input, id = null) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { from_idea_id, ...cleanInput } = input || {}
  const parsed = reelSchema.safeParse(cleanInput)
  if (!parsed.success) {
    const first = parsed.error.issues[0]
    return { error: first ? `${first.path.join('.')}: ${first.message}` : 'Invalid input' }
  }

  const payload = { ...parsed.data, user_id: user.id }

  const { data, error } = id
    ? await supabase.from('reels').update(payload).eq('id', id).eq('user_id', user.id).select('id').single()
    : await supabase.from('reels').insert(payload).select('id').single()

  if (error) return { error: error.message }

  // Link back to the idea if this Reel was created from one
  if (from_idea_id && !id) {
    await supabase
      .from('content_ideas')
      .update({ status: 'POSTED', converted_reel_id: data.id })
      .eq('id', from_idea_id)
      .eq('user_id', user.id)
    revalidatePath('/ideas')
  }

  revalidatePath('/reels')
  revalidatePath('/dashboard')
  return { success: true, id: data.id }
}

export async function deleteReel(id) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase.from('reels').delete().eq('id', id).eq('user_id', user.id)
  if (error) return { error: error.message }

  revalidatePath('/reels')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function setReelVerdict(id, verdict) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('reels')
    .update({ verdict, verdict_override: true })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/reels')
  return { success: true }
}