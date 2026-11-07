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
    
    if (process.env.LEMON_SQUEEZY_WEBHOOK_SECRET && signature) {
      const hmac = crypto.createHmac('sha256', process.env.LEMON_SQUEEZY_WEBHOOK_SECRET)
      const digest = Buffer.from(hmac.update(rawBody).digest('hex'), 'utf8')
      if (!crypto.timingSafeEqual(digest, Buffer.from(signature, 'utf8'))) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
      }
    }

    const payload = JSON.parse(rawBody)
    const eventName = payload.meta.event_name

    if (eventName === 'subscription_created' || eventName === 'order_created') {
      // We get the user_id directly from the custom data we passed in the URL!
      const userId = payload.meta.custom_data?.user_id

      if (userId) {
        await supabaseAdmin
          .from('profiles')
          .update({ subscription_status: 'active' })
          .eq('id', userId)
          
        console.log(`✅ User ${userId} upgraded to Active!`)
      }
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('Webhook error:', err)
    return NextResponse.json({ error: 'Webhook error' }, { status: 400 })
  }
}