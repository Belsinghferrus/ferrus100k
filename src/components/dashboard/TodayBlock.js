import { formatNumber, formatDelta, formatDate } from '@/lib/calculations/format'
import { Zap, ArrowRight } from 'lucide-react'

export function TodayBlock({ profile, currentFollowers, trajectory, todayEntry, yesterdayEntry }) {
  const dayNumber = Math.max(1, trajectory.daysElapsed + 1)
  const targetToday = Math.round(trajectory.requiredToday)
  const gap = targetToday - currentFollowers
  const behind = gap > 0

  return (
    <section className="relative overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/[0.08] via-card to-card p-6">
      <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />

      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Zap className="h-3.5 w-3.5" />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Today</div>
            <div className="text-sm font-semibold">
              Day {dayNumber} · {formatDate(new Date(), 'EEE, MMM d, yyyy')}
            </div>
          </div>
        </div>
        {todayEntry ? (
          <span className="rounded-full bg-success/15 px-3 py-1 text-[11px] font-semibold text-success border border-success/30">
            LOGGED
          </span>
        ) : (
          <span className="rounded-full bg-warning/15 px-3 py-1 text-[11px] font-semibold text-warning border border-warning/30">
            NOT LOGGED
          </span>
        )}
      </div>

      <div className="relative mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <Cell label="Current"     value={formatNumber(currentFollowers)} />
        <Cell label="Target Today" value={formatNumber(targetToday)} accent="text-primary" />
        <Cell
          label={behind ? 'Gap to Target' : 'Ahead of Target'}
          value={formatNumber(Math.abs(gap))}
          accent={behind ? 'text-destructive' : 'text-success'}
        />
        <Cell
          label="Yesterday"
          value={yesterdayEntry ? formatDelta(yesterdayEntry.net_growth) : 'Data not available'}
          accent={
            yesterdayEntry
              ? yesterdayEntry.net_growth >= 0 ? 'text-success' : 'text-destructive'
              : 'text-muted-foreground'
          }
        />
      </div>

      <div className="relative mt-6 rounded-lg border border-border bg-card/60 p-4">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
          Today&apos;s mission
        </div>
        <ul className="mt-3 space-y-2 text-sm">
          <li className="flex items-start gap-2">
            <ArrowRight className="mt-0.5 h-3.5 w-3.5 text-primary shrink-0" />
            <span>
              {todayEntry
                ? 'End-of-day followers logged. Nice.'
                : 'Log end-of-day follower count on the Daily page.'}
            </span>
          </li>
          <li className="flex items-start gap-2">
            <ArrowRight className="mt-0.5 h-3.5 w-3.5 text-primary shrink-0" />
            <span>Post today&apos;s Reel and record it in the Reels tracker.</span>
          </li>
          <li className="flex items-start gap-2">
            <ArrowRight className="mt-0.5 h-3.5 w-3.5 text-primary shrink-0" />
            <span>Track <span className="text-primary font-medium">follows / 1K views</span> — that&apos;s the metric that matters.</span>
          </li>
        </ul>
      </div>
    </section>
  )
}

function Cell({ label, value, accent }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`mt-1 text-lg md:text-xl font-semibold tabular-nums ${accent || ''}`}>{value}</div>
    </div>
  )
}