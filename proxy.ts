import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    // Create Supabase client for middleware
    // We need to use createServerClient and handle cookie setting carefully
    // for the middleware request/response lifecycle
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        request.cookies.set(name, value) // updates the request cookies
                    )

                    supabaseResponse = NextResponse.next({
                        request,
                    })

                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options) // updates the response cookies
                    )
                },
            },
        }
    )

    // 1. Refresh session if expired
    const {
        data: { user },
    } = await supabase.auth.getUser()

    // 2. Protected Routes Logic
    const path = request.nextUrl.pathname

    // Check if path is part of protected routes
    // We protect /dashboard, /member*, and /admin*
    const isProtectedRoute = path.startsWith('/dashboard') || path.startsWith('/member')
    const isAdminRoute = path.startsWith('/admin')

    if (isProtectedRoute || isAdminRoute) {
        if (!user) {
            const url = request.nextUrl.clone()
            url.pathname = '/login'
            // Optionally add returnTo param
            // url.searchParams.set('returnTo', path)
            return NextResponse.redirect(url)
        }

        if (isAdminRoute) {
            // Check for admin role
            const { data: userRecord } = await supabase
                .from('users')
                .select('role')
                .eq('id', user.id)
                .single()

            if (userRecord?.role !== 'admin') {
                const url = request.nextUrl.clone()
                url.pathname = '/dashboard'
                return NextResponse.redirect(url)
            }
        }
    }

    // Also redirect authenticated users away from auth pages
    if (user && (path === '/login' || path === '/signup')) {
        const url = request.nextUrl.clone()
        url.pathname = '/dashboard'
        return NextResponse.redirect(url)
    }

    return supabaseResponse
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public files (svg, png, etc)
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
