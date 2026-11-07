import { OnboardingWizard } from '@/components/auth/OnboardingWizard'

export const metadata = { title: 'Onboarding — Insta Growth Lab' }

export default function OnboardingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-xl">
        <div className="text-center mb-8">
          <div className="inline-flex flex-col items-center gap-1 mb-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_10px_#FFD02B]" />
              <span className="text-sm font-bold tracking-[0.15em]">INSTA GROWTH LAB</span>
            </div>
          </div>
        </div>
        
        <OnboardingWizard />
        
      </div>
    </div>
  )
}