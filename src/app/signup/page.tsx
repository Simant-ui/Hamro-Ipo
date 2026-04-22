'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { UserPlus, Mail, Lock, User, Loader2, ArrowRight, ShieldCheck, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

type Step = 'details' | 'otp'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState<Step>('details')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, purpose: 'signup' }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send OTP')
      }

      toast.success('Verification code sent to your email!')
      setStep('otp')
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyAndSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          name: fullName,
          code: otp
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Signup failed')
      }

      toast.success('Registration successful! Redirecting to login...')
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
      <div className="absolute top-0 -left-4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[128px] animate-pulse" />
      <div className="absolute bottom-0 -right-4 w-96 h-96 bg-blue-500/10 rounded-full blur-[128px]" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md p-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl z-10"
      >
        <div className="text-center mb-10">
          <div className="w-16 h-16 mx-auto mb-6 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20 rotate-3 transition-transform">
             <ShieldCheck className="w-8 h-8 text-slate-950" />
          </div>
          <h1 className="text-3xl font-black text-slate-950 dark:text-white tracking-tight uppercase italic">
            {step === 'details' ? 'Create Account' : 'Verify Email'}
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            {step === 'details' ? 'Start your investment journey' : `Enter code sent to ${email}`}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {step === 'details' ? (
            <motion.form 
              key="details"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              onSubmit={handleSendOTP} 
              className="space-y-5"
            >
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 ml-1 uppercase tracking-widest">Full Name</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Institutional Name"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-950 dark:text-white pl-11 pr-4 py-3.5 rounded-xl focus:outline-none focus:border-emerald-500/50 transition-all placeholder:text-slate-400 text-sm font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 ml-1 uppercase tracking-widest">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-950 dark:text-white pl-11 pr-4 py-3.5 rounded-xl focus:outline-none focus:border-emerald-500/50 transition-all placeholder:text-slate-400 text-sm font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 ml-1 uppercase tracking-widest">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-950 dark:text-white pl-11 pr-4 py-3.5 rounded-xl focus:outline-none focus:border-emerald-500/50 transition-all placeholder:text-slate-400 text-sm font-medium"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-500 text-slate-950 font-black py-4 rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 mt-6 uppercase tracking-widest disabled:opacity-50 hover:bg-emerald-600 active:scale-[0.98]"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                  <>
                    Continue Registration
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </motion.form>
          ) : (
            <motion.form 
              key="otp"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              onSubmit={handleVerifyAndSignup} 
              className="space-y-8"
            >
              <div className="space-y-4 text-center">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Security Verification</label>
                <div className="flex justify-center">
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="000000"
                    className="w-48 text-center text-3xl font-black bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-emerald-600 dark:text-emerald-500 py-5 rounded-2xl focus:outline-none focus:border-emerald-500/50 transition-all tracking-[0.4em] placeholder:text-slate-200 dark:placeholder:text-slate-800"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="w-full bg-emerald-500 text-slate-950 font-black py-4 rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 uppercase tracking-widest disabled:opacity-50 hover:bg-emerald-600 active:scale-[0.98]"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                    <>
                      Verify & Activate
                      <CheckCircle2 className="w-5 h-5" />
                    </>
                  )}
                </button>
                
                <button
                  type="button"
                  onClick={() => setStep('details')}
                  className="w-full py-2 text-slate-500 hover:text-emerald-600 font-bold text-[11px] transition-colors flex items-center justify-center gap-2 uppercase tracking-widest"
                >
                  <ArrowLeft className="w-3 h-3" />
                  Modify Details
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        <p className="text-center mt-10 text-slate-500 text-[11px] font-bold uppercase tracking-widest">
          Existing member?{' '}
          <Link href="/login" className="text-emerald-600 hover:text-emerald-500 transition-colors">
            Sign In
          </Link>
        </p>
      </motion.div>
    </div>

  )
}
