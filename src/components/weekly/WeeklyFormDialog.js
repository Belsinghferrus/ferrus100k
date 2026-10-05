'use client'
import { useEffect, useState, useTransition } from 'react'
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
import { weeklySchema } from '@/lib/validations/weekly'
import { upsertWeekly, deleteWeekly, autoFillWeekly } from '@/app/(app)/weekly/actions'
import { formatNumber } from '@/lib/calculations/format'
import { Loader2, Trash2, Wand2 } from 'lucide-react'

const emptyDefaults = (weekNumber) => {
  const today = new Date()
  const day = today.getDay() || 7
  const monday = new Date(today)
  monday.setDate(today.getDate() - (day - 1))
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  return {
    week_number: weekNumber,
    start_date: monday.toISOString().slice(0, 10),
    end_date: sunday.toISOString().slice(0, 10),
    starting_followers: 0,
    ending_followers: 0,
    reels_posted: '',
    total_views: '',
    total_follows: '',
    best_reel_id: null,
    winning_pattern: '',
    what_failed: '',
    what_to_kill: '',
    what_to_repeat: '',
    next_week_experiment: '',
    notes: '',
  }
}

export function WeeklyFormDialog({ open, onOpenChange, weekly, reels = [], nextWeekNumber = 1, profileId }) {
  const [isPending, startTransition] = useTransition()
  const [autofilling, setAutofilling] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const isEdit = !!weekly

  const defaults = weekly ?? emptyDefaults(nextWeekNumber)
  const form = useForm({ resolver: zodResolver(weeklySchema), defaultValues: defaults })
  const values = form.watch()

  useEffect(() => {
    if (open) { form.reset(weekly ?? emptyDefaults(nextWeekNumber)); setConfirmDelete(false) }
  }, [open, weekly, nextWeekNumber, form])

  const netGrowth = Number(values.ending_followers || 0) - Number(values.starting_followers || 0)
  const avgFollows = values.reels_posted && values.total_follows
    ? Math.round(Number(values.total_follows) / Number(values.reels_posted))
    : null

  async function handleAutofill() {
    const start = values.start_date
    const end = values.end_date
    if (!start || !end) { toast.error('Fill in start and end dates first'); return }
    setAutofilling(true)
    const res = await autoFillWeekly({ start_date: start, end_date: end, profile_id: profileId })
    setAutofilling(false)
    if (res?.error) { toast.error(res.error); return }
    form.setValue('starting_followers', res.starting)
    form.setValue('ending_followers', res.ending)
    form.setValue('reels_posted', res.reels_posted)
    form.setValue('total_views', res.total_views)
    if (res.total_follows != null) form.setValue('total_follows', res.total_follows)
    toast.success('Auto-filled from daily entries + Reels')
  }

  function onSubmit(data) {
    startTransition(async () => {
      const res = await upsertWeekly(data, weekly?.id)
      if (res?.error) { toast.error(res.error); return }
      toast.success(isEdit ? 'Week updated' : 'Week saved')
      onOpenChange(false)
    })
  }

  function onDelete() {
    if (!weekly) return
    if (!confirmDelete) { setConfirmDelete(true); return }
    startTransition(async () => {
      const res = await deleteWeekly(weekly.id)
      if (res?.error) { toast.error(res.error); return }
      toast.success('Week deleted')
      onOpenChange(false)
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Week' : 'New Weekly Review'}</DialogTitle>
          <DialogDescription>
            Review the week. Keep it short — this is a decision log, not an essay.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <Section title="Week">
            <div className="grid grid-cols-3 gap-3">
              <Field label="Week #">
                <Input type="number" {...form.register('week_number')} />
              </Field>
              <Field label="Start">
                <Input type="date" {...form.register('start_date')} />
              </Field>
              <Field label="End">
                <Input type="date" {...form.register('end_date')} />
              </Field>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={handleAutofill} disabled={autofilling}>
              {autofilling ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Wand2 className="h-3.5 w-3.5" />}
              Auto-fill from data
            </Button>
          </Section>

          <Section title="Followers">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Starting Followers">
                <Input type="number" {...form.register('starting_followers')} />
              </Field>
              <Field label="Ending Followers">
                <Input type="number" {...form.register('ending_followers')} />
              </Field>
            </div>
            <div className="flex items-center justify-between rounded-md border border-border bg-accent/40 px-3 py-2 text-sm">
              <span className="text-muted-foreground">Net growth</span>
              <span className={`font-semibold tabular-nums ${netGrowth > 0 ? 'text-success' : netGrowth < 0 ? 'text-destructive' : ''}`}>
                {netGrowth > 0 ? '+' : ''}{formatNumber(netGrowth)}
              </span>
            </div>
          </Section>

          <Section title="Content">
            <div className="grid grid-cols-3 gap-3">
              <Field label="Reels Posted"><Input type="number" {...form.register('reels_posted')} placeholder="—" /></Field>
              <Field label="Total Views"><Input type="number" {...form.register('total_views')} placeholder="—" /></Field>
              <Field label="Total Follows"><Input type="number" {...form.register('total_follows')} placeholder="—" /></Field>
            </div>
            {avgFollows != null && (
              <p className="text-[11px] text-muted-foreground">
                Avg follows / Reel: <span className="text-primary font-medium">{formatNumber(avgFollows)}</span>
              </p>
            )}
            <Field label="Best Reel">
              <Select
                value={values.best_reel_id ?? 'none'}
                onValueChange={(v) => form.setValue('best_reel_id', v === 'none' ? null : v)}
              >
                <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">—</SelectItem>
                  {reels.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.title || `Reel #${r.reel_number ?? '—'}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </Section>

          <Section title="Decisions">
            <Field label="Winning pattern"><Textarea rows={2} {...form.register('winning_pattern')} /></Field>
            <Field label="What failed"><Textarea rows={2} {...form.register('what_failed')} /></Field>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Field label="What to kill"><Textarea rows={2} {...form.register('what_to_kill')} /></Field>
              <Field label="What to repeat"><Textarea rows={2} {...form.register('what_to_repeat')} /></Field>
            </div>
            <Field label="Next week's experiment"><Textarea rows={2} {...form.register('next_week_experiment')} /></Field>
            <Field label="Notes"><Textarea rows={2} {...form.register('notes')} /></Field>
          </Section>

          <DialogFooter className="flex-row justify-between sm:justify-between gap-2">
            <div>
              {isEdit && (
                <Button type="button" variant={confirmDelete ? 'destructive' : 'ghost'} size="sm" onClick={onDelete} disabled={isPending}>
                  {confirmDelete ? <><Trash2 className="h-3.5 w-3.5" /> Confirm</> : <><Trash2 className="h-3.5 w-3.5" /> Delete</>}
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : (isEdit ? 'Save' : 'Save week')}
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