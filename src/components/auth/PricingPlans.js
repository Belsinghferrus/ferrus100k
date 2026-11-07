'use client'
import { useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { cn } from '@/lib/utils'

// 🚨 REPLACE THESE WITH YOUR ACTUAL LEMON SQUEEZY LINKS
const LINKS = {
  global: {
    monthly: 'https://instagrowthlabs.lemonsqueezy.com/checkout/buy/71ea30b7-3019-41c3-bc72-32f54516f3b8',
    yearly: 'https://instagrowthlabs.lemonsqueezy.com/checkout/buy/57ad38c0-8ca4-4c5e-af14-cb776043044e',
  },
  india: {
    monthly: 'https://instagrowthlabs.lemonsqueezy.com/checkout/buy/fc080b17-5b47-4cf9-acde-19be7970fbd9',
    yearly: 'https://instagrowthlabs.lemonsqueezy.com/checkout/buy/4d3be59b-ed30-4d82-b8e2-47ceb8b33271',
  }
}

const PRICES = {
  global: {
    monthly: 29,
    yearly: 249,
    symbol: '$'
  },
  india: {
    monthly: 499,
    yearly: 4999,
    symbol: '₹'
  }
}

export function PricingPlans({ isIndia }) {
  const [billingCycle, setBillingCycle] = useState('yearly')
  
  const region = isIndia ? 'india' : 'global'
  const price = PRICES[region][billingCycle]
  const symbol = PRICES[region].symbol
  const checkoutLink = LINKS[region][billingCycle]

  const features = [
    '100K Trajectory Dashboard',
    'Unlimited Reel Analytics',
    'Custom Content Pillars',
    'Weekly Review & Experiments',
    'Hook & Idea Libraries',
  ]

  return (
    <div className="w-full max-w-md space-y-6">
      {/* Toggle */}
      <div className="flex items-center justify-center gap-4 bg-accent p-1 rounded-full w-fit mx-auto border border-border">
        <button
          onClick={() => setBillingCycle('monthly')}
          className={cn(
            "px-6 py-2 rounded-full text-sm font-medium transition-all",
            billingCycle === 'monthly' ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          )}
        >
          Monthly
        </button>
        <button
          onClick={() => setBillingCycle('yearly')}
          className={cn(
            "px-6 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2",
            billingCycle === 'yearly' ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          )}
        >
          Yearly <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full">Save ~28%</span>
        </button>
      </div>

      {/* Pricing Card */}
      <Card className="border-primary/50 shadow-[0_0_40px_rgba(255,208,43,0.1)] relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary via-orange-400 to-primary" />
        <CardHeader className="text-center pb-2 pt-8">
          <div className="text-4xl font-bold text-foreground mb-1">
            {symbol}{price}
            <span className="text-sm font-normal text-muted-foreground"> / {billingCycle === 'monthly' ? 'mo' : 'year'}</span>
          </div>
          {billingCycle === 'yearly' && (
            <p className="text-xs text-success font-medium">
              That's just {symbol}{Math.round(price / 12)}/month
            </p>
          )}
        </CardHeader>
        <CardContent className="space-y-6 pt-4">
          <ul className="space-y-3">
            {features.map((feature, i) => (
              <li key={i} className="flex items-start gap-3 text-sm">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          <Button className="w-full h-12 text-lg" asChild>
            <a href={checkoutLink} target="_blank" rel="noopener noreferrer">
              Start Growing Today
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}