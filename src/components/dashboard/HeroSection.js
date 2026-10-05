import { StatusPill } from '@/components/dashboard/StatusPill'
import { formatNumber, formatCompact, formatPercent, formatDate } from '@/lib/calculations/format'
import { Calendar, Target, TrendingUp, Flag } from 'lucide-react'

export function HeroSection({ profile, currentFollowers, trajectory }) {
  const pct = Math.min(100, trajectory.progressPct)

  return (
    <section className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-card via-card to-[#1a1608] p-6 md:p-8">
      {/* yellow glow */}
      <div className="pointer-events-none absolute -top-32 -right-24 h-80 w-80 rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -left-24 h-72 w-72 rounded-full bg-success/10 blur-3xl" />

      <div className="relative flex items-start justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-primary shadow-[0_0_12px_#FFD02B]" />
          <span className="text-[11px] font-semibold tracking-[0.3em] text-muted-foreground">
            FERRUS 100K
          </span>
        </div>
        <StatusPill status={trajectory.status} delta={trajectory.delta} />
      </div>

      <div className="relative mt-6 flex items-end gap-3 md:gap-5">
        <div>
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Current</div>
          <div className="mt-1 text-5xl md:text-6xl font-semibold tracking-tight tabular-nums">
            {formatCompact(currentFollowers)}
          </div>
        </div>
        <div className="pb-2 md:pb-3 text-3xl md:text-4xl text-muted-foreground/60">→</div>
        <div>
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Target</div>
          <div className="mt-1 text-5xl md:text-6xl font-semibold tracking-tight tabular-nums text-primary">
            {formatCompact(profile.target_followers)}
          </div>
        </div>
      </div>

      <div className="relative mt-8">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground tabular-nums">
            {formatNumber(currentFollowers)} / {formatNumber(profile.target_followers)}
          </span>
          <span className="font-semibold text-foreground tabular-nums">
            {formatPercent(trajectory.progressPct, 2)}
          </span>
        </div>
        <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-accent/80">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary via-primary to-orange-400 shadow-[0_0_20px_rgba(255,208,43,0.4)] transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div className="relative mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <HeroStat icon={Flag}      label="Remaining"  value={formatCompact(trajectory.remaining)} accent="text-primary" />
        <HeroStat icon={Calendar}  label="Days Left"  value={formatNumber(trajectory.daysRemaining)} />
        <HeroStat icon={TrendingUp} label="Req / Day" value={formatNumber(Math.ceil(trajectory.requiredPerDay))} accent="text-primary" />
        <HeroStat icon={Target}    label="Deadline"   value={formatDate(profile.deadline, 'MMM d, yyyy')} />
      </div>
    </section>
  )
}

function HeroStat({ icon: Icon, label, value, accent }) {
  return (
    <div className="flex items-start gap-2.5">
      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-accent/60 text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div className="min-w-0">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className={`mt-0.5 text-sm font-semibold tabular-nums truncate ${accent || ''}`}>{value}</div>
      </div>
    </div>
  )
}