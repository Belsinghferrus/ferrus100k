import { cn } from '@/lib/utils'
import { formatNumber } from '@/lib/calculations/format'
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react'

export function StatusPill({ status, delta, className }) {
  const rounded = Math.round(delta ?? 0)

  const config = {
    AHEAD: {
      cls: 'bg-success/15 text-success border-success/30',
      icon: ArrowUpRight,
      label: `AHEAD BY ${formatNumber(rounded)}`,
    },
    BEHIND: {
      cls: 'bg-destructive/15 text-destructive border-destructive/30',
      icon: ArrowDownRight,
      label: `BEHIND BY ${formatNumber(Math.abs(rounded))}`,
    },
    ON_TRACK: {
      cls: 'bg-warning/15 text-warning border-warning/30',
      icon: Minus,
      label: 'ON TRACK',
    },
  }[status] || {
    cls: 'bg-accent text-muted-foreground border-border',
    icon: Minus,
    label: '—',
  }

  const Icon = config.icon

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold tracking-wide',
        config.cls,
        className
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {config.label}
    </span>
  )
}