'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { LayoutDashboard, TrendingUp, Film, BarChart3, Settings } from 'lucide-react'

const NAV = [
  { href: '/dashboard', label: 'Home',  icon: LayoutDashboard },
  { href: '/daily',     label: 'Daily', icon: TrendingUp },
  { href: '/reels',     label: 'Reels', icon: Film },
  { href: '/analytics', label: 'Stats', icon: BarChart3 },
  { href: '/settings',  label: 'More',  icon: Settings },
]

export function MobileNav() {
  const pathname = usePathname()
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-card/95 backdrop-blur border-t border-border pb-[env(safe-area-inset-bottom)]">
      <ul className="grid grid-cols-5">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <li key={href}>
              <Link
                href={href}
                className={cn(
                  'relative flex flex-col items-center justify-center gap-1 py-3 text-[11px] transition-colors',
                  active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {active && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 h-0.5 w-8 rounded-full bg-primary shadow-[0_0_8px_#FFD02B]" />
                )}
                <Icon className={cn('h-5 w-5', active && 'drop-shadow-[0_0_6px_rgba(255,208,43,0.6)]')} />
                {label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}