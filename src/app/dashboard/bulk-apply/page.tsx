'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ChevronDown, 
  AlertCircle,
  Activity
} from 'lucide-react'

import toast from 'react-hot-toast'
import { useAccountStore } from '@/store/useAccountStore'
import { fetchLiveIssues } from '@/lib/meroshare'
import { Loader2, RefreshCw } from 'lucide-react'

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
    <div className="space-y-6 pb-20 max-w-lg mx-auto">
      {/* Tabs */}
      <div className="p-1 rounded-2xl flex gap-1 bg-slate-900 border border-white/5">
        <button 
          onClick={() => setActiveTab('bulk')}
          className={`flex-1 py-3 rounded-xl text-sm font-black transition-all ${activeTab === 'bulk' ? 'bg-emerald-500/10 text-emerald-500 shadow-lg' : 'text-slate-500'}`}
        >
          Bulk
        </button>
        <button 
          onClick={() => setActiveTab('single')}
          className={`flex-1 py-3 rounded-xl text-sm font-black transition-all ${activeTab === 'single' ? 'bg-emerald-500/10 text-emerald-500 shadow-lg' : 'text-slate-500'}`}
        >
          Single
        </button>
      </div>

      {/* Form Fields */}
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <label className="text-[11px] font-black uppercase tracking-widest text-slate-500">Select Category (All Accounts)</label>
          </div>
          <div className="relative group">
            <select className="w-full appearance-none rounded-2xl px-5 py-4 font-bold border border-white/5 bg-slate-900 outline-none focus:border-emerald-500/50 transition-all text-sm">
              <option>Select Category (All Accounts)</option>
              <option>Family Accounts</option>
              <option>Investment Group</option>
            </select>
            <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none" />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
              <Activity className="w-3 h-3" /> Current Opening IPO/FPO/Right
            </label>
            <button 
              onClick={handleFetchIssues}
              disabled={loadingIssues}
              className="text-[10px] font-black text-emerald-500 uppercase flex items-center gap-1 hover:opacity-80"
            >
              {loadingIssues ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
              Fetch Live
            </button>
          </div>
          <div className="relative group">
            <select 
              value={selectedIssue}
              onChange={(e) => setSelectedIssue(e.target.value)}
              className="w-full appearance-none rounded-2xl pl-14 pr-5 py-4 font-bold border border-white/5 bg-slate-900 outline-none focus:border-emerald-500/50 transition-all text-sm"
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
            <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none" />
            <div className="absolute left-4 top-1/2 -translate-y-1/2 bg-emerald-500 text-[10px] font-black px-1.5 py-0.5 rounded text-white pointer-events-none">
              {liveIssues.find(i => i.companyCode === selectedIssue)?.scrip || 'IPO'}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 px-1">Quantity</label>
          <input 
            id="quantity-input"
            type="number" 
            defaultValue={10}
            className="w-full rounded-2xl px-5 py-4 font-black border border-white/5 bg-slate-900 outline-none focus:border-emerald-500/50 transition-all"
          />
        </div>
      </div>

      {activeTab === 'bulk' ? (
        /* Auto Apply Button */
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleBulkApply}
          className="w-full premium-gradient text-slate-950 font-black py-4 rounded-2xl shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-3 transition-colors text-lg"
        >
          Auto Apply All
        </motion.button>
      ) : (
        /* Single Apply Account List */
        <div className="space-y-3">
          <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-500 px-1">Select Account to Apply</h3>
          {accounts.map((account) => (
            <div key={account.id} className="glass-card p-4 flex items-center justify-between border-white/5">
              <div>
                <p className="text-sm font-black text-slate-200">{account.name}</p>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">USERNAME: {account.username}</p>
              </div>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSingleApply(account)}
                className="bg-emerald-500 text-slate-950 font-black px-4 py-2 rounded-xl shadow-lg shadow-emerald-500/20 text-xs uppercase tracking-widest"
              >
                Apply
              </motion.button>
            </div>
          ))}
        </div>
      )}

      {/* Bulk Apply Updates */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Apply Updates</h3>
          <button onClick={() => setApplyUpdates([])} className="text-[11px] font-black text-emerald-500 uppercase">clear</button>
        </div>

        <div className="space-y-3">
          {applyUpdates.map((update) => (
            <motion.div
              key={update.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-2xl border border-white/5 bg-slate-900/50 relative group"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                   <div className="mt-0.5">
                      <AlertCircle className="w-5 h-5 text-emerald-500" />
                   </div>
                   <div className="space-y-1">
                      <p className="text-sm font-black text-slate-200">{update.id}. {update.name}</p>
                      <p className="text-[11px] font-bold text-emerald-500/80 leading-relaxed">{update.message}</p>
                   </div>
                </div>
                <div className="bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                   <span className="text-[10px] font-black text-emerald-500 uppercase tracking-tighter">{update.status}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
