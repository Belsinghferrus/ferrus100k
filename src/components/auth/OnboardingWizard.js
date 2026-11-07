'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { completeOnboarding } from '@/app/(auth)/onboarding/actions'
import { Loader2, ArrowRight, CheckCircle2, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

const PILLARS = [
  'Business / Finance', 'Fitness / Health', 'Lifestyle', 
  'Fashion / Beauty', 'Travel', 'Tech', 'Food', 
  'Personal Story', 'Comedy / Entertainment'
]

const FORMATS = ['Talking Head', 'Voiceover', 'Cinematic B-Roll', 'Skits', 'Tutorials']

export function OnboardingWizard() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  
  const [step, setStep] = useState(1)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  // Form State
  const [igHandle, setIgHandle] = useState('')
  const [followers, setFollowers] = useState('')
  const [avgViews, setAvgViews] = useState('')
  
  const [selectedPillars, setSelectedPillars] = useState([])
  const [primaryFormat, setPrimaryFormat] = useState('')
  const [struggle, setStruggle] = useState('')
  
  const [targetFollowers, setTargetFollowers] = useState('100000')
  const [targetDate, setTargetDate] = useState('2027-01-01')
  const [why, setWhy] = useState('')

  const togglePillar = (pillar) => {
    if (selectedPillars.includes(pillar)) {
      setSelectedPillars(selectedPillars.filter(p => p !== pillar))
    } else {
      if (selectedPillars.length < 3) {
        setSelectedPillars([...selectedPillars, pillar])
      } else {
        toast.error('You can only select up to 3 pillars')
      }
    }
  }

  function handleNext() {
    // Basic Validation
    if (step === 1 && (!igHandle || !followers)) {
      return toast.error('Please fill in your handle and follower count')
    }
    if (step === 2 && selectedPillars.length === 0) {
      return toast.error('Please select at least 1 content pillar')
    }
    if (step === 3 && (!targetFollowers || !targetDate)) {
      return toast.error('Please set a target')
    }
    setStep(step + 1)
  }

  function handleSubmit(commitmentLevel) {
    if (commitmentLevel === 'exploring') {
      toast.error("We'll send you some free tips to get started!")
      // Route to dashboard (or a waitlist page)
      router.push('/dashboard') 
      return
    }

    setIsAnalyzing(true)

    startTransition(async () => {
      const res = await completeOnboarding({
        instagram_username: igHandle,
        current_followers: followers,
        target_followers: targetFollowers,
        target_date: targetDate,
        pillars: selectedPillars,
      })

      if (res?.error) { 
        toast.error(res.error)
        setIsAnalyzing(false)
        return 
      }
      
      // Add a fake delay to make the analysis feel real and premium
      setTimeout(() => {
        toast.success('Command Center generated!')
        router.push('/billing')
      }, 2500)
    })
  }

  // --- RENDERERS ---

  if (isAnalyzing) {
    return (
      <Card className="border-primary/50 bg-card">
        <CardContent className="py-20 flex flex-col items-center justify-center text-center">
          <div className="relative flex h-16 w-16 mb-6">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-20"></span>
            <span className="relative inline-flex rounded-full h-16 w-16 bg-primary/20 items-center justify-center">
              <TrendingUp className="h-8 w-8 text-primary animate-pulse" />
            </span>
          </div>
          <h2 className="text-xl font-semibold mb-2">Analyzing your profile...</h2>
          <p className="text-sm text-muted-foreground animate-pulse">
            Calculating required daily growth...<br/>
            Generating custom content pillars...<br/>
            Building your trajectory...
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border bg-card">
      <CardContent className="p-6 md:p-8">
        
        {/* Progress Bar */}
        <div className="flex gap-1 mb-8">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className={cn("h-1.5 flex-1 rounded-full", step >= i ? "bg-primary" : "bg-muted")} />
          ))}
        </div>

        {/* STEP 1: Baseline */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">Let's look at your baseline</h2>
              <p className="text-sm text-muted-foreground mt-1">Where are you starting from?</p>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Instagram Username</Label>
                <Input placeholder="@yourhandle" value={igHandle} onChange={e => setIgHandle(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Current Followers</Label>
                  <Input type="number" placeholder="25200" value={followers} onChange={e => setFollowers(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Avg Views per Reel</Label>
                  <Input type="number" placeholder="5000" value={avgViews} onChange={e => setAvgViews(e.target.value)} />
                </div>
              </div>
            </div>
            <Button onClick={handleNext} className="w-full">Next <ArrowRight className="h-4 w-4 ml-2" /></Button>
          </div>
        )}

        {/* STEP 2: Content */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">What is your content about?</h2>
              <p className="text-sm text-muted-foreground mt-1">Select up to 3 pillars. This builds your entire app.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {PILLARS.map(p => (
                <button
                  key={p}
                  onClick={() => togglePillar(p)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-sm border transition-all",
                    selectedPillars.includes(p) 
                      ? "bg-primary text-primary-foreground border-primary" 
                      : "bg-transparent text-muted-foreground border-border hover:border-primary/50"
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
            <div className="space-y-4 pt-4 border-t border-border">
               <div className="space-y-2">
                <Label>Primary Format</Label>
                <select 
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                  value={primaryFormat} onChange={e => setPrimaryFormat(e.target.value)}
                >
                  <option value="">Select a format</option>
                  {FORMATS.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
              <Button onClick={handleNext} className="flex-1">Next <ArrowRight className="h-4 w-4 ml-2" /></Button>
            </div>
          </div>
        )}

        {/* STEP 3: Goals */}
        {step === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">Set your target</h2>
              <p className="text-sm text-muted-foreground mt-1">We will build the daily math to get you there.</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Target Followers</Label>
                <Input type="number" value={targetFollowers} onChange={e => setTargetFollowers(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Target Date</Label>
                <Input type="date" value={targetDate} onChange={e => setTargetDate(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Why is this goal important to you?</Label>
              <Textarea 
                placeholder="I want to build a personal brand so I can quit my 9-5..." 
                value={why} onChange={e => setWhy(e.target.value)} 
                rows={3}
              />
              <p className="text-[10px] text-muted-foreground">Writing this down makes you 40% more likely to achieve it.</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
              <Button onClick={handleNext} className="flex-1">Next <ArrowRight className="h-4 w-4 ml-2" /></Button>
            </div>
          </div>
        )}

        {/* STEP 4: Commitment Gate */}
        {step === 4 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-semibold tracking-tight text-primary">You're almost in.</h2>
              <p className="text-sm text-muted-foreground">This system only works if you execute daily.</p>
            </div>
            
            <div className="bg-muted/50 rounded-lg p-4 text-center border border-border">
               <p className="text-sm font-medium">How committed are you to hitting {Number(targetFollowers).toLocaleString()} followers?</p>
            </div>

            <div className="space-y-3">
              <button 
                onClick={() => handleSubmit('committed')}
                disabled={isPending}
                className="w-full group p-4 rounded-lg border-2 border-primary/20 bg-primary/5 hover:bg-primary/10 hover:border-primary transition-all text-left flex items-start gap-4"
              >
                <CheckCircle2 className="h-6 w-6 text-primary shrink-0" />
                <div>
                  <div className="font-semibold text-foreground">I will do whatever it takes.</div>
                  <div className="text-xs text-muted-foreground mt-1">I'm ready to post consistently and use this lab to grow.</div>
                </div>
              </button>

              <button 
                onClick={() => handleSubmit('exploring')}
                disabled={isPending}
                className="w-full p-4 rounded-lg border border-border bg-transparent hover:bg-accent transition-all text-left flex items-start gap-4"
              >
                <div className="h-6 w-6 rounded-full border-2 border-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium text-foreground">I'm just exploring.</div>
                  <div className="text-xs text-muted-foreground mt-1">I want to look around first.</div>
                </div>
              </button>
            </div>
            
            {isPending && (
              <div className="flex justify-center pt-4">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            )}
          </div>
        )}

      </CardContent>
    </Card>
  )
}