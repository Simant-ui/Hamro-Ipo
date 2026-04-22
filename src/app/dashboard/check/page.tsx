'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  ChevronDown, 
  ArrowLeft
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Loader2, TrendingUp, Briefcase, CheckCircle2, XCircle, Clock } from 'lucide-react'
import { useAccountStore } from '@/store/useAccountStore'
import { toast } from 'react-hot-toast'
import { cn } from '@/lib/utils'

interface ResultItem {
  id: string | number;
  name: string;
  boid: string;
  applications: any[];
  isLoading?: boolean;
  error?: string;
}

export default function CheckPage() {
  const router = useRouter()
  const { accounts } = useAccountStore()
  const [category, setCategory] = useState('All Accounts')
  const [isChecking, setIsChecking] = useState(false)
  const [results, setResults] = useState<ResultItem[] | null>(null)

  const handleCheck = async () => {
    if (accounts.length === 0) return toast.error('No accounts found')
    
    setIsChecking(true)
    setResults(accounts.map(acc => ({ 
      id: acc.id, 
      name: acc.name, 
      boid: acc.boid, 
      applications: [], 
      isLoading: true 
    })))
    
    const checkPromises = accounts.map(async (acc) => {
      if (!acc.password || !acc.clientId) {
        return { ...acc, id: acc.id, applications: [], isLoading: false, error: 'Update Login Info' }
      }

      try {
        const res = await fetch('/api/meroshare/applications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            clientId: acc.clientId,
            username: acc.username,
            password: acc.password
          })
        })

        const data = await res.json()
        if (data.success) {
          return { 
            id: acc.id, 
            name: acc.name, 
            boid: acc.boid, 
            applications: data.data, 
            isLoading: false,
            isSimulated: data.isSimulated 
          }
        } else {
          // Authentication failed or specific MeroShare error
          return { id: acc.id, name: acc.name, boid: acc.boid, applications: [], isLoading: false, error: data.message || 'MeroShare Error' }
        }
      } catch (err) {
        return { id: acc.id, name: acc.name, boid: acc.boid, applications: [], isLoading: false, error: 'WAF/Server Block' }
      }
    })

    const finalResults = await Promise.all(checkPromises)
    setResults(finalResults)
    setIsChecking(false)
  }

  return (
    <div className="space-y-6 max-w-lg mx-auto pb-20">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => router.back()} className="p-2 hover:bg-slate-900 rounded-xl transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-black tracking-tight">Bulk Portfolio Check</h1>
      </div>

      <div className="space-y-8">
        <div className="space-y-3">
          <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 px-1">Select Category</label>
          <div className="relative group">
            <select 
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full appearance-none rounded-2xl px-5 py-4 font-bold border border-white/5 bg-slate-900 outline-none focus:border-emerald-500/50 transition-all text-sm"
            >
              <option>All Accounts</option>
              <option>Family Accounts</option>
              <option>Personal Accounts</option>
            </select>
            <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none" />
          </div>
        </div>

        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleCheck}
          disabled={isChecking}
          className="w-full border border-emerald-500/30 text-emerald-500 font-black py-4 rounded-2xl hover:bg-emerald-500/10 transition-all text-sm uppercase tracking-widest flex items-center justify-center gap-3 disabled:opacity-50"
        >
          {isChecking ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Checking Portfolio...
            </>
          ) : (
            'Check Bulk Portfolio'
          )}
        </motion.button>

        {/* Results Section */}
        {results && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 space-y-6"
          >
            {/* Summary Card */}
            {!isChecking && (
              <div className="grid grid-cols-2 gap-4">
                <div className="glass-card p-6 bg-emerald-500/5 border-emerald-500/10 rounded-3xl">
                  <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">Total Allotted</p>
                  <p className="text-3xl font-black text-white italic">
                    {results.reduce((acc, res) => acc + res.applications.filter(a => a.statusName === 'Allotted').length, 0)}
                  </p>
                </div>
                <div className="glass-card p-6 bg-rose-500/5 border-rose-500/10 rounded-3xl">
                  <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-1">Not Allotted</p>
                  <p className="text-3xl font-black text-white italic">
                    {results.reduce((acc, res) => acc + res.applications.filter(a => a.statusName === 'Not Allotted').length, 0)}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between px-1">
              <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Detailed Results</h2>
              <p className="text-[10px] font-bold text-slate-600 uppercase italic">{results.length} Accounts Scanned</p>
            </div>

            <div className="space-y-6">
              {results.map((res, i) => (
                <motion.div
                  key={res.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="glass-card p-8 rounded-[2.5rem] border border-white/5 bg-slate-900/40 backdrop-blur-3xl shadow-2xl space-y-6 group hover:border-emerald-500/20 transition-all"
                >
                  <div className="flex items-center justify-between border-b border-white/5 pb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                        <Briefcase className="w-6 h-6 text-emerald-500" />
                      </div>
                      <div>
                        <h3 className="font-black text-white tracking-wide uppercase italic">{res.name}</h3>
                        <p className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">BOID: {res.boid}</p>
                      </div>
                    </div>
                    {res.isLoading ? (
                       <Loader2 className="w-5 h-5 animate-spin text-emerald-500" />
                    ) : res.error ? (
                       <div className="flex items-center gap-2 text-rose-500 bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20">
                          <XCircle className="w-4 h-4" />
                          <span className="text-[10px] font-black uppercase tracking-widest">{res.error}</span>
                       </div>
                    ) : (
                       <div className="flex flex-col items-end gap-1">
                          <div className="flex items-center gap-2 text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                             <CheckCircle2 className="w-4 h-4" />
                             <span className="text-[10px] font-black uppercase tracking-widest">
                               {(res as any).isSimulated ? 'Simulated' : 'Live Data'}
                             </span>
                          </div>
                          {(res as any).isSimulated && (
                            <span className="text-[8px] font-bold text-amber-500/80 uppercase tracking-widest">Server Busy - Using Cache</span>
                          )}
                       </div>
                    )}
                  </div>

                  {/* Applications List */}
                  <div className="space-y-3">
                    {res.applications.length > 0 ? (
                      res.applications.map((app, idx) => (
                        <div key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 group hover:border-emerald-500/20 transition-all">
                          <div className="flex flex-col">
                            <span className="text-xs font-black text-white group-hover:text-emerald-500 transition-colors">{app.companyName}</span>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{app.appliedKitta} Units</span>
                              <div className="w-1 h-1 rounded-full bg-slate-700" />
                              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Rs. {app.amount}</span>
                            </div>
                          </div>
                          
                          <div className={cn(
                            "px-4 py-1.5 rounded-xl border flex items-center gap-2",
                            app.statusName === 'Allotted' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" :
                            app.statusName === 'Not Allotted' ? "bg-rose-500/10 border-rose-500/20 text-rose-500" :
                            "bg-amber-500/10 border-amber-500/20 text-amber-500"
                          )}>
                            {app.statusName === 'Allotted' ? <CheckCircle2 className="w-3.5 h-3.5" /> : 
                             app.statusName === 'Not Allotted' ? <XCircle className="w-3.5 h-3.5" /> : 
                             <Clock className="w-3.5 h-3.5" />}
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">{app.statusName}</span>
                          </div>
                        </div>
                      ))
                    ) : !res.isLoading && !res.error ? (
                      <div className="text-center py-6">
                        <p className="text-xs font-bold text-slate-500 italic">No application history found</p>
                      </div>
                    ) : null}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
