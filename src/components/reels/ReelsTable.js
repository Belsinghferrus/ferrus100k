'use client'
import { useMemo, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { VerdictBadge } from '@/components/reels/VerdictBadge'
import { ReelFormDialog } from '@/components/reels/ReelFormDialog'
import { formatNumber, formatDecimal, formatDate, pillarColor } from '@/lib/calculations/format'
import { sortByMetric } from '@/lib/calculations/reels'
import { Plus, Search, Pencil, Film } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useEffect } from 'react'


const SORTS = [
  { key: 'follows_per_1k', label: 'Follows / 1K' },
  { key: 'follows',        label: 'Follows' },
  { key: 'views',          label: 'Views' },
  { key: 'shares',         label: 'Shares' },
  { key: 'saves',          label: 'Saves' },
  { key: 'engagement_rate',label: 'Engagement' },
]

export function ReelsTable({ reels, pillars, series, fromIdea = null, autoOpen = false }) {
    const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [sortKey, setSortKey] = useState('follows_per_1k')
  const [pillarFilter, setPillarFilter] = useState('all')
  const [verdictFilter, setVerdictFilter] = useState('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (autoOpen && fromIdea) setOpen(true)
  }, [autoOpen, fromIdea])

  const nextNumber = reels.length ? Math.max(...reels.map((r) => r.reel_number || 0)) + 1 : 1

  const filtered = useMemo(() => {
    let out = reels
    if (pillarFilter !== 'all')  out = out.filter((r) => r.pillar_id === pillarFilter)
    if (verdictFilter !== 'all') out = out.filter((r) => r.verdict === verdictFilter)
    if (search.trim()) {
      const q = search.toLowerCase()
      out = out.filter((r) =>
        (r.title || '').toLowerCase().includes(q) ||
        (r.hook || '').toLowerCase().includes(q)
      )
    }
    return sortByMetric(out, sortKey, 'desc')
  }, [reels, sortKey, pillarFilter, verdictFilter, search])

  function openNew() { setEditing(null); setOpen(true) }
  function openEdit(reel) { setEditing(reel); setOpen(true) }

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search title or hook…"
            className="pl-9"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          <Select value={pillarFilter} onValueChange={setPillarFilter}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="Pillar" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All pillars</SelectItem>
              {pillars.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={verdictFilter} onValueChange={setVerdictFilter}>
            <SelectTrigger className="w-[130px]"><SelectValue placeholder="Verdict" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All verdicts</SelectItem>
              <SelectItem value="SCALE">SCALE</SelectItem>
              <SelectItem value="TEST">TEST</SelectItem>
              <SelectItem value="KILL">KILL</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortKey} onValueChange={setSortKey}>
            <SelectTrigger className="w-[170px]"><SelectValue placeholder="Sort" /></SelectTrigger>
            <SelectContent>
              {SORTS.map((s) => <SelectItem key={s.key} value={s.key}>{s.label}</SelectItem>)}
            </SelectContent>
          </Select>

          <Button onClick={openNew} className="shrink-0">
            <Plus className="h-3.5 w-3.5" /> Add Reel
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Film className="mx-auto h-6 w-6 text-muted-foreground" />
            <p className="mt-3 text-sm text-muted-foreground">
              {reels.length === 0 ? 'No Reels yet. Add your first one.' : 'No Reels match these filters.'}
            </p>
            {reels.length === 0 && (
              <Button className="mt-4" size="sm" onClick={openNew}>
                <Plus className="h-3.5 w-3.5" /> Add Reel
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-accent/40 text-left text-[10px] uppercase tracking-wider text-muted-foreground">
                  <th className="px-3 py-3 font-medium">Date</th>
                  <th className="px-3 py-3 font-medium">Reel</th>
                  <th className="px-3 py-3 font-medium">Pillar</th>
                  <th className="px-3 py-3 font-medium text-right">Views</th>
                  <th className="px-3 py-3 font-medium text-right">Follows</th>
                  <th className="px-3 py-3 font-medium text-right text-primary">Follows / 1K</th>
                  <th className="px-3 py-3 font-medium text-right">Shares</th>
                  <th className="px-3 py-3 font-medium text-right">Saves</th>
                  <th className="px-3 py-3 font-medium text-right">Eng %</th>
                  <th className="px-3 py-3 font-medium">Verdict</th>
                  <th className="px-3 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id} className="border-b border-border last:border-0 hover:bg-accent/30 transition-colors">
                    <td className="px-3 py-3 text-muted-foreground">{formatDate(r.posted_at, 'MMM d')}</td>
                    <td className="px-3 py-3 max-w-[260px]">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: pillarColor(r.pillar?.name) }} />
                        <span className="truncate font-medium">{r.title || `Reel #${r.reel_number ?? '—'}`}</span>
                      </div>
                      {r.hook && <div className="mt-0.5 text-[11px] text-muted-foreground truncate">{r.hook}</div>}
                    </td>
                    <td className="px-3 py-3 text-[11px] text-muted-foreground">{r.pillar?.name || '—'}</td>
                    <td className="px-3 py-3 tabular-nums text-right">{formatNumber(r.views)}</td>
                    <td className="px-3 py-3 tabular-nums text-right">{r.follows != null ? formatNumber(r.follows) : <span className="text-muted-foreground">—</span>}</td>
                    <td className="px-3 py-3 tabular-nums text-right font-semibold text-primary">
                      {r.follows_per_1k != null ? formatDecimal(r.follows_per_1k, 2) : '—'}
                    </td>
                    <td className="px-3 py-3 tabular-nums text-right">{formatNumber(r.shares)}</td>
                    <td className="px-3 py-3 tabular-nums text-right">{formatNumber(r.saves)}</td>
                    <td className="px-3 py-3 tabular-nums text-right text-muted-foreground">
                      {r.engagement_rate != null ? formatDecimal(r.engagement_rate, 2) + '%' : '—'}
                    </td>
                    <td className="px-3 py-3"><VerdictBadge verdict={r.verdict} /></td>
                    <td className="px-3 py-3 text-right">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(r)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <ReelFormDialog
  open={open}
  onOpenChange={(v) => { setOpen(v); if (!v) setEditing(null) }}
  reel={editing}
  pillars={pillars}
  series={series}
  nextNumber={nextNumber}
  fromIdea={fromIdea}
/>
    </>
  )
}