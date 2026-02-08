'use client'

import { useActionState, useEffect, useState } from 'react'
import { submitApplication, ApplicationState } from '@/app/actions/applications'
import { Loader2, Send, AlertCircle, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

const initialState: ApplicationState = {
    success: false,
    message: '',
}

export function WaitlistForm() {
    const [state, formAction, isPending] = useActionState(submitApplication, initialState)
    const [user, setUser] = useState<User | null>(null)
    const [loadingUser, setLoadingUser] = useState(true)
    const [waitlistId, setWaitlistId] = useState<number | null>(null)
    const supabase = createClient()

    useEffect(() => {
        async function initialize() {
            // Set random waitlist ID
            setWaitlistId(Math.floor(Math.random() * 500) + 1042)

            // Check user authentication
            const { data: { user } } = await supabase.auth.getUser()
            setUser(user)
            setLoadingUser(false)
        }
        initialize()
    }, [supabase.auth])

    if (loadingUser) {
        return (
            <div className="flex justify-center py-20">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
        )
    }

    if (!user) {
        return (
            <section id="apply" className="py-24 bg-gray-950 text-white flex flex-col items-center text-center">
                <div className="max-w-2xl px-4">
                    <h2 className="text-3xl md:text-5xl font-bold mb-6">Join the Inner Circle</h2>
                    <p className="text-xl text-gray-400 mb-8">
                        Each application is manually reviewed to ensure the quality of our community. Create an account to start your application.
                    </p>
                    <Link
                        href="/signup?next=/apply"
                        className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full font-bold hover:shadow-lg hover:shadow-purple-500/25 transition-all text-lg"
                    >
                        Create Account to Apply
                    </Link>
                    <p className="mt-4 text-gray-500">
                        Already a member? <Link href="/login" className="text-blue-400 hover:underline">Log in</Link>
                    </p>
                </div>
            </section>
        )
    }

    if (state.success) {
        return (
            <section id="apply" className="py-24 bg-gray-950 flex justify-center px-4">
                <div className="max-w-md w-full bg-gray-900 border border-green-500/30 rounded-3xl p-8 text-center shadow-2xl shadow-green-900/20">
                    <div className="w-16 h-16 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">Application Received</h3>
                    <p className="text-gray-400 mb-6">{state.message}</p>
                    <div className="p-4 bg-gray-950 rounded-xl border border-gray-800 text-sm text-gray-500">
                        Waitlist Position: <span className="text-blue-400 font-mono">#{waitlistId}</span>
                    </div>
                </div>
            </section>
        )
    }

    return (
        <section id="apply" className="py-24 bg-gray-950 text-white relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px] -z-10" />

            <div className="max-w-xl mx-auto px-4 relative z-10">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-5xl font-bold mb-4">Request Access</h2>
                    <p className="text-gray-400">
                        Tell us about your professional background.
                    </p>
                </div>

                <form action={formAction} className="space-y-6">
                    <input type="hidden" name="email" value={user.email} />

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label htmlFor="name" className="text-sm font-medium text-gray-300">Full Name</label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                required
                                defaultValue={user.user_metadata?.name || ''}
                                className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-white placeholder:text-gray-600"
                                placeholder="Jane Doe"
                            />
                            {state.errors?.name && <p className="text-red-400 text-xs">{state.errors.name[0]}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Email</label>
                            <div className="w-full bg-gray-900/50 border border-gray-800 rounded-xl px-4 py-3 text-gray-500 cursor-not-allowed">
                                {user.email}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="linkedin_url" className="text-sm font-medium text-gray-300">LinkedIn URL</label>
                        <input
                            id="linkedin_url"
                            name="linkedin_url"
                            type="url"
                            required
                            className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-white placeholder:text-gray-600"
                            placeholder="https://linkedin.com/in/username"
                        />
                        {state.errors?.linkedin_url && <p className="text-red-400 text-xs">{state.errors.linkedin_url[0]}</p>}
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label htmlFor="company" className="text-sm font-medium text-gray-300">Current Company</label>
                            <input
                                id="company"
                                name="company"
                                type="text"
                                required
                                className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-white placeholder:text-gray-600"
                                placeholder="Acme Corp"
                            />
                            {state.errors?.company && <p className="text-red-400 text-xs">{state.errors.company[0]}</p>}
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="role_title" className="text-sm font-medium text-gray-300">Role / Title</label>
                            <input
                                id="role_title"
                                name="role_title"
                                type="text"
                                required
                                className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-white placeholder:text-gray-600"
                                placeholder="Senior Product Manager"
                            />
                            {state.errors?.role_title && <p className="text-red-400 text-xs">{state.errors.role_title[0]}</p>}
                        </div>
                    </div>

                    {state.message && !state.success && (
                        <div className="p-4 bg-red-900/20 border border-red-900/50 rounded-xl flex items-center gap-3 text-red-400 text-sm">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            <p>{state.message}</p>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isPending}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-purple-900/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Submitting...
                            </>
                        ) : (
                            <>
                                Submit Application
                                <Send className="w-5 h-5" />
                            </>
                        )}
                    </button>
                </form>
            </div>
        </section>
    )
}
