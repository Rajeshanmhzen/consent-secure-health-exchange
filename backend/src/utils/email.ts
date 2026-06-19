import nodemailer from "nodemailer";

function createTransporter() {
    const port = Number(process.env.SMTP_PORT) || 587;

    console.log("[SMTP] Creating transporter with:", {
        host: process.env.SMTP_HOST,
        port,
        user: process.env.SMTP_USER,
        passSet: !!process.env.SMTP_PASS
    });

    return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port,
        secure: port === 465,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
        tls: {
            rejectUnauthorized: false
        },
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 15000,
    });
}

export async function sendConsentOtpEmail(email: string, code: string): Promise<void> {
    const transporter = createTransporter();
    try {
        const info = await transporter.sendMail({
            from: `"Health Exchange" <${process.env.SMTP_USER}>`,
            to: email,
            subject: "Your Consent Verification Code",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #f9f9ff; border-radius: 12px;">
                    <h2 style="color: #8B5CF6; margin-bottom: 8px;">Consent Authorization Code</h2>
                    <p style="color: #374151; margin-bottom: 24px;">Use this code to authorize the release of your medical records.</p>
                    <div style="background: #fff; border: 2px solid #8B5CF6; border-radius: 10px; padding: 20px; text-align: center; margin-bottom: 24px;">
                        <p style="font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #8B5CF6; margin: 0;">${code}</p>
                    </div>
                    <p style="color: #6B7280; font-size: 13px;">This code expires in 10 minutes. If you did not request this, please ignore this email.</p>
                </div>
            `,
        });
        console.log("[SMTP] Consent OTP email sent:", info.messageId, "| Response:", info.response);
    } catch (err: any) {
        console.error("[SMTP] Consent OTP email FAILED:", err?.message, "| Code:", err?.code, "| Command:", err?.command);
        throw err;
    }
}

export async function sendForgotPasswordEmail(email: string, code: string): Promise<void> {
    const resetLink = `${process.env.FRONTEND_URL || "http://localhost:5173"}/reset-password?email=${encodeURIComponent(email)}&code=${code}`;
    const transporter = createTransporter();
    try {
        const info = await transporter.sendMail({
            from: `"Health Exchange" <${process.env.SMTP_USER}>`,
            to: email,
            subject: "Reset Your Password",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #f9f9ff; border-radius: 12px;">
                    <h2 style="color: #8B5CF6; margin-bottom: 8px;">Reset Your Password</h2>
                    <p style="color: #374151; margin-bottom: 24px;">We received a request to reset your password. Use the code below or click the link to proceed.</p>

                    <div style="background: #fff; border: 2px solid #8B5CF6; border-radius: 10px; padding: 20px; text-align: center; margin-bottom: 24px;">
                        <p style="color: #6B7280; font-size: 13px; margin: 0 0 8px;">Your verification code</p>
                        <p style="font-size: 36px; font-weight: 700; letter-spacing: 10px; color: #8B5CF6; margin: 0;">${code}</p>
                        <p style="color: #9CA3AF; font-size: 12px; margin: 8px 0 0;">Expires in 15 minutes</p>
                    </div>

                    <p style="color: #6B7280; font-size: 13px; text-align: center; margin-bottom: 16px;">— or —</p>

                    <div style="text-align: center; margin-bottom: 24px;">
                        <a href="${resetLink}" style="display: inline-block; background: #8B5CF6; color: #fff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 600; font-size: 14px;">
                            Reset Password via Link
                        </a>
                    </div>

                    <p style="color: #9CA3AF; font-size: 12px; text-align: center;">If you didn't request this, you can safely ignore this email.</p>
                </div>
            `,
        });
        console.log("[SMTP] Forgot password email sent:", info.messageId, "| Response:", info.response);
    } catch (err: any) {
        console.error("[SMTP] Forgot password email FAILED:", err?.message, "| Code:", err?.code, "| Command:", err?.command);
        throw err;
    }
}
