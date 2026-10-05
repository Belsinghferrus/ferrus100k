'use client'
import { useEffect, useMemo, useState, useTransition } from 'react'
import { toast } from 'sonner'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { saveCheckIn } from '@/app/(app)/checkin/actions'
import { formatNumber } from '@/lib/calculations/format'
import { Loader2, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export function CheckInDialog({ open, onOpenChange, profile, reels = [], existing }) {
  const [isPending, startTransition] = useTransition()
  const todayISO = new Date().toISOString().slice(0, 10)

  const [date, setDate] = useState(todayISO)
  const [startFollowers, setStartFollowers] = useState(profile?.starting_followers ?? 0)
  const [endFollowers, setEndFollowers] = useState(profile?.starting_followers ?? 0)
  const [didPost, setDidPost] = useState(false)
  const [reelsPosted, setReelsPosted] = useState('')
  const [bestReelId, setBestReelId] = useState(null)
  const [whatWorked, setWhatWorked] = useState('')
  const [whatFailed, setWhatFailed] = useState('')
  const [tomorrowTest, setTomorrowTest] = useState('')

  useEffect(() => {
    if (!open) return
    if (existing) {
      setDate(existing.date)
      setStartFollowers(existing.start_followers)
      setEndFollowers(existing.end_followers)
      setDidPost(!!existing.did_post)
      setReelsPosted(existing.reels_posted ?? '')
      setBestReelId(existing.best_reel_id ?? null)
      setWhatWorked(existing.what_worked ?? '')
      setWhatFailed(existing.what_failed ?? '')
      setTomorrowTest(existing.tomorrow_test ?? '')
    } else {
      setDate(todayISO)
      setStartFollowers(profile?.starting_followers ?? 0)
      setEndFollowers(profile?.starting_followers ?? 0)
      setDidPost(false)
      setReelsPosted('')
      setBestReelId(null)
      setWhatWorked('')
      setWhatFailed('')
      setTomorrowTest('')
    }
  }, [open, existing, todayISO, profile])

  const delta = Number(endFollowers || 0) - Number(startFollowers || 0)

  function onSubmit(e) {
    e.preventDefault()
    if (!date) { toast.error('Pick a date'); return }
    startTransition(async () => {
      const res = await saveCheckIn({
        date,
        start_followers: Number(startFollowers),
        end_followers: Number(endFollowers),
        did_post: didPost,
        reels_posted: reelsPosted === '' ? null : Number(reelsPosted),
        best_reel_id: bestReelId,
        what_worked: whatWorked,
        what_failed: whatFailed,
        tomorrow_test: tomorrowTest,
      })
      if (res?.error) { toast.error(res.error); return }
      toast.success('Check-in saved')
      onOpenChange(false)
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Daily check-in</DialogTitle>
          <DialogDescription>
            Under 60 seconds. Numbers first, then a thought.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-5">
          {/* Followers */}
          <Block label="Followers">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Start">
                <Input type="number" value={startFollowers}
                  onChange={(e) => setStartFollowers(e.target.value)} />
              </Field>
              <Field label="End">
                <Input type="number" autoFocus value={endFollowers}
                  onChange={(e) => setEndFollowers(e.target.value)} />
              </Field>
            </div>
            <div className="flex items-center justify-between rounded-md border border-border bg-accent/40 px-3 py-2 text-sm">
              <span className="text-muted-foreground">Net growth</span>
              <span className={cn(
                'font-semibold tabular-nums',
                delta > 0 && 'text-success',
                delta < 0 && 'text-destructive'
              )}>
                {delta > 0 ? '+' : ''}{formatNumber(delta)}
              </span>
            </div>
          </Block>

          {/* Content */}
          <Block label="Content">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Did you post?">
                <div className="flex gap-2">
                  <Button type="button" size="sm"
                    variant={didPost ? 'default' : 'outline'}
                    onClick={() => setDidPost(true)} className="flex-1">
                    Yes
                  </Button>
                  <Button type="button" size="sm"
                    variant={!didPost ? 'default' : 'outline'}
                    onClick={() => setDidPost(false)} className="flex-1">
                    No
                  </Button>
                </div>
              </Field>
              <Field label="Reels posted">
                <Input type="number" value={reelsPosted}
                  onChange={(e) => setReelsPosted(e.target.value)}
                  placeholder={didPost ? '1' : '0'} />
              </Field>
            </div>
            {didPost && reels.length > 0 && (
              <Field label="Best Reel (optional)">
                <Select value={bestReelId ?? 'none'} onValueChange={(v) => setBestReelId(v === 'none' ? null : v)}>
                  <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">—</SelectItem>
                    {reels.slice(0, 20).map((r) => (
                      <SelectItem key={r.id} value={r.id}>
                        {r.title || `Reel #${r.reel_number ?? '—'}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            )}
          </Block>

          {/* Reflection */}
          <Block label="Reflection">
            <Field label="What worked">
              <Textarea rows={2} value={whatWorked} onChange={(e) => setWhatWorked(e.target.value)}
                placeholder="One sentence." />
            </Field>
            <Field label="What failed">
              <Textarea rows={2} value={whatFailed} onChange={(e) => setWhatFailed(e.target.value)}
                placeholder="One sentence." />
            </Field>
            <Field label="What to test tomorrow">
              <Textarea rows={2} value={tomorrowTest} onChange={(e) => setTomorrowTest(e.target.value)}
                placeholder="One sentence." />
            </Field>
          </Block>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <><CheckCircle2 className="h-3.5 w-3.5" /> Save check-in</>}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function Block({ label, children }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
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