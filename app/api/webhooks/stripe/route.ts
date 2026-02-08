import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/client';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';
import { STRIPE_CONFIG } from '@/lib/utils/constants';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
    const body = await req.text();
    const signature = (await headers()).get('Stripe-Signature') as string;

    let event: Stripe.Event;

    try {
        if (!process.env.STRIPE_WEBHOOK_SECRET) {
            throw new Error('STRIPE_WEBHOOK_SECRET is missing');
        }
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (error: any) {
        console.error(`Webhook signature verification failed: ${error.message}`);
        return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
    }

    const session = event.data.object as Stripe.Checkout.Session;
    const subscription = event.data.object as Stripe.Subscription;
    const invoice = event.data.object as Stripe.Invoice;

    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                // Retrieve the subscription details from Stripe
                const subscriptionId = session.subscription as string;
                if (!subscriptionId) {
                    console.error('No subscription ID found in session');
                    break;
                }
                const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId);

                const userId = session.metadata?.userId || session.client_reference_id;
                if (!userId) {
                    console.error('No userId found in session metadata');
                    break;
                }

                // Determine tier based on price ID
                if (!stripeSubscription.items?.data?.[0]?.price?.id) {
                    console.error('Missing price ID in subscription items', stripeSubscription);
                    break;
                }

                const priceId = stripeSubscription.items.data[0].price.id;
                let tier = 'basic';
                if (priceId === STRIPE_CONFIG.prices.prestige) {
                    tier = 'prestige';
                }

                // Upsert subscription
                const { error: subError } = await supabaseAdmin
                    .from('subscriptions')
                    .upsert({
                        user_id: userId,
                        stripe_customer_id: session.customer as string,
                        stripe_subscription_id: subscriptionId,
                        tier: tier,
                        status: 'active',
                        cancel_at_period_end: stripeSubscription.cancel_at_period_end,
                        current_period_start: new Date(stripeSubscription.current_period_start * 1000).toISOString(),
                        current_period_end: new Date(stripeSubscription.current_period_end * 1000).toISOString(),
                    });

                if (subError) {
                    console.error('Error creating subscription:', subError);
                }

                // Update user role to 'member'
                const { error: userError } = await supabaseAdmin
                    .from('users')
                    .update({ role: 'member' })
                    .eq('id', userId);

                if (userError) {
                    console.error('Error updating user role:', userError);
                }
                break;
            }
            case 'customer.subscription.updated':
            case 'customer.subscription.deleted': {
                const sub = event.data.object as Stripe.Subscription;
                console.log(`Processing subscription ${event.type === 'customer.subscription.updated' ? 'update' : 'deletion'}:`, sub.id);

                // Add logging for cancel_at_period_end specifically
                console.log(`Subscription ${sub.id} status: ${sub.status}`);
                console.log(`Subscription ${sub.id} cancel_at_period_end: ${sub.cancel_at_period_end}`);

                if (!sub.items?.data?.[0]?.price?.id) {
                    console.error('Subscription update/delete failed: Missing price ID', sub);
                    // We still want to update status if it's a deletion, even if items are missing for some reason
                    if (event.type === 'customer.subscription.updated') break;
                }

                const priceId = sub.items?.data?.[0]?.price?.id;
                let tier = 'basic';
                if (priceId === STRIPE_CONFIG.prices.prestige) {
                    tier = 'prestige';
                }

                const { error: updateError } = await supabaseAdmin
                    .from('subscriptions')
                    .update({
                        status: sub.status === 'canceled' ? 'cancelled' : sub.status,
                        tier: tier,
                        cancel_at_period_end: sub.cancel_at_period_end,
                        current_period_start: new Date(sub.current_period_start * 1000).toISOString(),
                        current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
                    })
                    .eq('stripe_subscription_id', sub.id);

                if (updateError) {
                    console.error(`Error updating subscription ${sub.id} in DB:`, updateError);
                } else {
                    console.log(`Successfully synced subscription ${sub.id} to DB`);
                }
                break;
            }
            case 'invoice.paid':
            case 'invoice.payment_failed': {
                const subId = invoice.subscription as string;
                if (!subId) {
                    console.log('Invoice has no subscription ID');
                    break;
                }

                console.log(`Processing invoice ${event.type} for subscription:`, subId);

                // For invoice events, we retrieve the latest subscription status from Stripe
                const latestSub = await stripe.subscriptions.retrieve(subId);

                const { error: invoiceError } = await supabaseAdmin
                    .from('subscriptions')
                    .update({
                        status: latestSub.status === 'canceled' ? 'cancelled' : latestSub.status,
                        current_period_start: new Date(latestSub.current_period_start * 1000).toISOString(),
                        current_period_end: new Date(latestSub.current_period_end * 1000).toISOString(),
                    })
                    .eq('stripe_subscription_id', subId);

                if (invoiceError) {
                    console.error(`Error updating subscription ${subId} on invoice event:`, invoiceError);
                } else {
                    console.log(`Successfully updated subscription ${subId} status to ${latestSub.status}`);
                }
                break;
            }
            // ... (other cases)
            default:
                console.log(`Unhandled event type ${event.type}`);
        }
    } catch (err: any) {
        console.error(`Error processing webhook event ${event.type}:`, err);
        return new NextResponse(`Error processing event: ${err.message}`, { status: 500 });
    }

    return new NextResponse('Received', { status: 200 });
}
