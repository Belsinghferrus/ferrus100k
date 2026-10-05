import { Suspense } from 'react'
import { LoginForm } from '@/components/auth/LoginForm'

export const metadata = { title: 'Sign in — Ferrus 100K' }

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_10px_#FFD02B]" />
            <span className="text-xs tracking-[0.3em] text-muted-foreground">FERRUS</span>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">100K Command Center</h1>
          <p className="mt-2 text-sm text-muted-foreground">25,200 → 100,000 · Dec 31, 2026</p>
        </div>
        <Suspense fallback={<LoginFormSkeleton />}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  )
}

function LoginFormSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-card p-6 space-y-4">
      <div className="h-4 w-16 rounded bg-accent/60 animate-pulse" />
      <div className="h-9 w-full rounded bg-accent/60 animate-pulse" />
      <div className="h-4 w-20 rounded bg-accent/60 animate-pulse" />
      <div className="h-9 w-full rounded bg-accent/60 animate-pulse" />
      <div className="h-9 w-full rounded bg-accent/60 animate-pulse" />
    </div>
  )
}