'use client'
import { useEffect, useTransition } from 'react'
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
import { ideaSchema } from '@/lib/validations/ideas'
import { upsertIdea, deleteIdea } from '@/app/(app)/ideas/actions'
import { IDEA_STATUSES, SERIES_POTENTIAL, DIFFICULTY, REEL_FORMATS } from '@/lib/constants'
import { Loader2, Trash2 } from 'lucide-react'
import { useState } from 'react'

const defaults = {
  idea: '',
  pillar_id: null,
  format: null,
  hook: '',
  series_potential: null,
  difficulty: null,
  status: 'IDEA',
  expected_outcome: '',
  result: '',
  follow_up_idea: '',
  notes: '',
}

export function IdeaFormDialog({ open, onOpenChange, idea, pillars = [] }) {
  const [isPending, startTransition] = useTransition()
  const [confirmDelete, setConfirmDelete] = useState(false)
  const isEdit = !!idea

  const form = useForm({ resolver: zodResolver(ideaSchema), defaultValues: idea ?? defaults })
  const values = form.watch()

  useEffect(() => {
    if (open) { form.reset(idea ?? defaults); setConfirmDelete(false) }
  }, [open, idea, form])

  function onSubmit(data) {
    startTransition(async () => {
      const res = await upsertIdea(data, idea?.id)
      if (res?.error) { toast.error(res.error); return }
      toast.success(isEdit ? 'Idea updated' : 'Idea created')
      onOpenChange(false)
    })
  }

  function onDelete() {
    if (!idea) return
    if (!confirmDelete) { setConfirmDelete(true); return }
    startTransition(async () => {
      const res = await deleteIdea(idea.id)
      if (res?.error) { toast.error(res.error); return }
      toast.success('Idea deleted')
      onOpenChange(false)
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Idea' : 'New Content Idea'}</DialogTitle>
          <DialogDescription>
            Every idea starts with a one-line concept. Everything else is optional.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <Field label="Idea *">
            <Textarea rows={2} autoFocus {...form.register('idea')} placeholder="One line that captures the concept…" />
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
            <Field label="Format">
              <Select value={values.format ?? 'none'} onValueChange={(v) => form.setValue('format', v === 'none' ? null : v)}>
                <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">—</SelectItem>
                  {REEL_FORMATS.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Status">
              <Select value={values.status} onValueChange={(v) => form.setValue('status', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {IDEA_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <Field label="Hook">
            <Input {...form.register('hook')} placeholder="Opening line or visual…" />
          </Field>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Field label="Series Potential">
              <Select value={values.series_potential ?? 'none'} onValueChange={(v) => form.setValue('series_potential', v === 'none' ? null : v)}>
                <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">—</SelectItem>
                  {SERIES_POTENTIAL.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Difficulty">
              <Select value={values.difficulty ?? 'none'} onValueChange={(v) => form.setValue('difficulty', v === 'none' ? null : v)}>
                <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">—</SelectItem>
                  {DIFFICULTY.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <Field label="Expected outcome">
            <Textarea rows={2} {...form.register('expected_outcome')} placeholder="What does success look like?" />
          </Field>

          {(isEdit && (values.status === 'POSTED' || values.status === 'REPEAT' || values.status === 'KILLED')) && (
            <Field label="Actual result">
              <Textarea rows={2} {...form.register('result')} placeholder="What actually happened?" />
            </Field>
          )}

          <Field label="Follow-up idea">
            <Input {...form.register('follow_up_idea')} placeholder="If this works, do this next…" />
          </Field>

          <Field label="Notes">
            <Textarea rows={2} {...form.register('notes')} />
          </Field>

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
                {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : (isEdit ? 'Save changes' : 'Create idea')}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
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