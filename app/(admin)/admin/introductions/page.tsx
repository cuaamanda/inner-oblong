import { createClient } from '@/lib/supabase/server'
import { generateSuggestions, approveMatch, declineMatch } from '@/app/actions/introductions'
import { Button } from '@/components/ui/button'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { redirect } from 'next/navigation'

export default async function AdminintroductionsPage() {
    const supabase = await createClient()

    // 1. Check Admin access
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

    if (userData?.role !== 'admin') redirect('/dashboard')

    // 2. Fetch suggested introductions
    // We join with users twice (for member_a and member_b)
    const { data: suggestedMatches, error } = await supabase
        .from('introductions')
        .select(`
            id,
            status,
            intro_message,
            month_year,
            created_at,
            member_a:users!member_a_id (name, email),
            member_b:users!member_b_id (name, email)
        `)
        .eq('status', 'suggested')
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching suggested matches:', error)
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Match Suggestions</h1>
                    <p className="text-muted-foreground">Review and approve introductions for members.</p>
                </div>
                <form action={generateSuggestions}>
                    <Button type="submit">Generate Suggestions</Button>
                </form>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Suggested Pairs</CardTitle>
                    <CardDescription>
                        Matches generated based on expertise alignment and industry.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {!suggestedMatches || suggestedMatches.length === 0 ? (
                        <div className="py-10 text-center text-muted-foreground">
                            No suggested matches found. Click "Generate Suggestions" to start.
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Member A</TableHead>
                                    <TableHead>Member B</TableHead>
                                    <TableHead>Reasoning</TableHead>
                                    <TableHead>Month</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {suggestedMatches.map((match: any) => (
                                    <TableRow key={match.id}>
                                        <TableCell>
                                            <div className="font-medium">{match.member_a.name}</div>
                                            <div className="text-xs text-muted-foreground">{match.member_a.email}</div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium">{match.member_b.name}</div>
                                            <div className="text-xs text-muted-foreground">{match.member_b.email}</div>
                                        </TableCell>
                                        <TableCell className="max-w-md">
                                            <p className="text-sm line-clamp-2" title={match.intro_message}>
                                                {match.intro_message}
                                            </p>
                                        </TableCell>
                                        <TableCell>{match.month_year}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <form action={approveMatch.bind(null, match.id)}>
                                                    <Button variant="default" size="sm">Approve</Button>
                                                </form>
                                                <form action={declineMatch.bind(null, match.id)}>
                                                    <Button variant="outline" size="sm">Decline</Button>
                                                </form>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
