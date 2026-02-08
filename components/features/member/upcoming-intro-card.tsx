import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Calendar, User, Building2 } from "lucide-react"

interface Introduction {
    id: string
    other_member: {
        name: string
        company: string
        role_title: string
    } | null
    status: string
    month_year: string
    intro_message?: string
}

interface UpcomingIntroCardProps {
    introduction: Introduction | null
}

export function UpcomingIntroCard({ introduction }: UpcomingIntroCardProps) {
    if (!introduction) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Your Next Introduction</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                        <Calendar className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="font-medium">Coming soon</p>
                    <p className="text-sm text-muted-foreground max-w-[200px]">
                        We're hand-curating your next match. You'll be notified once it's ready.
                    </p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-lg">Your Next Introduction</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50 border">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <User className="h-6 w-6 text-primary" />
                    </div>
                    <div className="space-y-1">
                        <p className="font-bold text-lg leading-tight">
                            {introduction.other_member?.name || 'Hand-picked Match'}
                        </p>
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <Building2 className="h-3.5 w-3.5" />
                            <span>{introduction.other_member?.role_title} at {introduction.other_member?.company}</span>
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <p className="text-sm font-semibold">Intro Theme</p>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                        {introduction.intro_message || "A curated match based on your industry and looking-for criteria."}
                    </p>
                </div>

                <div className="pt-2">
                    <div className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-green-100 text-green-700">
                        Matching for {introduction.month_year}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
