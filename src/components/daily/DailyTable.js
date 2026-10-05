'use client'
import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DailyEntryDialog } from '@/components/daily/DailyEntryDialog'
import { formatNumber, formatDate } from '@/lib/calculations/format'
import { Plus, Pencil } from 'lucide-react'

export function DailyTable({ rows, profile }) {
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)

  const previousEnd = rows.length ? rows[rows.length - 1].end_followers : profile.starting_followers
  const todayISO = new Date().toISOString().slice(0, 10)

  function openNew() { setEditing(null); setOpen(true) }
  function openEdit(row) { setEditing(row); setOpen(true) }

  return (
    <>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold tracking-tight">Daily Entries</h2>
        <Button size="sm" onClick={openNew}>
          <Plus className="h-3.5 w-3.5" /> Add entry
        </Button>
      </div>

      <Card className="overflow-hidden">
        {rows.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-sm text-muted-foreground">
              No entries yet. Add your first one to start tracking.
            </p>
            <Button className="mt-4" size="sm" onClick={openNew}>
              <Plus className="h-3.5 w-3.5" /> Add entry
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-accent/40 text-left text-[10px] uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Day</th>
                  <th className="px-4 py-3 font-medium text-right">Start</th>
                  <th className="px-4 py-3 font-medium text-right">End</th>
                  <th className="px-4 py-3 font-medium text-right">Net</th>
                  <th className="px-4 py-3 font-medium text-right">Target</th>
                  <th className="px-4 py-3 font-medium text-right">Variance</th>
                  <th className="px-4 py-3 font-medium text-right">Cumulative</th>
                  <th className="px-4 py-3 font-medium text-right">Progress</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {rows.slice().reverse().map((r) => (
                  <tr key={r.id} className="border-b border-border last:border-0 hover:bg-accent/30 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                      {formatDate(r.date, 'MMM d, yyyy')}
                    </td>
                    <td className="px-4 py-3 tabular-nums text-muted-foreground">D{r.dayIndex}</td>
                    <td className="px-4 py-3 tabular-nums text-right">{formatNumber(r.start_followers)}</td>
                    <td className="px-4 py-3 tabular-nums text-right font-medium">{formatNumber(r.end_followers)}</td>
                    <td className={`px-4 py-3 tabular-nums text-right font-medium ${r.netGrowth > 0 ? 'text-success' : r.netGrowth < 0 ? 'text-destructive' : ''}`}>
                      {r.netGrowth > 0 ? '+' : ''}{formatNumber(r.netGrowth)}
                    </td>
                    <td className="px-4 py-3 tabular-nums text-right text-muted-foreground">
                      {formatNumber(Math.round(r.targetAtDate))}
                    </td>
                    <td className={`px-4 py-3 tabular-nums text-right ${r.variance > 0 ? 'text-success' : r.variance < 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
                      {r.variance > 0 ? '+' : ''}{formatNumber(Math.round(r.variance))}
                    </td>
                    <td className="px-4 py-3 tabular-nums text-right font-medium text-primary">
                      +{formatNumber(r.cumulative)}
                    </td>
                    <td className="px-4 py-3 tabular-nums text-right text-muted-foreground">
                      {r.progressPct.toFixed(2)}%
                    </td>
                    <td className="px-4 py-3 text-right">
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

      <DailyEntryDialog
        open={open}
        onOpenChange={setOpen}
        defaultDate={todayISO}
        previousEnd={previousEnd}
        existingEntry={editing}
      />
    </>
  )
}