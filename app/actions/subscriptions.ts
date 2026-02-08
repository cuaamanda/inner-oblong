'use server';

import { createClient } from '@/lib/supabase/server';
import { createCustomerPortalSession } from '@/lib/stripe/helpers';
import { redirect } from 'next/navigation';

export async function createStripePortalSession() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('User not found');
    }

    const { data: subscription } = await supabase
        .from('subscriptions')
        .select('stripe_customer_id')
        .eq('user_id', user.id)
        .single();

    if (!subscription?.stripe_customer_id) {
        throw new Error('No subscription found');
    }

    const session = await createCustomerPortalSession({
        customerId: subscription.stripe_customer_id,
        returnUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
    });

    if (!session.url) {
        throw new Error('Failed to create portal session');
    }

    redirect(session.url);
}
