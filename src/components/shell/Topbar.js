'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { CheckInDialog } from '@/components/checkin/CheckInDialog'
import { LogOut, CheckCircle2, Loader2 } from 'lucide-react'

export function Topbar({ profile, email, reels = [], todayEntry = null }) {
  const [open, setOpen] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const router = useRouter()

  async function handleSignOut() {
    setSigningOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <>
      <header className="sticky top-0 z-30 h-16 bg-background/80 backdrop-blur border-b border-border flex items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-2 md:hidden">
          <span className="w-2 h-2 rounded-full bg-primary" />
          <span className="text-xs font-semibold tracking-[0.25em]">FERRUS 100K</span>
        </div>

        <div className="hidden md:block text-sm text-muted-foreground">
          {profile?.instagram_username ? `@${profile.instagram_username}` : ''}
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={todayEntry ? 'outline' : 'default'}
            onClick={() => setOpen(true)}
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{todayEntry ? 'Logged' : 'Check-in'}</span>
          </Button>

          <span className="hidden lg:block text-xs text-muted-foreground truncate max-w-[160px]">
            {email}
          </span>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleSignOut}
            disabled={signingOut}
            aria-label="Sign out"
          >
            {signingOut
              ? <Loader2 className="h-4 w-4 animate-spin" />
              : <LogOut className="h-4 w-4" />}
          </Button>
        </div>
      </header>

      <CheckInDialog
        open={open}
        onOpenChange={setOpen}
        profile={profile}
        reels={reels}
        existing={todayEntry}
      />
    </>
  )
}