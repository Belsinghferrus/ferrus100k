import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { PricingPlans } from '@/components/auth/PricingPlans'
import { redirect } from 'next/navigation'

export default async function BillingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const headersList = headers()
  const country = headersList.get('x-vercel-ip-country') || 'US'
  const isIndia = country === 'IN'

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 py-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Unlock your Command Center</h1>
      </div>
      <PricingPlans isIndia={isIndia} userId={user.id} />
    </div>
  )
}