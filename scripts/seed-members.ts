import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const testMembers = [
    {
        name: 'Alice Designer',
        email: 'alice@example.com',
        industry: 'SaaS',
        expertise_areas: ['Product Design', 'UI/UX'],
        looking_for: 'Growth strategies and networking with founders',
        tier: 'basic'
    },
    {
        name: 'Bob Engineer',
        email: 'bob@example.com',
        industry: 'AI',
        expertise_areas: ['Backend Engineering', 'Python', 'AI'],
        looking_for: 'Mentorship in Product Design',
        tier: 'basic'
    },
    {
        name: 'Charlie Founder',
        email: 'charlie@example.com',
        industry: 'Fintech',
        expertise_areas: ['Growth', 'Marketing'],
        looking_for: 'Networking with AI engineers',
        tier: 'basic'
    },
    {
        name: 'Dave prestige',
        email: 'dave@example.com',
        industry: 'SaaS',
        expertise_areas: ['Frontend Engineering', 'React'],
        looking_for: 'Hiring growth experts',
        tier: 'prestige'
    },
    {
        name: 'Eve AI',
        email: 'eve@example.com',
        industry: 'AI',
        expertise_areas: ['Product Design', 'Research'],
        looking_for: 'Networking with fintech founders',
        tier: 'basic'
    },
    {
        name: 'Frank Fintech',
        email: 'frank@example.com',
        industry: 'Fintech',
        expertise_areas: ['Backend Engineering', 'Security'],
        looking_for: 'Mentorship in AI',
        tier: 'prestige'
    }
]

async function seed() {
    console.log('Starting seed...')

    for (const member of testMembers) {
        // 1. Create Auth User
        const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
            email: member.email,
            password: 'Password123!',
            email_confirm: true,
            user_metadata: { name: member.name }
        })

        if (authError) {
            if (authError.message.includes('already exists')) {
                console.log(`User ${member.email} already exists, skipping auth creation.`)
                // Try to get the existing user
                const { data: existingUser } = await supabase.from('users').select('id').eq('email', member.email).single()
                if (existingUser) {
                    await updateMemberData(existingUser.id, member)
                }
                continue
            }
            console.error(`Error creating auth user ${member.email}:`, authError)
            continue
        }

        if (authUser.user) {
            console.log(`Created auth user ${member.email}`)
            await updateMemberData(authUser.user.id, member)
        }
    }

    console.log('Seed completed.')
}

async function updateMemberData(userId: string, member: typeof testMembers[0]) {
    // 2. Update User Role to 'member'
    const { error: userError } = await supabase
        .from('users')
        .update({ role: 'member', name: member.name })
        .eq('id', userId)

    if (userError) console.error('Error updating user role:', userError)

    // 3. Create/Update Profile
    const { error: profileError } = await supabase
        .from('member_profiles')
        .upsert({
            user_id: userId,
            industry: member.industry,
            expertise_areas: member.expertise_areas,
            looking_for: member.looking_for,
            tier: member.tier,
            updated_at: new Date().toISOString()
        })

    if (profileError) console.error('Error updating profile:', profileError)

    // 4. Create Active Subscription
    const { error: subError } = await supabase
        .from('subscriptions')
        .upsert({
            user_id: userId,
            tier: member.tier,
            status: 'active',
            updated_at: new Date().toISOString()
        })

    if (subError) console.error('Error updating subscription:', subError)

    console.log(`Successfully seeded ${member.name}`)
}

seed()
