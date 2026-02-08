import { createClient } from '@/lib/supabase/server'
import { StatsCards } from '@/components/features/admin/stats-cards'

export default async function AdminDashboardPage() {
    const supabase = await createClient()

    // Fetch stats in parallel for efficiency
    const [
        { count: totalApplications },
        { count: pendingApplications },
        { count: approvedApplications },
        { count: rejectedApplications },
        { count: activeMembers },
        { count: introductionsThisMonth },
    ] = await Promise.all([
        supabase.from('applications').select('*', { count: 'exact', head: true }),
        supabase.from('applications').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('applications').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
        supabase.from('applications').select('*', { count: 'exact', head: true }).eq('status', 'rejected'),
        supabase.from('users').select('*', { count: 'exact', head: true }).in('role', ['member', 'admin']), // Assuming admin is also a member/active user
        // For introductions, we need to filter by current month.
        // Supabase filter for date range.
        supabase.from('introductions').select('*', { count: 'exact', head: true }).gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),
    ])

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground">Overview of your community growth and activity.</p>
            </div>

            <StatsCards
                totalApplications={totalApplications || 0}
                pendingApplications={pendingApplications || 0}
                approvedApplications={approvedApplications || 0}
                rejectedApplications={rejectedApplications || 0}
                activeMembers={activeMembers || 0}
                introductionsThisMonth={introductionsThisMonth || 0}
            />
        </div>
    )
}
