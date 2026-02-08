import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { generateSuggestions } from '../app/actions/introductions'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function test() {
    console.log('Testing Matching Engine...')

    // Since generateSuggestions uses supabase/server which uses cookies, 
    // it won't work directly in a node script without mocking.
    // I'll just check if the members were seeded correctly first.

    const { data: members, error: mError } = await supabase
        .from('member_profiles')
        .select('*, users(name)')

    if (mError) {
        console.error('Error fetching members:', mError)
        return
    }

    console.log(`Found ${members.length} members for matching.`)
    members.forEach(m => console.log(`- ${m.users.name}: ${m.industry}, Tier: ${m.tier}`))

    // Instead of calling the server action directly (which has auth/cookie deps),
    // I'll run the matching logic manually here to verify the scores.

    const { calculateMatchScore, MemberProfile } = await import('../lib/utils/matching')

    const formattedMembers: MemberProfile[] = members.map(m => ({
        user_id: m.user_id,
        name: m.users.name,
        industry: m.industry,
        expertise_areas: m.expertise_areas,
        looking_for: m.looking_for,
        tier: m.tier
    }))

    const previousMatches = new Set<string>()

    console.log('\n--- Calculated Scores ---')
    const matches = []
    for (let i = 0; i < formattedMembers.length; i++) {
        for (let j = i + 1; j < formattedMembers.length; j++) {
            const match = calculateMatchScore(formattedMembers[i], formattedMembers[j], previousMatches)
            if (match && match.score > 0) {
                matches.push(match)
            }
        }
    }

    matches.sort((a, b) => b.score - a.score)

    matches.forEach(m => {
        console.log(`Match: ${m.memberA.name} & ${m.memberB.name}`)
        console.log(`Score: ${m.score}`)
        console.log(`Reasoning: ${m.reasoning.join(', ')}`)
        console.log('---')
    })
}

test()
