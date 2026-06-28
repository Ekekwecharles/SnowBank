import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = "SnowBank <noreply@snowbank.io>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export async function sendVerificationEmail(email: string, token: string, name: string) {
  const url = `${APP_URL}/verify-email?token=${token}`;
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: "Verify your SnowBank account",
    html: `
      <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;padding:40px 20px;background:#0A0F1E;color:#fff;border-radius:12px;">
        <h1 style="color:#2563EB;font-size:28px;margin-bottom:8px;">SnowBank</h1>
        <h2 style="font-size:20px;margin-bottom:16px;">Welcome, ${name}!</h2>
        <p style="color:#9ca3af;margin-bottom:24px;">Please verify your email address to activate your account.</p>
        <a href="${url}" style="display:inline-block;background:#2563EB;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:600;">Verify Email</a>
        <p style="color:#6b7280;font-size:12px;margin-top:32px;">Link expires in 24 hours. If you didn't create this account, ignore this email.</p>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail(email: string, token: string, name: string) {
  const url = `${APP_URL}/reset-password?token=${token}`;
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: "Reset your SnowBank password",
    html: `
      <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;padding:40px 20px;background:#0A0F1E;color:#fff;border-radius:12px;">
        <h1 style="color:#2563EB;font-size:28px;margin-bottom:8px;">SnowBank</h1>
        <h2 style="font-size:20px;margin-bottom:16px;">Password Reset Request</h2>
        <p style="color:#9ca3af;margin-bottom:8px;">Hi ${name}, we received a request to reset your password.</p>
        <p style="color:#9ca3af;margin-bottom:24px;">This link expires in 1 hour.</p>
        <a href="${url}" style="display:inline-block;background:#2563EB;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:600;">Reset Password</a>
        <p style="color:#6b7280;font-size:12px;margin-top:32px;">If you didn't request this, please secure your account immediately.</p>
      </div>
    `,
  });
}

export async function sendTransferConfirmationEmail(
  email: string,
  name: string,
  amount: number,
  receiverName: string,
  reference: string,
  balance: number,
) {
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: `Transfer Confirmed — ₦${amount.toLocaleString()}`,
    html: `
      <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;padding:40px 20px;background:#0A0F1E;color:#fff;border-radius:12px;">
        <h1 style="color:#2563EB;font-size:28px;margin-bottom:8px;">SnowBank</h1>
        <h2 style="font-size:20px;margin-bottom:16px;">Transfer Successful</h2>
        <p style="color:#9ca3af;">Hi ${name},</p>
        <p style="color:#9ca3af;margin-bottom:24px;">Your transfer of <strong style="color:#fff;">₦${amount.toLocaleString("en-NG", { minimumFractionDigits: 2 })}</strong> to <strong style="color:#fff;">${receiverName}</strong> was successful.</p>
        <div style="background:#1a2035;border-radius:8px;padding:20px;margin-bottom:24px;">
          <p style="margin:4px 0;color:#9ca3af;">Reference: <span style="color:#fff;">${reference}</span></p>
          <p style="margin:4px 0;color:#9ca3af;">New Balance: <span style="color:#fff;">₦${balance.toLocaleString("en-NG", { minimumFractionDigits: 2 })}</span></p>
        </div>
        <p style="color:#6b7280;font-size:12px;">If you did not authorize this transfer, contact support@snowbank.io immediately.</p>
      </div>
    `,
  });
}
