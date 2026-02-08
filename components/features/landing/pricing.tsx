import { Check } from 'lucide-react'
import Link from 'next/link'

const tiers = [
    {
        name: 'Basic',
        price: '$20',
        period: '/month',
        description: 'Essential access to the network.',
        features: [
            'Member Directory Access',
            '1 Curated Introduction / Month',
            'Community Forum',
            'Standard Support',
        ],
        cta: 'Apply for Basic',
        highlight: false,
    },
    {
        name: 'Prestige',
        price: '$98',
        period: '/month',
        description: 'Priority access and enhanced visibility.',
        features: [
            'Priority Member Directory Listing',
            '3 Curated Introductions / Month',
            'Exclusive "Prestige" Badge',
            'VIP Event Access',
            'Concierge Support',
        ],
        cta: 'Apply for Prestige',
        highlight: true,
    },
]

export function Pricing() {
    return (
        <section id="pricing" className="py-24 bg-gray-950 text-white">
            <div className="max-w-6xl mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold mb-6">Membership Tiers</h2>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                        Choose the level of engagement that suits your professional goals.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {tiers.map((tier) => (
                        <div
                            key={tier.name}
                            className={`relative rounded-3xl p-8 border ${tier.highlight
                                    ? 'bg-gray-900 border-purple-500/50 shadow-2xl shadow-purple-900/20'
                                    : 'bg-gray-900/50 border-gray-800'
                                } flex flex-col`}
                        >
                            {tier.highlight && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-sm font-bold tracking-wide">
                                    MOST POPULAR
                                </div>
                            )}

                            <div className="mb-8">
                                <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-5xl font-bold">{tier.price}</span>
                                    <span className="text-gray-400">{tier.period}</span>
                                </div>
                                <p className="text-gray-400 mt-4">{tier.description}</p>
                            </div>

                            <ul className="space-y-4 mb-8 flex-1">
                                {tier.features.map((feature) => (
                                    <li key={feature} className="flex items-center gap-3">
                                        <div className={`p-1 rounded-full ${tier.highlight ? 'bg-purple-500/20 text-purple-400' : 'bg-gray-800 text-gray-400'}`}>
                                            <Check className="w-4 h-4" />
                                        </div>
                                        <span className="text-gray-300">{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <Link
                                href="#apply"
                                className={`w-full py-4 rounded-xl text-center font-bold transition-all ${tier.highlight
                                        ? 'bg-white text-gray-950 hover:bg-gray-100'
                                        : 'bg-gray-800 text-white hover:bg-gray-700'
                                    }`}
                            >
                                {tier.cta}
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
