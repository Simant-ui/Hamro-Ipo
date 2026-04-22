'use client'

import { motion } from 'framer-motion'
import { 
  ExternalLink, 
  Layers, 
  ListChecks, 
  Activity,
  ChevronRight,
  ShieldCheck,
  Smartphone
} from 'lucide-react'

const resultOptions = [
  {
    title: 'Check From MeroShare',
    description: 'Verify allocation via official portal',
    icon: ExternalLink,
    color: 'blue',
    gradient: 'from-blue-500/20 to-blue-600/5',
    href: 'https://iporesult.cdsc.com.np/'
  },
  {
    title: 'IPO Bulk Result',
    description: 'View IPO results in bulk',
    icon: Layers,
    color: 'emerald',
    gradient: 'from-emerald-500/20 to-emerald-600/5'
  },
  {
    title: 'IPO Bulk Status',
    description: 'View all application status',
    icon: ListChecks,
    color: 'purple',
    gradient: 'from-purple-500/20 to-purple-600/5'
  },
  {
    title: 'Current IPO Status',
    description: 'Check current opening IPO status',
    icon: Activity,
    color: 'orange',
    gradient: 'from-orange-500/20 to-orange-600/5'
  }
]

export default function ResultsPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 max-w-xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12 mt-4 space-y-2">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 mb-4"
        >
          <ShieldCheck className="w-8 h-8 text-emerald-500" />
        </motion.div>
        <h1 className="text-4xl font-black tracking-tighter uppercase italic text-emerald-500">
          MERO SHARE
        </h1>
        <p className="text-slate-400 font-bold tracking-widest uppercase text-[10px]">
          IPO Allotment Result
        </p>
      </div>

      {/* Options List */}
      <div className="space-y-6">
        {resultOptions.map((option, i) => (
          <motion.a
            key={option.title}
            href={option.href || '#'}
            target={option.href ? "_blank" : "_self"}
            rel="noopener noreferrer"
            referrerPolicy="no-referrer"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ y: -4, scale: 1.01 }}
            className={`relative block group cursor-pointer overflow-hidden rounded-[2.5rem] border border-slate-800 bg-slate-900/30 p-1`}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${option.gradient} opacity-50 group-hover:opacity-100 transition-opacity`}></div>
            
            <div className="relative bg-slate-950/80 backdrop-blur-xl rounded-[2.3rem] p-6 flex items-center justify-between">
              <div className="flex items-center gap-5">
                <div className={`w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center group-hover:border-emerald-500/30 transition-all`}>
                  <option.icon className={`w-7 h-7 text-slate-400 group-hover:text-emerald-500 transition-colors`} />
                </div>
                <div>
                  <h3 className="text-lg font-black tracking-tight group-hover:text-emerald-500 transition-colors">{option.title}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{option.description}</p>
                </div>
              </div>
              <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center group-hover:bg-emerald-500/10 group-hover:border-emerald-500/20 transition-all">
                <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-emerald-500" />
              </div>
            </div>
          </motion.a>
        ))}
      </div>

      {/* Footer Info */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-12 p-6 rounded-3xl bg-slate-900/50 border border-slate-800 flex items-center gap-4"
      >
        <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
          <Smartphone className="w-5 h-5 text-emerald-500" />
        </div>
        <div className="flex-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mobile Integration</p>
          <p className="text-xs text-slate-500">Download the official Hamro IPO app for push notifications on allotment status.</p>
        </div>
      </motion.div>

      <div className="h-10"></div>
    </div>
  )
}
