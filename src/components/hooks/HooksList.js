'use client'
import { useMemo, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { EmptyState } from '@/components/shell/EmptyState'
import { HookFormDialog } from '@/components/hooks/HookFormDialog'
import { Plus, Search, Copy, Pencil, Check, Zap } from 'lucide-react'
import { HOOK_CATEGORIES } from '@/lib/constants'
import { pillarColor } from '@/lib/calculations/format'

export function HooksList({ hooks, pillars }) {
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [copiedId, setCopiedId] = useState(null)

  const pillarMap = useMemo(() => new Map(pillars.map((p) => [p.id, p])), [pillars])

  const filtered = useMemo(() => {
    let out = hooks
    if (category !== 'all') out = out.filter((h) => h.category === category)
    if (search.trim()) {
      const q = search.toLowerCase()
      out = out.filter((h) => h.hook.toLowerCase().includes(q))
    }
    return out
  }, [hooks, category, search])

  async function copyHook(id, text) {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(id)
      setTimeout(() => setCopiedId((v) => (v === id ? null : v)), 1500)
    } catch {
      // clipboard not available
    }
  }

  function openNew() { setEditing(null); setOpen(true) }
  function openEdit(h) { setEditing(h); setOpen(true) }

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search hooks…" className="pl-9" />
        </div>
        <div className="flex gap-2">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {HOOK_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button onClick={openNew} className="shrink-0">
            <Plus className="h-3.5 w-3.5" /> New Hook
          </Button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Zap}
          title={hooks.length === 0 ? 'No hooks saved' : 'No hooks match'}
          description={hooks.length === 0 ? 'Build your swipe file. The opening 2 seconds decide everything.' : 'Try a different filter.'}
          action={hooks.length === 0 ? <Button size="sm" onClick={openNew}><Plus className="h-3.5 w-3.5" /> Save first hook</Button> : null}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filtered.map((h) => {
            const pillar = pillarMap.get(h.pillar_id)
            const isCopied = copiedId === h.id
            return (
              <Card key={h.id} className="group transition-colors hover:border-primary/40">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <span className="inline-flex items-center rounded-md border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                      {h.category}
                    </span>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => copyHook(h.id, h.hook)}
                        title="Copy hook"
                      >
                        {isCopied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(h)} title="Edit">
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  <p className="mt-3 text-sm font-medium leading-snug">&ldquo;{h.hook}&rdquo;</p>

                  <div className="mt-3 flex flex-wrap items-center gap-2 text-[10px] text-muted-foreground">
                    {pillar && (
                      <span className="inline-flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: pillarColor(pillar.name) }} />
                        {pillar.name}
                      </span>
                    )}
                    {h.format && <span className="rounded border border-border px-1.5 py-0.5">{h.format}</span>}
                    {h.used_count > 0 && <span>Used {h.used_count}×</span>}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <HookFormDialog open={open} onOpenChange={setOpen} hook={editing} pillars={pillars} />
    </>
  )
}