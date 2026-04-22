'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ChevronDown, 
  AlertCircle,
  Activity,
  Zap,
  CheckCircle2,
  Loader2,
  RefreshCw
} from 'lucide-react'

import toast from 'react-hot-toast'
import { useAccountStore } from '@/store/useAccountStore'
import { cn } from '@/lib/utils'

export default function BulkApplyPage() {
  const { accounts } = useAccountStore()
  const [activeTab, setActiveTab] = useState('bulk')
  const [loadingIssues, setLoadingIssues] = useState(false)
  const [liveIssues, setLiveIssues] = useState<any[]>([])
  const [selectedIssue, setSelectedIssue] = useState<string>('')
  const [applyUpdates, setApplyUpdates] = useState<any[]>([])

  // Auto fetch issues on mount
  useEffect(() => {
    if (accounts.length > 0 && liveIssues.length === 0) {
      handleFetchIssues()
    }
  }, [accounts.length])

  const handleFetchIssues = async () => {
    const defaultAccount = accounts.find(a => a.isDefault) || accounts[0]
    if (!defaultAccount) return toast.error('Add an account first')
    if (!defaultAccount.password || !defaultAccount.clientId) return toast.error('Credentials missing for primary account')

    setLoadingIssues(true)
    try {
      const res = await fetch('/api/meroshare/issues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: defaultAccount.clientId,
          username: defaultAccount.username,
          password: defaultAccount.password
        })
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.message)

      setLiveIssues(data.data || [])
      if (data.data?.length > 0) setSelectedIssue(data.data[0].companyCode)
      toast.success('Live issues updated!')
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch issues')
    } finally {
      setLoadingIssues(false)
    }
  }

  const handleBulkApply = async () => {
    if (accounts.length === 0) return toast.error('No accounts found')
    if (!selectedIssue) return toast.error('Please select an issue')

    const issue = liveIssues.find(i => i.companyCode === selectedIssue)
    if (!issue) return toast.error('Selected issue not found')

    const kandaId = issue.kandaElementId
    const quantityInput = (document.getElementById('quantity-input') as HTMLInputElement)?.value || '10'
    
    toast.loading(`Starting bulk application...`)

    for (const acc of accounts) {
      if (!acc.password || !acc.crn || !acc.pin) {
        setApplyUpdates(prev => [{
          id: Date.now(),
          name: `IPO@${acc.name.split(' ')[0]}`,
          status: 'Failed',
          message: 'Missing credentials or CASBA info.',
          type: 'error'
        }, ...prev])
        continue
      }

      try {
        const res = await fetch('/api/meroshare/apply', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            clientId: acc.clientId,
            username: acc.username,
            password: acc.password,
            kandaElementId: kandaId,
            appliedKitta: parseInt(quantityInput),
            crnNumber: acc.crn,
            transactionPin: acc.pin
          })
        })
        const result = await res.json()
        setApplyUpdates(prev => [{
          id: Date.now(),
          name: `IPO@${acc.name.split(' ')[0]}`,
          status: result.success ? 'Applied' : 'Failed',
          message: result.message,
          type: result.success ? 'success' : 'error'
        }, ...prev])
      } catch (err) {
        console.error(err)
      }
    }
    toast.success('Bulk application completed!')
  }

  const handleSingleApply = async (account: any) => {
    if (!selectedIssue) return toast.error('Please select an issue')
    const issue = liveIssues.find(i => i.companyCode === selectedIssue)
    if (!issue) return toast.error('Selected issue not found')

    if (!account.password || !account.crn || !account.pin) {
      return toast.error('Missing credentials or CASBA info for this account')
    }

    const quantityInput = (document.getElementById('quantity-input') as HTMLInputElement)?.value || '10'
    const toastId = toast.loading(`Applying for ${account.name}...`)

    try {
      const res = await fetch('/api/meroshare/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: account.clientId,
          username: account.username,
          password: account.password,
          kandaElementId: issue.kandaElementId,
          appliedKitta: parseInt(quantityInput),
          crnNumber: account.crn,
          transactionPin: account.pin
        })
      })
      const result = await res.json()
      if (result.success) {
        toast.success(result.message, { id: toastId })
        setApplyUpdates(prev => [{
          id: Date.now(),
          name: `IPO@${account.name.split(' ')[0]}`,
          status: 'Applied',
          message: result.message,
          type: 'success'
        }, ...prev])
      } else {
        toast.error(result.message, { id: toastId })
      }
    } catch (err) {
      toast.error('Failed to apply', { id: toastId })
    }
  }

  return (
    <div className="space-y-8 pb-24 max-w-2xl mx-auto">
      {/* Page Header */}
      <div className="space-y-2">
        <h2 className="text-3xl font-black tracking-tight text-[var(--foreground)] uppercase italic">Bulk Apply Suite</h2>
        <p className="text-sm text-slate-500 font-medium">Manage multiple IPO applications with institutional precision.</p>
      </div>

      {/* Tabs */}
      <div className="p-1.5 rounded-2xl flex gap-2 bg-[var(--surface-alt)] border border-[var(--border)]">
        <button 
          onClick={() => setActiveTab('bulk')}
          className={`flex-1 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'bulk' ? 'bg-white dark:bg-slate-800 text-emerald-500 shadow-sm border border-[var(--border)]' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
        >
          Bulk Operation
        </button>
        <button 
          onClick={() => setActiveTab('single')}
          className={`flex-1 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'single' ? 'bg-white dark:bg-slate-800 text-emerald-500 shadow-sm border border-[var(--border)]' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
        >
          Single Account
        </button>
      </div>

      {/* Form Infrastructure */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 ml-1">Account Category</label>
          <div className="relative group">
            <select className="w-full appearance-none rounded-2xl px-5 py-4 font-bold border border-[var(--border)] bg-[var(--surface)] outline-none focus:border-emerald-500/50 transition-all text-sm cursor-pointer">
              <option>All Accounts</option>
              <option>Family Accounts</option>
              <option>Investment Group</option>
            </select>
            <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 ml-1">Quantity (Kitta)</label>
          <input 
            id="quantity-input"
            type="number" 
            defaultValue={10}
            className="w-full rounded-2xl px-5 py-4 font-black border border-[var(--border)] bg-[var(--surface)] outline-none focus:border-emerald-500/50 transition-all text-sm"
          />
        </div>

        <div className="md:col-span-2 space-y-2">
          <div className="flex items-center justify-between px-1">
            <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
              <Activity className="w-3 h-3 text-emerald-500" /> Live Issues (IPO/FPO/Right)
            </label>
            <button 
              onClick={handleFetchIssues}
              disabled={loadingIssues}
              className="text-[10px] font-black text-emerald-500 uppercase flex items-center gap-1.5 hover:text-emerald-400 transition-colors"
            >
              {loadingIssues ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
              Sync Issues
            </button>
          </div>
          <div className="relative group">
            <select 
              value={selectedIssue}
              onChange={(e) => setSelectedIssue(e.target.value)}
              className="w-full appearance-none rounded-2xl pl-16 pr-5 py-4 font-bold border border-[var(--border)] bg-[var(--surface)] outline-none focus:border-emerald-500/50 transition-all text-sm cursor-pointer"
            >
              {liveIssues.length === 0 ? (
                <option value="">No opening issues found. Click Fetch Live.</option>
              ) : (
                <>
                  <option value="">-- Select an Issue --</option>
                  {liveIssues.map((issue) => (
                    <option key={issue.companyCode} value={issue.companyCode}>
                      {issue.companyName}
                    </option>
                  ))}
                </>
              )}
            </select>
            <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <div className="absolute left-4 top-1/2 -translate-y-1/2 bg-emerald-500 text-[10px] font-black px-2 py-1 rounded text-slate-950 pointer-events-none uppercase">
              {liveIssues.find(i => i.companyCode === selectedIssue)?.scrip || 'IPO'}
            </div>
          </div>
        </div>
      </div>

      {activeTab === 'bulk' ? (
        <motion.button 
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={handleBulkApply}
          className="w-full bg-slate-950 dark:bg-emerald-500 text-white dark:text-slate-950 font-black py-5 rounded-2xl shadow-xl shadow-emerald-500/10 flex items-center justify-center gap-3 transition-all text-lg uppercase tracking-widest italic"
        >
          Execute Bulk Apply
          <Zap className="w-5 h-5 fill-current" />
        </motion.button>
      ) : (
        <div className="space-y-4">
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-500 ml-1">Precision Accounts</h3>
          <div className="grid grid-cols-1 gap-3">
            {accounts.map((account) => (
              <div key={account.id} className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] flex items-center justify-between group hover:border-emerald-500/30 transition-all shadow-sm">
                <div className="space-y-1">
                  <p className="text-sm font-black text-slate-950 dark:text-slate-200 uppercase italic tracking-tight">{account.name}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{account.username}</p>
                </div>
                <button 
                  onClick={() => handleSingleApply(account)}
                  className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-black px-6 py-2.5 rounded-xl border border-emerald-500/20 text-[10px] uppercase tracking-widest hover:bg-emerald-500 hover:text-slate-950 transition-all"
                >
                  Apply
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Operation Log */}
      <div className="space-y-4 pt-6 border-t border-[var(--border)]">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Operation Log</h3>
          <button 
            onClick={() => setApplyUpdates([])} 
            className="text-[10px] font-bold text-emerald-500 uppercase hover:text-emerald-400 transition-colors"
          >
            Clear Log
          </button>
        </div>

        <div className="space-y-3">
          <AnimatePresence>
            {applyUpdates.length === 0 ? (
              <div className="py-12 text-center space-y-2 opacity-30">
                 <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto">
                    <Activity className="w-6 h-6 text-slate-400" />
                 </div>
                 <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">No active operations</p>
              </div>
            ) : applyUpdates.map((update) => (
              <motion.div
                key={update.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] relative group shadow-sm overflow-hidden"
              >
                <div className={cn("absolute left-0 top-0 bottom-0 w-1", update.type === 'success' ? 'bg-emerald-500' : 'bg-rose-500')} />
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                     <div className={cn("p-2 rounded-lg", update.type === 'success' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500')}>
                        {update.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                     </div>
                     <div className="space-y-1">
                        <p className="text-sm font-black text-slate-950 dark:text-slate-200 uppercase italic tracking-tight">{update.name}</p>
                        <p className="text-[11px] font-medium text-slate-500 leading-relaxed">{update.message}</p>
                     </div>
                  </div>
                  <div className={cn("px-2.5 py-1 rounded-lg border text-[9px] font-black uppercase tracking-widest", 
                    update.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-rose-500/10 border-rose-500/20 text-rose-500'
                  )}>
                    {update.status}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>

  )
}
