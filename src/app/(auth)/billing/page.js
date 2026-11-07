import { headers } from 'next/headers'
import { PricingPlans } from '@/components/auth/PricingPlans'

export const metadata = { title: 'Unlock Insta Growth Lab' }

export default function BillingPage() {
  // Read the user's country from Vercel's Edge Network
  const headersList = headers()
  const country = headersList.get('x-vercel-ip-country') || 'US'
  
  // Determine if we should show INR or USD
  const isIndia = country === 'IN'

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 py-12">
      <div className="text-center mb-8">
        <div className="inline-flex flex-col items-center gap-1 mb-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_10px_#FFD02B]" />
            <span className="text-sm font-bold tracking-[0.15em]">INSTA GROWTH LAB</span>
          </div>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Unlock your Command Center</h1>
        <p className="text-muted-foreground mt-2">Your custom growth plan is ready. Let's get to work.</p>
      </div>

      <PricingPlans isIndia={isIndia} />
      
      <p className="text-xs text-muted-foreground mt-8 text-center max-w-sm">
        Secure checkout via Lemon Squeezy. 
        Automatically handles global taxes and VAT. Cancel anytime.
      </p>
    </div>
  )
}