import { Hero } from '@/components/features/landing/hero'
import { HowItWorks } from '@/components/features/landing/how-it-works'
import { Pricing } from '@/components/features/landing/pricing'
import { WaitlistForm } from '@/components/features/landing/waitlist-form'

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-950 text-white selection:bg-purple-500/30">
      <Hero />
      <HowItWorks />
      <Pricing />
      <WaitlistForm />

      <footer className="py-12 bg-gray-950 border-t border-gray-900 text-center text-gray-600 text-sm">
        <p>© {new Date().getFullYear()} Inner Circle. All rights reserved.</p>
      </footer>
    </main>
  )
}
