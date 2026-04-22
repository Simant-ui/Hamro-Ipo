'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft, 
  Building2, 
  CheckCircle2, 
  Clock, 
  CreditCard, 
  Info, 
  Loader2, 
  ShieldCheck, 
  Users,
  AlertTriangle,
  Send
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useAppStore } from '@/store/useAppStore'
import { useAccountStore } from '@/store/useAccountStore'
import { IPOListing, DematAccountDisplay } from '@/types'
import { formatCurrency, formatNumber, formatDate } from '@/lib/utils'
import { toast } from 'react-hot-toast'
import Link from 'next/link'

const REAL_IPOS: IPOListing[] = [
  {
    id: 'sopan-1',
    company_name: 'Sopan Pharmaceuticals Limited',
    symbol: 'SOPAN',
    type: 'IPO',
    status: 'open',
    open_date: '2026-04-16',
    close_date: '2026-04-21',
    issue_price: 100,
    total_units: 3474900,
    min_units: 10,
    max_units: 1000,
    lot_size: 10,
    sector: 'Pharmaceutical',
    description: 'Sopan Pharmaceuticals is issuing shares to the general public.'
  },
  {
    id: 'mepdl-1',
    company_name: 'Mount Everest Power Development Ltd',
    symbol: 'MEPDL',
    type: 'IPO',
    status: 'upcoming',
    open_date: '2026-05-05',
    close_date: '2026-05-10',
    issue_price: 100,
    total_units: 2580000,
    min_units: 10,
    max_units: 500,
    lot_size: 10,
    sector: 'Energy',
    description: 'Upcoming hydropower project approved by SEBON.'
  },
  {
    id: 'spil-1',
    company_name: 'Sarvottam Paints Industries Ltd',
    symbol: 'SPIL',
    type: 'IPO',
    status: 'upcoming',
    open_date: '2026-05-12',
    close_date: '2026-05-17',
    issue_price: 100,
    total_units: 850000,
    min_units: 10,
    max_units: 200,
    lot_size: 10,
    sector: 'Manufacturing',
    description: 'Premium paints manufacturer.'
  },
  {
    id: 'ecl-1',
    company_name: 'Everest Colour Limited',
    symbol: 'ECL',
    type: 'IPO',
    status: 'upcoming',
    open_date: '2026-05-20',
    close_date: '2026-05-25',
    issue_price: 100,
    total_units: 790000,
    min_units: 10,
    max_units: 300,
    lot_size: 10,
    sector: 'Manufacturing',
    description: 'Color and pigment manufacturer.'
  },
  {
    id: 'norvic-1',
    company_name: 'Norvic International Hospital',
    symbol: 'NIHMCL',
    type: 'IPO',
    status: 'upcoming',
    open_date: '2026-06-01',
    close_date: '2026-06-05',
    issue_price: 100,
    total_units: 1500000,
    min_units: 10,
    max_units: 1000,
    lot_size: 10,
    sector: 'Healthcare',
    description: 'Book building process initiated.'
  },
  {
    id: 'jsml-1',
    company_name: 'Jagdamba Spinning Mills Ltd',
    symbol: 'JSML',
    type: 'IPO',
    status: 'upcoming',
    open_date: '2026-06-10',
    close_date: '2026-06-15',
    issue_price: 100,
    total_units: 1200000,
    min_units: 10,
    max_units: 500,
    lot_size: 10,
    sector: 'Manufacturing',
    description: 'Spinning mills sector.'
  }
]

