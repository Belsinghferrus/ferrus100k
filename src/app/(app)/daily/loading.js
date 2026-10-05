import { Skeleton } from '@/components/ui/skeleton'

export default function ReelsLoading() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-9 w-64" />
      <Skeleton className="h-9 w-full max-w-xl" />
      <Skeleton className="h-[500px] w-full rounded-xl" />
    </div>
  )
}