'use client'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { wipeUserData } from '@/app/(app)/settings/actions'
import { AlertTriangle, Loader2, Trash2 } from 'lucide-react'

export function DangerZone() {
  const [open, setOpen] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const [isPending, startTransition] = useTransition()

  function handleWipe() {
    if (confirmText !== 'DELETE') { toast.error('Type DELETE to confirm'); return }
    startTransition(async () => {
      const res = await wipeUserData()
      if (res?.error) { toast.error(res.error); return }
      toast.success('All data cleared. Default pillars restored.')
      setConfirmText('')
      setOpen(false)
    })
  }

  return (
    <Card className="border-destructive/40">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-destructive flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" /> Danger zone
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs text-muted-foreground">
          Deletes every Reel, daily entry, weekly review, experiment, idea, hook, and series for your account.
          Pillars are re-seeded. Your login stays active.
        </p>

        {!open ? (
          <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
            <Trash2 className="h-3.5 w-3.5" /> Delete all data
          </Button>
        ) : (
          <div className="space-y-3 rounded-md border border-destructive/40 p-3">
            <div className="space-y-1.5">
              <Label className="text-[11px]">Type <span className="font-mono font-bold text-destructive">DELETE</span> to confirm</Label>
              <Input
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="DELETE"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="destructive" size="sm" onClick={handleWipe}
                disabled={isPending || confirmText !== 'DELETE'}>
                {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Confirm delete all'}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => { setOpen(false); setConfirmText('') }}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}