'use client'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { AlertTriangle } from 'lucide-react'

export default function AppError({ error, reset }) {
  useEffect(() => {
    // Log for debugging (kept client-side in prod)
    console.error('[app error]', error)
  }, [error])

  return (
    <Card className="border-destructive/30">
      <CardContent className="p-8 text-center">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-destructive/15">
          <AlertTriangle className="h-5 w-5 text-destructive" />
        </div>
        <h2 className="mt-4 text-lg font-semibold">Something broke</h2>
        <p className="mt-1 text-sm text-muted-foreground max-w-md mx-auto">
          {error?.message || 'An unexpected error occurred.'}
        </p>
        <div className="mt-5 flex justify-center gap-2">
          <Button onClick={() => reset()}>Try again</Button>
          <Button variant="outline" onClick={() => window.location.href = '/dashboard'}>Go to Dashboard</Button>
        </div>
      </CardContent>
    </Card>
  )
}