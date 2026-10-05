import { createClient, getProfile } from '@/lib/supabase/server'
import { PageHeader } from '@/components/shell/PageHeader'
import { AnalyticsView } from '@/components/analytics/AnalyticsView'
import { computeTrajectory, buildTrajectoryData } from '@/lib/calculations/trajectory'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Analytics — Ferrus 100K' }

export default async function AnalyticsPage() {
  const profile = await getProfile()
  if (!profile) return <><PageHeader title="Analytics" /><p className="text-sm text-muted-foreground">Profile not found.</p></>

  const supabase = await createClient()

  const [{ data: reels }, { data: dailyEntries }] = await Promise.all([
    supabase
      .from('reels')
      .select(`
        id, reel_number, title, posted_at, format,
        views, likes, comments, saves, shares, accounts_engaged, follows,
        follows_per_1k, engagement_rate,
        pillar:content_pillars(id, name),
        series:content_series(id, name)
      `)
      .eq('user_id', profile.id)
      .order('posted_at', { ascending: false }),
    supabase
      .from('daily_growth')
      .select('date, start_followers, end_followers, net_growth')
      .eq('user_id', profile.id)
      .order('date', { ascending: true }),
  ])

  const entries = dailyEntries ?? []
  const latest = entries.length ? entries[entries.length - 1].end_followers : profile.starting_followers
  const trajectory = computeTrajectory(profile, latest)
  const chartData = buildTrajectoryData(profile, entries)

  return (
    <>
      <PageHeader
        title="Analytics"
        description="Everything the account has produced, in one view."
      />
      <AnalyticsView
        profile={profile}
        trajectory={trajectory}
        chartData={chartData}
        reels={reels ?? []}
        dailyEntries={entries}
      />
    </>
  )
}