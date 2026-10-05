'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard, TrendingUp, Film, BarChart3, Menu,
  CalendarDays, Lightbulb, Sparkles, Zap, FlaskConical, Settings,
} from 'lucide-react'
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose,
} from '@/components/ui/sheet'

const PRIMARY = [
  { href: '/dashboard', label: 'Home',  icon: LayoutDashboard },
  { href: '/daily',     label: 'Daily', icon: TrendingUp },
  { href: '/reels',     label: 'Reels', icon: Film },
  { href: '/analytics', label: 'Stats', icon: BarChart3 },
]

const SECONDARY = [
  { href: '/weekly',      label: 'Weekly Review', icon: CalendarDays },
  { href: '/ideas',       label: 'Content Ideas', icon: Lightbulb },
  { href: '/series',      label: 'Series',        icon: Sparkles },
  { href: '/hooks',       label: 'Hook Library',  icon: Zap },
  { href: '/experiments', label: 'Experiments',   icon: FlaskConical },
  { href: '/settings',    label: 'Settings',      icon: Settings },
]

export function MobileNav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const moreActive = SECONDARY.some(
    ({ href }) => pathname === href || pathname.startsWith(href + '/')
  )

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-card/95 backdrop-blur border-t border-border pb-[env(safe-area-inset-bottom)]">
      <ul className="grid grid-cols-5">
        {PRIMARY.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <li key={href}>
              <Link
                href={href}
                className={cn(
                  'relative flex flex-col items-center justify-center gap-1 py-3 text-[11px] transition-colors',
                  active ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                {active && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 h-0.5 w-8 rounded-full bg-primary shadow-[0_0_8px_#FFD02B]" />
                )}
                <Icon className="h-5 w-5" />
                {label}
              </Link>
            </li>
          )
        })}

        <li>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button
                className={cn(
                  'relative flex flex-col items-center justify-center gap-1 py-3 text-[11px] w-full transition-colors',
                  moreActive ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                {moreActive && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 h-0.5 w-8 rounded-full bg-primary shadow-[0_0_8px_#FFD02B]" />
                )}
                <Menu className="h-5 w-5" />
                More
              </button>
            </SheetTrigger>

            <SheetContent side="bottom" className="rounded-t-2xl pb-8 max-h-[85vh]">
              <SheetHeader className="pb-2">
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>

              <nav className="mt-2 space-y-1">
                {SECONDARY.map(({ href, label, icon: Icon }) => {
                  const active = pathname === href || pathname.startsWith(href + '/')
                  return (
                    <SheetClose asChild key={href}>
                      <Link
                        href={href}
                        className={cn(
                          'flex items-center gap-3 rounded-md px-3 py-3 text-sm transition-colors',
                          active
                            ? 'bg-primary/10 text-primary font-medium'
                            : 'text-foreground hover:bg-accent'
                        )}
                      >
                        <Icon className={cn('h-4 w-4', active && 'text-primary')} />
                        <span className="flex-1">{label}</span>
                        {active && (
                          <span className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_8px_#FFD02B]" />
                        )}
                      </Link>
                    </SheetClose>
                  )
                })}
              </nav>
            </SheetContent>
          </Sheet>
        </li>
      </ul>
    </nav>
  )
}