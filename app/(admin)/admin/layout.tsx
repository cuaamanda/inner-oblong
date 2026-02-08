import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

    if (userData?.role !== 'admin') {
        redirect('/')
    }

    return (
        <div className="flex min-h-screen flex-col">
            <header className="border-b bg-muted/40 p-4">
                <div className="container mx-auto flex items-center justify-between">
                    <div className="font-bold text-lg">Admin Dashboard</div>
                    <nav className="flex gap-4 text-sm font-medium">
                        <Link href="/admin" className="hover:underline">Overview</Link>
                        <Link href="/admin/applications" className="hover:underline">Applications</Link>
                        <Link href="/" className="hover:underline text-muted-foreground">Back to Site</Link>
                    </nav>
                </div>
            </header>
            <main className="flex-1 p-8 container mx-auto">
                {children}
            </main>
        </div>
    )
}
