import { createClient } from '@/lib/supabase/server'
import { WelcomeCard } from '@/components/features/member/welcome-card'
import { UpcomingIntroCard } from '@/components/features/member/upcoming-intro-card'
import { IntroHistory } from '@/components/features/member/intro-history'
import { MembershipCard } from '@/components/features/member/membership-card'
import { redirect } from 'next/navigation'
import { signout } from '@/app/actions/auth'

export default async function DashboardPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Fetch user profile and subscription
    const [
        { data: profile },
        { data: subscription },
        { data: introsRaw }
    ] = await Promise.all([
        supabase.from('users').select('*').eq('id', user.id).single(),
        supabase.from('subscriptions').select('*').eq('user_id', user.id).single(),
        supabase
            .from('introductions')
            .select(`
                *,
                member_a:users!member_a_id(id, name, member_profiles(company, role_title)),
                member_b:users!member_b_id(id, name, member_profiles(company, role_title)),
                introduction_feedback(member_id)
            `)
            .or(`member_a_id.eq.${user.id},member_b_id.eq.${user.id}`)
            .order('created_at', { ascending: false })
    ])

    // Process introductions
    const introductions = (introsRaw || []).map(intro => {
        const isMemberA = intro.member_a_id === user.id
        const otherMemberData = isMemberA ? intro.member_b : intro.member_a

        return {
            id: intro.id,
            status: intro.status,
            month_year: intro.month_year,
            sent_at: intro.sent_at,
            intro_message: intro.intro_message,
            other_member: {
                name: otherMemberData?.name || 'Unknown',
                company: otherMemberData?.member_profiles?.[0]?.company || 'Unknown',
                role_title: otherMemberData?.member_profiles?.[0]?.role_title || 'Unknown',
            },
            feedback_given: (intro.introduction_feedback || []).some(
                (f: any) => f.member_id === user.id
            )
        }
    })

    const upcomingIntro = introductions.find(i => ['approved', 'sent'].includes(i.status)) || null
    const pastIntros = introductions.filter(i => i.status === 'completed')

    return (
        <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-8">
                <WelcomeCard
                    name={profile?.name || user.email?.split('@')[0] || 'Member'}
                    tier={subscription?.tier || 'Basic'}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-2 space-y-8">
                        <UpcomingIntroCard introduction={upcomingIntro} />
                        <IntroHistory introductions={pastIntros} />
                    </div>

                    <div className="space-y-8">
                        <MembershipCard
                            tier={subscription?.tier || 'Basic'}
                            status={subscription?.status || 'inactive'}
                            nextBillingDate={subscription?.current_period_end}
                        />

                        {/* Quick links card */}
                        <div className="rounded-xl border bg-card p-6 shadow-sm">
                            <h3 className="font-semibold mb-4">Quick Links</h3>
                            <ul className="space-y-3 text-sm">
                                <li>
                                    <a href="/profile" className="text-primary hover:underline">Edit Profile</a>
                                </li>
                                {profile?.role === 'admin' && (
                                    <li>
                                        <a href="/admin" className="text-primary hover:underline font-bold">Admin Dashboard</a>
                                    </li>
                                )}
                                <li>
                                    <a href="/member/directory" className="text-primary hover:underline">Member Directory</a>
                                </li>
                                <li>
                                    <a href="/faq" className="text-primary hover:underline">How it Works</a>
                                </li>
                                <li>
                                    <a href="mailto:support@innercircle.com" className="text-primary hover:underline">Contact Support</a>
                                </li>
                                <li className="pt-2 border-t">
                                    <form action={signout}>
                                        <button type="submit" className="text-destructive hover:underline font-medium">
                                            Logout
                                        </button>
                                    </form>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
