'use client'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, Cell, ReferenceLine,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatNumber, formatDecimal, formatCompact, pillarColor } from '@/lib/calculations/format'
import { aggregateBy, sortByMetric } from '@/lib/calculations/reels'

export function AnalyticsView({ profile, trajectory, chartData, reels, dailyEntries }) {
  const hasFollows = reels.some((r) => r.follows != null)

  const totals = {
    reels: reels.length,
    views: reels.reduce((s, r) => s + (r.views || 0), 0),
    follows: hasFollows ? reels.filter((r) => r.follows != null).reduce((s, r) => s + r.follows, 0) : null,
    shares: reels.reduce((s, r) => s + (r.shares || 0), 0),
    saves: reels.reduce((s, r) => s + (r.saves || 0), 0),
    daysLogged: dailyEntries.length,
    totalGrowth: dailyEntries.reduce((s, d) => s + (d.net_growth || 0), 0),
  }

  const avgFp1k = hasFollows
    ? (reels.filter((r) => r.follows_per_1k != null).reduce((s, r) => s + r.follows_per_1k, 0)
      / reels.filter((r) => r.follows_per_1k != null).length)
    : null

  const byPillar = aggregateBy(reels, (r) => r.pillar?.id ?? 'none', (r) => r.pillar?.name ?? 'Unassigned')
  const byFormat = aggregateBy(reels, (r) => r.format ?? 'none', (r) => r.format ?? 'Unassigned')
  const bySeries = aggregateBy(reels, (r) => r.series?.id ?? 'none', (r) => r.series?.name ?? 'Standalone')

  const topByFp1k = hasFollows
    ? sortByMetric(reels.filter((r) => r.follows_per_1k != null), 'follows_per_1k').slice(0, 8)
    : []

  const dailyChart = dailyEntries.map((d) => ({
    date: d.date,
    growth: d.net_growth,
  }))

  return (
    <div className="space-y-6">
      {/* Totals */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <Summary label="Reels Tracked" value={formatNumber(totals.reels)} />
        <Summary label="Total Views" value={formatCompact(totals.views)} />
        <Summary label="Total Follows" value={totals.follows != null ? formatNumber(totals.follows) : 'Data not available'} accent="text-primary" />
        <Summary label="Avg / Reel" value={avgFp1k != null ? formatDecimal(avgFp1k, 2) + ' / 1K' : 'Data not available'} accent="text-primary" />
        <Summary label="Total Shares" value={formatCompact(totals.shares)} />
        <Summary label="Total Saves" value={formatCompact(totals.saves)} />
        <Summary label="Days Logged" value={formatNumber(totals.daysLogged)} />
      </div>

      {/* Growth trajectory (reuse from dashboard) */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Follower Growth vs Required Trajectory
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272A" vertical={false} />
                <XAxis dataKey="date" stroke="#71717A" fontSize={11} tickLine={false} axisLine={false}
                  tickFormatter={(d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  minTickGap={40} />
                <YAxis stroke="#71717A" fontSize={11} tickLine={false} axisLine={false}
                  tickFormatter={formatCompact} width={48} />
                <Tooltip
                  contentStyle={{ background: '#111113', border: '1px solid #27272A', borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: '#A1A1AA', fontSize: 11 }}
                  formatter={(v, n) => [v == null ? '—' : formatNumber(v), n === 'required' ? 'Required' : 'Actual']}
                />
                <ReferenceLine y={profile.target_followers} stroke="#FFD02B" strokeDasharray="2 4" strokeOpacity={0.5} />
                <Line type="linear" dataKey="required" stroke="#FFD02B" strokeWidth={1.5} strokeDasharray="4 4" dot={false} isAnimationActive={false} />
                <Line type="monotone" dataKey="actual" stroke={trajectory.status === 'AHEAD' ? '#22C55E' : trajectory.status === 'BEHIND' ? '#EF4444' : '#F59E0B'}
                  strokeWidth={2.5} dot={{ r: 2 }} connectNulls isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Daily net growth bar */}
      {dailyChart.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Daily Net Growth
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyChart} margin={{ top: 4, right: 12, left: -12, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272A" vertical={false} />
                  <XAxis dataKey="date" stroke="#71717A" fontSize={10} tickLine={false} axisLine={false}
                    tickFormatter={(d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    minTickGap={30} />
                  <YAxis stroke="#71717A" fontSize={10} tickLine={false} axisLine={false} tickFormatter={formatNumber} width={48} />
                  <Tooltip
                    contentStyle={{ background: '#111113', border: '1px solid #27272A', borderRadius: 8, fontSize: 12 }}
                    formatter={(v) => [formatNumber(v), 'Net growth']}
                  />
                  <ReferenceLine y={0} stroke="#71717A" />
                  <Bar dataKey="growth" radius={[3, 3, 0, 0]}>
                    {dailyChart.map((d, i) => (
                      <Cell key={i} fill={d.growth >= 0 ? '#22C55E' : '#EF4444'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top by follows/1K */}
      {hasFollows && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Top Reels by Follows / 1K Views
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topByFp1k.map((r) => ({
                  name: (r.title || `Reel #${r.reel_number ?? '—'}`).slice(0, 28),
                  value: r.follows_per_1k,
                }))} layout="vertical" margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid horizontal={false} stroke="#27272A" />
                  <XAxis type="number" stroke="#71717A" fontSize={10} tickLine={false} axisLine={false}
                    tickFormatter={(v) => Number(v).toFixed(1)} />
                  <YAxis type="category" dataKey="name" stroke="#A1A1AA" fontSize={10} tickLine={false} axisLine={false} width={170} />
                  <Tooltip
                    contentStyle={{ background: '#111113', border: '1px solid #27272A', borderRadius: 8, fontSize: 12 }}
                    formatter={(v) => [Number(v).toFixed(2), 'Follows / 1K']}
                  />
                  <Bar dataKey="value" fill="#FFD02B" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Aggregations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <AggregateCard title="By Pillar" data={byPillar} colorByLabel={pillarColor} />
        <AggregateCard title="By Format" data={byFormat} />
      </div>
      <AggregateCard title="By Series" data={bySeries} />
    </div>
  )
}

function Summary({ label, value, accent }) {
  return (
    <Card><CardContent className="p-4">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`mt-1 text-xl font-semibold tabular-nums ${accent || ''}`}>{value}</div>
    </CardContent></Card>
  )
}

function AggregateCard({ title, data, colorByLabel }) {
  const chartData = data.map((g, i) => ({
    name: g.label,
    views: g.views,
    followsPer1k: g.followsPer1k,
    color: colorByLabel ? colorByLabel(g.label) : ['#FFD02B','#22C55E','#38BDF8','#A78BFA','#F472B6','#F59E0B'][i % 6],
  }))

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {chartData.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">No data</p>
        ) : (
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 4, right: 12, left: -12, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="#27272A" />
                <XAxis dataKey="name" stroke="#A1A1AA" fontSize={10} tickLine={false} axisLine={false} interval={0} angle={-15} textAnchor="end" height={50} />
                <YAxis stroke="#71717A" fontSize={10} tickLine={false} axisLine={false} tickFormatter={formatCompact} />
                <Tooltip
                  contentStyle={{ background: '#111113', border: '1px solid #27272A', borderRadius: 8, fontSize: 12 }}
                  formatter={(v) => [formatNumber(v), 'Views']}
                />
                <Bar dataKey="views" radius={[4, 4, 0, 0]}>
                  {chartData.map((c, i) => <Cell key={i} fill={c.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}