'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, CheckCircle2 } from 'lucide-react'

export default function SuccessPage() {
  const router = useRouter()

  useEffect(() => {
    // Ping the dashboard every 2 seconds to see if the webhook has updated the DB
    const interval = setInterval(() => {
      router.refresh()
      router.push('/dashboard')
    }, 2000)
    return () => clearInterval(interval)
  }, [router])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-4">
      <CheckCircle2 className="h-16 w-16 text-success mb-4 animate-bounce" />
      <h1 className="text-2xl font-bold">Payment Successful!</h1>
      <p className="text-muted-foreground mt-2 flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin" /> Setting up your Command Center...
      </p>
    </div>
  )
}