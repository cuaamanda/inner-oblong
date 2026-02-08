import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, FileText, CheckCircle, XCircle, UserCheck } from "lucide-react"

interface StatsCardsProps {
    totalApplications: number
    pendingApplications: number
    approvedApplications: number
    rejectedApplications: number
    activeMembers: number
    introductionsThisMonth: number
}

export function StatsCards({
    totalApplications,
    pendingApplications,
    approvedApplications,
    rejectedApplications,
    activeMembers,
    introductionsThisMonth,
}: StatsCardsProps) {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Total Applications
                    </CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{totalApplications}</div>
                    <p className="text-xs text-muted-foreground">
                        All time applications
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Pending Review
                    </CardTitle>
                    <div className="h-4 w-4 text-yellow-500 font-bold">!</div>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{pendingApplications}</div>
                    <p className="text-xs text-muted-foreground">
                        Awaiting action
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Active Members
                    </CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{activeMembers}</div>
                    <p className="text-xs text-muted-foreground">
                        +20% from last month
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Approved
                    </CardTitle>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{approvedApplications}</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Rejected
                    </CardTitle>
                    <XCircle className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{rejectedApplications}</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Introductions
                    </CardTitle>
                    <UserCheck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{introductionsThisMonth}</div>
                    <p className="text-xs text-muted-foreground">
                        Made this month
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
