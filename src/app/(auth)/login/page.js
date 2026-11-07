import { Suspense } from 'react'
import { LoginForm } from '@/components/auth/LoginForm'

export const metadata = { title: 'Sign in — Insta Growth Lab' }

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="inline-flex flex-col items-center gap-1 mb-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_10px_#FFD02B]" />
              <span className="text-sm font-bold tracking-[0.15em]">INSTA GROWTH</span>
            </div>
            <span className="text-[10px] text-primary tracking-[0.3em] font-semibold">LAB</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight mt-2">Command Center</h1>
          <p className="mt-2 text-sm text-muted-foreground">Log in to your growth operating system.</p>
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