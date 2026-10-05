import { createClient, getProfile } from '@/lib/supabase/server'
import { PageHeader } from '@/components/shell/PageHeader'
import { ExperimentsBoard } from '@/components/experiments/ExperimentsBoard'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Experiments — Ferrus 100K' }

export default async function ExperimentsPage() {
  const profile = await getProfile()
  if (!profile) return <><PageHeader title="Experiments" /><p className="text-sm text-muted-foreground">Profile not found.</p></>

  const supabase = await createClient()
  const { data: experiments } = await supabase
    .from('experiments')
    .select('*')
    .eq('user_id', profile.id)
    .order('created_at', { ascending: false })

  return (
    <>
      <PageHeader
        title="Experiments"
        description="One variable at a time. Learn faster than guessing."
      />
      <ExperimentsBoard experiments={experiments ?? []} />
    </>
  )
}