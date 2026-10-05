'use client'
import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { formatDate, pillarColor } from '@/lib/calculations/format'
import { deleteIdea, duplicateIdea, setIdeaStatus } from '@/app/(app)/ideas/actions'
import { MoreVertical, Pencil, Copy, Trash2, Sparkles, ArrowRight, Film } from 'lucide-react'
import { IDEA_STATUSES } from '@/lib/constants'

const STATUS_COLORS = {
  IDEA:    'border-border bg-accent text-muted-foreground',
  READY:   'border-primary/40 bg-primary/10 text-primary',
  POSTED:  'border-success/40 bg-success/10 text-success',
  REPEAT:  'border-sky-400/40 bg-sky-400/10 text-sky-400',
  KILLED:  'border-destructive/40 bg-destructive/10 text-destructive',
}

export function IdeaCard({ idea, pillar, onEdit }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleDuplicate() {
    startTransition(async () => {
      const res = await duplicateIdea(idea.id)
      if (res?.error) { toast.error(res.error); return }
      toast.success('Idea duplicated')
    })
  }

  function handleDelete() {
    startTransition(async () => {
      const res = await deleteIdea(idea.id)
      if (res?.error) { toast.error(res.error); return }
      toast.success('Idea deleted')
    })
  }

  function handleConvert() {
    router.push(`/reels?from_idea=${idea.id}`)
  }

  function handleStatus(status) {
    startTransition(async () => {
      const res = await setIdeaStatus(idea.id, status)
      if (res?.error) { toast.error(res.error); return }
      toast.success(`Marked as ${status}`)
    })
  }

  return (
    <Card className="group relative overflow-hidden transition-colors hover:border-primary/40">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge variant="outline" className={STATUS_COLORS[idea.status]}>
              {idea.status}
            </Badge>
            {pillar && (
              <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: pillarColor(pillar.name) }} />
                {pillar.name}
              </span>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" disabled={isPending}>
                <MoreVertical className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => onEdit(idea)}>
                <Pencil className="h-3.5 w-3.5" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={handleDuplicate}>
                <Copy className="h-3.5 w-3.5" /> Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => handleStatus('READY')}>
                <Sparkles className="h-3.5 w-3.5" /> Mark READY
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => handleStatus('REPEAT')}>
                <ArrowRight className="h-3.5 w-3.5" /> Mark REPEAT
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => handleStatus('KILLED')}>
                <Trash2 className="h-3.5 w-3.5" /> Mark KILLED
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={handleDelete} className="text-destructive focus:text-destructive">
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <p className="mt-3 text-sm font-medium leading-snug line-clamp-3">{idea.idea}</p>

        {idea.hook && (
          <p className="mt-2 text-[11px] text-muted-foreground line-clamp-2 italic">
            &ldquo;{idea.hook}&rdquo;
          </p>
        )}

        <div className="mt-3 flex flex-wrap gap-1.5 text-[10px] text-muted-foreground">
          {idea.format && <span className="rounded border border-border px-1.5 py-0.5">{idea.format}</span>}
          {idea.series_potential && <span className="rounded border border-border px-1.5 py-0.5">Series: {idea.series_potential}</span>}
          {idea.difficulty && <span className="rounded border border-border px-1.5 py-0.5">{idea.difficulty}</span>}
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
          <span className="text-[10px] text-muted-foreground">
            {formatDate(idea.created_at, 'MMM d')}
          </span>
          {idea.status !== 'POSTED' && (
            <Button size="sm" variant="ghost" className="h-7 text-[11px] text-primary" onClick={handleConvert} disabled={isPending}>
              <Film className="h-3 w-3" /> Convert to Reel
            </Button>
          )}
          {idea.status === 'POSTED' && idea.converted_reel_id && (
            <span className="text-[10px] text-success">Linked to Reel</span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}