'use client'
import { useMemo, useState, useTransition } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { EmptyState } from '@/components/shell/EmptyState'
import { ExperimentFormDialog } from '@/components/experiments/ExperimentFormDialog'
import { setExperimentStatus, deleteExperiment } from '@/app/(app)/experiments/actions'
import { formatDate } from '@/lib/calculations/format'
import { Plus, FlaskConical, MoreVertical, Pencil, Trash2, Play, CheckCircle, Pause } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const STATUS_STYLES = {
  PLANNED: 'border-border bg-accent text-muted-foreground',
  RUNNING: 'border-warning/40 bg-warning/10 text-warning',
  COMPLETE: 'border-success/40 bg-success/10 text-success',
}

const WINNER_STYLES = {
  CONTROL: 'border-border bg-accent text-foreground',
  TEST: 'border-primary/40 bg-primary/10 text-primary',
  INCONCLUSIVE: 'border-border bg-accent text-muted-foreground',
}

export function ExperimentsBoard({ experiments }) {
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [activeTab, setActiveTab] = useState('ALL')
  const [pendingId, setPendingId] = useState(null)
  const [, startTransition] = useTransition()

  const filtered = useMemo(() => {
    if (activeTab === 'ALL') return experiments
    return experiments.filter((e) => e.status === activeTab)
  }, [experiments, activeTab])

  const counts = useMemo(() => ({
    ALL: experiments.length,
    PLANNED: experiments.filter((e) => e.status === 'PLANNED').length,
    RUNNING: experiments.filter((e) => e.status === 'RUNNING').length,
    COMPLETE: experiments.filter((e) => e.status === 'COMPLETE').length,
  }), [experiments])

  function openNew() { setEditing(null); setOpen(true) }
  function openEdit(e) { setEditing(e); setOpen(true) }

  function changeStatus(id, status) {
    setPendingId(id)
    startTransition(async () => {
      const res = await setExperimentStatus(id, status)
      setPendingId(null)
      if (res?.error) { toast.error(res.error); return }
      toast.success(`Marked ${status}`)
    })
  }

  function removeExperiment(id) {
    setPendingId(id)
    startTransition(async () => {
      const res = await deleteExperiment(id)
      setPendingId(null)
      if (res?.error) { toast.error(res.error); return }
      toast.success('Experiment deleted')
    })
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="ALL">All · {counts.ALL}</TabsTrigger>
            <TabsTrigger value="PLANNED">Planned · {counts.PLANNED}</TabsTrigger>
            <TabsTrigger value="RUNNING">Running · {counts.RUNNING}</TabsTrigger>
            <TabsTrigger value="COMPLETE">Complete · {counts.COMPLETE}</TabsTrigger>
          </TabsList>
        </Tabs>
        <Button onClick={openNew}>
          <Plus className="h-3.5 w-3.5" /> New Experiment
        </Button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={FlaskConical}
          title={experiments.length === 0 ? 'No experiments yet' : 'No experiments in this tab'}
          description="Turn the account into a lab. Test one variable at a time."
          action={experiments.length === 0 ? <Button size="sm" onClick={openNew}><Plus className="h-3.5 w-3.5" /> Start an experiment</Button> : null}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filtered.map((e) => (
            <Card key={e.id} className={cn('transition-opacity', pendingId === e.id && 'opacity-60')}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className={STATUS_STYLES[e.status]}>{e.status}</Badge>
                      {e.winner && (
                        <Badge variant="outline" className={WINNER_STYLES[e.winner]}>
                          Winner: {e.winner}
                        </Badge>
                      )}
                    </div>
                    <h3 className="mt-2 text-sm font-semibold leading-snug">{e.name}</h3>
                    {e.variable && (
                      <div className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                        Variable: {e.variable}
                      </div>
                    )}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0">
                        <MoreVertical className="h-3.5 w-3.5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onSelect={() => openEdit(e)}>
                        <Pencil className="h-3.5 w-3.5" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => changeStatus(e.id, 'RUNNING')}>
                        <Play className="h-3.5 w-3.5" /> Mark RUNNING
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => changeStatus(e.id, 'COMPLETE')}>
                        <CheckCircle className="h-3.5 w-3.5" /> Mark COMPLETE
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => changeStatus(e.id, 'PLANNED')}>
                        <Pause className="h-3.5 w-3.5" /> Mark PLANNED
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => removeExperiment(e.id)} className="text-destructive focus:text-destructive">
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {e.hypothesis && (
                  <p className="mt-3 text-xs text-muted-foreground italic line-clamp-3">
                    &ldquo;{e.hypothesis}&rdquo;
                  </p>
                )}

                <div className="mt-3 grid grid-cols-2 gap-3 border-t border-border pt-3">
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Control</div>
                    <p className="mt-0.5 text-[11px] line-clamp-2">{e.control || '—'}</p>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Test</div>
                    <p className="mt-0.5 text-[11px] line-clamp-2">{e.test || '—'}</p>
                  </div>
                </div>

                {(e.start_date || e.end_date) && (
                  <div className="mt-3 text-[10px] text-muted-foreground">
                    {e.start_date && formatDate(e.start_date, 'MMM d')}
                    {e.start_date && e.end_date && ' → '}
                    {e.end_date && formatDate(e.end_date, 'MMM d, yyyy')}
                  </div>
                )}

                {e.learning && (
                  <div className="mt-3 rounded-md border border-primary/30 bg-primary/[0.05] px-3 py-2">
                    <div className="text-[10px] uppercase tracking-wider text-primary">Learning</div>
                    <p className="mt-1 text-[11px] line-clamp-3">{e.learning}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ExperimentFormDialog open={open} onOpenChange={setOpen} experiment={editing} />
    </>
  )
}