import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import crypto from 'crypto'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(req) {
  try {
    const rawBody = await req.text()
    const signature = req.headers.get('x-signature')
    
    // 1. Verify the request actually came from Lemon Squeezy
    if (process.env.LEMON_SQUEEZY_WEBHOOK_SECRET && signature) {
      const hmac = crypto.createHmac('sha256', process.env.LEMON_SQUEEZY_WEBHOOK_SECRET)
      const digest = Buffer.from(hmac.update(rawBody).digest('hex'), 'utf8')
      const signatureBuffer = Buffer.from(signature, 'utf8')
      
      if (!crypto.timingSafeEqual(digest, signatureBuffer)) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
      }
    }

    const payload = JSON.parse(rawBody)
    const eventName = payload.meta.event_name

    // 2. Listen for successful subscription
    if (eventName === 'subscription_created' || eventName === 'order_created') {
      // Lemon Squeezy passes custom data if we set it in the URL
      const userEmail = payload.meta.custom_data?.email || payload.data.attributes.user_email

      if (userEmail) {
        // Find the user ID by email
        const { data: userData, error: userError } = await supabaseAdmin
          .from('profiles')
          .select('id')
          .eq('username', userEmail.split('@')[0]) // Fallback if you store username like this
          
        // Actually, it's safer to use Supabase Auth admin API
        const { data: { users }, error: authError } = await supabaseAdmin.auth.admin.listUsers()
        const user = users.find(u => u.email === userEmail)

        if (user) {
          await supabaseAdmin
            .from('profiles')
            .update({ subscription_status: 'active' })
            .eq('id', user.id)
            
          console.log(`✅ User ${userEmail} upgraded to Active!`)
        }
      }
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('Webhook error:', err)
    return NextResponse.json({ error: 'Webhook error' }, { status: 400 })
  }
}