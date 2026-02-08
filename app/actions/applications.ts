'use server'

import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { sendEmail, cancelEmail } from '@/lib/email/send'
import { applicationApprovedTemplate, applicationRejectedTemplate } from '@/lib/email/templates'
import { revalidatePath } from 'next/cache'


const applicationSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    linkedin_url: z.string().url('Invalid LinkedIn URL').includes('linkedin.com', { message: 'Must be a valid LinkedIn URL' }),
    company: z.string().min(2, 'Company name is required'),
    role_title: z.string().min(2, 'Role/Title is required'),
})

export type ApplicationState = {
    success?: boolean
    message?: string
    errors?: {
        [key: string]: string[]
    }
}

export async function submitApplication(prevState: ApplicationState, formData: FormData): Promise<ApplicationState> {
    const supabase = await createClient()

    // 1. Check Authentication
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        // Ideally this should be handled by middleware or client-side check, 
        // but as a failsafe we return an error or could redirect.
        // The requirement says "Unauthenticated users are prompted to create an account first."
        // We can return a specific error code to trigger client-side redirect or just redirect here if it's a direct POST.
        // Since this is a server action called from a form, redirecting might be aggressive if we want to preserve form state,
        // but the requirement says "redirect to signup with return URL".
        // We'll let the client handle the redirect based on the error message, or we can use `redirect` here.
        return {
            success: false,
            message: 'You must be logged in to apply.',
        }
    }

    // 2. Validate Input
    const validatedFields = applicationSchema.safeParse({
        name: formData.get('name'),
        email: formData.get('email'),
        linkedin_url: formData.get('linkedin_url'),
        company: formData.get('company'),
        role_title: formData.get('role_title'),
    })

    if (!validatedFields.success) {
        return {
            success: false,
            message: 'Please check your input.',
            errors: validatedFields.error.flatten().fieldErrors,
        }
    }

    const { name, email, linkedin_url, company, role_title } = validatedFields.data

    // 3. Check for Existing Application
    const { data: existingApplication } = await supabase
        .from('applications')
        .select('status')
        .eq('user_id', user.id)
        .in('status', ['pending', 'approved'])
        .single()

    if (existingApplication) {
        return {
            success: false,
            message: `You already have a ${existingApplication.status} application.`,
        }
    }

    // 4. Insert Application
    const { error: insertError } = await supabase.from('applications').insert({
        user_id: user.id,
        name,
        email, // Should we use user.email or form email? Ideally they match or we verify. For now using form email.
        linkedin_url,
        company,
        role_title,
        status: 'pending',
    })

    if (insertError) {
        console.error('Error submitting application:', insertError)
        return {
            success: false,
            message: 'Failed to submit application. Please try again.',
        }
    }

    // 5. Update User Role
    const { error: updateError } = await supabase
        .from('users')
        .update({ role: 'applicant' })
        .eq('id', user.id)

    if (updateError) {
        // Log error but don't fail the whole request as the application is saved
        console.error('Error updating user role:', updateError)
    }


    return {
        success: true,
        message: 'Application received! We will review it shortly.',
    }
}

