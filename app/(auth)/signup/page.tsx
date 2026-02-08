'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { signup } from '@/app/actions/auth'

export default function SignupPage() {
    const searchParams = useSearchParams()
    const error = searchParams.get('error')

    return (
        <div className="bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                    Join Inner Circle
                </h1>
                <p className="text-gray-400">Start your exclusive journey today</p>
            </div>

            <form action={signup} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Full Name
                    </label>
                    <input
                        name="fullName"
                        type="text"
                        required
                        className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all"
                        placeholder="John Doe"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Email Address
                    </label>
                    <input
                        name="email"
                        type="email"
                        required
                        className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all"
                        placeholder="you@example.com"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Password
                    </label>
                    <input
                        name="password"
                        type="password"
                        required
                        minLength={6}
                        className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all"
                        placeholder="••••••••"
                    />
                </div>

                {error && (
                    <div className="p-3 rounded-lg text-sm bg-red-500/10 text-red-400 border border-red-500/20">
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold py-3 px-6 rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-purple-500/25"
                >
                    Create Account
                </button>

                <p className="text-center text-gray-400 text-sm">
                    Already a member?{' '}
                    <Link href="/login" className="text-purple-400 hover:text-purple-300 transition-colors">
                        Sign In
                    </Link>
                </p>
            </form>
        </div>
    )
}
