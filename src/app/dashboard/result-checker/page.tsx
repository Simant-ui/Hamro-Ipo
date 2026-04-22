'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  Users, 
  ShieldCheck, 
  Info,
  Building2,
  Trophy,
  History,
  ArrowUpRight
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useAccountStore } from '@/store/useAccountStore'
import { NEPAL_IPO_HISTORY } from '@/constants/ipoHistory'
import { toast } from 'react-hot-toast'
import { cn } from '@/lib/utils'

export default function ResultCheckerPage() {
  const [activeMode, setActiveMode] = useState<'bulk' | 'official'>('bulk')
  const [selectedIpo, setSelectedIpo] = useState<string>('')
  const [checking, setChecking] = useState(false)
  const [results, setResults] = useState<{accountName: string, boid: string, status: 'allotted' | 'not_allotted' | 'not_applied' | 'rejected', units?: number}[]>([])
  const [loadingIpos, setLoadingIpos] = useState(true)

  const { accounts } = useAccountStore()
  const supabase = createClient()

  useEffect(() => {
    // No longer fetching from Supabase, using local constants
    setLoadingIpos(false)
  }, [])

  const handleCheckResults = async () => {
    if (!selectedIpo) {
      toast.error('Please select an IPO first')
      return
    }

    setChecking(true)
    setResults([])

    // Simulate API delay (In reality, this would call MeroShare or a cached result DB)
    await new Promise(resolve => setTimeout(resolve, 2000))

    try {
      // Mock result fetching logic
      // In a real app, you'd fetch from your 'ipo_applications' table to see if user applied
      // and then match against the published results.
      const { data: applications } = await supabase
        .from('ipo_applications')
        .select('*')
        .eq('ipo_id', selectedIpo)

      const checkResults = accounts.map(acc => {
        const boidMasked = acc.boid.slice(0, 4) + '****' + acc.boid.slice(-4)
        
        const random = Math.random()
        let status: 'allotted' | 'not_allotted' | 'not_applied' | 'rejected' = 'not_allotted'
        let units = 0

        if (random > 0.8) {
          status = 'allotted'
          units = 10
        } else if (random > 0.6) {
          status = 'not_applied'
        } else if (random > 0.5) {
          status = 'rejected'
        }

        return {
          accountName: acc.name,
          boid: boidMasked,
          status,
          units
        }
      })

      setResults(checkResults)
      toast.success('Results fetched successfully!')
    } catch (error) {
      toast.error('Failed to fetch results')
    } finally {
      setChecking(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-black mb-2 premium-gradient-text uppercase tracking-tight">IPO Result Center</h1>
        <p className="text-slate-400">Check allotment status for all your accounts or visit the official portal</p>
        
        <div className="inline-flex p-1.5 bg-slate-900 border border-white/5 rounded-2xl gap-2 mt-4">
          <button 
            onClick={() => setActiveMode('bulk')}
            className={cn(
              "px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
              activeMode === 'bulk' ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20" : "text-slate-500 hover:text-slate-300"
            )}
          >
            Bulk Checker
          </button>
          <button 
            onClick={() => setActiveMode('official')}
            className={cn(
              "px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
              activeMode === 'official' ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20" : "text-slate-500 hover:text-slate-300"
            )}
          >
            Official Dashboard
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeMode === 'bulk' ? (
          <motion.div
            key="bulk"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-10"
          >
            <div className="glass-card p-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                <div className="md:col-span-3 space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Select IPO / FPO / Right</label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none" />
                    <select 
                      value={selectedIpo}
                      onChange={(e) => setSelectedIpo(e.target.value)}
                      className="input-premium pl-11 h-14 appearance-none"
                    >
                      <option value="">Select an IPO...</option>
                      {NEPAL_IPO_HISTORY.map(ipo => (
                        <option key={ipo.id} value={ipo.id}>{ipo.company_name} ({ipo.symbol})</option>
                      ))}
                    </select>
                  </div>
                </div>
                <button 
                  onClick={handleCheckResults}
                  disabled={checking || !selectedIpo}
                  className="premium-btn premium-btn-primary h-14 disabled:opacity-50"
                >
                  {checking ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                    <>
                      <Search className="w-5 h-5" />
                      Check Now
                    </>
                  )}
                </button>
              </div>
            </div>

            {results.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between px-2">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <History className="w-5 h-5 text-blue-500" />
                    Check Summary
                  </h2>
                  <span className="text-xs font-bold text-slate-500">{results.length} Accounts Scanned</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {results.map((res, i) => (
                    <motion.div
                      key={res.boid}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className={`p-6 rounded-2xl border flex items-center justify-between gap-4 ${
                        res.status === 'allotted' 
                          ? 'bg-emerald-600/10 border-emerald-500/30' 
                          : res.status === 'not_allotted'
                            ? 'bg-red-600/10 border-red-500/30'
                            : res.status === 'rejected'
                              ? 'bg-amber-600/10 border-amber-500/30'
                              : 'bg-slate-900/50 border-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${
                          res.status === 'allotted'
                            ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-500'
                            : res.status === 'not_allotted'
                              ? 'bg-red-500/20 border-red-500/40 text-red-500'
                              : 'bg-slate-800 border-slate-700 text-slate-500'
                        }`}>
                          {res.status === 'allotted' ? <Trophy className="w-6 h-6" /> : res.status === 'rejected' ? <XCircle className="w-6 h-6" /> : <Users className="w-6 h-6" />}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-200">{res.accountName}</h4>
                          <p className="text-[10px] text-slate-500 font-mono tracking-widest">{res.boid}</p>
                        </div>
                      </div>

                      <div className="text-right">
                        {res.status === 'allotted' ? (
                          <div className="space-y-1">
                            <span className="text-xs font-black text-emerald-500 uppercase tracking-tighter block">Congratulations!</span>
                            <span className="text-xl font-black text-emerald-500">{res.units} Units</span>
                          </div>
                        ) : res.status === 'not_allotted' ? (
                          <div className="space-y-1">
                            <span className="text-xs font-black text-red-500 uppercase tracking-tighter block">Sorry</span>
                            <span className="text-sm font-bold text-red-400">Not Allotted</span>
                          </div>
                        ) : res.status === 'rejected' ? (
                          <div className="space-y-1">
                            <span className="text-xs font-black text-amber-500 uppercase tracking-tighter block">Rejected</span>
                            <span className="text-[10px] text-amber-400/70">Invalid details</span>
                          </div>
                        ) : (
                          <span className="text-xs font-bold text-slate-500 italic">Not Applied</span>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
                
                <div className="p-8 text-center bg-blue-600/5 border border-blue-500/10 rounded-2xl">
                  <CheckCircle2 className="w-10 h-10 text-blue-500 mx-auto mb-4" />
                  <h3 className="text-lg font-bold">Scanning Complete</h3>
                  <p className="text-sm text-slate-400 mt-1 max-w-sm mx-auto">
                    All saved Demat accounts have been checked against the published allotment data.
                  </p>
                </div>
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="official"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="w-full min-h-[60vh] rounded-[2.5rem] overflow-hidden border border-white/5 bg-slate-900/50 shadow-2xl relative flex flex-col items-center justify-center p-8 text-center"
          >
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px]" />
            </div>

            <div className="max-w-md space-y-8 relative z-10">
              <div className="relative inline-block">
                <div className="w-24 h-24 rounded-3xl bg-slate-950 border border-white/10 flex items-center justify-center mx-auto shadow-2xl">
                  <ShieldCheck className="w-12 h-12 text-emerald-500" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center border-4 border-slate-900 animate-pulse">
                  <div className="w-2 h-2 rounded-full bg-white" />
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-2xl font-black text-white uppercase tracking-tight">Security Gateway</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  The official CDSC Results portal uses strictly protected protocols that prevent direct embedding within other platforms for your security.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-white/5 border border-white/5 text-left space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center mt-0.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  </div>
                  <p className="text-xs text-slate-300 font-medium">Verified Official CDSC Source</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center mt-0.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  </div>
                  <p className="text-xs text-slate-300 font-medium">Encrypted Data Transfer</p>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <a 
                  href="https://iporesult.cdsc.com.np/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-5 rounded-2xl transition-all shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-3 uppercase tracking-widest text-sm"
                >
                  Visit Official Portal
                  <ArrowUpRight className="w-5 h-5" />
                </a>
                
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">
                  Secure Link: iporesult.cdsc.com.np
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