export default function IPODetailsPage() {
  const { id } = useParams()
  const router = useRouter()
  const supabase = createClient()
  const { accounts } = useAccountStore()
  const [ipo, setIpo] = useState<IPOListing | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [selectedAccounts, setSelectedAccounts] = useState<string[] | number[]>([])
  const [quantity, setQuantity] = useState(10)

  useEffect(() => {
    const fetchData = async () => {
      // Fallback to real-time data
      const fallback = REAL_IPOS.find(r => r.id === id)
      if (fallback) setIpo(fallback)
      
      setLoading(false)
    }

    fetchData()
  }, [id])

  const toggleAccount = (accountId: string | number) => {
    setSelectedAccounts(prev => 
      prev.includes(accountId as never) 
        ? prev.filter(id => id !== accountId)
        : [...prev, accountId] as any
    )
  }

  const handleBulkApply = async () => {
    if (selectedAccounts.length === 0) {
      toast.error('Please select at least one account')
      return
    }

    setSubmitting(true)
    const toastId = toast.loading(`Starting application for ${selectedAccounts.length} accounts...`)

    try {
      // 1. Get real MeroShare Issues to find kandaElementId
      // We'll use the first selected account to fetch the issues list
      const firstAccId = selectedAccounts[0]
      const firstAcc = accounts.find(a => a.id === firstAccId)
      
      if (!firstAcc || !firstAcc.password || !firstAcc.clientId) {
        throw new Error('Primary account credentials missing. Please update account details.')
      }

      toast.loading('Fetching real-time issue details...', { id: toastId })
      
      const issuesRes = await fetch('/api/meroshare/issues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: firstAcc.clientId,
          username: firstAcc.username,
          password: firstAcc.password
        })
      })
      
      const issuesData = await issuesRes.json()
      if (!issuesData.success) throw new Error(issuesData.message || 'Failed to fetch issues')

      const realIssue = (issuesData.data || []).find((iss: any) => 
        iss.scrip === ipo?.symbol || iss.companyName.toLowerCase().includes(ipo?.company_name.toLowerCase() || '')
      )

      if (!realIssue) {
        throw new Error(`IPO for ${ipo?.symbol} not found in MeroShare unapplied list. It might be closed or already applied.`)
      }

      const kandaId = realIssue.kandaElementId
      let successCount = 0
      let failCount = 0

      // 2. Apply for each account
      for (const accId of selectedAccounts) {
        const acc = accounts.find(a => a.id === accId)
        if (!acc || !acc.password || !acc.crn || !acc.pin) {
          failCount++
          toast.error(`Credentials missing for ${acc?.name || 'Unknown Account'}`, { duration: 3000 })
          continue
        }

        toast.loading(`Applying for ${acc.name}...`, { id: toastId })

        try {
          const applyRes = await fetch('/api/meroshare/apply', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              clientId: acc.clientId,
              username: acc.username,
              password: acc.password,
              kandaElementId: kandaId,
              appliedKitta: quantity,
              crnNumber: acc.crn,
              transactionPin: acc.pin
            })
          })

          const result = await applyRes.json()
          if (result.success) {
            successCount++
          } else {
            failCount++
            toast.error(`${acc.name}: ${result.message}`, { duration: 4000 })
          }
        } catch (e) {
          failCount++
        }
      }

      if (successCount > 0) {
        toast.success(`Successfully applied for ${successCount} accounts!`, { id: toastId })
        if (failCount > 0) {
          toast.error(`Failed for ${failCount} accounts.`, { duration: 5000 })
        }
        router.push('/dashboard/check') // Go to check page to see status
      } else {
        toast.error('Application failed for all selected accounts.', { id: toastId })
      }

    } catch (error: any) {
      toast.error(error.message || 'Failed to apply', { id: toastId })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
      <p className="text-slate-400">Loading IPO details...</p>
    </div>
  )

  if (!ipo) return (
    <div className="text-center py-20">
      <h2 className="text-2xl font-bold">IPO Not Found</h2>
      <Link href="/dashboard/ipo-apply" className="text-blue-500 hover:underline mt-4 block">Go back</Link>
    </div>
  )

  const totalAmount = selectedAccounts.length * quantity * ipo.issue_price

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <Link 
        href="/dashboard/ipo-apply" 
        className="flex items-center gap-2 text-slate-400 hover:text-slate-200 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Listings
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: IPO Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-card p-8">
            <div className="w-20 h-20 bg-blue-600/10 rounded-3xl flex items-center justify-center text-3xl font-bold text-blue-500 border border-blue-500/20 mb-6">
              {ipo.symbol}
            </div>
            <h1 className="text-2xl font-bold mb-2">{ipo.company_name}</h1>
            <p className="text-slate-400 mb-8">{ipo.sector}</p>

            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-slate-800">
                <span className="text-slate-500 text-sm">Issue Price</span>
                <span className="font-bold">{formatCurrency(ipo.issue_price)}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-slate-800">
                <span className="text-slate-500 text-sm">Issue Type</span>
                <span className="font-bold text-blue-500">{ipo.type}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-slate-800">
                <span className="text-slate-500 text-sm">Total Units</span>
                <span className="font-bold">{formatNumber(ipo.total_units)}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-slate-800">
                <span className="text-slate-500 text-sm">Min/Max Units</span>
                <span className="font-bold">{ipo.min_units} - {ipo.max_units}</span>
              </div>
              <div className="flex justify-between items-center py-3">
                <span className="text-slate-500 text-sm">Opening Date</span>
                <span className="font-bold text-emerald-500">{formatDate(ipo.open_date)}</span>
              </div>
              <div className="flex justify-between items-center py-3">
                <span className="text-slate-500 text-sm">Closing Date</span>
                <span className="font-bold text-red-500">{formatDate(ipo.close_date)}</span>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 bg-blue-600/5 border-blue-500/20">
            <div className="flex gap-4">
              <Info className="w-6 h-6 text-blue-500 shrink-0" />
              <div>
                <h4 className="font-bold text-blue-500 mb-1">Application Tip</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Apply for exactly 10 units unless the issue is very large. Allotment is usually done on a lottery basis for 10 units.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Bulk Selection */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold">Bulk Application</h2>
              <div className="flex items-center gap-2 text-xs font-bold px-3 py-1.5 bg-slate-800 rounded-full text-slate-400">
                <Users className="w-3.5 h-3.5" />
                {selectedAccounts.length} / {accounts.length} Selected
              </div>
            </div>

            <div className="space-y-6">
              {/* Quantity Selector */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-slate-300 ml-1">Apply Quantity (Units)</label>
                <div className="flex items-center gap-4">
                  <input 
                    type="number"
                    min={ipo.min_units}
                    max={ipo.max_units}
                    step={ipo.lot_size}
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value))}
                    className="input-premium w-32 text-center text-lg font-bold"
                  />
                  <div className="flex-1 p-4 bg-slate-900/50 rounded-xl border border-slate-800 flex justify-between items-center">
                    <span className="text-slate-400 text-sm">Amount per A/C</span>
                    <span className="text-xl font-bold text-blue-500">{formatCurrency(quantity * ipo.issue_price)}</span>
                  </div>
                </div>
              </div>

              {/* Account Selection */}
              <div className="space-y-3">
                <div className="flex items-center justify-between ml-1">
                  <label className="text-sm font-medium text-slate-300">Select Accounts</label>
                  <button 
                    onClick={() => setSelectedAccounts(selectedAccounts.length === accounts.length ? [] : accounts.map(a => a.id))}
                    className="text-xs text-blue-500 hover:underline font-bold"
                  >
                    {selectedAccounts.length === accounts.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {accounts.map((acc) => (
                    <div 
                      key={acc.id}
                      onClick={() => toggleAccount(acc.id)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                        selectedAccounts.includes(acc.id)
                          ? 'bg-blue-600/10 border-blue-500/50 ring-1 ring-blue-500/50'
                          : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                          selectedAccounts.includes(acc.id) ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-500'
                        }`}>
                          {selectedAccounts.includes(acc.id) ? <CheckCircle2 className="w-5 h-5" /> : <Users className="w-5 h-5" />}
                        </div>
                        <div>
                          <p className={`text-sm font-bold ${selectedAccounts.includes(acc.id) ? 'text-blue-400' : 'text-slate-200'}`}>
                            {acc.name}
                          </p>
                          <p className="text-[10px] text-slate-500 uppercase tracking-tighter">{acc.bank}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500">{acc.boid.slice(-4)}</span>
                    </div>
                  ))}
                  {accounts.length === 0 && (
                    <div className="col-span-full p-8 text-center bg-slate-900/50 border border-dashed border-slate-800 rounded-2xl">
                      <p className="text-slate-500 text-sm mb-4">No Demat accounts found.</p>
                      <Link href="/dashboard/accounts" className="premium-btn premium-btn-secondary inline-flex">
                        Add Account First
                      </Link>
                    </div>
                  )}
                </div>
              </div>

              {/* Summary & Submit */}
              {selectedAccounts.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="pt-6 border-t border-slate-800"
                >
                  <div className="bg-blue-600 p-6 rounded-2xl shadow-xl shadow-blue-900/20 text-white flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                      <p className="text-blue-100 text-sm font-medium mb-1">Total Investment Required</p>
                      <h3 className="text-3xl font-black">{formatCurrency(totalAmount)}</h3>
                      <p className="text-blue-200 text-xs mt-1">For {selectedAccounts.length} applications @ {quantity} units each</p>
                    </div>
                    <button 
                      onClick={handleBulkApply}
                      disabled={submitting}
                      className="bg-white text-blue-600 px-8 py-4 rounded-xl font-black text-lg hover:bg-blue-50 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                      {submitting ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                        <>
                          Apply Now
                          <Send className="w-5 h-5" />
                        </>
                      )}
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-4 px-2 text-amber-500">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <p className="text-[10px] font-bold uppercase tracking-wider">
                      Ensure all selected accounts have sufficient CRN balance.
                    </p>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
