import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  try {
    const { email, code, purpose } = await request.json();

    if (!email || !code || !purpose) {
      return NextResponse.json({ error: 'Email, code, and purpose are required' }, { status: 400 });
    }

    // Verify OTP
    const { data: verification, error: dbError } = await supabaseAdmin
      .from('otp_verifications')
      .select('*')
      .eq('email', email)
      .eq('code', code)
      .eq('purpose', purpose)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (dbError || !verification) {
      return NextResponse.json({ error: 'Invalid or expired verification code' }, { status: 400 });
    }

    // Optional: Delete the OTP after verification to prevent reuse
    await supabaseAdmin
      .from('otp_verifications')
      .delete()
      .eq('id', verification.id);

    return NextResponse.json({ success: true, message: 'OTP verified successfully' });
  } catch (error) {
    console.error('Verify Error:', error);
    return NextResponse.json({ error: 'Failed to verify OTP' }, { status: 500 });
  }
}
