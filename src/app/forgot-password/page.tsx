'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { Mail, Lock, Loader2, ArrowRight, ShieldCheck, ArrowLeft, KeyRound } from 'lucide-react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

type Step = 'email' | 'reset'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [step, setStep] = useState<Step>('email')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, purpose: 'reset_password' }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send reset code')
      }

      toast.success('Reset code sent to your email!')
      setStep('reset')
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          code: otp,
          newPassword
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Reset failed')
      }

      toast.success('Password reset successful! Please login.')
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-slate-950">
      {/* Background Orbs */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-emerald-600/10 rounded-full blur-[128px]" />
      <div className="absolute bottom-0 -right-4 w-72 h-72 bg-teal-600/10 rounded-full blur-[128px]" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md glass-card p-8 shadow-2xl z-10 border border-white/5 bg-slate-900/50 backdrop-blur-xl rounded-3xl"
      >
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 rounded-3xl overflow-hidden shadow-2xl shadow-emerald-500/20 border border-white/10 bg-slate-900 flex items-center justify-center">
             <KeyRound className="w-10 h-10 text-emerald-500" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight uppercase">
            {step === 'email' ? 'Reset Vault' : 'Secure Entry'}
          </h1>
          <p className="text-slate-400 text-xs font-bold tracking-widest mt-2 uppercase">
            {step === 'email' ? 'Recover your account access' : `Updating credentials for ${email}`}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {step === 'email' ? (
            <motion.form 
              key="email"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onSubmit={handleSendOTP} 
              className="space-y-6"
            >
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 ml-1 uppercase tracking-wider">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="w-full bg-slate-950/50 border border-white/10 text-white pl-12 pr-4 py-3.5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all placeholder:text-slate-600"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 rounded-2xl transition-all shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2 uppercase tracking-widest disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                  <>
                    Send Reset Code
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </motion.form>
          ) : (
            <motion.form 
              key="reset"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handleResetPassword} 
              className="space-y-4"
            >
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 ml-1 uppercase tracking-wider">Verification Code</label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className="w-full text-center text-2xl font-black bg-slate-950/50 border border-white/10 text-emerald-500 py-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all tracking-[0.5em] placeholder:text-slate-800"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 ml-1 uppercase tracking-wider">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none" />
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950/50 border border-white/10 text-white pl-12 pr-4 py-3.5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all placeholder:text-slate-600"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 ml-1 uppercase tracking-wider">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950/50 border border-white/10 text-white pl-12 pr-4 py-3.5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all placeholder:text-slate-600"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3 pt-4">
                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 rounded-2xl transition-all shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2 uppercase tracking-widest disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                    <>
                      Reset Password
                      <ShieldCheck className="w-5 h-5" />
                    </>
                  )}
                </button>
                
                <button
                  type="button"
                  onClick={() => setStep('email')}
                  className="w-full py-2 text-slate-400 hover:text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 uppercase tracking-widest"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        <p className="text-center mt-8 text-slate-400 text-sm">
          Remember your password?{' '}
          <Link href="/login" className="text-emerald-500 hover:text-emerald-400 font-bold transition-colors">
            Sign In
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
