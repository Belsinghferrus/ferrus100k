import { cn } from '@/lib/utils'

const STYLES = {
  SCALE: 'bg-success/15 text-success border-success/30',
  TEST:  'bg-warning/15 text-warning border-warning/30',
  KILL:  'bg-destructive/15 text-destructive border-destructive/30',
}

export function VerdictBadge({ verdict, size = 'sm', className }) {
  if (!verdict) {
    return (
      <span className={cn('inline-flex items-center rounded-md border border-border bg-accent px-2 py-0.5 text-[10px] font-semibold text-muted-foreground', className)}>
        —
      </span>
    )
  }
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border font-semibold tracking-wide',
        size === 'lg' ? 'px-2.5 py-1 text-xs' : 'px-2 py-0.5 text-[10px]',
        STYLES[verdict] || 'border-border bg-accent text-muted-foreground',
        className
      )}
    >
      {verdict}
    </span>
  )
}