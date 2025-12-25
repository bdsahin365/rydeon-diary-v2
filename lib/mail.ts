import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const domain = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export const sendPasswordResetEmail = async (email: string, token: string) => {
    const resetLink = `${domain}/reset-password?token=${token}`;

    try {
        await resend.emails.send({
            from: 'Rydeon Diary <onboarding@resend.dev>', // Change to your verified domain in production
            to: email,
            subject: 'Reset your password',
            html: `
                <h1>Reset Your Password</h1>
                <p>Click the link below to reset your password:</p>
                <a href="${resetLink}">Reset Password</a>
                <p>If you didn't request this, please ignore this email.</p>
            `,
        });
        console.log("Password reset email sent to:", email);
    } catch (error) {
        console.error("Error sending password reset email:", error);
    }
};
