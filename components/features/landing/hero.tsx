import Link from 'next/link'

export function Hero() {
    return (
        <section className="relative min-h-[90vh] flex flex-col items-center justify-center text-center px-4 overflow-hidden">
            {/* Background Gradient Blob */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[120px] -z-10" />

            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8">
                <span className="block text-white mb-2">Unlock Your</span>
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Inner Circle
                </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mb-12 leading-relaxed">
                The exclusive community for elite professionals. Curated introductions, high-value networking, and zero noise.
            </p>

            <div className="flex flex-col sm:flex-row gap-6">
                <Link
                    href="#apply"
                    className="px-8 py-4 bg-white text-gray-950 font-semibold rounded-full hover:bg-gray-100 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                >
                    Apply for Access
                </Link>
                <Link
                    href="#how-it-works"
                    className="px-8 py-4 bg-transparent border border-gray-800 text-white font-semibold rounded-full hover:bg-white/5 transition-colors"
                >
                    How It Works
                </Link>
            </div>

            <div className="mt-20 flex items-center gap-8 text-sm text-gray-500 font-medium">
                <span>STRATEGY</span>
                <span className="w-1.5 h-1.5 bg-gray-700 rounded-full" />
                <span>LEADERSHIP</span>
                <span className="w-1.5 h-1.5 bg-gray-700 rounded-full" />
                <span>GROWTH</span>
            </div>
        </section>
    )
}
