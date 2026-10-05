'use client'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatNumber, formatDecimal, pillarColor } from '@/lib/calculations/format'
import { aggregateBy, sortByMetric } from '@/lib/calculations/reels'

const CHART_COLORS = ['#FFD02B', '#22C55E', '#38BDF8', '#A78BFA', '#F472B6', '#F59E0B', '#EF4444', '#10B981']

export function ReelsAnalytics({ reels }) {
  const hasFollows = reels.some((r) => r.follows != null)

  if (!reels.length) {
    return (
      <Card><CardContent className="p-10 text-center text-sm text-muted-foreground">
        No Reels to analyse yet.
      </CardContent></Card>
    )
  }

  const topViews    = sortByMetric(reels, 'views').slice(0, 5)
  const topFollows  = hasFollows ? sortByMetric(reels.filter(r => r.follows != null), 'follows').slice(0, 5) : []
  const topFp1k     = hasFollows ? sortByMetric(reels.filter(r => r.follows_per_1k != null), 'follows_per_1k').slice(0, 5) : []
  const topShares   = sortByMetric(reels, 'shares').slice(0, 5)
  const topSaves    = sortByMetric(reels, 'saves').slice(0, 5)

  const byPillar = aggregateBy(reels, (r) => r.pillar?.id ?? 'none', (r) => r.pillar?.name ?? 'Unassigned')
  const byFormat = aggregateBy(reels, (r) => r.format ?? 'none',     (r) => r.format ?? 'Unassigned')
  const bySeries = aggregateBy(reels, (r) => r.series?.id ?? 'none', (r) => r.series?.name ?? 'Standalone')

  return (
    <div className="space-y-6">
      {/* Average summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Summary label="Total Reels" value={formatNumber(reels.length)} />
        <Summary label="Avg Views"   value={formatNumber(Math.round(reels.reduce((s, r) => s + (r.views || 0), 0) / reels.length))} />
        <Summary
          label="Avg Follows / Reel"
          value={hasFollows
            ? formatNumber(Math.round(reels.filter(r => r.follows != null).reduce((s, r) => s + r.follows, 0) / reels.filter(r => r.follows != null).length))
            : 'Data not available'}
          accent="text-primary"
        />
        <Summary
          label="Avg Follows / 1K"
          value={hasFollows
            ? formatDecimal(reels.filter(r => r.follows_per_1k != null).reduce((s, r) => s + r.follows_per_1k, 0) / reels.filter(r => r.follows_per_1k != null).length, 2)
            : 'Data not available'}
        />
      </div>

      {/* Row 1: Top by views + follows */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TopCard title="Top by Views" data={topViews} metric="views" color="#38BDF8" />
        {hasFollows
          ? <TopCard title="Top by Follows" data={topFollows} metric="follows" color="#22C55E" />
          : <NotAvailableCard title="Top by Follows" />}
      </div>

      {/* Row 2: Top by follows/1K + shares */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {hasFollows
          ? <TopCard title="Top by Follows / 1K" data={topFp1k} metric="follows_per_1k" color="#FFD02B" decimals={2} />
          : <NotAvailableCard title="Top by Follows / 1K" />}
        <TopCard title="Top by Shares" data={topShares} metric="shares" color="#A78BFA" />
      </div>

      {/* Row 3: Top by saves + one more */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TopCard title="Top by Saves" data={topSaves} metric="saves" color="#F472B6" />
      </div>

      {/* Row 4: Aggregations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <AggregateCard title="Performance by Pillar" data={byPillar} colorByLabel={pillarColor} />
        <AggregateCard title="Performance by Format" data={byFormat} />
      </div>

      <AggregateCard title="Performance by Series" data={bySeries} />

      {!hasFollows && (
        <p className="text-[11px] text-muted-foreground text-center">
          Follows-based charts unlock once you record follows on at least one Reel.
        </p>
      )}
    </div>
  )
}

/* ---------- Sub-components ---------- */

function TopCard({ title, data, metric, color, decimals = 0 }) {
  const chartData = data.map((r) => ({
    name: shortLabel(r.title || `Reel #${r.reel_number ?? '—'}`, 22),
    value: r[metric] ?? 0,
    id: r.id,
  }))

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {chartData.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">Data not available</p>
        ) : (
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid horizontal={false} stroke="#27272A" />
                <XAxis type="number" stroke="#71717A" fontSize={10} tickLine={false} axisLine={false}
                  tickFormatter={(v) => decimals ? Number(v).toFixed(decimals) : formatNumber(v)} />
                <YAxis type="category" dataKey="name" stroke="#A1A1AA" fontSize={10} tickLine={false} axisLine={false} width={140} />
                <Tooltip
                  contentStyle={{ background: '#111113', border: '1px solid #27272A', borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: '#A1A1AA', fontSize: 11 }}
                  formatter={(v) => [decimals ? Number(v).toFixed(decimals) : formatNumber(v), '']}
                />
                <Bar dataKey="value" fill={color} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function AggregateCard({ title, data, colorByLabel }) {
  const chartData = data.map((g, i) => ({
    name: g.label,
    views: g.views,
    followsPer1k: g.followsPer1k,
    color: colorByLabel ? colorByLabel(g.label) : CHART_COLORS[i % CHART_COLORS.length],
  }))

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {title}
        </CardTitle>
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
                <YAxis stroke="#71717A" fontSize={10} tickLine={false} axisLine={false} tickFormatter={formatCompactShort} />
                <Tooltip
                  contentStyle={{ background: '#111113', border: '1px solid #27272A', borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: '#A1A1AA', fontSize: 11 }}
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

function Summary({ label, value, accent }) {
  return (
    <Card><CardContent className="p-4">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`mt-1 text-xl font-semibold tabular-nums ${accent || ''}`}>{value}</div>
    </CardContent></Card>
  )
}

function NotAvailableCard({ title }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="py-10 text-center text-sm text-muted-foreground">Data not available</p>
      </CardContent>
    </Card>
  )
}

function shortLabel(s, n) { return s.length > n ? s.slice(0, n - 1) + '…' : s }
function formatCompactShort(n) {
  if (n == null) return ''
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(0) + 'K'
  return String(n)
}