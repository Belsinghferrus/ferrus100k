import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import {
  Target, TrendingUp, Activity, BarChart3, Flag, CalendarDays, Clock, AlertTriangle
} from 'lucide-react'
import { formatNumber, formatCompact } from '@/lib/calculations/format'

const COLORS = {
  primary: { text: 'text-primary', bg: 'bg-primary/10', ring: 'ring-primary/20' },
  success: { text: 'text-success', bg: 'bg-success/10', ring: 'ring-success/20' },
  danger:  { text: 'text-destructive', bg: 'bg-destructive/10', ring: 'ring-destructive/20' },
  warning: { text: 'text-warning', bg: 'bg-warning/10', ring: 'ring-warning/20' },
  info:    { text: 'text-sky-400', bg: 'bg-sky-400/10', ring: 'ring-sky-400/20' },
  violet:  { text: 'text-violet-400', bg: 'bg-violet-400/10', ring: 'ring-violet-400/20' },
  muted:   { text: 'text-muted-foreground', bg: 'bg-accent', ring: 'ring-border' },
}

export function KpiGrid({ trajectory }) {
  const ahead = trajectory.status === 'AHEAD'
  const onTrack = trajectory.status === 'ON_TRACK'
  const paceColor = ahead ? 'success' : onTrack ? 'warning' : 'danger'

  const kpis = [
    {
      label: 'Required / Week',
      value: formatNumber(Math.ceil(trajectory.requiredPerWeek)),
      icon: TrendingUp,
      color: 'primary',
      hint: 'to hit deadline',
    },
    {
      label: 'Actual / Day',
      value: formatNumber(Math.round(trajectory.actualPerDay)),
      icon: Activity,
      color: paceColor,
      hint: 'current pace',
    },
    {
      label: 'Actual / Week',
      value: formatNumber(Math.round(trajectory.actualPerWeek)),
      icon: BarChart3,
      color: paceColor,
      hint: 'current pace',
    },
    {
      label: 'Projected Final',
      value: formatCompact(trajectory.projectedFinal),
      icon: Flag,
      color: trajectory.projectedFinal >= trajectory.target ? 'success' : 'warning',
      hint: 'at this pace',
    },
    {
      label: 'Projected 100K',
      value: trajectory.projectedDateToTarget
        ? trajectory.projectedDateToTarget.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        : 'Not available',
      icon: CalendarDays,
      color: 'info',
      hint: 'eta',
    },
    {
      label: 'Shortfall / Week',
      value: trajectory.shortfallPerWeek > 0
        ? formatNumber(Math.ceil(trajectory.shortfallPerWeek))
        : 'On pace',
      icon: AlertTriangle,
      color: trajectory.shortfallPerWeek > 0 ? 'danger' : 'success',
      hint: 'extra needed',
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
      {kpis.map((k) => (
        <Kpi key={k.label} {...k} />
      ))}
    </div>
  )
}

function Kpi({ label, value, icon: Icon, color, hint }) {
  const c = COLORS[color] || COLORS.muted
  return (
    <Card className="overflow-hidden border-border/80">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
          <div className={cn('flex h-6 w-6 items-center justify-center rounded-md', c.bg)}>
            <Icon className={cn('h-3 w-3', c.text)} />
          </div>
        </div>
        <div className={cn('mt-3 text-xl md:text-2xl font-semibold tracking-tight tabular-nums', c.text)}>
          {value}
        </div>
        {hint && <div className="mt-1 text-[10px] text-muted-foreground">{hint}</div>}
      </CardContent>
    </Card>
  )
}