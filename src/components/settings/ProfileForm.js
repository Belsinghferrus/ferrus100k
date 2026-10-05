'use client'
import { useEffect, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updateProfile } from '@/app/(app)/settings/actions'
import { Loader2 } from 'lucide-react'

export function ProfileForm({ profile }) {
  const [isPending, startTransition] = useTransition()
  const form = useForm({
    defaultValues: {
      instagram_username: profile.instagram_username || '',
      starting_followers: profile.starting_followers,
      target_followers: profile.target_followers,
      starting_date: profile.starting_date,
      deadline: profile.deadline,
    },
  })

  useEffect(() => {
    form.reset({
      instagram_username: profile.instagram_username || '',
      starting_followers: profile.starting_followers,
      target_followers: profile.target_followers,
      starting_date: profile.starting_date,
      deadline: profile.deadline,
    })
  }, [profile, form])

  function onSubmit(data) {
    startTransition(async () => {
      const res = await updateProfile(data)
      if (res?.error) { toast.error(res.error); return }
      toast.success('Profile updated')
    })
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Field label="Instagram username">
              <Input {...form.register('instagram_username')} placeholder="ferruz.in" />
            </Field>
            <Field label="Timezone">
              <Input value={profile.timezone || 'UTC'} disabled />
            </Field>
            <Field label="Starting followers">
              <Input type="number" {...form.register('starting_followers')} />
            </Field>
            <Field label="Target followers">
              <Input type="number" {...form.register('target_followers')} />
            </Field>
            <Field label="Starting date">
              <Input type="date" {...form.register('starting_date')} />
            </Field>
            <Field label="Deadline">
              <Input type="date" {...form.register('deadline')} />
            </Field>
          </div>
          <Button type="submit" disabled={isPending}>
            {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Save profile'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

function Field({ label, children }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[11px] text-muted-foreground">{label}</Label>
      {children}
    </div>
  )
}