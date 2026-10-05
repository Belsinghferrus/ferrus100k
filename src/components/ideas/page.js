import { createClient, getProfile } from '@/lib/supabase/server'
import { PageHeader } from '@/components/shell/PageHeader'
import { IdeasBoard } from '@/components/ideas/IdeasBoard'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Content Ideas — Ferrus 100K' }

export default async function IdeasPage() {
  const profile = await getProfile()
  if (!profile) return <><PageHeader title="Content Ideas" /><p className="text-sm text-muted-foreground">Profile not found.</p></>

  const supabase = await createClient()

  const [{ data: ideas }, { data: pillars }] = await Promise.all([
    supabase
      .from('content_ideas')
      .select('*')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('content_pillars')
      .select('id, name')
      .eq('user_id', profile.id)
      .order('name'),
  ])

  return (
    <>
      <PageHeader
        title="Content Ideas"
        description={`${(ideas ?? []).length} idea${(ideas ?? []).length === 1 ? '' : 's'} in the pipeline`}
      />
      <IdeasBoard ideas={ideas ?? []} pillars={pillars ?? []} />
    </>
  )
}