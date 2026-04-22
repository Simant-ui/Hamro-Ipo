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
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/90 backdrop-blur-xl"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 40 }}
            className="w-full max-w-xl bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] overflow-hidden relative z-10 shadow-[0_0_100px_rgba(16,185,129,0.1)]"
          >
            {/* Background Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-50" />
            
            {/* Header */}
            <div className="px-10 py-10 border-b border-white/5 bg-gradient-to-b from-white/5 to-transparent flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  </div>
                  <h2 className="text-3xl font-black tracking-tighter text-white uppercase italic">
                    {initialData ? 'Update Account' : 'Add Demat Account'}
                  </h2>
                </div>
                <div className="flex items-center gap-3">
                   <div className="flex gap-1">
                      <div className={cn("w-8 h-1.5 rounded-full transition-all duration-500", step >= 1 ? "bg-emerald-500" : "bg-white/10")} />
                      <div className={cn("w-8 h-1.5 rounded-full transition-all duration-500", step >= 2 ? "bg-emerald-500" : "bg-white/10")} />
                   </div>
                   <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em]">
                     Step {step} of 2
                   </p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all text-slate-500 border border-white/5 group"
              >
                <X className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-10 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <AnimatePresence mode="wait">
                {step === 1 ? (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500 px-1">MeroShare Authentication</label>
                      
                      {/* DP Selection */}
                      <div className="relative group">
                        <Building2 className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 transition-colors group-focus-within:text-emerald-500" />
                        <input 
                          list="dp-modal-list"
                          required
                          placeholder="Select Depository Participant (DP)"
                          value={formData.dpName}
                          onChange={(e) => setFormData({ ...formData, dpName: e.target.value })}
                          className="w-full bg-white/5 border border-white/5 rounded-2xl pl-14 pr-10 py-5 focus:outline-none focus:border-emerald-500/50 transition-all placeholder-slate-600 text-white font-bold"
                        />
                        <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-700 pointer-events-none" />
                        <datalist id="dp-modal-list">
                          {NEPAL_BANKS.map((dp) => (
                            <option key={dp.id} value={`${dp.dp_code} - ${dp.name}`} />
                          ))}
                        </datalist>
                      </div>

                      {/* Username */}
                      <div className="relative group">
                        <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 transition-colors group-focus-within:text-emerald-500" />
                        <input 
                          type="text"
                          required
                          placeholder="MeroShare Username (8 Digits)"
                          value={formData.username}
                          onChange={(e) => handleNumericInput(e, 'username', 8)}
                          className="w-full bg-white/5 border border-white/5 rounded-2xl pl-14 pr-5 py-5 focus:outline-none focus:border-emerald-500/50 transition-all placeholder-slate-600 text-white font-bold"
                        />
                      </div>

                      {/* Password */}
                      <div className="relative group">
                        <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 transition-colors group-focus-within:text-emerald-500" />
                        <input 
                          type={showPassword ? "text" : "password"}
                          required
                          placeholder="MeroShare Password"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          className="w-full bg-white/5 border border-white/5 rounded-2xl pl-14 pr-14 py-5 focus:outline-none focus:border-emerald-500/50 transition-all placeholder-slate-600 text-white font-bold"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-emerald-500 transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={verifyMeroShare}
                      disabled={verifying}
                      className="w-full bg-white text-black font-black py-6 rounded-2xl flex items-center justify-center gap-3 hover:bg-emerald-500 hover:text-black transition-all active:scale-[0.98] group"
                    >
                      {verifying ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                        <>
                          Next Step
                          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                  >
                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500 px-1">Identity & Banking Info</label>
                      
                      {/* Full Name */}
                      <div className="relative group">
                        <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 transition-colors group-focus-within:text-emerald-500" />
                        <input 
                          type="text"
                          required
                          placeholder="Full Name (from MeroShare)"
                          value={formData.fullName}
                          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                          className="w-full bg-white/5 border border-white/5 rounded-2xl pl-14 pr-5 py-5 focus:outline-none focus:border-emerald-500/50 transition-all placeholder-slate-600 text-white font-bold"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Bank */}
                        <div className="relative group">
                          <Building className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 transition-colors group-focus-within:text-emerald-500" />
                          <input 
                            list="bank-modal-list"
                            required
                            placeholder="Linked Bank"
                            value={formData.bank}
                            onChange={(e) => setFormData({ ...formData, bank: e.target.value })}
                            className="w-full bg-white/5 border border-white/5 rounded-2xl pl-14 pr-5 py-5 focus:outline-none focus:border-emerald-500/50 transition-all placeholder-slate-600 text-white font-bold"
                          />
                          <datalist id="bank-modal-list">
                            {CRN_BANKS.map((bank, idx) => (
                              <option key={idx} value={bank} />
                            ))}
                          </datalist>
                        </div>

                        {/* CRN */}
                        <div className="relative group">
                          <Hash className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 transition-colors group-focus-within:text-emerald-500" />
                          <input 
                            type="text"
                            required
                            placeholder="CRN Number"
                            value={formData.crnNumber}
                            onChange={(e) => setFormData({ ...formData, crnNumber: e.target.value })}
                            className="w-full bg-white/5 border border-white/5 rounded-2xl pl-14 pr-5 py-5 focus:outline-none focus:border-emerald-500/50 transition-all placeholder-slate-600 text-white font-bold"
                          />
                        </div>
                      </div>

                      {/* Transaction PIN */}
                      <div className="relative group">
                        <Key className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 transition-colors group-focus-within:text-emerald-500" />
                        <input 
                          type={showPin ? "text" : "password"}
                          required
                          placeholder="4-Digit Transaction PIN"
                          value={formData.transactionPin}
                          onChange={(e) => handleNumericInput(e, 'transactionPin', 4)}
                          className="w-full bg-white/5 border border-white/5 rounded-2xl pl-14 pr-14 py-5 focus:outline-none focus:border-emerald-500/50 transition-all placeholder-slate-600 text-white font-bold text-center tracking-[1em]"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPin(!showPin)}
                          className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-emerald-500 transition-colors"
                        >
                          {showPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="flex-1 bg-white/5 border border-white/10 text-white font-black py-6 rounded-2xl hover:bg-white/10 transition-all"
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex-[2] bg-emerald-500 text-black font-black py-6 rounded-2xl flex items-center justify-center gap-3 hover:bg-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.3)] transition-all active:scale-[0.98]"
                      >
                        {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                          <>
                          <Check className="w-6 h-6" />
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
