'use client'
import { useRef, useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { toCSV, parseCSV, downloadCSV } from '@/lib/csv'
import { importDaily, importReels, importIdeas } from '@/app/(app)/settings/actions'
import { Download, Upload, Loader2, AlertTriangle } from 'lucide-react'

const SCHEMAS = {
  daily: {
    label: 'Daily Growth',
    columns: [
      { key: 'date', label: 'date' },
      { key: 'start_followers', label: 'start_followers' },
      { key: 'end_followers', label: 'end_followers' },
      { key: 'notes', label: 'notes' },
    ],
    import: importDaily,
  },
  reels: {
    label: 'Reels',
    columns: [
      { key: 'posted_at', label: 'posted_at' },
      { key: 'reel_number', label: 'reel_number' },
      { key: 'title', label: 'title' },
      { key: 'hook', label: 'hook' },
      { key: 'format', label: 'format' },
      { key: 'views', label: 'views' },
      { key: 'likes', label: 'likes' },
      { key: 'comments', label: 'comments' },
      { key: 'saves', label: 'saves' },
      { key: 'shares', label: 'shares' },
      { key: 'accounts_engaged', label: 'accounts_engaged' },
      { key: 'follows', label: 'follows' },
      { key: 'non_follower_pct', label: 'non_follower_pct' },
    ],
    import: importReels,
  },
  ideas: {
    label: 'Content Ideas',
    columns: [
      { key: 'idea', label: 'idea' },
      { key: 'format', label: 'format' },
      { key: 'hook', label: 'hook' },
      { key: 'series_potential', label: 'series_potential' },
      { key: 'difficulty', label: 'difficulty' },
      { key: 'status', label: 'status' },
      { key: 'expected_outcome', label: 'expected_outcome' },
      { key: 'notes', label: 'notes' },
    ],
    import: importIdeas,
  },
}

export function ImportExportPanel({ daily, reels, ideas }) {
  const data = { daily, reels, ideas }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Import / Export</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {Object.entries(SCHEMAS).map(([key, cfg], idx) => (
          <div key={key} className="space-y-3">
            {idx > 0 && <Separator />}
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-medium">{cfg.label}</div>
                <div className="text-[11px] text-muted-foreground">
                  {data[key]?.length ?? 0} rows
                </div>
              </div>
              <div className="flex gap-2">
                <ExportButton rows={data[key] ?? []} columns={cfg.columns} filename={`ferrus-${key}.csv`} />
                <ImportButton schema={cfg} />
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

function ExportButton({ rows, columns, filename }) {
  function handle() {
    if (!rows.length) { toast.error('Nothing to export'); return }
    const csv = toCSV(rows, columns)
    downloadCSV(filename, csv)
    toast.success(`Exported ${rows.length} rows`)
  }
  return (
    <Button size="sm" variant="outline" onClick={handle}>
      <Download className="h-3.5 w-3.5" /> Export
    </Button>
  )
}

function ImportButton({ schema }) {
  const inputRef = useRef(null)
  const [isPending, startTransition] = useTransition()
  const [report, setReport] = useState(null)

  function handleFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target?.result
      if (typeof text !== 'string') return
      const { rows } = parseCSV(text)
      if (!rows.length) { toast.error('No rows found in file'); return }
      startTransition(async () => {
        const res = await schema.import(rows)
        if (res?.error) { toast.error(res.error); return }
        const errCount = res.errors?.length ?? 0
        setReport({ inserted: res.inserted, errors: res.errors ?? [] })
        toast.success(`Imported ${res.inserted} rows${errCount ? ` · ${errCount} skipped` : ''}`)
      })
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        onChange={handleFile}
      />
      <Button size="sm" variant="outline" onClick={() => inputRef.current?.click()} disabled={isPending}>
        {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <><Upload className="h-3.5 w-3.5" /> Import</>}
      </Button>
      {report?.errors?.length > 0 && (
        <div className="w-full rounded-md border border-warning/40 bg-warning/[0.06] p-3 text-[11px] space-y-1">
          <div className="flex items-center gap-1.5 font-medium text-warning">
            <AlertTriangle className="h-3.5 w-3.5" /> {report.errors.length} rows skipped
          </div>
          <ul className="list-disc list-inside text-muted-foreground space-y-0.5 max-h-32 overflow-y-auto">
            {report.errors.slice(0, 20).map((e, i) => (
              <li key={i}>Row {e.row}: {e.message}</li>
            ))}
          </ul>
        </div>
      )}
    </>
  )
}