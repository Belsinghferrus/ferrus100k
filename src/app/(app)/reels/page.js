import { createClient, getProfile } from '@/lib/supabase/server'
import { PageHeader } from '@/components/shell/PageHeader'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ReelsTable } from '@/components/reels/ReelsTable'
import { ReelsAnalytics } from '@/components/reels/ReelsAnalytics'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Reels — Ferrus 100K' }

export default async function ReelsPage() {
  const profile = await getProfile()
  if (!profile) return <><PageHeader title="Reels" /><p className="text-sm text-muted-foreground">Profile not found.</p></>

  const supabase = await createClient()

  const [{ data: reels }, { data: pillars }, { data: series }] = await Promise.all([
    supabase
      .from('reels')
      .select(`
        id, reel_number, posted_at, title, hook, format,
        views, watch_time_seconds, avg_watch_time_seconds,
        likes, comments, saves, shares, accounts_engaged,
        profile_visits, follows, non_follower_pct,
        follows_per_1k, engagement_rate, share_rate, save_rate,
        verdict, verdict_override, what_worked, what_didnt_work, next_test,
        pillar_id, series_id, series_episode,
        pillar:content_pillars(id, name),
        series:content_series(id, name)
      `)
      .eq('user_id', profile.id)
      .order('posted_at', { ascending: false }),
    supabase.from('content_pillars').select('id, name').eq('user_id', profile.id).order('name'),
    supabase.from('content_series').select('id, name').eq('user_id', profile.id).order('name'),
  ])

  const safeReels = reels ?? []

  return (
    <>
      <PageHeader
        title="Reels"
        description={`${safeReels.length} Reel${safeReels.length === 1 ? '' : 's'} tracked · rank by Follows / 1K for decision-making.`}
      />

      <Tabs defaultValue="tracker">
        <TabsList>
          <TabsTrigger value="tracker">Tracker</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="tracker">
          <ReelsTable reels={safeReels} pillars={pillars ?? []} series={series ?? []} />
        </TabsContent>

        <TabsContent value="analytics">
          <ReelsAnalytics reels={safeReels} />
        </TabsContent>
      </Tabs>
    </>
  )
}