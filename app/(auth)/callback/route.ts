import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    // if "next" is in param, use it as the redirect URL
    const next = searchParams.get('next') ?? '/dashboard'

    if (code) {
        const supabase = await createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error) {
            return NextResponse.redirect(`${origin}${next}`)
        } else {
            console.error('Supabase Auth Error:', error.message, error)
        }
    } else {
        console.error('No code provided in callback URL')
    }

    // return the user to an error page with instructions
    const errorMessage = code ? 'Auth Code Error (See console)' : 'No code provided';
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(errorMessage)}`)
}
