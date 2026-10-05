'use server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { dailyEntrySchema } from '@/lib/validations/daily'

export async function upsertDailyEntry(input) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const parsed = dailyEntrySchema.safeParse(input)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || 'Invalid input' }
  }

  const { error } = await supabase
    .from('daily_growth')
    .upsert({ ...parsed.data, user_id: user.id }, { onConflict: 'user_id,date' })

  if (error) return { error: error.message }

  revalidatePath('/dashboard')
  revalidatePath('/daily')
  return { success: true }
}

export async function deleteDailyEntry(id) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('daily_growth')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/dashboard')
  revalidatePath('/daily')
  return { success: true }
}