import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const EMAILS_TO_UPGRADE = [
    'amandacua02@gmail.com',
    'aystella11@gmail.com',
    'stellaay11@gmail.com',
    'testadmin@example.com'
]

const EMAILS_TO_KEEP_ADMIN_BUT_ADD_PROFILE = [
    'amanda@backscoop.com'
]

async function run() {
    console.log('Enrolling users as members...')

    for (const email of EMAILS_TO_UPGRADE) {
        console.log(`Processing ${email}...`)

        // 1. Get User
        const { data: user } = await supabase.from('users').select('id, name').eq('email', email).single()
        if (!user) {
            console.log(`User ${email} not found, skipping.`)
            continue
        }

        // 2. Update Role to member
        await supabase.from('users').update({ role: 'member' }).eq('id', user.id)

        // 3. Create/Update Profile
        const { data: existingProfile } = await supabase.from('member_profiles').select('id').eq('user_id', user.id).single()
        if (!existingProfile) {
            await supabase.from('member_profiles').insert({
                user_id: user.id,
                industry: 'Tech',
                expertise_areas: ['Product Management', 'Growth'],
                looking_for: 'Networking with founders',
                role_title: 'Entrepreneur',
                company: 'Startup X',
                tier: 'basic'
            })
            console.log(`Created profile for ${email}`)
        }

        // 4. Create/Update Subscription
        const { data: existingSub } = await supabase.from('subscriptions').select('id').eq('user_id', user.id).single()
        if (!existingSub) {
            await supabase.from('subscriptions').insert({
                user_id: user.id,
                status: 'active',
                tier: 'basic',
                stripe_customer_id: `mock_cust_${user.id.slice(0, 8)}`,
                stripe_subscription_id: `mock_sub_${user.id.slice(0, 8)}`,
                current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
            })
            console.log(`Created active subscription for ${email}`)
        }
    }

    for (const email of EMAILS_TO_KEEP_ADMIN_BUT_ADD_PROFILE) {
        console.log(`Processing Admin ${email}...`)
        const { data: user } = await supabase.from('users').select('id, name').eq('email', email).single()
        if (!user) continue

        // Just add profile and sub if missing
        const { data: profile } = await supabase.from('member_profiles').select('id').eq('user_id', user.id).single()
        if (!profile) {
            await supabase.from('member_profiles').insert({
                user_id: user.id,
                industry: 'Media',
                expertise_areas: ['Journalism', 'Scaling Newsletters'],
                looking_for: 'Tech advisors',
                role_title: 'Founder',
                company: 'Backscoop',
                tier: 'prestige'
            })
        }

        const { data: sub } = await supabase.from('subscriptions').select('id').eq('user_id', user.id).single()
        if (!sub) {
            await supabase.from('subscriptions').insert({
                user_id: user.id,
                status: 'active',
                tier: 'prestige',
                stripe_customer_id: `mock_cust_${user.id.slice(0, 8)}`,
                stripe_subscription_id: `mock_sub_${user.id.slice(0, 8)}`,
                current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
            })
        }
    }

    console.log('Done enrolling users.')
}

run()
