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
import { experimentSchema } from '@/lib/validations/experiments'
import { upsertExperiment, deleteExperiment } from '@/app/(app)/experiments/actions'
import { EXPERIMENT_STATUS, EXPERIMENT_WINNER } from '@/lib/constants'
import { Loader2, Trash2 } from 'lucide-react'

const defaults = {
  name: '', hypothesis: '', start_date: '', end_date: '',
  variable: '', control: '', test: '',
  expected_result: '', actual_result: '', winner: null,
  learning: '', next_action: '', status: 'PLANNED',
}

export function ExperimentFormDialog({ open, onOpenChange, experiment }) {
  const [isPending, startTransition] = useTransition()
  const [confirmDelete, setConfirmDelete] = useState(false)
  const isEdit = !!experiment

  const form = useForm({ resolver: zodResolver(experimentSchema), defaultValues: experiment ?? defaults })
  const values = form.watch()

  useEffect(() => {
    if (open) { form.reset(experiment ?? defaults); setConfirmDelete(false) }
  }, [open, experiment, form])

  function onSubmit(data) {
    startTransition(async () => {
      const res = await upsertExperiment(data, experiment?.id)
      if (res?.error) { toast.error(res.error); return }
      toast.success(isEdit ? 'Experiment updated' : 'Experiment created')
      onOpenChange(false)
    })
  }

  function onDelete() {
    if (!experiment) return
    if (!confirmDelete) { setConfirmDelete(true); return }
    startTransition(async () => {
      const res = await deleteExperiment(experiment.id)
      if (res?.error) { toast.error(res.error); return }
      toast.success('Experiment deleted')
      onOpenChange(false)
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Experiment' : 'New Experiment'}</DialogTitle>
          <DialogDescription>
            Test one variable at a time. Write the hypothesis before you run it.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <Section title="Setup">
            <Field label="Name *">
              <Input autoFocus {...form.register('name')} placeholder="e.g. Challenge content vs educational content" />
            </Field>
            <Field label="Hypothesis">
              <Textarea rows={2} {...form.register('hypothesis')} placeholder="If I do X, then Y because Z…" />
            </Field>
            <div className="grid grid-cols-3 gap-3">
              <Field label="Start"><Input type="date" {...form.register('start_date')} /></Field>
              <Field label="End"><Input type="date" {...form.register('end_date')} /></Field>
              <Field label="Status">
                <Select value={values.status} onValueChange={(v) => form.setValue('status', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {EXPERIMENT_STATUS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>
            </div>
            <Field label="Variable being tested">
              <Input {...form.register('variable')} placeholder="e.g. Hook style" />
            </Field>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Field label="Control"><Textarea rows={2} {...form.register('control')} placeholder="What you normally do" /></Field>
              <Field label="Test"><Textarea rows={2} {...form.register('test')} placeholder="What you're changing" /></Field>
            </div>
          </Section>

          <Section title="Result">
            <Field label="Expected result"><Textarea rows={2} {...form.register('expected_result')} /></Field>
            <Field label="Actual result"><Textarea rows={2} {...form.register('actual_result')} /></Field>
            <Field label="Winner">
              <Select value={values.winner ?? 'none'} onValueChange={(v) => form.setValue('winner', v === 'none' ? null : v)}>
                <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">—</SelectItem>
                  {EXPERIMENT_WINNER.map((w) => <SelectItem key={w} value={w}>{w}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Learning"><Textarea rows={2} {...form.register('learning')} /></Field>
            <Field label="Next action"><Textarea rows={2} {...form.register('next_action')} /></Field>
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
                {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : (isEdit ? 'Save' : 'Create experiment')}
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