export const STRIPE_CONFIG = {
    prices: {
        basic: process.env.STRIPE_BASIC_PRICE_ID!,
        prestige: process.env.STRIPE_PRESTIGE_PRICE_ID!,
    },
    plans: {
        basic: {
            name: 'Basic',
            price: 20,
            currency: 'usd',
        },
        prestige: {
            name: 'Prestige',
            price: 98,
            currency: 'usd',
        },
    },
};
