import { completeOnboarding } from '@/app/actions/profiles'

export default function OnboardingPage() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12">
            <div className="mx-auto flex w-full max-w-lg flex-col space-y-8">
                <div className="flex flex-col space-y-2 text-center">
                    <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl">
                        Complete Your Profile
                    </h1>
                    <p className="text-muted-foreground">
                        Tell us more about yourself to help us curate your experience.
                    </p>
                </div>

                <div className="grid gap-6">
                    <form action={completeOnboarding} className="space-y-6">
                        <div className="space-y-2">
                            <label htmlFor="industry" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                Industry
                            </label>
                            <input
                                id="industry"
                                name="industry"
                                placeholder="e.g. Fintech, E-commerce, AI"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="expertise" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                Expertise
                            </label>
                            <input
                                id="expertise"
                                name="expertise"
                                placeholder="e.g. Product Design, Backend Engineering, Growth"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="looking_for" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                What are you looking for?
                            </label>
                            <textarea
                                id="looking_for"
                                name="looking_for"
                                placeholder="e.g. Networking with founders, Mentorship, Hiring"
                                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="bio" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                Short Bio
                            </label>
                            <textarea
                                id="bio"
                                name="bio"
                                placeholder="Tell us a bit about your journey..."
                                className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="inline-flex h-10 w-full items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                        >
                            Complete Profile
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}
