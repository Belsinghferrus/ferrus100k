'use client'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createPillar, deletePillar } from '@/app/(app)/settings/actions'
import { pillarColor } from '@/lib/calculations/format'
import { Plus, X, Loader2 } from 'lucide-react'

export function PillarsManager({ pillars }) {
  const [name, setName] = useState('')
  const [isPending, startTransition] = useTransition()
  const [deletingId, setDeletingId] = useState(null)

  function handleAdd(e) {
    e.preventDefault()
    if (!name.trim()) return
    startTransition(async () => {
      const res = await createPillar(name)
      if (res?.error) { toast.error(res.error); return }
      setName('')
      toast.success('Pillar added')
    })
  }

  function handleDelete(id, label) {
    if (!confirm(`Delete pillar "${label}"? Reels using it will become unassigned.`)) return
    setDeletingId(id)
    startTransition(async () => {
      const res = await deletePillar(id)
      setDeletingId(null)
      if (res?.error) { toast.error(res.error); return }
      toast.success('Pillar deleted')
    })
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Content Pillars</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleAdd} className="flex gap-2">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="New pillar name…"
            maxLength={60}
          />
          <Button type="submit" disabled={isPending || !name.trim()}>
            {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <><Plus className="h-3.5 w-3.5" /> Add</>}
          </Button>
        </form>

        {pillars.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">No pillars yet.</p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {pillars.map((p) => (
              <li key={p.id}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-accent/40 pl-3 pr-1 py-1 text-sm">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: pillarColor(p.name) }} />
                <span>{p.name}</span>
                <button
                  type="button"
                  onClick={() => handleDelete(p.id, p.name)}
                  disabled={deletingId === p.id}
                  className="flex h-6 w-6 items-center justify-center rounded-full hover:bg-destructive/20 transition-colors"
                  aria-label={`Delete ${p.name}`}
                >
                  {deletingId === p.id
                    ? <Loader2 className="h-3 w-3 animate-spin" />
                    : <X className="h-3 w-3" />}
                </button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}