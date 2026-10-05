'use client'
import { useMemo, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/shell/EmptyState'
import { SeriesFormDialog } from '@/components/series/SeriesFormDialog'
import { formatNumber, formatDecimal, formatDate } from '@/lib/calculations/format'
import { Plus, Sparkles, Pencil, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

const STATUS_STYLES = {
  active:   'border-primary/40 bg-primary/10 text-primary',
  paused:   'border-warning/40 bg-warning/10 text-warning',
  complete: 'border-success/40 bg-success/10 text-success',
  archived: 'border-border bg-accent text-muted-foreground',
}

export function SeriesList({ series, reels }) {
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [expandedId, setExpandedId] = useState(null)

  const reelsBySeries = useMemo(() => {
    const m = new Map()
    for (const s of series) m.set(s.id, [])
    for (const r of reels) {
      if (r.series_id && m.has(r.series_id)) m.get(r.series_id).push(r)
    }
    return m
  }, [series, reels])

  function openNew() { setEditing(null); setOpen(true) }
  function openEdit(s) { setEditing(s); setOpen(true) }

  function stats(sid) {
    const r = reelsBySeries.get(sid) ?? []
    const views = r.reduce((sum, x) => sum + (x.views || 0), 0)
    const followsKnown = r.filter((x) => x.follows != null)
    const follows = followsKnown.reduce((sum, x) => sum + x.follows, 0)
    const avgViews = r.length ? Math.round(views / r.length) : 0
    const avgFollows = followsKnown.length ? Math.round(follows / followsKnown.length) : null
    const totalFp1k = r.filter((x) => x.follows_per_1k != null)
    const bestFp1k = totalFp1k.length
      ? totalFp1k.reduce((best, x) => (!best || x.follows_per_1k > best.follows_per_1k ? x : best), null)
      : null
    const bestFollows = followsKnown.length
      ? followsKnown.reduce((best, x) => (!best || x.follows > best.follows ? x : best), null)
      : null
    return { r, views, follows, avgViews, avgFollows, bestFp1k, bestFollows }
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-muted-foreground">
          {series.length} series · {reels.filter((r) => r.series_id).length} Reels assigned
        </div>
        <Button onClick={openNew}>
          <Plus className="h-3.5 w-3.5" /> New Series
        </Button>
      </div>

      {series.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title="No series yet"
          description="Series build momentum and compounding reach. Group related Reels to test if the format should continue."
          action={<Button size="sm" onClick={openNew}><Plus className="h-3.5 w-3.5" /> Create first series</Button>}
        />
      ) : (
        <div className="space-y-3">
          {series.map((s) => {
            const st = stats(s.id)
            const expanded = expandedId === s.id
            return (
              <Card key={s.id}>
                <CardContent className="p-4 md:p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-semibold truncate">{s.name}</h3>
                        <Badge variant="outline" className={STATUS_STYLES[s.status]}>{s.status}</Badge>
                      </div>
                      {s.description && (
                        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{s.description}</p>
                      )}
                      <div className="mt-1 text-[11px] text-muted-foreground">
                        {s.planned_episodes ? `${st.r.length} / ${s.planned_episodes} episodes` : `${st.r.length} episodes`}
                        {s.start_date ? ` · started ${formatDate(s.start_date, 'MMM d, yyyy')}` : ''}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(s)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => setExpandedId(expanded ? null : s.id)}
                      >
                        <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', expanded && 'rotate-180')} />
                      </Button>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Stat label="Total Views" value={formatNumber(st.views)} />
                    <Stat label="Avg Views"   value={formatNumber(st.avgViews)} />
                    <Stat
                      label="Total Follows"
                      value={st.r.some((x) => x.follows != null) ? formatNumber(st.follows) : 'Data not available'}
                      accent="text-primary"
                    />
                    <Stat
                      label="Avg Follows / Reel"
                      value={st.avgFollows != null ? formatNumber(st.avgFollows) : 'Data not available'}
                    />
                  </div>

                  {st.bestFollows && (
                    <div className="mt-3 rounded-md border border-primary/30 bg-primary/[0.05] px-3 py-2 text-[11px]">
                      <span className="text-muted-foreground">Best episode: </span>
                      <span className="font-medium">{st.bestFollows.title || `Reel #${st.bestFollows.reel_number ?? '—'}`}</span>
                      <span className="text-muted-foreground"> · {formatNumber(st.bestFollows.follows)} follows</span>
                      {st.bestFollows.follows_per_1k != null && (
                        <span className="text-primary"> · {formatDecimal(st.bestFollows.follows_per_1k, 2)} / 1K</span>
                      )}
                    </div>
                  )}

                  {expanded && (
                    <div className="mt-4 border-t border-border pt-3">
                      {st.r.length === 0 ? (
                        <p className="text-sm text-muted-foreground py-2">No Reels assigned yet. Edit a Reel to link it to this series.</p>
                      ) : (
                        <ul className="space-y-2">
                          {st.r
                            .slice()
                            .sort((a, b) => (a.series_episode ?? 999) - (b.series_episode ?? 999))
                            .map((r) => (
                              <li key={r.id} className="flex items-center justify-between gap-3 text-sm">
                                <span className="truncate">
                                  {r.series_episode ? `Ep ${r.series_episode} · ` : ''}
                                  {r.title || `Reel #${r.reel_number ?? '—'}`}
                                </span>
                                <span className="shrink-0 text-[11px] text-muted-foreground tabular-nums">
                                  {formatNumber(r.views)} views
                                  {r.follows != null ? ` · ${formatNumber(r.follows)} follows` : ''}
                                </span>
                              </li>
                            ))}
                        </ul>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <SeriesFormDialog open={open} onOpenChange={setOpen} series={editing} />
    </>
  )
}

function Stat({ label, value, accent }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`mt-0.5 text-sm font-semibold tabular-nums ${accent || ''}`}>{value}</div>
    </div>
  )
}