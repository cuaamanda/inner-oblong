'use server'

import { createClient } from '@/lib/supabase/server'
import { calculateMatchScore, MemberProfile, MatchResult } from '@/lib/utils/matching'
import { revalidatePath } from 'next/cache'

/**
 * Generates match suggestions for the current month.
 * Only suggests matches for members with active subscriptions and completed profiles.
 */
export async function generateSuggestions() {
    const supabase = await createClient()

    // 1. Get current admin user
    const { data: { user: adminUser } } = await supabase.auth.getUser()
    if (!adminUser) throw new Error('Unauthorized')

    // 2. Fetch all members with active subscriptions and their profiles
    // We join users to get names, member_profiles for details, and subscriptions for tier/status
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
        .in('role', ['member', 'admin'])
        .eq('subscriptions.status', 'active')

    if (membersError) {
        console.error('Error fetching members for matching:', membersError)
        return { success: false, message: 'Failed to fetch members' }
    }

    const members: MemberProfile[] = membersData.map(m => ({
        user_id: m.id,
        name: m.name,
        industry: m.member_profiles[0]?.industry || null,
        expertise_areas: m.member_profiles[0]?.expertise_areas || [],
        looking_for: m.member_profiles[0]?.looking_for || null,
        tier: (m.subscriptions[0]?.tier as 'basic' | 'prestige') || 'basic'
    }))

    // 3. Fetch all previous introduction pairs to avoid repeats
    const { data: pastIntros, error: introError } = await supabase
        .from('introductions')
        .select('member_a_id, member_b_id')

    if (introError) {
        console.error('Error fetching past introductions:', introError)
        return { success: false, message: 'Failed to fetch past intros' }
    }

    const previousMatches = new Set<string>()
    pastIntros?.forEach(intro => {
        const key = [intro.member_a_id, intro.member_b_id].sort().join(':')
        previousMatches.add(key)
    })

    // 4. Generate Ranked Matches
    const rankedMatches: MatchResult[] = []
    for (let i = 0; i < members.length; i++) {
        for (let j = i + 1; j < members.length; j++) {
            const match = calculateMatchScore(members[i], members[j], previousMatches)
            if (match && match.score > 0) {
                rankedMatches.push(match)
            }
        }
    }

    // Sort by score
    rankedMatches.sort((a, b) => b.score - a.score)

    // 5. Save top suggestions for the current month
    const now = new Date()
    const monthYear = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

    const suggestionsToInsert = rankedMatches.map(match => ({
        member_a_id: match.memberA.user_id,
        member_b_id: match.memberB.user_id,
        matched_by: adminUser.id,
        status: 'suggested',
        month_year: monthYear,
        intro_message: match.reasoning.join(' ') // Storing reasoning in intro_message for admin review
    }))

    if (suggestionsToInsert.length === 0) {
        return { success: true, message: 'No new suggestions found.' }
    }

    const { error: insertError } = await supabase
        .from('introductions')
        .insert(suggestionsToInsert)

    if (insertError) {
        console.error('Error inserting suggestions:', insertError)
        return { success: false, message: 'Failed to save suggestions' }
    }

    revalidatePath('/admin/introductions')
    return { success: true, message: `Generated ${suggestionsToInsert.length} suggestions.` }
}

/**
 * Approves a suggested match.
 */
export async function approveMatch(introductionId: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('introductions')
        .update({ status: 'approved' })
        .eq('id', introductionId)

    if (error) {
        console.error('Error approving match:', error)
        return { success: false, message: 'Failed to approve match' }
    }

    revalidatePath('/admin/introductions')
    return { success: true, message: 'Match approved.' }
}

/**
 * Declines/Removes a suggested match.
 */
export async function declineMatch(introductionId: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('introductions')
        .delete()
        .eq('id', introductionId)
        .eq('status', 'suggested')

    if (error) {
        console.error('Error declining match:', error)
        return { success: false, message: 'Failed to decline match' }
    }

    revalidatePath('/admin/introductions')
    return { success: true, message: 'Match declined.' }
}

/**
 * Updates the intro message for a match.
 */
export async function updateIntroMessage(introductionId: string, message: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('introductions')
        .update({ intro_message: message })
        .eq('id', introductionId)

    if (error) {
        console.error('Error updating intro message:', error)
        return { success: false, message: 'Failed to update intro message' }
    }

    revalidatePath('/admin/introductions')
    return { success: true, message: 'Intro message updated.' }
}

/**
 * Sends the introduction email to both parties.
 */
export async function sendIntroduction(introductionId: string) {
    const supabase = await createClient()
    const { sendEmail } = await import('@/lib/email/send')
    const { introductionEmailTemplate } = await import('@/lib/email/templates')

    // 1. Fetch introduction and member details
    const { data: intro, error: fetchError } = await supabase
        .from('introductions')
        .select(`
            id,
            intro_message,
            member_a:member_a_id (
                id,
                email,
                name,
                member_profiles (linkedin_url)
            ),
            member_b:member_b_id (
                id,
                email,
                name,
                member_profiles (linkedin_url)
            )
        `)
        .eq('id', introductionId)
        .single()

    if (fetchError || !intro) {
        console.error('Error fetching intro for sending:', fetchError)
        return { success: false, message: 'Failed to fetch introduction details' }
    }

    const memberA = intro.member_a as any
    const memberB = intro.member_b as any

    const emailHtml = introductionEmailTemplate(
        memberA.name,
        memberB.name,
        intro.intro_message || 'You were matched based on your professional profiles.',
        memberA.member_profiles[0]?.linkedin_url,
        memberB.member_profiles[0]?.linkedin_url
    )

    // 2. Send emails
    const subject = `Inner Circle Introduction: ${memberA.name} <> ${memberB.name}`

    const [resultA, resultB] = await Promise.all([
        sendEmail({ to: memberA.email, subject, html: emailHtml }),
        sendEmail({ to: memberB.email, subject, html: emailHtml })
    ])

    if (!resultA.success || !resultB.success) {
        return { success: false, message: 'Failed to send one or more emails' }
    }

    // 3. Update status
    const { error: updateError } = await supabase
        .from('introductions')
        .update({ status: 'sent', sent_at: new Date().toISOString() })
        .eq('id', introductionId)

    if (updateError) {
        console.error('Error updating intro status after send:', updateError)
    }

    revalidatePath('/admin/introductions')
    return { success: true, message: 'Introduction sent successfully!' }
}
