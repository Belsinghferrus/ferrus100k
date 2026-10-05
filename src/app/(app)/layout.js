import { redirect } from 'next/navigation'
import { createClient, getUser, getProfile } from '@/lib/supabase/server'
import { Sidebar } from '@/components/shell/Sidebar'
import { Topbar } from '@/components/shell/Topbar'
import { MobileNav } from '@/components/shell/MobileNav'

export default async function AppLayout({ children }) {
  const user = await getUser()
  if (!user) redirect('/login')
  const profile = await getProfile()

  const supabase = await createClient()
  const todayISO = new Date().toISOString().slice(0, 10)

  const [{ data: recentReels }, { data: todayRows }] = await Promise.all([
    supabase
      .from('reels')
      .select('id, reel_number, title')
      .eq('user_id', user.id)
      .order('posted_at', { ascending: false })
      .limit(20),
    supabase
      .from('daily_growth')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', todayISO)
      .limit(1),
  ])

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar />
      <div className="md:pl-64">
        <Topbar
          profile={profile}
          email={user.email}
          reels={recentReels ?? []}
          todayEntry={todayRows?.[0] ?? null}
        />
        <main className="mx-auto max-w-[1400px] px-4 md:px-8 pt-4 md:pt-8 pb-24 md:pb-12">
          {children}
        </main>
      </div>
      <MobileNav />
    </div>
  )
}