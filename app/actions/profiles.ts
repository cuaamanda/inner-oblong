'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function completeOnboarding(formData: FormData) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        throw new Error('Not authenticated')
    }

    const industry = formData.get('industry') as string
    const expertise = formData.get('expertise') as string
    const looking_for = formData.get('looking_for') as string
    const bio = formData.get('bio') as string

    // Get current subscription to determine tier
    const { data: subscription } = await supabase
        .from('subscriptions')
        .select('tier')
        .eq('user_id', user.id)
        .single()

    const { error } = await supabase
        .from('member_profiles')
        .upsert({
            user_id: user.id,
            industry,
            expertise,
            looking_for,
            bio,
            tier: subscription?.tier || 'basic',
            updated_at: new Date().toISOString()
        })

    if (error) {
        console.error('Error saving profile:', error)
        return { success: false, message: 'Failed to save profile' }
    }

    revalidatePath('/dashboard')
    redirect('/dashboard')
}
