'use client'
import { useEffect, useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { dailyEntrySchema } from '@/lib/validations/daily'
import { upsertDailyEntry, deleteDailyEntry } from '@/app/(app)/daily/actions'
import { formatNumber } from '@/lib/calculations/format'
import { Loader2 } from 'lucide-react'

export function DailyEntryDialog({ open, onOpenChange, defaultDate, previousEnd, existingEntry }) {
  const [isPending, startTransition] = useTransition()
  const [deleting, setDeleting] = useState(false)

  const form = useForm({
    resolver: zodResolver(dailyEntrySchema),
    defaultValues: {
      date: defaultDate,
      start_followers: existingEntry?.start_followers ?? previousEnd ?? 0,
      end_followers: existingEntry?.end_followers ?? previousEnd ?? 0,
      notes: existingEntry?.notes ?? '',
    },
  })

  useEffect(() => {
    if (!open) return
    form.reset({
      date: existingEntry?.date ?? defaultDate,
      start_followers: existingEntry?.start_followers ?? previousEnd ?? 0,
      end_followers: existingEntry?.end_followers ?? previousEnd ?? 0,
      notes: existingEntry?.notes ?? '',
    })
  }, [open, defaultDate, previousEnd, existingEntry, form])

  const watchedStart = form.watch('start_followers')
  const watchedEnd = form.watch('end_followers')
  const delta = Number(watchedEnd || 0) - Number(watchedStart || 0)

  function onSubmit(values) {
    startTransition(async () => {
      const res = await upsertDailyEntry(values)
      if (res?.error) { toast.error(res.error); return }
      toast.success('Daily entry saved')
      onOpenChange(false)
    })
  }

  function onDelete() {
    if (!existingEntry) return
    setDeleting(true)
    startTransition(async () => {
      const res = await deleteDailyEntry(existingEntry.id)
      setDeleting(false)
      if (res?.error) { toast.error(res.error); return }
      toast.success('Entry deleted')
      onOpenChange(false)
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{existingEntry ? 'Edit daily entry' : 'Add daily entry'}</DialogTitle>
          <DialogDescription>
            Enter today&apos;s end-of-day follower count. Start is auto-filled from the previous day.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2 col-span-2">
              <Label htmlFor="date">Date</Label>
              <Input id="date" type="date" {...form.register('date')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="start_followers">Start Followers</Label>
              <Input id="start_followers" type="number" {...form.register('start_followers')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_followers">End Followers</Label>
              <Input id="end_followers" type="number" autoFocus {...form.register('end_followers')} />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-md border border-border bg-accent/40 px-3 py-2 text-sm">
            <span className="text-muted-foreground">Net growth</span>
            <span className={`font-semibold tabular-nums ${delta > 0 ? 'text-success' : delta < 0 ? 'text-destructive' : ''}`}>
              {delta > 0 ? '+' : ''}{formatNumber(delta)}
            </span>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Input id="notes" placeholder="Anything unusual?" {...form.register('notes')} />
          </div>

          <DialogFooter>
            {existingEntry && (
              <Button type="button" variant="destructive" onClick={onDelete} disabled={deleting || isPending}>
                {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Delete'}
              </Button>
            )}
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Save'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}