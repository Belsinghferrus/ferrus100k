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
import { seriesSchema } from '@/lib/validations/series'
import { upsertSeries, deleteSeries } from '@/app/(app)/series/actions'
import { Loader2, Trash2 } from 'lucide-react'

const STATUSES = ['active', 'paused', 'complete', 'archived']
const defaults = { name: '', description: '', planned_episodes: '', status: 'active', start_date: '' }

export function SeriesFormDialog({ open, onOpenChange, series }) {
  const [isPending, startTransition] = useTransition()
  const [confirmDelete, setConfirmDelete] = useState(false)
  const isEdit = !!series

  const form = useForm({ resolver: zodResolver(seriesSchema), defaultValues: series ?? defaults })
  const values = form.watch()

  useEffect(() => {
    if (open) { form.reset(series ?? defaults); setConfirmDelete(false) }
  }, [open, series, form])

  function onSubmit(data) {
    startTransition(async () => {
      const res = await upsertSeries(data, series?.id)
      if (res?.error) { toast.error(res.error); return }
      toast.success(isEdit ? 'Series updated' : 'Series created')
      onOpenChange(false)
    })
  }

  function onDelete() {
    if (!series) return
    if (!confirmDelete) { setConfirmDelete(true); return }
    startTransition(async () => {
      const res = await deleteSeries(series.id)
      if (res?.error) { toast.error(res.error); return }
      toast.success('Series deleted')
      onOpenChange(false)
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Series' : 'New Series'}</DialogTitle>
          <DialogDescription>Group Reels into a series to test whether it deserves a full run.</DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <Field label="Name *">
            <Input autoFocus {...form.register('name')} placeholder="e.g. 7-Day Surfing Challenge" />
          </Field>
          <Field label="Description">
            <Textarea rows={2} {...form.register('description')} placeholder="What is this series about?" />
          </Field>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Planned Episodes">
              <Input type="number" {...form.register('planned_episodes')} placeholder="7" />
            </Field>
            <Field label="Status">
              <Select value={values.status} onValueChange={(v) => form.setValue('status', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Start Date">
              <Input type="date" {...form.register('start_date')} />
            </Field>
          </div>

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
                {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : (isEdit ? 'Save' : 'Create series')}
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