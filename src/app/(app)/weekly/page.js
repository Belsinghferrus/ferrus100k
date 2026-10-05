import { createClient, getProfile } from '@/lib/supabase/server'
import { PageHeader } from '@/components/shell/PageHeader'
import { WeeklyList } from '@/components/weekly/WeeklyList'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Weekly Review — Ferrus 100K' }

export default async function WeeklyPage() {
  const profile = await getProfile()
  if (!profile) return <><PageHeader title="Weekly Review" /><p className="text-sm text-muted-foreground">Profile not found.</p></>

  const supabase = await createClient()

  const [{ data: weeks }, { data: reels }] = await Promise.all([
    supabase
      .from('weekly_reviews')
      .select('*')
      .eq('user_id', profile.id)
      .order('week_number', { ascending: false }),
    supabase
      .from('reels')
      .select('id, reel_number, title, posted_at')
      .eq('user_id', profile.id)
      .order('posted_at', { ascending: false }),
  ])

  const maxWeek = (weeks ?? []).reduce((m, w) => Math.max(m, w.week_number || 0), 0)

  return (
    <>
      <PageHeader
        title="Weekly Review"
        description="End-of-week debrief. What worked, what didn't, what changes next week."
      />
      <WeeklyList
        weeks={weeks ?? []}
        reels={reels ?? []}
        profileId={profile.id}
        nextWeekNumber={maxWeek + 1}
      />
    </>
  )
}