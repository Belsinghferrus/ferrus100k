import { getProfile } from '@/lib/supabase/server'
import { PageHeader } from '@/components/shell/PageHeader'
import { Card, CardContent } from '@/components/ui/card'
import { computeTrajectory } from '@/lib/calculations/trajectory'
import { formatNumber, formatCompact, formatPercent } from '@/lib/calculations/format'

export default async function DashboardPage() {
  const profile = await getProfile()
  // Phase 1: no daily entries yet → current = starting
  const currentFollowers = profile?.starting_followers ?? 0
  const t = profile ? computeTrajectory(profile, currentFollowers) : null

  return (
    <>
      <PageHeader
        title="Command Center"
        description="Phase 1 — shell + data pipeline live. Charts & modules ship in Phase 2."
      />
      {!profile ? (
        <Card><CardContent className="p-6 text-sm text-muted-foreground">
          Profile not found. Did the auth trigger fire?
        </CardContent></Card>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Kpi label="Current"        value={formatCompact(currentFollowers)} accent />
          <Kpi label="Target"         value={formatCompact(profile.target_followers)} />
          <Kpi label="Remaining"      value={formatCompact(t.remaining)} />
          <Kpi label="Days left"      value={formatNumber(t.daysRemaining)} />
          <Kpi label="Required / day" value={formatNumber(Math.ceil(t.requiredPerDay))} accent />
          <Kpi label="Required / week" value={formatNumber(Math.ceil(t.requiredPerWeek))} />
          <Kpi label="Progress"       value={formatPercent(t.progressPct)} />
          <Kpi
            label="Status"
            value={t.status.replace('_', ' ')}
            accent={t.status === 'AHEAD'}
            danger={t.status === 'BEHIND'}
          />
        </div>
      )}
    </>
  )
}

function Kpi({ label, value, accent, danger }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
        <div
          className={[
            'mt-1 text-2xl font-semibold tracking-tight tabular-nums',
            accent ? 'text-primary' : '',
            danger ? 'text-destructive' : '',
          ].join(' ')}
        >
          {value}
        </div>
      </CardContent>
    </Card>
  )
}