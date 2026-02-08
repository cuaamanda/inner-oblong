import { createClient } from '@/lib/supabase/server'
import { ApplicationTable } from '@/components/features/admin/application-table'

export default async function ApplicationsPage() {
    const supabase = await createClient()

    const { data: applications, error } = await supabase
        .from('applications')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching applications:', error)
        return <div>Error loading applications</div>
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Applications</h1>
                <p className="text-muted-foreground">Review and manage member applications.</p>
            </div>

            <ApplicationTable applications={applications || []} />
        </div>
    )
}
