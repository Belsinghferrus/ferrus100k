'use server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { weeklySchema } from '@/lib/validations/weekly'

export async function upsertWeekly(input, id = null) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const parsed = weeklySchema.safeParse(input)
  if (!parsed.success) {
    const first = parsed.error.issues[0]
    return { error: first ? `${first.path.join('.')}: ${first.message}` : 'Invalid input' }
  }

  const payload = { ...parsed.data, user_id: user.id }

  const { data, error } = id
    ? await supabase.from('weekly_reviews').update(payload).eq('id', id).eq('user_id', user.id).select('id').single()
    : await supabase.from('weekly_reviews').insert(payload).select('id').single()

  if (error) return { error: error.message }

  revalidatePath('/weekly')
  revalidatePath('/dashboard')
  return { success: true, id: data.id }
}

export async function deleteWeekly(id) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase.from('weekly_reviews').delete().eq('id', id).eq('user_id', user.id)
  if (error) return { error: error.message }

  revalidatePath('/weekly')
  return { success: true }
}

/**
 * Given a start_date and end_date, compute the starting and ending follower
 * counts from daily_growth entries. Returns { starting, ending, reels_posted,
 * total_views, total_follows } or nulls where unknown.
 */
export async function autoFillWeekly({ start_date, end_date, profile_id }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const [{ data: daily }, { data: reels }, { data: profile }] = await Promise.all([
    supabase
      .from('daily_growth')
      .select('date, start_followers, end_followers')
      .eq('user_id', profile_id)
      .gte('date', start_date)
      .lte('date', end_date)
      .order('date', { ascending: true }),
    supabase
      .from('reels')
      .select('views, follows')
      .eq('user_id', profile_id)
      .gte('posted_at', start_date)
      .lte('posted_at', end_date),
    supabase
      .from('profiles')
      .select('starting_followers')
      .eq('id', profile_id)
      .single(),
  ])

  const first = daily?.[0]
  const last  = daily?.[daily.length - 1]

  const starting = first?.start_followers ?? profile?.starting_followers ?? 0
  const ending   = last?.end_followers ?? starting
  const reels_posted = reels?.length ?? 0
  const total_views  = reels?.reduce((s, r) => s + (r.views || 0), 0) ?? 0
  const followsArr   = (reels ?? []).filter((r) => r.follows != null)
  const total_follows = followsArr.length ? followsArr.reduce((s, r) => s + r.follows, 0) : null

  return { starting, ending, reels_posted, total_views, total_follows }
}