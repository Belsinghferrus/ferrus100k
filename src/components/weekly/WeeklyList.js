'use client'
import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/shell/EmptyState'
import { WeeklyFormDialog } from '@/components/weekly/WeeklyFormDialog'
import { formatNumber, formatDelta, formatDate } from '@/lib/calculations/format'
import { Plus, CalendarDays, Pencil } from 'lucide-react'

export function WeeklyList({ weeks, reels, profileId, nextWeekNumber }) {
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)

  function openNew() { setEditing(null); setOpen(true) }
  function openEdit(w) { setEditing(w); setOpen(true) }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-muted-foreground">
          {weeks.length} week{weeks.length === 1 ? '' : 's'} reviewed
        </div>
        <Button onClick={openNew}>
          <Plus className="h-3.5 w-3.5" /> New Week
        </Button>
      </div>

      {weeks.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="No weekly reviews yet"
          description="End-of-week reflection is where strategy emerges. Start with this week."
          action={<Button size="sm" onClick={openNew}><Plus className="h-3.5 w-3.5" /> Review this week</Button>}
        />
      ) : (
        <div className="space-y-3">
          {weeks.map((w) => {
            const net = w.ending_followers - w.starting_followers
            const avgFollows = w.reels_posted && w.total_follows
              ? Math.round(w.total_follows / w.reels_posted) : null
            return (
              <Card key={w.id}>
                <CardContent className="p-4 md:p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="inline-flex items-center rounded-md border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                          Week {w.week_number}
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          {formatDate(w.start_date, 'MMM d')} → {formatDate(w.end_date, 'MMM d, yyyy')}
                        </span>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(w)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                  </div>

                  <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-3">
                    <Stat label="Start"     value={formatNumber(w.starting_followers)} />
                    <Stat label="End"       value={formatNumber(w.ending_followers)} />
                    <Stat
                      label="Net Growth"
                      value={formatDelta(net)}
                      accent={net > 0 ? 'text-success' : net < 0 ? 'text-destructive' : ''}
                    />
                    <Stat label="Reels"     value={w.reels_posted ?? '—'} />
                    <Stat
                      label="Avg / Reel"
                      value={avgFollows != null ? formatNumber(avgFollows) : 'Data not available'}
                      accent="text-primary"
                    />
                  </div>

                  {(w.winning_pattern || w.what_to_repeat || w.next_week_experiment) && (
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 border-t border-border pt-3">
                      {w.winning_pattern && <Note label="Winning pattern" text={w.winning_pattern} />}
                      {w.what_to_repeat && <Note label="Repeat" text={w.what_to_repeat} accent="text-success" />}
                      {w.next_week_experiment && <Note label="Next test" text={w.next_week_experiment} accent="text-primary" />}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <WeeklyFormDialog
        open={open}
        onOpenChange={setOpen}
        weekly={editing}
        reels={reels}
        profileId={profileId}
        nextWeekNumber={nextWeekNumber}
      />
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

function Note({ label, text, accent }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <p className={`mt-1 text-xs ${accent || 'text-foreground'} line-clamp-3`}>{text}</p>
    </div>
  )
}