import { CheckCircle2, UserCheck, Users } from 'lucide-react'

const steps = [
    {
        icon: UserCheck,
        title: 'Apply',
        description: 'Submit your profile. We vet every applicant to ensure the highest caliber of professionals.',
    },
    {
        icon: CheckCircle2,
        title: 'Get Approved',
        description: 'Once accepted, you gain access to the member directory and exclusive events.',
    },
    {
        icon: Users,
        title: 'Get Introduced',
        description: 'Receive curated introductions to peers who match your goals and expertise.',
    },
]

export function HowItWorks() {
    return (
        <section id="how-it-works" className="py-24 bg-gray-900 text-white">
            <div className="max-w-6xl mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold mb-6">How It Works</h2>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                        A simple, transparent process designed to maintain the quality of our network.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-12 relative">
                    {/* Connector Line (Desktop) */}
                    <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-blue-500/0 via-blue-500/50 to-blue-500/0 -z-0" />

                    {steps.map((step, index) => (
                        <div key={index} className="relative z-10 flex flex-col items-center text-center">
                            <div className="w-24 h-24 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center mb-8 shadow-xl shadow-blue-500/10 group hover:shadow-blue-500/20 transition-all duration-300">
                                <step.icon className="w-10 h-10 text-blue-400 group-hover:scale-110 transition-transform" />
                            </div>
                            <h3 className="text-2xl font-bold mb-4">{step.title}</h3>
                            <p className="text-gray-400 leading-relaxed max-w-xs">
                                {step.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
