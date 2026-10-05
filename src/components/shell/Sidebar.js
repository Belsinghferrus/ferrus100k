'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard, TrendingUp, Film, CalendarDays, Lightbulb,
  Sparkles, Zap, FlaskConical, BarChart3, Settings
} from 'lucide-react'

const NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/daily', label: 'Daily Growth', icon: TrendingUp },
  { href: '/reels', label: 'Reels', icon: Film },
  { href: '/weekly', label: 'Weekly Review', icon: CalendarDays },
  { href: '/ideas', label: 'Content Ideas', icon: Lightbulb },
  { href: '/series', label: 'Series', icon: Sparkles },
  { href: '/hooks', label: 'Hooks', icon: Zap },
  { href: '/experiments', label: 'Experiments', icon: FlaskConical },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  return (
    <aside className="hidden md:flex fixed inset-y-0 left-0 w-64 flex-col bg-card border-r border-border">
      <div className="h-16 flex items-center px-5 border-b border-border">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-primary" />
          <span className="text-sm font-semibold tracking-[0.25em]">FERRUS</span>
          <span className="text-[10px] text-muted-foreground tracking-[0.25em]">100K</span>
        </Link>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link key={href} href={href}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                active
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              )}>
              <Icon className="h-4 w-4 shrink-0" />
              <span>{label}</span>
            </Link>
          )
        })}
      </nav>
      <div className="px-4 py-3 border-t border-border text-[11px] text-muted-foreground">
        25.2K → 100K · Dec 31, 2026
      </div>
    </aside>
  )
}