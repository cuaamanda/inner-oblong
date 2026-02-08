import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatDate } from "@/lib/utils"
import { CheckCircle2, MessageSquare, ArrowRight } from "lucide-react"

interface PastIntroduction {
    id: string
    other_member: {
        name: string
        company: string
    }
    sent_at: string
    feedback_given: boolean
}

interface IntroHistoryProps {
    introductions: PastIntroduction[]
}

export function IntroHistory({ introductions }: IntroHistoryProps) {
    return (
        <Card className="col-span-1 md:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl">Past Introductions</CardTitle>
                {introductions.length > 0 && (
                    <Link href="/introductions">
                        <Button variant="ghost" size="sm" className="gap-1">
                            View All <ArrowRight className="h-4 w-4" />
                        </Button>
                    </Link>
                )}
            </CardHeader>
            <CardContent>
                {introductions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                            <MessageSquare className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <p className="font-medium">No past introductions yet</p>
                        <p className="text-sm text-muted-foreground">
                            Your history will appear here once you've completed your first match.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {introductions.slice(0, 5).map((intro) => (
                            <div key={intro.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/30 transition-colors">
                                <div className="space-y-1">
                                    <p className="font-medium">{intro.other_member.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {intro.other_member.company} • Joined {formatDate(intro.sent_at)}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    {intro.feedback_given ? (
                                        <div className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full font-medium">
                                            <CheckCircle2 className="h-3 w-3" />
                                            Feedback Sent
                                        </div>
                                    ) : (
                                        <Link href={`/introductions/${intro.id}/feedback`}>
                                            <Button variant="outline" size="sm" className="h-7 text-xs px-2">
                                                Leave Feedback
                                            </Button>
                                        </Link>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
