import { createClient, getProfile } from '@/lib/supabase/server'
import { PageHeader } from '@/components/shell/PageHeader'
import { SeriesList } from '@/components/series/SeriesList'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Series — Ferrus 100K' }

export default async function SeriesPage() {
  const profile = await getProfile()
  if (!profile) return <><PageHeader title="Series" /><p className="text-sm text-muted-foreground">Profile not found.</p></>

  const supabase = await createClient()

  const [{ data: series }, { data: reels }] = await Promise.all([
    supabase
      .from('content_series')
      .select('*')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('reels')
      .select('id, reel_number, title, series_id, series_episode, views, follows, follows_per_1k')
      .eq('user_id', profile.id)
      .not('series_id', 'is', null),
  ])

  return (
    <>
      <PageHeader
        title="Series"
        description="Group Reels into series. Repeat what works; kill what doesn't."
      />
      <SeriesList series={series ?? []} reels={reels ?? []} />
    </>
  )
}