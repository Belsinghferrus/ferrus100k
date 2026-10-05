'use server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function saveCheckIn(input) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const {
    date, start_followers, end_followers,
    did_post, reels_posted, best_reel_id,
    what_worked, what_failed, tomorrow_test,
  } = input || {}

  if (!date || typeof start_followers !== 'number' || typeof end_followers !== 'number') {
    return { error: 'Missing date or follower counts' }
  }

  const { error } = await supabase
    .from('daily_growth')
    .upsert({
      user_id: user.id,
      date,
      start_followers,
      end_followers,
      did_post: !!did_post,
      reels_posted: reels_posted ?? null,
      best_reel_id: best_reel_id || null,
      what_worked: what_worked || null,
      what_failed: what_failed || null,
      tomorrow_test: tomorrow_test || null,
    }, { onConflict: 'user_id,date' })

  if (error) return { error: error.message }

  revalidatePath('/dashboard')
  revalidatePath('/daily')
  return { success: true }
}