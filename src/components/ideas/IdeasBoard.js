'use client'
import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { IdeaCard } from '@/components/ideas/IdeaCard'
import { IdeaFormDialog } from '@/components/ideas/IdeaFormDialog'
import { EmptyState } from '@/components/shell/EmptyState'
import { Plus, Search, Lightbulb } from 'lucide-react'
import { IDEA_STATUSES } from '@/lib/constants'

export function IdeasBoard({ ideas, pillars }) {
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [activeTab, setActiveTab] = useState('ALL')
  const [search, setSearch] = useState('')

  const pillarMap = useMemo(() => {
    const m = new Map()
    for (const p of pillars) m.set(p.id, p)
    return m
  }, [pillars])

  const filtered = useMemo(() => {
    let out = ideas
    if (activeTab !== 'ALL') out = out.filter((i) => i.status === activeTab)
    if (search.trim()) {
      const q = search.toLowerCase()
      out = out.filter((i) =>
        i.idea.toLowerCase().includes(q) ||
        (i.hook || '').toLowerCase().includes(q)
      )
    }
    return out
  }, [ideas, activeTab, search])

  const counts = useMemo(() => {
    const c = { ALL: ideas.length }
    for (const s of IDEA_STATUSES) c[s] = ideas.filter((i) => i.status === s).length
    return c
  }, [ideas])

  function openNew() { setEditing(null); setOpen(true) }
  function openEdit(idea) { setEditing(idea); setOpen(true) }

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search ideas…"
            className="pl-9"
          />
        </div>
        <Button onClick={openNew} className="shrink-0">
          <Plus className="h-3.5 w-3.5" /> New Idea
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="ALL">All · {counts.ALL}</TabsTrigger>
          {IDEA_STATUSES.map((s) => (
            <TabsTrigger key={s} value={s}>{s} · {counts[s]}</TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Lightbulb}
          title={ideas.length === 0 ? 'No ideas yet' : 'No ideas match'}
          description={ideas.length === 0 ? 'Start capturing every concept that could move you toward 100K.' : 'Try a different filter or search.'}
          action={ideas.length === 0 ? <Button size="sm" onClick={openNew}><Plus className="h-3.5 w-3.5" /> New Idea</Button> : null}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((i) => (
            <IdeaCard key={i.id} idea={i} pillar={pillarMap.get(i.pillar_id)} onEdit={openEdit} />
          ))}
        </div>
      )}

      <IdeaFormDialog open={open} onOpenChange={setOpen} idea={editing} pillars={pillars} />
    </>
  )
}