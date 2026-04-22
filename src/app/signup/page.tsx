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
      <div className="absolute top-0 -left-4 w-72 h-72 bg-emerald-600/10 rounded-full blur-[128px]" />
      <div className="absolute bottom-0 -right-4 w-72 h-72 bg-teal-600/10 rounded-full blur-[128px]" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md glass-card p-8 shadow-2xl z-10 border border-white/5 bg-slate-900/50 backdrop-blur-xl rounded-3xl"
      >
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 rounded-3xl overflow-hidden shadow-2xl shadow-emerald-500/20 border border-white/10 bg-slate-900 flex items-center justify-center">
             <ShieldCheck className="w-10 h-10 text-emerald-500" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight uppercase">
            {step === 'details' ? 'Create Account' : 'Verify Email'}
          </h1>
          <p className="text-slate-400 text-xs font-bold tracking-widest mt-2 uppercase">
            {step === 'details' ? 'Start your investment journey' : `Enter code sent to ${email}`}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {step === 'details' ? (
            <motion.form 
              key="details"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onSubmit={handleSendOTP} 
              className="space-y-4"
            >
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 ml-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full bg-slate-950/50 border border-white/10 text-white pl-12 pr-4 py-3.5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all placeholder:text-slate-600"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 ml-1">Email Address</label>
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

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 ml-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950/50 border border-white/10 text-white pl-12 pr-4 py-3.5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all placeholder:text-slate-600"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 rounded-2xl transition-all shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2 mt-6 uppercase tracking-widest disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                  <>
                    Continue
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </motion.form>
          ) : (
            <motion.form 
              key="otp"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handleVerifyAndSignup} 
              className="space-y-6"
            >
              <div className="space-y-2 text-center">
                <label className="text-sm font-medium text-slate-300">Enter Verification Code</label>
                <div className="flex justify-center">
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="000000"
                    className="w-48 text-center text-3xl font-black bg-slate-950/50 border border-white/10 text-emerald-500 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all tracking-[0.5em] placeholder:text-slate-800"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 rounded-2xl transition-all shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2 uppercase tracking-widest disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                    <>
                      Verify & Register
                      <ShieldCheck className="w-5 h-5" />
                    </>
                  )}
                </button>
                
                <button
                  type="button"
                  onClick={() => setStep('details')}
                  className="w-full py-3 text-slate-400 hover:text-white font-bold text-sm transition-colors flex items-center justify-center gap-2 uppercase tracking-widest"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Details
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        <p className="text-center mt-8 text-slate-400 text-sm">
          Already have an account?{' '}
          <Link href="/login" className="text-emerald-500 hover:text-emerald-400 font-bold transition-colors">
            Sign In
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
