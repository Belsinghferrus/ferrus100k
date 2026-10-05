import { createClient, getProfile } from '@/lib/supabase/server'
import { PageHeader } from '@/components/shell/PageHeader'
import { ProfileForm } from '@/components/settings/ProfileForm'
import { PillarsManager } from '@/components/settings/PillarsManager'
import { ImportExportPanel } from '@/components/settings/ImportExportPanel'
import { DangerZone } from '@/components/settings/DangerZone'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Settings — Ferrus 100K' }

export default async function SettingsPage() {
  const profile = await getProfile()
  if (!profile) return <><PageHeader title="Settings" /><p className="text-sm text-muted-foreground">Profile not found.</p></>

  const supabase = await createClient()

  const [
    { data: pillars },
    { data: daily },
    { data: reels },
    { data: ideas },
  ] = await Promise.all([
    supabase.from('content_pillars').select('*').eq('user_id', profile.id).order('name'),
    supabase.from('daily_growth').select('date, start_followers, end_followers, notes').eq('user_id', profile.id).order('date'),
    supabase.from('reels').select('posted_at, reel_number, title, hook, format, views, likes, comments, saves, shares, accounts_engaged, follows, non_follower_pct').eq('user_id', profile.id).order('posted_at'),
    supabase.from('content_ideas').select('idea, format, hook, series_potential, difficulty, status, expected_outcome, notes').eq('user_id', profile.id).order('created_at'),
  ])

  return (
    <>
      <PageHeader
        title="Settings"
        description="Profile, pillars, data import/export, and the danger zone."
      />
      <div className="space-y-6">
        <ProfileForm profile={profile} />
        <PillarsManager pillars={pillars ?? []} />
        <ImportExportPanel daily={daily ?? []} reels={reels ?? []} ideas={ideas ?? []} />
        <DangerZone />
      </div>
    </>
  )
}
