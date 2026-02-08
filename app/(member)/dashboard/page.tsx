import { createClient } from '@/lib/supabase/server'
import { signout } from '@/app/actions/auth'
import { createStripePortalSession } from '@/app/actions/subscriptions'

export default async function DashboardPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Fetch subscription details
    const { data: subscription } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user?.id)
        .single()

    return (
        <div className="min-h-screen bg-gray-950 text-white p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
                <div className="space-y-6">
                    <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                        <p className="mb-2 text-xl font-medium">Welcome back, <span className="text-blue-400">{user?.email}</span></p>
                        <p className="text-sm text-gray-500 mb-6">User ID: {user?.id}</p>

                        <form action={signout}>
                            <button className="bg-red-500/10 text-red-400 border border-red-500/20 px-4 py-2 rounded-lg hover:bg-red-500/20 transition-colors">
                                Sign Out
                            </button>
                        </form>
                    </div>

                    <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                        <h2 className="text-xl font-semibold mb-4">Subscription Details</h2>

                        {subscription ? (
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <span className="text-gray-400">Status:</span>
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold uppercase ${subscription.status === 'active' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                                        }`}>
                                        {subscription.status}
                                    </span>
                                </div>

                                {subscription.cancel_at_period_end && (
                                    <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                                        <p className="text-yellow-500 text-sm">
                                            Your subscription will be cancelled on <strong>{new Date(subscription.current_period_end).toLocaleDateString()}</strong>.
                                            You will still have access until then.
                                        </p>
                                    </div>
                                )}

                                <div className="pt-2">
                                    <form action={createStripePortalSession}>
                                        <button className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-4 py-2 rounded-lg hover:bg-blue-500/20 transition-colors text-sm">
                                            Manage Subscription
                                        </button>
                                    </form>
                                </div>
                            </div>
                        ) : (
                            <p className="text-gray-500 text-sm">No active subscription found.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
