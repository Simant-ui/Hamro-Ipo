import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  try {
    const { email, code, newPassword } = await request.json()

    if (!email || !code || !newPassword) {
      return NextResponse.json({ error: 'Email, code, and new password are required' }, { status: 400 })
    }

    // 1. Verify OTP
    const { data: otpData, error: otpError } = await supabaseAdmin
      .from('otp_verifications')
      .select('*')
      .eq('email', email)
      .eq('code', code)
      .gt('expires_at', new Date().toISOString())
      .single()

    if (otpError || !otpData) {
      return NextResponse.json({ error: 'Invalid or expired verification code' }, { status: 400 })
    }

    // 2. Find user by email
    const { data: { users }, error: findError } = await supabaseAdmin.auth.admin.listUsers()
    
    if (findError) throw findError
    
    const user = users.find(u => u.email === email)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // 3. Update password
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      user.id,
      { password: newPassword }
    )

    if (updateError) throw updateError

    // 4. Delete used OTP
    await supabaseAdmin
      .from('otp_verifications')
      .delete()
      .eq('email', email)

    return NextResponse.json({ message: 'Password reset successful' })
  } catch (error: any) {
    console.error('Reset password error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
