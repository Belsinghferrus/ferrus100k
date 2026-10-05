import { createClient, getProfile } from '@/lib/supabase/server'
import { PageHeader } from '@/components/shell/PageHeader'
import { DailyTable } from '@/components/daily/DailyTable'
import { computeDailyRows, dailyTargetForDate } from '@/lib/calculations/daily'
import { formatNumber } from '@/lib/calculations/format'
import { Card, CardContent } from '@/components/ui/card'

export const dynamic = 'force-dynamic'

export default async function DailyPage() {
  const profile = await getProfile()
  if (!profile) {
    return <><PageHeader title="Daily Growth" /><p className="text-sm text-muted-foreground">Profile not found.</p></>
  }

  const supabase = await createClient()
  const { data: entries } = await supabase
    .from('daily_growth')
    .select('id, date, start_followers, end_followers, net_growth, notes')
    .eq('user_id', profile.id)
    .order('date', { ascending: true })

  const rows = computeDailyRows(profile, entries ?? [])
  const dailyTarget = dailyTargetForDate(profile)
  const totalLogged = rows.reduce((sum, r) => sum + r.netGrowth, 0)

  return (
    <>
      <PageHeader
        title="Daily Growth"
        description={`Log your end-of-day follower count. Daily target: ${formatNumber(dailyTarget)}.`}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Stat label="Entries"         value={formatNumber(rows.length)} />
        <Stat label="Daily Target"    value={formatNumber(dailyTarget)} accent="text-primary" />
        <Stat label="Total Growth"    value={formatNumber(totalLogged)} accent={totalLogged >= 0 ? 'text-success' : 'text-destructive'} />
        <Stat label="Days Logged Rate" value={
          rows.length ? `${(rows.filter(r => r.netGrowth >= dailyTarget).length / rows.length * 100).toFixed(0)}%` : '—'
        } />
      </div>

      <DailyTable rows={rows} profile={profile} />
    </>
  )
}

function Stat({ label, value, accent }) {
  return (
    <Card><CardContent className="p-4">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`mt-1 text-xl font-semibold tabular-nums ${accent || ''}`}>{value}</div>
    </CardContent></Card>
  )
}