import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function run() {
    console.log('Manually triggering suggestion generation...')

    // 1. Get an admin user ID
    const { data: adminUser } = await supabase
        .from('users')
        .select('id')
        .eq('role', 'admin')
        .limit(1)
        .single()

    if (!adminUser) {
        console.error('No admin user found')
        return
    }

    // 2. Fetch all members with active subscriptions and their profiles
    const { data: membersData, error: membersError } = await supabase
        .from('users')
        .select(`
            id,
            name,
            member_profiles!inner (
                industry,
                expertise_areas,
                looking_for,
                tier
            ),
            subscriptions!inner (
                status,
                tier
            )
        `)
        .eq('role', 'member')
        .eq('subscriptions.status', 'active')

    if (membersError) {
        console.error('Error fetching members:', membersError)
        return
    }

    console.log(`Found ${membersData.length} active members.`)

    const { calculateMatchScore } = await import('../lib/utils/matching')

    const members = membersData.map(m => ({
        user_id: m.id,
        name: m.name,
        industry: m.member_profiles[0]?.industry || null,
        expertise_areas: m.member_profiles[0]?.expertise_areas || [],
        looking_for: m.member_profiles[0]?.looking_for || null,
        tier: m.subscriptions[0]?.tier || 'basic'
    }))

    const previousMatches = new Set<string>()
    const rankedMatches = []

    for (let i = 0; i < members.length; i++) {
        for (let j = i + 1; j < members.length; j++) {
            const match = calculateMatchScore(members[i], members[j], previousMatches)
            if (match && match.score > 0) {
                rankedMatches.push(match)
            }
        }
    }

    rankedMatches.sort((a, b) => b.score - a.score)
    console.log(`Generated ${rankedMatches.length} match suggestions.`)

    const now = new Date()
    const monthYear = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

    const suggestionsToInsert = rankedMatches.map(match => ({
        member_a_id: match.memberA.user_id,
        member_b_id: match.memberB.user_id,
        matched_by: adminUser.id,
        status: 'suggested',
        month_year: monthYear,
        intro_message: match.reasoning.join(' ')
    }))

    const { error: insertError } = await supabase
        .from('introductions')
        .insert(suggestionsToInsert)

    if (insertError) {
        console.error('Error inserting suggestions:', insertError)
    } else {
        console.log('Successfully saved suggestions to database.')
    }
}

run()
