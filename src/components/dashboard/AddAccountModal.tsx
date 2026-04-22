'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  Building2, 
  User, 
  Lock, 
  Key, 
  Hash, 
  ChevronDown, 
  Check, 
  Eye, 
  EyeOff,
  Loader2,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  Building
} from 'lucide-react'
import { NEPAL_BANKS, CRN_BANKS } from '@/constants/banks'
import { toast } from 'react-hot-toast'
import { cn } from '@/lib/utils'

interface AddAccountModalProps {
  isOpen: boolean
  onClose: () => void
  initialData?: any
  onSave?: (data: any) => void
}

export function AddAccountModal({ isOpen, onClose, initialData, onSave }: AddAccountModalProps) {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [verifying, setVerifying] = useState(false)
  
  const [formData, setFormData] = useState({
    fullName: '',
    dpName: '',
    username: '',
    password: '',
    bank: '',
    crnNumber: '',
    transactionPin: '',
  })
  
  const [showPassword, setShowPassword] = useState(false)
  const [showPin, setShowPin] = useState(false)

  useEffect(() => {
    if (initialData) {
      setFormData({
        fullName: initialData.name || '',
        dpName: initialData.bank || '',
        username: initialData.username || '',
        password: '',
        bank: initialData.bank || '',
        crnNumber: initialData.crn || '',
        transactionPin: initialData.pin || '',
      })
      setStep(1) // Always start at step 1 for security re-verification if needed, or we could skip to 2
    } else {
      resetForm()
    }
  }, [initialData, isOpen])

  const resetForm = () => {
    setFormData({
      fullName: '',
      dpName: '',
      username: '',
      password: '',
      bank: '',
      crnNumber: '',
      transactionPin: '',
    })
    setStep(1)
    setVerifying(false)
    setLoading(false)
  }

  const handleNumericInput = (e: React.ChangeEvent<HTMLInputElement>, field: string, maxLength: number) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, maxLength)
    setFormData({ ...formData, [field]: value })
  }

  const verifyMeroShare = async () => {
    if (!formData.dpName || !formData.username || !formData.password) {
      toast.error('Please enter DP, Username, and Password')
      return false
    }

    const selectedBank = NEPAL_BANKS.find(b => `${b.dp_code} - ${b.name}` === formData.dpName)
    if (!selectedBank) {
      toast.error('Please select a valid DP from the list')
      return false
    }

    setVerifying(true)
    const toastId = toast.loading('Connecting to MeroShare...')
    
    try {
      const response = await fetch('/api/meroshare/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: selectedBank.id,
          username: formData.username,
          password: formData.password,
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        if (data.user) {
          setFormData(prev => ({
            ...prev,
            fullName: data.user.name || prev.fullName,
          }))
        }
        toast.success('Login Successful!', { id: toastId })
        setStep(2)
        return true
      } else {
        toast.error(data.message || 'Invalid Username or Password', { id: toastId })
        return false
      }
    } catch (error) {
      toast.error('Connection failed. Please try again.', { id: toastId })
      return false
    } finally {
      setVerifying(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (step === 1) {
      await verifyMeroShare()
      return
    }

    // Step 2 Validation
    if (!formData.bank || !formData.crnNumber || !formData.transactionPin) {
      toast.error('Please fill in all CASBA details')
      return
    }

    if (formData.transactionPin.length !== 4) {
      toast.error('Transaction PIN must be 4 digits')
      return
    }
    
    setLoading(true)
    try {
      if (onSave) {
        onSave(formData)
      }
      toast.success('Account added successfully!')
      onClose()
      resetForm()
    } catch (err) {
      toast.error('Failed to save account')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 md:left-72 z-[100] flex items-center justify-center px-4 py-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="w-full max-w-xl bg-white dark:bg-slate-950 border border-[var(--border)] rounded-3xl overflow-hidden relative z-10 shadow-2xl"
          >
            {/* Header */}
            <div className="px-8 py-8 border-b border-[var(--border)] flex items-center justify-between">
              <div className="space-y-1">
                <h2 className="text-2xl font-black tracking-tight text-[var(--foreground)] uppercase italic">
                  {initialData ? 'Update Account' : 'Add Demat Account'}
                </h2>
                <div className="flex items-center gap-3">
                   <div className="flex gap-1">
                      <div className={cn("w-6 h-1 rounded-full transition-all duration-500", step >= 1 ? "bg-emerald-500" : "bg-slate-100 dark:bg-slate-800")} />
                      <div className={cn("w-6 h-1 rounded-full transition-all duration-500", step >= 2 ? "bg-emerald-500" : "bg-slate-100 dark:bg-slate-800")} />
                   </div>
                   <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                     Step {step} of 2
                   </p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto no-scrollbar">
              <AnimatePresence mode="wait">
                {step === 1 ? (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="space-y-6"
                  >
                    <div className="space-y-4">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">MeroShare Credentials</p>
                      
                      {/* DP Selection */}
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-500 ml-1">Depository Participant</label>
                        <div className="relative group">
                          <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 transition-colors group-focus-within:text-emerald-500" />
                          <input 
                            list="dp-modal-list"
                            required
                            placeholder="Search your DP..."
                            value={formData.dpName}
                            onChange={(e) => setFormData({ ...formData, dpName: e.target.value })}
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-[var(--border)] rounded-xl pl-11 pr-10 py-3.5 focus:outline-none focus:border-emerald-500/50 transition-all placeholder-slate-400 text-sm font-bold"
                          />
                          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 pointer-events-none" />
                          <datalist id="dp-modal-list">
                            {NEPAL_BANKS.map((dp) => (
                              <option key={dp.id} value={`${dp.dp_code} - ${dp.name}`} />
                            ))}
                          </datalist>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Username */}
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-bold text-slate-500 ml-1">Username</label>
                          <div className="relative group">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 transition-colors group-focus-within:text-emerald-500" />
                            <input 
                              type="text"
                              required
                              placeholder="8-digit ID"
                              value={formData.username}
                              onChange={(e) => handleNumericInput(e, 'username', 8)}
                              className="w-full bg-slate-50 dark:bg-slate-900 border border-[var(--border)] rounded-xl pl-11 pr-4 py-3.5 focus:outline-none focus:border-emerald-500/50 transition-all placeholder-slate-400 text-sm font-bold"
                            />
                          </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-bold text-slate-500 ml-1">Password</label>
                          <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 transition-colors group-focus-within:text-emerald-500" />
                            <input 
                              type={showPassword ? "text" : "password"}
                              required
                              placeholder="••••••••"
                              value={formData.password}
                              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                              className="w-full bg-slate-50 dark:bg-slate-900 border border-[var(--border)] rounded-xl pl-11 pr-11 py-3.5 focus:outline-none focus:border-emerald-500/50 transition-all placeholder-slate-400 text-sm font-bold"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-emerald-500 transition-colors"
                            >
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={verifyMeroShare}
                      disabled={verifying}
                      className="w-full bg-slate-950 dark:bg-emerald-500 text-white dark:text-slate-950 font-black py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-emerald-600 transition-all active:scale-[0.98] group"
                    >
                      {verifying ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                        <>
                          Continue
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                  >
                    <div className="space-y-4">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">CASBA Registration</p>
                      
                      {/* Full Name */}
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-500 ml-1">Account Holder Name</label>
                        <div className="relative group">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 transition-colors group-focus-within:text-emerald-500" />
                          <input 
                            type="text"
                            required
                            placeholder="Full Name"
                            value={formData.fullName}
                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-[var(--border)] rounded-xl pl-11 pr-4 py-3.5 focus:outline-none focus:border-emerald-500/50 transition-all placeholder-slate-400 text-sm font-bold"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Bank */}
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-bold text-slate-500 ml-1">Bank</label>
                          <div className="relative group">
                            <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 transition-colors group-focus-within:text-emerald-500" />
                            <input 
                              list="bank-modal-list"
                              required
                              placeholder="Linked Bank"
                              value={formData.bank}
                              onChange={(e) => setFormData({ ...formData, bank: e.target.value })}
                              className="w-full bg-slate-50 dark:bg-slate-900 border border-[var(--border)] rounded-xl pl-11 pr-4 py-3.5 focus:outline-none focus:border-emerald-500/50 transition-all placeholder-slate-400 text-sm font-bold"
                            />
                            <datalist id="bank-modal-list">
                              {CRN_BANKS.map((bank, idx) => (
                                <option key={idx} value={bank} />
                              ))}
                            </datalist>
                          </div>
                        </div>

                        {/* CRN */}
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-bold text-slate-500 ml-1">CRN Number</label>
                          <div className="relative group">
                            <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 transition-colors group-focus-within:text-emerald-500" />
                            <input 
                              type="text"
                              required
                              placeholder="Bank CRN"
                              value={formData.crnNumber}
                              onChange={(e) => setFormData({ ...formData, crnNumber: e.target.value })}
                              className="w-full bg-slate-50 dark:bg-slate-900 border border-[var(--border)] rounded-xl pl-11 pr-4 py-3.5 focus:outline-none focus:border-emerald-500/50 transition-all placeholder-slate-400 text-sm font-bold"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Transaction PIN */}
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-500 ml-1">4-Digit PIN</label>
                        <div className="relative group">
                          <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 transition-colors group-focus-within:text-emerald-500" />
                          <input 
                            type={showPin ? "text" : "password"}
                            required
                            placeholder="••••"
                            value={formData.transactionPin}
                            onChange={(e) => handleNumericInput(e, 'transactionPin', 4)}
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-[var(--border)] rounded-xl pl-11 pr-11 py-3.5 focus:outline-none focus:border-emerald-500/50 transition-all placeholder-slate-400 text-sm font-bold tracking-widest"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPin(!showPin)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-emerald-500 transition-colors"
                          >
                            {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="flex-1 bg-slate-50 dark:bg-slate-900 border border-[var(--border)] text-slate-600 dark:text-slate-300 font-bold py-4 rounded-xl hover:bg-slate-100 transition-all"
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex-[2] bg-emerald-500 text-slate-950 font-black py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-emerald-600 transition-all active:scale-[0.98]"
                      >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                          <>
                          <Check className="w-5 h-5" />
                          {initialData ? 'Update Account' : 'Save Account'}
                        </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>

  )
}
