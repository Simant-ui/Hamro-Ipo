import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  try {
    const { email, password, name, code } = await request.json();

    if (!email || !password || !name || !code) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    // 1. Verify OTP
    const { data: verification, error: dbError } = await supabaseAdmin
      .from('otp_verifications')
      .select('*')
      .eq('email', email)
      .eq('code', code)
      .eq('purpose', 'signup')
      .gt('expires_at', new Date().toISOString())
      .single();

    if (dbError || !verification) {
      return NextResponse.json({ error: 'Invalid or expired verification code' }, { status: 400 });
    }

    // 2. Check if user already exists
    const { data: existingUser } = await supabaseAdmin.auth.admin.listUsers();
    const userExists = existingUser.users.some(u => u.email === email);
    
    if (userExists) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    // 3. Create User in Supabase Auth
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: name }
    });

    if (authError) {
      console.error('Auth Error:', authError);
      return NextResponse.json({ error: authError.message }, { status: 500 });
    }

    // 4. Delete the OTP
    await supabaseAdmin
      .from('otp_verifications')
      .delete()
      .eq('id', verification.id);

    return NextResponse.json({ 
      success: true, 
      message: 'Account created successfully. You can now login.' 
    });
  } catch (error) {
    console.error('Signup Error:', error);
    return NextResponse.json({ error: 'Failed to create account' }, { status: 500 });
  }
}