export async function approveApplication(applicationId: string, tier: 'basic' | 'prestige' = 'basic') {
    const supabase = await createClient()

    // 1. Verify Admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { success: false, message: 'Unauthorized' }
    }

    const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

    if (userData?.role !== 'admin') {
        return { success: false, message: 'Unauthorized: Admin access required' }
    }

    // 2. Get Application Details
    const { data: application, error: fetchError } = await supabase
        .from('applications')
        .select('*')
        .eq('id', applicationId)
        .single()

    if (fetchError || !application) {
        return { success: false, message: 'Application not found' }
    }


    // 3. Calculate Scheduled Time (TEMPORARILY DISABLED FOR TESTING - was 5 minutes)
    // 3. Calculate Scheduled Time
    // const scheduledAt = new Date(Date.now() + 5 * 60000).toISOString() // Send in 5 mins
    const scheduledAt: string | undefined = undefined // Send immediately

    // 4. Generate Stripe Checkout Session
    let paymentLink: string;
    try {
        const { STRIPE_CONFIG } = await import('@/lib/utils/constants');
        const { createCheckoutSession } = await import('@/lib/stripe/helpers');

        const session = await createCheckoutSession({
            priceId: tier === 'prestige' ? STRIPE_CONFIG.prices.prestige : STRIPE_CONFIG.prices.basic,
            userId: application.user_id,
            email: application.email,
            returnUrl: `${process.env.NEXT_PUBLIC_APP_URL}/subscription/success`
        });

        if (!session.url) {
            console.error('Stripe session created but no URL returned:', session);
            return { success: false, message: 'Failed to create checkout session - no URL returned' }
        }

        paymentLink = session.url;
    } catch (stripeError: any) {
        console.error('Stripe checkout session creation failed:', stripeError);
        return {
            success: false,
            message: `Failed to create Stripe checkout: ${stripeError.message || 'Unknown error'}`
        }
    }

    // 5. Send Email (Scheduled)
    const emailResult = await sendEmail({
        to: application.email,
        subject: 'Welcome to Inner Circle! Your application is approved.',
        html: applicationApprovedTemplate(application.name, paymentLink),
        scheduledAt: scheduledAt
    })

    // 5. Update Status with scheduled_email_id
    const { error: updateError } = await supabase
        .from('applications')
        .update({
            status: 'approved',
            reviewed_by: user.id,
            reviewed_at: new Date().toISOString(),
            scheduled_email_id: emailResult.id
        })
        .eq('id', applicationId)

    if (updateError) {
        return { success: false, message: 'Failed to update application status' }
    }

    revalidatePath('/admin/applications')

    return { success: true, message: 'Application approved (email sent immediately)' }
}

export async function rejectApplication(applicationId: string) {
    const supabase = await createClient()

    // 1. Verify Admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { success: false, message: 'Unauthorized' }
    }

    const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

    if (userData?.role !== 'admin') {
        return { success: false, message: 'Unauthorized: Admin access required' }
    }

    // 2. Get Application Details
    const { data: application, error: fetchError } = await supabase
        .from('applications')
        .select('*')
        .eq('id', applicationId)
        .single()

    if (fetchError || !application) {
        return { success: false, message: 'Application not found' }
    }


    // 3. Calculate Scheduled Time (TEMPORARILY DISABLED FOR TESTING - was 5 minutes)
    // 3. Calculate Scheduled Time
    // const scheduledAt = new Date(Date.now() + 5 * 60000).toISOString() // Send in 5 mins
    const scheduledAt: string | undefined = undefined // Send immediately

    // 4. Send Email (Scheduled)
    const emailResult = await sendEmail({
        to: application.email,
        subject: 'Update on your Inner Circle application',
        html: applicationRejectedTemplate(application.name), // Using template function
        scheduledAt: scheduledAt
    })

    // 5. Update Status with scheduled_email_id
    const { error: updateError } = await supabase
        .from('applications')
        .update({
            status: 'rejected',
            reviewed_by: user.id,
            reviewed_at: new Date().toISOString(),
            scheduled_email_id: emailResult.id
        })
        .eq('id', applicationId)

    if (updateError) {
        return { success: false, message: 'Failed to update application status' }
    }

    revalidatePath('/admin/applications')

    return { success: true, message: 'Application rejected (email sent immediately)' }
}

export async function resetApplicationStatus(applicationId: string) {
    const supabase = await createClient()

    // 1. Verify Admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { success: false, message: 'Unauthorized' }
    }

    const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

    if (userData?.role !== 'admin') {
        return { success: false, message: 'Unauthorized: Admin access required' }
    }

    // 2. Get Application Details
    const { data: application, error: fetchError } = await supabase
        .from('applications')
        .select('scheduled_email_id')
        .eq('id', applicationId)
        .single()

    if (fetchError || !application) {
        return { success: false, message: 'Application not found' }
    }

    // 3. Cancel Email if exists
    if (application.scheduled_email_id) {
        await cancelEmail(application.scheduled_email_id)
    }

    // 4. Reset Status
    const { error: updateError } = await supabase
        .from('applications')
        .update({
            status: 'pending',
            reviewed_by: null,
            reviewed_at: null,
            scheduled_email_id: null
        })
        .eq('id', applicationId)

    if (updateError) {
        console.error('Error resetting status:', updateError)
        return { success: false, message: 'Failed to reset application status' }
    }

    revalidatePath('/admin/applications')
    return { success: true, message: 'Application status reset' }
}
