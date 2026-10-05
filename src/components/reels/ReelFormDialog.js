'use client'
import { useEffect, useMemo, useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { reelSchema } from '@/lib/validations/reels'
import { upsertReel, deleteReel } from '@/app/(app)/reels/actions'
import { REEL_FORMATS, VERDICTS } from '@/lib/constants'
import { formatNumber, formatDecimal } from '@/lib/calculations/format'
import { followsPer1k, engagementRate, shareRate, saveRate } from '@/lib/calculations/reels'
import { cn } from '@/lib/utils'
import { Loader2, Trash2 } from 'lucide-react'

const emptyDefaults = (nextNumber) => ({
  posted_at: new Date().toISOString().slice(0, 10),
  reel_number: nextNumber,
  title: '',
  pillar_id: null,
  series_id: null,
  series_episode: '',
  hook: '',
  format: null,
  views: 0,
  watch_time_seconds: '',
  avg_watch_time_seconds: '',
  likes: 0,
  comments: 0,
  saves: 0,
  shares: 0,
  accounts_engaged: 0,
  profile_visits: '',
  follows: '',
  non_follower_pct: '',
  verdict: null,
  what_worked: '',
  what_didnt_work: '',
  next_test: '',
})

export function ReelFormDialog({ open, onOpenChange, reel, pillars = [], series = [], nextNumber = 1 }) {
  const [isPending, startTransition] = useTransition()
  const [confirmDelete, setConfirmDelete] = useState(false)
  const isEdit = !!reel

  const defaults = useMemo(
    () => (reel ? { ...reel, pillar_id: reel.pillar_id ?? null, series_id: reel.series_id ?? null } : emptyDefaults(nextNumber)),
    [reel, nextNumber]
  )

  const form = useForm({ resolver: zodResolver(reelSchema), defaultValues: defaults })

  useEffect(() => { if (open) { form.reset(defaults); setConfirmDelete(false) } }, [open, defaults, form])

  const values = form.watch()

  const preview = useMemo(() => {
    const views = Number(values.views) || 0
    const follows = values.follows === '' ? null : Number(values.follows)
    return {
      fp1k: followsPer1k(follows, views),
      er: engagementRate(Number(values.accounts_engaged) || 0, views),
      sr: shareRate(Number(values.shares) || 0, views),
      svr: saveRate(Number(values.saves) || 0, views),
    }
  }, [values])

  function onSubmit(data) {
    startTransition(async () => {
      const res = await upsertReel(data, reel?.id)
      if (res?.error) { toast.error(res.error); return }
      toast.success(isEdit ? 'Reel updated' : 'Reel saved')
      onOpenChange(false)
    })
  }

  function onDelete() {
    if (!reel) return
    if (!confirmDelete) { setConfirmDelete(true); return }
    startTransition(async () => {
      const res = await deleteReel(reel.id)
      if (res?.error) { toast.error(res.error); return }
      toast.success('Reel deleted')
      onOpenChange(false)
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Reel' : 'Add Reel'}</DialogTitle>
          <DialogDescription>
            Every metric is optional except date + views. Follows drives the ranking.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          {/* Identification */}
          <Section title="Identification">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <Field label="Date *">
                <Input type="date" {...form.register('posted_at')} />
              </Field>
              <Field label="Reel #">
                <Input type="number" {...form.register('reel_number')} placeholder="auto" />
              </Field>
              <Field label="Format">
                <Select value={values.format ?? 'none'} onValueChange={(v) => form.setValue('format', v === 'none' ? null : v)}>
                  <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">—</SelectItem>
                    {REEL_FORMATS.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>
            </div>
            <Field label="Title">
              <Input {...form.register('title')} placeholder="e.g. 7-Day Surfing Challenge — Day 1" />
            </Field>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Field label="Pillar">
                <Select value={values.pillar_id ?? 'none'} onValueChange={(v) => form.setValue('pillar_id', v === 'none' ? null : v)}>
                  <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">—</SelectItem>
                    {pillars.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Series">
                <Select value={values.series_id ?? 'none'} onValueChange={(v) => form.setValue('series_id', v === 'none' ? null : v)}>
                  <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">—</SelectItem>
                    {series.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Episode #">
                <Input type="number" {...form.register('series_episode')} placeholder="—" />
              </Field>
            </div>
            <Field label="Hook">
              <Textarea rows={2} {...form.register('hook')} placeholder="First 1–2 seconds of the Reel…" />
            </Field>
          </Section>

          {/* Performance */}
          <Section title="Performance">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <Field label="Views *"><Input type="number" {...form.register('views')} /></Field>
              <Field label="Watch Time (s)"><Input type="number" {...form.register('watch_time_seconds')} /></Field>
              <Field label="Avg Watch (s)"><Input type="number" step="0.01" {...form.register('avg_watch_time_seconds')} /></Field>
              <Field label="Likes"><Input type="number" {...form.register('likes')} /></Field>
              <Field label="Comments"><Input type="number" {...form.register('comments')} /></Field>
              <Field label="Saves"><Input type="number" {...form.register('saves')} /></Field>
              <Field label="Shares"><Input type="number" {...form.register('shares')} /></Field>
              <Field label="Accounts Engaged"><Input type="number" {...form.register('accounts_engaged')} /></Field>
              <Field label="Profile Visits"><Input type="number" {...form.register('profile_visits')} placeholder="—" /></Field>
              <Field label="Follows"><Input type="number" {...form.register('follows')} placeholder="—" /></Field>
              <Field label="Non-Follower %"><Input type="number" step="0.1" {...form.register('non_follower_pct')} placeholder="—" /></Field>
            </div>

            {/* Live preview */}
            <div className="rounded-lg border border-primary/30 bg-gradient-to-br from-primary/[0.06] to-transparent p-3">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
                Computed live
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Metric label="Follows / 1K" value={preview.fp1k != null ? formatDecimal(preview.fp1k, 2) : '—'} accent />
                <Metric label="Engagement" value={preview.er != null ? formatDecimal(preview.er, 2) + '%' : '—'} />
                <Metric label="Share Rate" value={preview.sr != null ? formatDecimal(preview.sr, 2) + '%' : '—'} />
                <Metric label="Save Rate" value={preview.svr != null ? formatDecimal(preview.svr, 2) + '%' : '—'} />
              </div>
            </div>
          </Section>

          {/* Verdict */}
          <Section title="Verdict">
            <div className="flex flex-wrap gap-2">
              {VERDICTS.map((v) => {
                const active = values.verdict === v
                const cls = v === 'SCALE' ? 'border-success/50 bg-success/15 text-success'
                  : v === 'TEST' ? 'border-warning/50 bg-warning/15 text-warning'
                  : 'border-destructive/50 bg-destructive/15 text-destructive'
                return (
                  <button
                    key={v}
                    type="button"
                    onClick={() => { form.setValue('verdict', active ? null : v, { shouldDirty: true }); form.setValue('verdict_override', true) }}
                    className={cn(
                      'rounded-md border px-4 py-2 text-xs font-semibold tracking-wide transition-all',
                      active ? cls : 'border-border bg-accent text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {v}
                  </button>
                )
              })}
            </div>
          </Section>

          {/* Learnings */}
          <Section title="Learnings">
            <Field label="What worked"><Textarea rows={2} {...form.register('what_worked')} /></Field>
            <Field label="What didn't work"><Textarea rows={2} {...form.register('what_didnt_work')} /></Field>
            <Field label="Next test"><Textarea rows={2} {...form.register('next_test')} /></Field>
          </Section>

          <DialogFooter className="flex-row justify-between sm:justify-between gap-2">
            <div>
              {isEdit && (
                <Button type="button" variant={confirmDelete ? 'destructive' : 'ghost'} size="sm" onClick={onDelete} disabled={isPending}>
                  {confirmDelete ? <><Trash2 className="h-3.5 w-3.5" /> Confirm delete</> : <><Trash2 className="h-3.5 w-3.5" /> Delete</>}
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : (isEdit ? 'Save changes' : 'Save Reel')}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function Section({ title, children }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{title}</span>
        <div className="h-px flex-1 bg-border" />
      </div>
      {children}
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[11px] text-muted-foreground">{label}</Label>
      {children}
    </div>
  )
}

function Metric({ label, value, accent }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={cn('mt-0.5 text-base font-semibold tabular-nums', accent && 'text-primary')}>{value}</div>
    </div>
  )
}