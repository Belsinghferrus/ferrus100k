'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard, TrendingUp, Film, CalendarDays, Lightbulb,
  Sparkles, Zap, FlaskConical, BarChart3, Settings
} from 'lucide-react'

const NAV = [
  { href: '/dashboard',   label: 'Dashboard',     icon: LayoutDashboard },
  { href: '/daily',       label: 'Daily Growth',  icon: TrendingUp },
  { href: '/reels',       label: 'Reels',         icon: Film },
  { href: '/weekly',      label: 'Weekly Review', icon: CalendarDays },
  { href: '/ideas',       label: 'Content Ideas', icon: Lightbulb },
  { href: '/series',      label: 'Series',        icon: Sparkles },
  { href: '/hooks',       label: 'Hooks',         icon: Zap },
  { href: '/experiments', label: 'Experiments',   icon: FlaskConical },
  { href: '/analytics',   label: 'Analytics',     icon: BarChart3 },
  { href: '/settings',    label: 'Settings',      icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  return (
    <aside className="hidden md:flex fixed inset-y-0 left-0 w-64 flex-col bg-card border-r border-border z-40">
      {/* Brand */}
      <div className="h-16 flex items-center px-5 border-b border-border">
        <Link href="/dashboard" className="flex items-center gap-2 group">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-primary opacity-75 animate-ping" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
          </span>
          <span className="text-sm font-semibold tracking-[0.25em]">FERRUS</span>
          <span className="text-[10px] text-primary tracking-[0.25em] font-semibold">100K</span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'group relative flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-all',
                active
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              )}
            >
              <Icon className={cn(
                'h-4 w-4 shrink-0 transition-transform',
                active && 'text-primary',
                !active && 'group-hover:scale-110'
              )} />
              <span>{label}</span>
              {active && (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_8px_#FFD02B]" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Target footer */}
      <div className="px-4 py-3 border-t border-border space-y-2">
        <div className="flex items-center justify-between">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Target</div>
          <div className="text-[10px] text-primary font-semibold">Dec 31, 2026</div>
        </div>
        <div className="text-xs font-semibold text-primary">25.2K → 100K</div>
        <div className="h-1 w-full rounded-full bg-accent overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-primary to-orange-400" style={{ width: '0%' }} />
        </div>
      </div>
    </aside>
  )
}