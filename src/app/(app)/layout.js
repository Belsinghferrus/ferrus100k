import { redirect } from 'next/navigation'
import { getUser, getProfile } from '@/lib/supabase/server'
import { Sidebar } from '@/components/shell/Sidebar'
import { Topbar } from '@/components/shell/Topbar'
import { MobileNav } from '@/components/shell/MobileNav'

export default async function AppLayout({ children }) {
  const user = await getUser()
  if (!user) redirect('/login')
  const profile = await getProfile()

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar />
      <div className="md:pl-64">
        <Topbar profile={profile} email={user.email} />
        <main className="mx-auto max-w-[1400px] px-4 md:px-8 pt-4 md:pt-8 pb-24 md:pb-12">
          {children}
        </main>
      </div>
      <MobileNav />
    </div>
  )
}