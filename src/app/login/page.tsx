'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { LogIn, Mail, Lock, Loader2, ArrowRight, ShieldCheck, AlertCircle, Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (loginError) {
      if (loginError.message.includes("Invalid login credentials")) {
        setError("Wrong credentials. Please check your email and password.")
      } else {
        setError(loginError.message)
      }
      setLoading(false)
      return
    }

    toast.success('Login successful!')
    router.push('/dashboard')
    router.refresh()
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
          <h1 className="text-3xl font-black text-white tracking-tight uppercase">Hamro IPO</h1>
          <p className="text-slate-400 text-xs font-bold tracking-widest mt-2 uppercase">Institutional Grade Vault</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-3"
              >
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium">{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

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
            <div className="flex items-center justify-between ml-1">
              <label className="text-sm font-medium text-slate-300">Password</label>
              <Link href="/forgot-password" title="Reset your password" className="text-xs font-black text-emerald-500 hover:text-emerald-400 uppercase tracking-wider transition-colors">
                Forgot?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950/50 border border-white/10 text-white pl-12 pr-12 py-3.5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all placeholder:text-slate-600"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 rounded-2xl transition-all shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2 mt-6 uppercase tracking-widest disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
              <>
                Sign In
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        <p className="text-center mt-8 text-slate-400 text-sm">
          Don&apos;t have an account?{' '}
          <Link href="/signup" title="Create an account" className="text-emerald-500 hover:text-emerald-400 font-black transition-colors uppercase tracking-widest">
            Create Account
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
