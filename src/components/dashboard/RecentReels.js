import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatNumber, formatDecimal, formatDate, pillarColor } from '@/lib/calculations/format'
import { Film } from 'lucide-react'

const VERDICT_STYLES = {
  SCALE: 'bg-success/15 text-success border-success/30',
  TEST:  'bg-warning/15 text-warning border-warning/30',
  KILL:  'bg-destructive/15 text-destructive border-destructive/30',
}

export function RecentReels({ reels }) {
  if (!reels?.length) {
    return (
      <Card>
        <CardContent className="p-6 flex items-center gap-3 text-sm text-muted-foreground">
          <Film className="h-4 w-4" />
          No Reels yet. Add one from the Reels page.
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-2">
      {reels.map((r) => (
        <Link
          key={r.id}
          href="/reels"
          className="group flex items-center justify-between gap-3 rounded-lg border border-border bg-card p-3.5 transition-colors hover:border-primary/40 hover:bg-accent/40"
        >
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: pillarColor(r.pillar_name) }}
              />
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground truncate">
                {r.pillar_name || 'Unassigned'}
              </span>
              {r.verdict && (
                <Badge variant="outline" className={`text-[10px] py-0 px-1.5 h-4 ${VERDICT_STYLES[r.verdict]}`}>
                  {r.verdict}
                </Badge>
              )}
            </div>
            <div className="mt-1 text-sm font-medium truncate">
              {r.title || `Reel #${r.reel_number ?? '—'}`}
            </div>
            <div className="mt-0.5 text-[11px] text-muted-foreground">
              {formatDate(r.posted_at, 'MMM d')} · {formatNumber(r.views)} views
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Follows / 1K</div>
            <div className="text-lg font-semibold tabular-nums text-primary">
              {r.follows_per_1k != null ? formatDecimal(r.follows_per_1k, 2) : '—'}
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}