import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { supabaseAdmin } from '@/lib/supabase/admin';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function POST(request: Request) {
  try {
    const { email, purpose } = await request.json();

    if (!email || !purpose) {
      return NextResponse.json({ error: 'Email and purpose are required' }, { status: 400 });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    // Save to database (Upsert on email)
    const { error: dbError } = await supabaseAdmin
      .from('otp_verifications')
      .upsert({
        email,
        code: otp,
        purpose,
        expires_at: expiresAt.toISOString(),
      }, { onConflict: 'email' });

    if (dbError) {
      console.error('Database Error:', dbError);
      return NextResponse.json({ error: 'Failed to generate verification code' }, { status: 500 });
    }

    // Send email
    const mailOptions = {
      from: `"Hamro IPO" <${process.env.SMTP_USER}>`,
      to: email,
      subject: purpose === 'signup' ? 'Verify your Hamro IPO account' : 'Reset your Hamro IPO password',
      html: `
        <div style="font-family: 'Plus Jakarta Sans', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #0f172a; color: #f8fafc; border-radius: 12px; border: 1px solid #1e293b;">
          <h2 style="color: #10b981; text-align: center;">Hamro IPO</h2>
          <div style="background-color: #1e293b; padding: 30px; border-radius: 8px; margin-top: 20px;">
            <p style="font-size: 16px; line-height: 1.6;">Hello,</p>
            <p style="font-size: 16px; line-height: 1.6;">Your verification code for <strong>${purpose === 'signup' ? 'Account Creation' : 'Password Reset'}</strong> is:</p>
            <div style="text-align: center; margin: 30px 0;">
              <span style="font-size: 36px; font-weight: 800; letter-spacing: 10px; color: #10b981; background-color: #0f172a; padding: 10px 20px; border-radius: 8px; border: 1px solid #334155;">
                ${otp}
              </span>
            </div>
            <p style="font-size: 14px; color: #94a3b8; text-align: center;">This code will expire in 10 minutes.</p>
          </div>
          <p style="font-size: 12px; color: #64748b; text-align: center; margin-top: 30px;">
            If you didn't request this, please ignore this email.
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true, message: 'OTP sent successfully' });
  } catch (error) {
    console.error('SMTP Error:', error);
    return NextResponse.json({ error: 'Failed to send verification email' }, { status: 500 });
  }
}
