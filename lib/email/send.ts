import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Use a verified domain or resend default for testing if not set up
const FROM_EMAIL = process.env.NEXT_PUBLIC_FROM_EMAIL || 'onboarding@resend.dev';

type SendEmailParams = {
    to: string;
    subject: string;
    html: string;
    scheduledAt?: string; // ISO string
};

export async function sendEmail({
    to,
    subject,
    html,
    scheduledAt,
}: SendEmailParams) {
    if (!process.env.RESEND_API_KEY) {
        console.log('RESEND_API_KEY is missing. Logging email instead.');
        console.log(`To: ${to}, Subject: ${subject}, ScheduledAt: ${scheduledAt}`);
        return { success: true, id: 'mock-id' };
    }

    try {
        const payload: any = {
            from: FROM_EMAIL,
            to,
            subject,
            html,
        };

        if (scheduledAt) {
            payload.scheduled_at = scheduledAt;
        }

        const data = await resend.emails.send(payload);

        if (data.error) {
            console.error('Error sending email:', data.error);
            return { success: false, error: data.error };
        }

        return { success: true, id: data.data?.id };
    } catch (error) {
        console.error('Error sending email:', error);
        return { success: false, error };
    }
}

export async function cancelEmail(emailId: string) {
    if (!process.env.RESEND_API_KEY) {
        console.log(`Mock cancelling email: ${emailId}`);
        return { success: true };
    }

    try {
        const data = await resend.emails.cancel(emailId);
        if (data.error) {
            console.error('Error cancelling email:', data.error);
            // If email is already sent or not found, we might want to know, but for "Undo" UI, 
            // we mostly care about trying.
            return { success: false, error: data.error };
        }
        return { success: true };
    } catch (error) {
        console.error('Error cancelling email:', error);
        return { success: false, error };
    }
}
