'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Check, Zap, Crown, Star, Smartphone } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'

interface MembershipModalProps {
  isOpen: boolean
  onClose: () => void
}

const PLANS = [
  {
    id: 'monthly',
    name: 'Starter',
    duration: '1 Month',
    price: 70,
    icon: Star,
    color: 'emerald',
    features: ['Unlimited Accounts', 'Auto-Apply Feature', 'Email Notifications', 'Basic Support']
  },
  {
    id: 'half-yearly',
    name: 'Elite',
    duration: '6 Months',
    price: 450,
    icon: Zap,
    color: 'emerald',
    features: ['All Starter Features', 'Bulk Result Checker', 'Priority Support', 'Ad-Free Experience']
  },
  {
    id: 'yearly',
    name: 'Professional',
    duration: '1 Year',
    price: 800,
    icon: Crown,
    color: 'emerald',
    popular: true,
    features: ['All Pro Features', 'Early Beta Access', 'Direct Call Support', 'Lifetime Community Access']
  }
]

export function MembershipModal({ isOpen, onClose }: MembershipModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<'esewa' | 'khalti' | null>(null)

  const handleSubscribe = (planId: string) => {
    setSelectedPlan(planId)
  }

  const handlePayment = (method: 'esewa' | 'khalti') => {
    setPaymentMethod(method)
    const plan = PLANS.find(p => p.id === selectedPlan)
    if (!plan) return

    if (method === 'esewa') {
      toast.loading('Redirecting to eSewa...', { duration: 2000 })
      
      // eSewa EPAY Form Parameters
      const path = "https://uat.esewa.com.np/epay/main" // Use 'https://esewa.com.np/epay/main' for production
      const params = {
        amt: plan.price,
        psc: 0,
        pdc: 0,
        txAmt: 0,
        tAmt: plan.price,
        pid: `SUBS-${Date.now()}`, // Unique Product ID
        scd: "EPAYTEST", // Replace with real Merchant Code for production
        su: window.location.origin + "/dashboard?payment=success",
        fu: window.location.origin + "/dashboard?payment=failed"
      }

      // Create a hidden form and submit it
      const form = document.createElement('form')
      form.setAttribute('method', 'POST')
      form.setAttribute('action', path)

      for (const key in params) {
        const hiddenField = document.createElement('input')
        hiddenField.setAttribute('type', 'hidden')
        hiddenField.setAttribute('name', key)
        hiddenField.setAttribute('value', (params as any)[key])
        form.appendChild(hiddenField)
      }

      document.body.appendChild(form)
      setTimeout(() => form.submit(), 1500)
    } else {
      toast.loading(`Khalti gateway integration in progress...`, { duration: 2000 })
      setTimeout(() => {
        toast.dismiss()
        window.open('https://khalti.com', '_blank')
      }, 2000)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-full max-w-5xl glass-card relative overflow-hidden bg-slate-950 border-white/10 shadow-2xl shadow-emerald-500/10"
          >
            {/* Background Orbs inside modal */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/5 dark:bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />
            {/* Header */}
            <div className="px-10 py-8 border-b border-white/5 flex items-center justify-between bg-black/40 relative z-10 backdrop-blur-xl">
              <div>
                <h2 className="text-3xl font-black tracking-tighter text-white uppercase glow-text">Premium Membership</h2>
                <p className="text-[11px] text-emerald-400 font-black uppercase tracking-[0.4em] mt-1.5 opacity-80">Unlock the full power of Hamro IPO</p>
              </div>
              <button onClick={onClose} className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-white/5">
                <X className="w-6 h-6 text-slate-500" />
              </button>
            </div>

            <div className="p-8 max-h-[80vh] overflow-y-auto custom-scrollbar">
              {!selectedPlan ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 auto-rows-fr relative z-10">
                  {PLANS.map((plan) => (
                    <motion.div
                      key={plan.id}
                      whileHover={{ y: -15, scale: 1.02 }}
                      className={`relative p-8 rounded-[3rem] border-2 transition-all duration-700 group flex flex-col ${
                        plan.popular 
                          ? 'border-emerald-500/50 bg-emerald-500/10 shadow-[0_0_50px_-10px_rgba(0,255,159,0.3)]' 
                          : 'border-white/5 bg-white/5 hover:border-emerald-500/30 shadow-2xl'
                      }`}
                    >
                      {plan.popular && (
                        <div className="absolute -top-5 left-1/2 -translate-x-1/2 px-6 py-2 bg-gradient-to-r from-emerald-400 to-cyan-500 rounded-full text-[10px] font-black text-slate-950 uppercase tracking-[0.2em] shadow-[0_0_30px_rgba(0,255,159,0.6)] animate-glow">
                          Most Popular
                        </div>
                      )}

                      <div className="mb-8">
                        <div className={`w-16 h-16 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-[0_0_20px_rgba(0,255,159,0.1)] dark:shadow-[0_0_20px_rgba(0,255,159,0.2)]`}>
                          <plan.icon className="w-9 h-9" />
                        </div>
                        <h3 className="text-3xl font-black text-white glow-text mb-1">{plan.name}</h3>
                        <p className="text-[11px] text-emerald-400 font-black uppercase tracking-[0.3em] opacity-80">{plan.duration}</p>
                      </div>

                      <div className="mb-10">
                        <div className="flex items-baseline gap-2">
                          <span className="text-5xl font-black text-white tracking-tighter glow-text">Rs.{plan.price}</span>
                          <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest">/ Total</span>
                        </div>
                      </div>

                      <ul className="space-y-5 mb-12 flex-1">
                        {plan.features.map((feature, idx) => (
                          <li key={idx} className="flex items-center gap-4 text-[13px] font-black text-slate-400 group-hover:text-slate-300 transition-colors">
                            <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 flex-shrink-0 shadow-[0_0_10px_rgba(0,255,159,0.2)]">
                              <Check className="w-3.5 h-3.5" />
                            </div>
                            {feature}
                          </li>
                        ))}
                      </ul>

                      <button
                        onClick={() => handleSubscribe(plan.id)}
                        className={cn(
                          "w-full py-5 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-[11px] transition-all duration-500 transform active:scale-95",
                          plan.popular
                           ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 shadow-[0_0_30px_rgba(0,255,159,0.4)] hover:shadow-[0_0_50px_rgba(0,255,159,0.6)]'
                            : 'bg-white/5 text-white border border-white/10 hover:border-emerald-500/50 hover:bg-emerald-500/10'
                        )}
                      >
                        Select {plan.name}
                      </button>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="max-w-xl mx-auto text-center space-y-8"
                >
                  <div>
                    <h3 className="text-2xl font-black text-white uppercase tracking-tight">Select Payment Method</h3>
                    <p className="text-slate-400 text-sm font-bold mt-2">Plan: <span className="text-emerald-500">{PLANS.find(p => p.id === selectedPlan)?.name}</span> - Rs. {PLANS.find(p => p.id === selectedPlan)?.price}</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <button
                      onClick={() => handlePayment('esewa')}
                      className="group p-6 rounded-3xl border-2 border-white/5 hover:border-[#60bb46] bg-white/5 transition-all flex flex-col items-center gap-4"
                    >
                      <div className="w-16 h-16 rounded-2xl bg-[#60bb46]/10 flex items-center justify-center transition-transform group-hover:scale-110">
                         <img src="https://blog.esewa.com.np/wp-content/uploads/2023/07/esewa-logo.png" alt="eSewa" className="w-12 object-contain" />
                      </div>
                      <span className="font-black text-slate-500 group-hover:text-[#60bb46] uppercase tracking-widest text-[10px]">eSewa Pay</span>
                    </button>

                    <button
                      onClick={() => handlePayment('khalti')}
                      className="group p-6 rounded-3xl border-2 border-white/5 hover:border-[#5c2d91] bg-white/5 transition-all flex flex-col items-center gap-4"
                    >
                      <div className="w-16 h-16 rounded-2xl bg-[#5c2d91]/10 flex items-center justify-center transition-transform group-hover:scale-110">
                         <img src="https://khalti.com/wp-content/uploads/2021/01/khalti-logo-white.png" alt="Khalti" className="w-12 object-contain brightness-0 invert" />
                      </div>
                      <span className="font-black text-slate-500 group-hover:text-[#5c2d91] uppercase tracking-widest text-[10px]">Khalti Pay</span>
                    </button>

                    <button
                      onClick={() => setPaymentMethod('qr' as any)}
                      className="group p-6 rounded-3xl border-2 border-white/5 hover:border-emerald-500 bg-white/5 transition-all flex flex-col items-center gap-4"
                    >
                      <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center transition-transform group-hover:scale-110">
                         <Zap className="w-8 h-8 text-emerald-500" />
                      </div>
                      <span className="font-black text-slate-500 group-hover:text-emerald-500 uppercase tracking-widest text-[10px]">Scan & Pay</span>
                    </button>
                  </div>

                  <AnimatePresence>
                    {paymentMethod === 'qr' && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-6 bg-white/5 backdrop-blur-2xl rounded-[2rem] border border-white/10 shadow-2xl flex flex-col items-center gap-6 mx-auto max-w-[320px] relative overflow-hidden"
                      >
                        {/* Decorative background element */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500" />
                        
                        <div className="text-center space-y-1">
                          <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em]">Personalized QR Code</p>
                          <h4 className="text-xl font-black text-white uppercase tracking-tight">
                            {PLANS.find(p => p.id === selectedPlan)?.name} Plan
                          </h4>
                          <div className="flex items-center justify-center gap-2">
                            <span className="text-2xl font-black text-white">Rs. {PLANS.find(p => p.id === selectedPlan)?.price}</span>
                            <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[8px] font-black rounded-md uppercase tracking-wider">Instant</span>
                          </div>
                        </div>

                        <div className="w-full aspect-square bg-white flex items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-emerald-500/30 p-2 relative group">
                           <img 
                             src="/esewa-qr.png" 
                             alt="eSewa QR Code" 
                             className="w-full h-full object-contain"
                             onLoad={() => console.log('QR Loaded')}
                           />
                           <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                        </div>

                        <div className="w-full space-y-3">
                          <div className="p-3 bg-white/5 rounded-xl border border-white/5 space-y-1">
                            <div className="flex justify-between text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                              <span>Account Name</span>
                              <span>Verified</span>
                            </div>
                            <p className="text-xs font-black text-emerald-400">9824718666 (Hamro IPO)</p>
                          </div>
                          
                          <p className="text-[9px] text-slate-400 font-bold leading-relaxed text-center px-2">
                            Scan this QR using your eSewa app and enter the amount manually. Activation will be completed within 5-10 minutes of payment.
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <button 
                    onClick={() => {
                      setSelectedPlan(null)
                      setPaymentMethod(null)
                    }}
                    className="text-slate-500 text-xs font-black uppercase tracking-widest hover:text-white transition-colors"
                  >
                    Back to plans
                  </button>
                </motion.div>
              )}
            </div>

            <div className="px-8 py-6 bg-black/40 border-t border-white/5 text-center">
               <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">
                 Safe & Secure Transactions • Instant Activation • 24/7 Support
               </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
