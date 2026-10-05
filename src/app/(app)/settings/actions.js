'use server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { profileSchema } from '@/lib/validations/profile'
import { dailyEntrySchema } from '@/lib/validations/daily'
import { reelSchema } from '@/lib/validations/reels'
import { ideaSchema } from '@/lib/validations/ideas'

/* -------------------- Profile -------------------- */

export async function updateProfile(input) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const parsed = profileSchema.safeParse(input)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || 'Invalid input' }
  }
  const { error } = await supabase
    .from('profiles')
    .update(parsed.data)
    .eq('id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/settings')
  revalidatePath('/dashboard')
  return { success: true }
}

/* -------------------- Pillars -------------------- */

export async function createPillar(name) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const clean = (name || '').trim()
  if (!clean) return { error: 'Name required' }
  if (clean.length > 60) return { error: 'Name too long' }

  const { data, error } = await supabase
    .from('content_pillars')
    .insert({ user_id: user.id, name: clean })
    .select('id, name')
    .single()

  if (error) return { error: error.message }
  revalidatePath('/settings')
  revalidatePath('/reels')
  revalidatePath('/ideas')
  return { success: true, pillar: data }
}

export async function deletePillar(id) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('content_pillars')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { error: error.message }
  revalidatePath('/settings')
  revalidatePath('/reels')
  revalidatePath('/ideas')
  return { success: true }
}

/* -------------------- Bulk import -------------------- */

export async function importDaily(rows) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const errors = []
  const valid = []

  rows.forEach((r, i) => {
    const parsed = dailyEntrySchema.safeParse(r)
    if (!parsed.success) {
      errors.push({ row: i + 2, message: parsed.error.issues[0]?.message || 'Invalid' })
    } else {
      valid.push({ ...parsed.data, user_id: user.id })
    }
  })

  if (valid.length) {
    const { error } = await supabase
      .from('daily_growth')
      .upsert(valid, { onConflict: 'user_id,date' })
    if (error) return { error: error.message, errors }
  }

  revalidatePath('/daily')
  revalidatePath('/dashboard')
  return { success: true, inserted: valid.length, errors }
}

export async function importReels(rows) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const errors = []
  const valid = []

  rows.forEach((r, i) => {
    const parsed = reelSchema.safeParse(r)
    if (!parsed.success) {
      errors.push({ row: i + 2, message: parsed.error.issues[0]?.message || 'Invalid' })
    } else {
      valid.push({ ...parsed.data, user_id: user.id })
    }
  })

  if (valid.length) {
    const { error } = await supabase.from('reels').insert(valid)
    if (error) return { error: error.message, errors }
  }

  revalidatePath('/reels')
  revalidatePath('/dashboard')
  return { success: true, inserted: valid.length, errors }
}

export async function importIdeas(rows) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const errors = []
  const valid = []

  rows.forEach((r, i) => {
    const parsed = ideaSchema.safeParse(r)
    if (!parsed.success) {
      errors.push({ row: i + 2, message: parsed.error.issues[0]?.message || 'Invalid' })
    } else {
      valid.push({ ...parsed.data, user_id: user.id })
    }
  })

  if (valid.length) {
    const { error } = await supabase.from('content_ideas').insert(valid)
    if (error) return { error: error.message, errors }
  }

  revalidatePath('/ideas')
  return { success: true, inserted: valid.length, errors }
}

/* -------------------- Danger zone -------------------- */

export async function wipeUserData() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const tables = [
    'weekly_reviews', 'experiments', 'content_ideas', 'reels',
    'daily_growth', 'hooks', 'content_series', 'content_pillars',
  ]

  for (const t of tables) {
    const { error } = await supabase.from(t).delete().eq('user_id', user.id)
    if (error) return { error: `${t}: ${error.message}` }
  }

  // Re-seed default pillars so the app remains usable
  const defaults = [
    'Founder Journey', 'Business', 'Experiments / Challenges',
    'Personal Story', 'Founder Lifestyle',
  ]
  await supabase.from('content_pillars').insert(
    defaults.map((name) => ({ user_id: user.id, name, is_default: true }))
  )

  revalidatePath('/dashboard')
  revalidatePath('/settings')
  return { success: true }
}