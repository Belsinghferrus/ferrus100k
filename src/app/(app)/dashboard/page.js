import { createClient, getProfile } from '@/lib/supabase/server'
import { computeTrajectory, buildTrajectoryData } from '@/lib/calculations/trajectory'
import { PageHeader } from '@/components/shell/PageHeader'
import { HeroSection } from '@/components/dashboard/HeroSection'
import { KpiGrid } from '@/components/dashboard/KpiGrid'
import { TrajectoryChart } from '@/components/dashboard/TrajectoryChart'
import { TodayBlock } from '@/components/dashboard/TodayBlock'
import { RecentReels } from '@/components/dashboard/RecentReels'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { computeDailyRows } from '@/lib/calculations/daily.js'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const profile = await getProfile()
  if (!profile) {
    return (
      <>
        <PageHeader title="Command Center" />
        <Card><CardContent className="p-6 text-sm text-muted-foreground">
          Profile not found. Check Supabase.
        </CardContent></Card>
      </>
    )
  }

  const supabase = await createClient()

  const [{ data: dailyEntries }, { data: reelsRaw }] = await Promise.all([
    supabase
      .from('daily_growth')
      .select('id, date, start_followers, end_followers, net_growth, notes')
      .eq('user_id', profile.id)
      .order('date', { ascending: true }),
    supabase
      .from('reels')
      .select('id, reel_number, title, posted_at, views, follows, follows_per_1k, verdict, pillar:content_pillars(name)')
      .eq('user_id', profile.id)
      .order('follows_per_1k', { ascending: false, nullsFirst: false })
      .limit(3),
  ])

  const entries = dailyEntries ?? []
  const rows = computeDailyRows(profile, entries)

  const latestEntry = entries.length ? entries[entries.length - 1] : null
  const currentFollowers = latestEntry?.end_followers ?? profile.starting_followers

  const trajectory = computeTrajectory(profile, currentFollowers)
  const chartData = buildTrajectoryData(profile, entries)

  const todayISO = new Date().toISOString().slice(0, 10)
  const todayEntry = entries.find((e) => e.date === todayISO) || null
  const yesterdayISO = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
  const yesterdayEntry = entries.find((e) => e.date === yesterdayISO) || null

  const recentReels = (reelsRaw ?? []).map((r) => ({
    ...r,
    pillar_name: r.pillar?.name ?? null,
  }))

  return (
    <>
      <PageHeader
        title="Command Center"
        description="Where you are, what to do today, what worked."
      />

      <div className="space-y-6">
        <HeroSection
          profile={profile}
          currentFollowers={currentFollowers}
          trajectory={trajectory}
        />

        <KpiGrid trajectory={trajectory} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Trajectory — Actual vs Required
                  </CardTitle>
                  <span className="text-[11px] text-muted-foreground">
                    Target line: {profile.target_followers.toLocaleString()}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <TrajectoryChart
                  data={chartData}
                  status={trajectory.status}
                  targetFollowers={profile.target_followers}
                />
              </CardContent>
            </Card>
          </div>

          <div>
            <TodayBlock
              profile={profile}
              currentFollowers={currentFollowers}
              trajectory={trajectory}
              todayEntry={todayEntry}
              yesterdayEntry={yesterdayEntry}
            />
          </div>
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold tracking-tight">Top Reels by Follows / 1K Views</h2>
            <a href="/reels" className="text-[11px] text-primary hover:underline">View all →</a>
          </div>
          <RecentReels reels={recentReels} />
        </div>
      </div>
    </>
  )
}