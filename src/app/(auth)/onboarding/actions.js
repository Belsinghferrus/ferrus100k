'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function completeOnboarding(data) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // 1. Update Profile
  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      instagram_username: data.instagram_username.replace('@', ''),
      starting_followers: Number(data.current_followers),
      target_followers: Number(data.target_followers),
      deadline: data.target_date,
      onboarding_completed: true,
    })
    .eq('id', user.id)

  if (profileError) return { error: profileError.message }

  // 2. Generate Custom Content Pillars
  if (data.pillars && data.pillars.length > 0) {
    // Delete the default seeded pillars for this new user
    await supabase.from('content_pillars').delete().eq('user_id', user.id)
    
    // Insert their custom selected pillars
    const pillarsToInsert = data.pillars.map(name => ({
      user_id: user.id,
      name: name,
      is_default: false
    }))
    
    const { error: pillarError } = await supabase
      .from('content_pillars')
      .insert(pillarsToInsert)
      
    if (pillarError) return { error: pillarError.message }
  }

  revalidatePath('/', 'layout')
  return { success: true }
}