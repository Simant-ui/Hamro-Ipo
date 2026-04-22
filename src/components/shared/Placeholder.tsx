'use client'

import { motion } from 'framer-motion'
import { ArrowLeft, Construction } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function PlaceholderServicePage() {
  const router = useRouter()

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 text-center px-6">
      <div className="w-20 h-20 bg-emerald-500/10 rounded-3xl flex items-center justify-center border border-emerald-500/20">
        <Construction className="w-10 h-10 text-emerald-500" />
      </div>
      <div className="space-y-2">
        <h1 className="text-2xl font-black tracking-tight">Under Construction</h1>
        <p className="text-slate-400 text-sm font-bold">This feature is coming soon to Hamro IPO Premium!</p>
      </div>
      <button 
        onClick={() => router.back()}
        className="px-8 py-3 bg-emerald-500 text-slate-900 font-black rounded-2xl shadow-xl shadow-emerald-500/20 active:scale-95 transition-all flex items-center gap-2"
      >
        <ArrowLeft className="w-5 h-5" />
        Go Back
      </button>
    </div>
  )
}
