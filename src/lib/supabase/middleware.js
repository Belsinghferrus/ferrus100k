import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export async function updateSession(request) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(list) {
          list.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          list.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const url = request.nextUrl.clone()
  
  const isAuthPage = url.pathname === '/login' || url.pathname === '/signup'
  const isOnboarding = url.pathname === '/onboarding'
  const isBilling = url.pathname === '/billing'
  const isApp = url.pathname.startsWith('/dashboard') || url.pathname.startsWith('/reels') || url.pathname.startsWith('/daily') || url.pathname.startsWith('/ideas') || url.pathname.startsWith('/settings')

  // 🚨 DEBUG LOG
  console.log("MIDDLEWARE RUNNING:", url.pathname, "| User:", user?.email || 'None')

  if (!user && !isAuthPage && url.pathname !== '/') {
    console.log("-> REDIRECTING TO LOGIN (No user)")
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (user) {
    if (isAuthPage) {
      console.log("-> REDIRECTING TO DASHBOARD (Already logged in)")
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }

    if (isApp || isOnboarding || isBilling) {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('onboarding_completed, subscription_status')
        .eq('id', user.id)
        .single()

      // 🚨 DEBUG LOG
      console.log("-> PROFILE FETCH:", profile, "| Error:", error)

      if (!profile?.onboarding_completed && !isOnboarding && !isBilling) {
        console.log("-> REDIRECTING TO ONBOARDING")
        url.pathname = '/onboarding'
        return NextResponse.redirect(url)
      }

      if (profile?.onboarding_completed && profile?.subscription_status !== 'active' && !isBilling) {
        console.log("-> REDIRECTING TO BILLING")
        url.pathname = '/billing'
        return NextResponse.redirect(url)
      }
    }
  }

  return response
}