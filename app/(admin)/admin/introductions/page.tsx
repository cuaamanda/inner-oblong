import { createClient } from '@/lib/supabase/server'
import { MatchCard } from '@/components/features/admin/match-card'
import { generateSuggestions } from '@/app/actions/introductions'
import Link from 'next/link'

interface IntroductionsPageProps {
    searchParams: Promise<{
        month?: string
        status?: string
    }>
}

export default async function IntroductionsPage({ searchParams }: IntroductionsPageProps) {
    const supabase = await createClient()
    const { month, status } = await searchParams

    // Defaults
    const now = new Date()
    const defaultMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    const currentMonth = month || defaultMonth
    const currentStatus = status || 'suggested'

    // 1. Fetch matching stats for the dashboard (current month)
    const { data: statsData } = await supabase
        .from('introductions')
        .select('status')
        .eq('month_year', currentMonth)

    const stats = {
        sent: statsData?.filter(i => i.status === 'sent').length || 0,
        pending: statsData?.filter(i => i.status === 'suggested' || i.status === 'approved').length || 0,
        total: statsData?.length || 0,
    }
    const completionRate = stats.total > 0 ? Math.round((stats.sent / stats.total) * 100) : 0

    // 2. Fetch introductions based on filters
    let query = supabase
        .from('introductions')
        .select(`
            *,
            member_a:member_a_id (
                id,
                name,
                member_profiles (company, role_title)
            ),
            member_b:member_b_id (
                id,
                name,
                member_profiles (company, role_title)
            )
        `)
        .order('created_at', { ascending: false })

    if (currentMonth) query = query.eq('month_year', currentMonth)
    if (currentStatus && currentStatus !== 'all') query = query.eq('status', currentStatus)

    const { data: introductions, error } = await query

    if (error) {
        console.error('Error fetching introductions:', error)
        return <div className="p-8 text-red-600">Error loading introductions. Please try again.</div>
    }

    return (
        <div className="space-y-8 pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 font-outfit">Introduction Management</h1>
                    <p className="text-gray-500 mt-1">Review, modify, and send monthly match suggestions.</p>
                </div>

                <form action={async () => {
                    'use server'
                    await generateSuggestions()
                }}>
                    <button
                        type="submit"
                        className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-semibold shadow-sm transition-all flex items-center justify-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Generate Suggestions
                    </button>
                </form>
            </div>

            {/* Dashboard Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">Sent This Month</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.sent}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">Pending Approval</p>
                    <p className="text-3xl font-bold text-gray-900 text-indigo-600">{stats.pending}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">Completion Rate</p>
                    <p className="text-3xl font-bold text-gray-900">{completionRate}%</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">Total Created</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-wrap gap-4 items-center">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-700">Month:</span>
                    <select
                        defaultValue={currentMonth}
                        className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        onChange={(e) => {
                            const url = new URL(window.location.href)
                            url.searchParams.set('month', e.target.value)
                            window.location.href = url.toString()
                        }}
                    >
                        {/* Simple month generator for past 6 months and next 1 month */}
                        {Array.from({ length: 8 }).map((_, i) => {
                            const d = new Date()
                            d.setMonth(d.getMonth() - i + 1)
                            const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
                            return <option key={val} value={val}>{val}</option>
                        })}
                    </select>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-700">Status:</span>
                    <div className="flex bg-gray-100 p-1 rounded-lg">
                        {['all', 'suggested', 'approved', 'sent', 'declined'].map((s) => (
                            <Link
                                key={s}
                                href={`?month=${currentMonth}&status=${s}`}
                                className={`px-4 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all ${currentStatus === s
                                        ? 'bg-white text-indigo-600 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                {s}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {/* Match List */}
            {introductions && introductions.length > 0 ? (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {introductions.map((match: any) => (
                        <MatchCard key={match.id} match={match} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-24 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 text-gray-400 mb-4">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No matches found</h3>
                    <p className="text-gray-500 max-w-sm mx-auto">
                        Try changing the filters or click "Generate Suggestions" to create new matches for this month.
                    </p>
                </div>
            )}
        </div>
    )
}
