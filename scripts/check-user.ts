
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkSpecificUser(email: string) {
    console.log(`\n--- Checking specific user: ${email} ---`)
    const { data: { users }, error } = await supabase.auth.admin.listUsers()

    const user = users.find(u => u.email === email)
    if (!user) {
        console.log(`User ${email} not found in Auth.`)
        return
    }

    console.log(`User ${email} found:`, { id: user.id })

    const { data: subscription } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single()

    if (subscription) {
        console.log(`Subscription for ${email}:`, {
            status: subscription.status,
            cancel_at_period_end: subscription.cancel_at_period_end,
            stripe_sub_id: subscription.stripe_subscription_id,
            updated_at: subscription.updated_at
        })
    } else {
        console.log(`No subscription found for ${email} in public.subscriptions table.`)
    }
}

async function listAllSubscriptions() {
    console.log('\n--- Listing all rows in public.subscriptions ---')
    const { data: subscriptions, error } = await supabase
        .from('subscriptions')
        .select('*')

    if (error) {
        console.error('Error listing subscriptions:', error)
        return
    }

    console.log(`Found ${subscriptions.length} subscriptions.`)
    subscriptions.forEach(sub => {
        console.log({
            id: sub.id,
            user_id: sub.user_id,
            stripe_sub_id: sub.stripe_subscription_id,
            status: sub.status,
            cancel_at_period_end: sub.cancel_at_period_end,
            updated_at: sub.updated_at
        })
    })
}

listAllSubscriptions()
// checkSpecificUser('amandadcsocials@gmail.com')
// checkUser()
