import { stripe } from './client';

export async function createCheckoutSession({
    priceId,
    userId,
    email,
    returnUrl,
}: {
    priceId: string;
    userId: string;
    email: string;
    returnUrl: string;
}) {
    const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [
            {
                price: priceId,
                quantity: 1,
            },
        ],
        customer_email: email,
        client_reference_id: userId,
        success_url: `${returnUrl}?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${returnUrl}?canceled=true`,
        metadata: {
            userId,
        },
    });

    return session;
}

export async function createCustomerPortalSession({
    customerId,
    returnUrl,
}: {
    customerId: string;
    returnUrl: string;
}) {
    const session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl,
    });

    return session;
}
