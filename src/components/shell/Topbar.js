import { signOut } from '@/app/(auth)/actions'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'

export function Topbar({ profile, email }) {
  return (
    <header className="sticky top-0 z-30 h-16 bg-background/80 backdrop-blur border-b border-border flex items-center justify-between px-4 md:px-8">
      <div className="flex items-center gap-2 md:hidden">
        <span className="w-2 h-2 rounded-full bg-primary" />
        <span className="text-xs font-semibold tracking-[0.25em]">FERRUS 100K</span>
      </div>
      <div className="hidden md:block text-sm text-muted-foreground">
        {profile?.instagram_username ? `@${profile.instagram_username}` : ''}
      </div>
      <div className="flex items-center gap-3">
        <span className="hidden sm:block text-xs text-muted-foreground truncate max-w-[180px]">{email}</span>
        <form action={signOut}>
          <Button variant="ghost" size="icon" type="submit" aria-label="Sign out">
            <LogOut className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </header>
  )
}