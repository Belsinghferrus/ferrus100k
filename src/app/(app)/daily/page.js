import { PageHeader } from '@/components/shell/PageHeader'
import { EmptyState } from '@/components/shell/EmptyState'
import { TrendingUp } from 'lucide-react'

export default function DailyPage() {
  return (
    <>
      <PageHeader title="Daily Growth" description="Log daily followers. Track pace vs target." />
      <EmptyState
        icon={TrendingUp}
        title="Phase 2 module"
        description="Daily entry table, variance calc, and cumulative growth land in Phase 2."
      />
    </>
  )
}