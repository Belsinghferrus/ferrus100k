'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { LayoutDashboard, TrendingUp, Film, BarChart3, Settings } from 'lucide-react'

const NAV = [
  { href: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { href: '/daily', label: 'Daily', icon: TrendingUp },
  { href: '/reels', label: 'Reels', icon: Film },
  { href: '/analytics', label: 'Stats', icon: BarChart3 },
  { href: '/settings', label: 'More', icon: Settings },
]

export function MobileNav() {
  const pathname = usePathname()
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-card border-t border-border pb-[env(safe-area-inset-bottom)]">
      <ul className="grid grid-cols-5">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <li key={href}>
              <Link href={href}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 py-3 text-[11px]',
                  active ? 'text-primary' : 'text-muted-foreground'
                )}>
                <Icon className="h-5 w-5" />
                {label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}