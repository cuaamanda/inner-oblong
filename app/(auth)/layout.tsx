export default function AuthLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white p-4">
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-[25%] -left-[10%] w-[50%] h-[50%] rounded-full bg-purple-500/20 blur-[120px]" />
                <div className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] rounded-full bg-blue-500/20 blur-[120px]" />
                <div className="absolute -bottom-[20%] left-[20%] w-[60%] h-[60%] rounded-full bg-indigo-500/10 blur-[120px]" />
            </div>

            <div className="relative w-full max-w-md">
                {children}
            </div>
        </div>
    )
}
