import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { createStripePortalSession } from "@/app/actions/subscriptions"
import { CreditCard, Calendar, Settings } from "lucide-react"
import { formatDate } from "@/lib/utils"

interface MembershipCardProps {
    tier: string
    status: string
    nextBillingDate: string | null
}

export function MembershipCard({ tier, status, nextBillingDate }: MembershipCardProps) {
    const isPremium = tier.toLowerCase() === 'prestige'

    return (
        <Card className="flex flex-col">
            <CardHeader>
                <CardTitle className="text-lg">Your Membership</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 space-y-6">
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Settings className="h-4 w-4" />
                            <span>Plan</span>
                        </div>
                        <span className={`text-sm font-bold uppercase ${isPremium ? 'text-purple-600' : 'text-blue-600'}`}>
                            {tier}
                        </span>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <CreditCard className="h-4 w-4" />
                            <span>Status</span>
                        </div>
                        <span className={`text-sm font-medium capitalize ${status === 'active' ? 'text-green-600' : 'text-yellow-600'}`}>
                            {status}
                        </span>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>Next Bill</span>
                        </div>
                        <span className="text-sm font-medium">
                            {nextBillingDate ? formatDate(nextBillingDate) : 'N/A'}
                        </span>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="pt-0">
                <form action={createStripePortalSession} className="w-full">
                    <Button variant="outline" className="w-full gap-2" type="submit">
                        Manage Subscription
                    </Button>
                </form>
            </CardFooter>
        </Card>
    )
}
