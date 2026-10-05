import { createClient, getProfile } from '@/lib/supabase/server'
import { PageHeader } from '@/components/shell/PageHeader'
import { HooksList } from '@/components/hooks/HooksList'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Hook Library — Ferrus 100K' }

export default async function HooksPage() {
  const profile = await getProfile()
  if (!profile) return <><PageHeader title="Hook Library" /><p className="text-sm text-muted-foreground">Profile not found.</p></>

  const supabase = await createClient()

  const [{ data: hooks }, { data: pillars }] = await Promise.all([
    supabase
      .from('hooks')
      .select('*')
      .eq('user_id', profile.id)
      .order('used_count', { ascending: false })
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
        title="Hook Library"
        description={`${(hooks ?? []).length} hook${(hooks ?? []).length === 1 ? '' : 's'} saved`}
      />
      <HooksList hooks={hooks ?? []} pillars={pillars ?? []} />
    </>
  )
}