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
import { hookSchema } from '@/lib/validations/hooks'
import { upsertHook, deleteHook } from '@/app/(app)/hooks/actions'
import { HOOK_CATEGORIES, REEL_FORMATS } from '@/lib/constants'
import { Loader2, Trash2 } from 'lucide-react'

const defaults = { hook: '', category: 'Curiosity', pillar_id: null, format: null, notes: '' }

export function HookFormDialog({ open, onOpenChange, hook, pillars = [] }) {
  const [isPending, startTransition] = useTransition()
  const [confirmDelete, setConfirmDelete] = useState(false)
  const isEdit = !!hook

  const form = useForm({ resolver: zodResolver(hookSchema), defaultValues: hook ?? defaults })
  const values = form.watch()

  useEffect(() => {
    if (open) { form.reset(hook ?? defaults); setConfirmDelete(false) }
  }, [open, hook, form])

  function onSubmit(data) {
    startTransition(async () => {
      const res = await upsertHook(data, hook?.id)
      if (res?.error) { toast.error(res.error); return }
      toast.success(isEdit ? 'Hook updated' : 'Hook saved')
      onOpenChange(false)
    })
  }

  function onDelete() {
    if (!hook) return
    if (!confirmDelete) { setConfirmDelete(true); return }
    startTransition(async () => {
      const res = await deleteHook(hook.id)
      if (res?.error) { toast.error(res.error); return }
      toast.success('Hook deleted')
      onOpenChange(false)
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Hook' : 'New Hook'}</DialogTitle>
          <DialogDescription>Save the opening lines that actually convert.</DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <Field label="Hook *">
            <Textarea rows={3} autoFocus {...form.register('hook')} placeholder="The exact words you say or show first…" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Category">
              <Select value={values.category} onValueChange={(v) => form.setValue('category', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {HOOK_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Pillar">
              <Select value={values.pillar_id ?? 'none'} onValueChange={(v) => form.setValue('pillar_id', v === 'none' ? null : v)}>
                <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">—</SelectItem>
                  {pillars.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
          </div>
          <Field label="Format">
            <Select value={values.format ?? 'none'} onValueChange={(v) => form.setValue('format', v === 'none' ? null : v)}>
              <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">—</SelectItem>
                {REEL_FORMATS.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Notes">
            <Textarea rows={2} {...form.register('notes')} placeholder="When does this hook work best?" />
          </Field>

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
                {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : (isEdit ? 'Save' : 'Save hook')}
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