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
    <div className="space-y-10 pb-24 max-w-2xl mx-auto">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
           <div className="flex items-center gap-4">
              <button onClick={() => router.back()} className="p-2.5 bg-white dark:bg-slate-900 border border-[var(--border)] rounded-2xl hover:border-emerald-500/30 transition-all active:scale-95">
                 <ArrowLeft className="w-5 h-5 text-slate-500" />
              </button>
              <h2 className="text-3xl font-black tracking-tight text-[var(--foreground)] uppercase italic leading-none">Portfolio Sync</h2>
           </div>
           <p className="text-sm text-slate-500 font-medium ml-14">Institutional-grade application audit across all accounts.</p>
        </div>
      </div>

      {/* Control Panel */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
           <div className="md:col-span-2 space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 ml-1">Account Filter</label>
              <div className="relative group">
                <select 
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full appearance-none rounded-2xl px-5 py-4 font-bold border border-[var(--border)] bg-white dark:bg-slate-950 outline-none focus:border-emerald-500/50 transition-all text-sm cursor-pointer"
                >
                  <option>All Accounts</option>
                  <option>Family Accounts</option>
                  <option>Personal Accounts</option>
                </select>
                <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
           </div>

           <motion.button 
             whileHover={{ scale: 1.01 }}
             whileTap={{ scale: 0.99 }}
             onClick={handleCheck}
             disabled={isChecking}
             className="bg-slate-950 dark:bg-emerald-500 text-white dark:text-slate-950 font-black py-4.5 rounded-2xl shadow-xl shadow-emerald-500/10 flex items-center justify-center gap-3 transition-all text-xs uppercase tracking-widest italic disabled:opacity-50"
           >
             {isChecking ? (
               <>
                 <Loader2 className="w-4 h-4 animate-spin" />
                 Syncing...
               </>
             ) : (
               <>
                 <RefreshCw className="w-4 h-4" />
                 Execute Audit
               </>
             )}
           </motion.button>
        </div>

        {/* Results Visualizer */}
        {results && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-10"
          >
            {/* Global Stats */}
            {!isChecking && (
              <div className="grid grid-cols-2 gap-6">
                <div className="p-8 rounded-[32px] bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                     <CheckCircle2 className="w-16 h-16 text-emerald-500" />
                  </div>
                  <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-2">Total Allotted</p>
                  <p className="text-5xl font-black text-slate-950 dark:text-white italic tracking-tighter">
                    {results.reduce((acc, res) => acc + res.applications.filter(a => a.statusName === 'Allotted').length, 0)}
                  </p>
                </div>
                <div className="p-8 rounded-[32px] bg-rose-500/5 dark:bg-rose-500/10 border border-rose-500/20 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                     <XCircle className="w-16 h-16 text-rose-500" />
                  </div>
                  <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-2">Not Allotted</p>
                  <p className="text-5xl font-black text-slate-950 dark:text-white italic tracking-tighter">
                    {results.reduce((acc, res) => acc + res.applications.filter(a => a.statusName === 'Not Allotted').length, 0)}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Detailed Audit Logs</h3>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">{results.length} Nodes Verified</p>
            </div>

            <div className="space-y-8">
              {results.map((res, i) => (
                <motion.div
                  key={res.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="p-8 rounded-[40px] bg-[var(--surface)] border border-[var(--border)] shadow-sm hover:border-emerald-500/30 transition-all group"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-[var(--border)] pb-6 mb-6">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-950 flex items-center justify-center border border-[var(--border)] group-hover:bg-emerald-500/10 group-hover:border-emerald-500/20 transition-colors">
                        <Briefcase className="w-7 h-7 text-slate-400 group-hover:text-emerald-500 transition-colors" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-xl font-black text-slate-950 dark:text-slate-100 uppercase italic tracking-tight">{res.name}</h3>
                        <p className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">BOID: {res.boid}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {res.isLoading ? (
                         <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2">
                            <Loader2 className="w-3 h-3 animate-spin text-emerald-500" />
                            <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Scanning</span>
                         </div>
                      ) : res.error ? (
                         <div className="px-4 py-2 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-2">
                            <AlertCircle className="w-3 h-3 text-rose-500" />
                            <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest">{res.error}</span>
                         </div>
                      ) : (
                         <div className="flex flex-col items-end gap-1.5">
                            <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2">
                               <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                               <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">
                                 {(res as any).isSimulated ? 'Cached Data' : 'Live Verified'}
                               </span>
                            </div>
                            {(res as any).isSimulated && (
                              <span className="text-[8px] font-bold text-amber-500/80 uppercase tracking-widest mr-2">MeroShare Congested</span>
                            )}
                         </div>
                      )}
                    </div>
                  </div>

                  {/* Applications Infrastructure */}
                  <div className="grid grid-cols-1 gap-4">
                    {res.applications.length > 0 ? (
                      res.applications.map((app, idx) => (
                        <div key={idx} className="flex items-center justify-between p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-[var(--border)] group/app hover:border-emerald-500/20 transition-all">
                          <div className="space-y-1">
                            <span className="text-sm font-black text-slate-950 dark:text-slate-100 uppercase italic tracking-tight group-hover/app:text-emerald-500 transition-colors">{app.companyName}</span>
                            <div className="flex items-center gap-3">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{app.appliedKitta} Units</span>
                              <div className="w-1 h-1 rounded-full bg-slate-200 dark:bg-slate-800" />
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">NPR {app.amount}</span>
                            </div>
                          </div>
                          
                          <div className={cn(
                            "px-4 py-2 rounded-xl border flex items-center gap-2.5",
                            app.statusName === 'Allotted' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400" :
                            app.statusName === 'Not Allotted' ? "bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400" :
                            "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400"
                          )}>
                            {app.statusName === 'Allotted' ? <CheckCircle2 className="w-3.5 h-3.5" /> : 
                             app.statusName === 'Not Allotted' ? <XCircle className="w-3.5 h-3.5" /> : 
                             <Clock className="w-3.5 h-3.5" />}
                            <span className="text-[10px] font-black uppercase tracking-widest">{app.statusName}</span>
                          </div>
                        </div>
                      ))
                    ) : !res.isLoading && !res.error ? (
                      <div className="py-10 text-center space-y-2 opacity-30">
                        <History className="w-10 h-10 text-slate-400 mx-auto" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">History Clean</p>
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
