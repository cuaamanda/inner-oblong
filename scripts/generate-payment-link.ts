
import { createCheckoutSession } from '../lib/stripe/helpers'
import { STRIPE_CONFIG } from '../lib/utils/constants'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

async function generateLink() {
    // 1. Get the user
    const { data: { users }, error } = await supabase.auth.admin.listUsers()
    if (error) {
        console.error('Error listing users:', error)
        return
    }
    const user = users.find(u => u.email === 'amandadcsocials@gmail.com')

    if (!user) {
        console.error('User not found')
        return
    }

    console.log('Generating link for:', user.email, user.id)

    try {
        const session = await createCheckoutSession({
            priceId: STRIPE_CONFIG.prices.basic,
            userId: user.id,
            email: user.email!,
            returnUrl: `${process.env.NEXT_PUBLIC_APP_URL}/subscription/success`
        });

        if (session.url) {
            console.log('\n✅ PAYMENT LINK GENERATED SUCCESSFULLY:\n')
            console.log(session.url)
            console.log('\n')
        } else {
            console.error('Session created but no URL:', session)
        }
    } catch (err) {
        console.error('Error creating session:', err)
    }
}

generateLink()
