import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface WelcomeCardProps {
    name: string
    tier: string
}

export function WelcomeCard({ name, tier }: WelcomeCardProps) {
    const isPrestige = tier.toLowerCase() === 'prestige'

    return (
        <Card className="col-span-full bg-gradient-to-r from-blue-50 to-indigo-50 border-none">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="space-y-1">
                    <CardTitle className="text-3xl font-bold">Welcome back, {name}!</CardTitle>
                    <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${isPrestige
                                ? "bg-purple-100 text-purple-700 border border-purple-200"
                                : "bg-blue-100 text-blue-700 border border-blue-200"
                            }`}>
                            {tier} Member
                        </span>
                    </div>
                </div>
                <Link href="/profile">
                    <Button variant="outline" size="sm">
                        Edit Profile
                    </Button>
                </Link>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">
                    Here's what's happening with your Inner Circle experience today.
                </p>
            </CardContent>
        </Card>
    )
}
