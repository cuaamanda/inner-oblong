import { createClient } from '@/lib/supabase/server'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatDate } from "@/lib/utils"
import { CheckCircle2, ArrowLeft } from "lucide-react"
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function IntroductionsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const { data: introsRaw } = await supabase
        .from('introductions')
        .select(`
            *,
            member_a:users!member_a_id(id, name, member_profiles(company, role_title)),
            member_b:users!member_b_id(id, name, member_profiles(company, role_title)),
            introduction_feedback(member_id)
        `)
        .or(`member_a_id.eq.${user.id},member_b_id.eq.${user.id}`)
        .order('created_at', { ascending: false })

    const introductions = (introsRaw || []).map(intro => {
        const isMemberA = intro.member_a_id === user.id
        const otherMemberData = isMemberA ? intro.member_b : intro.member_a

        return {
            id: intro.id,
            status: intro.status,
            month_year: intro.month_year,
            sent_at: intro.sent_at,
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

    return (
        <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="mb-6">
                <Link href="/dashboard">
                    <Button variant="ghost" size="sm" className="gap-2">
                        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
                    </Button>
                </Link>
            </div>

            <div className="flex flex-col gap-6">
                <h1 className="text-3xl font-bold">Introduction History</h1>

                {introductions.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center text-muted-foreground">
                            No introductions found yet.
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4">
                        {introductions.map((intro) => (
                            <Card key={intro.id}>
                                <CardContent className="p-6">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-bold text-lg">{intro.other_member.name}</h3>
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium uppercase ${intro.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                                                    }`}>
                                                    {intro.status}
                                                </span>
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                {intro.other_member.role_title} at {intro.other_member.company}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Match for {intro.month_year} • Sent on {intro.sent_at ? formatDate(intro.sent_at) : 'Not sent yet'}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {intro.feedback_given ? (
                                                <div className="flex items-center gap-1.5 text-sm text-green-600 font-medium">
                                                    <CheckCircle2 className="h-4 w-4" />
                                                    Feedback Submitted
                                                </div>
                                            ) : intro.status === 'completed' ? (
                                                <Link href={`/introductions/${intro.id}/feedback`}>
                                                    <Button variant="outline">Leave Feedback</Button>
                                                </Link>
                                            ) : null}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
