import Link from 'next/link';
import { CheckCircle } from 'lucide-react';

export default function SubscriptionSuccessPage() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
            <div className="mx-auto flex w-full max-w-md flex-col items-center justify-center space-y-6 text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
                    <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-500" />
                </div>
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl">
                        Payment Successful!
                    </h1>
                    <p className="text-muted-foreground md:text-xl">
                        Thank you for joining Inner Circle. Your membership is now active.
                    </p>
                </div>
                <div className="pt-4">
                    <Link
                        href="/onboarding"
                        className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                    >
                        Complete Onboarding
                    </Link>
                </div>
            </div>
        </div>
    );
}
