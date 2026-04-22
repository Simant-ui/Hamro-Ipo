'use client'

import { motion } from 'framer-motion'
import { 
  Calculator, 
  Newspaper, 
  TrendingUp, 
  History, 
  Settings, 
  HelpCircle,
  BarChart3,
  Calendar,
  MessageSquare
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

const services = [
  { name: 'Share Calculator', icon: Calculator, path: '/dashboard/services/calculator', color: 'bg-emerald-500' },
  { name: 'Latest News', icon: Newspaper, path: '/dashboard/services/news', color: 'bg-blue-500' },
  { name: 'Market Data', icon: TrendingUp, path: '/dashboard/services/market', color: 'bg-amber-500' },
  { name: 'Apply History', icon: History, path: '/dashboard/services/history', color: 'bg-purple-500' },
  { name: 'Upcoming IPOs', icon: Calendar, path: '/dashboard/services/upcoming', color: 'bg-rose-500' },
  { name: 'IPO Results', icon: BarChart3, path: '/dashboard/result-checker', color: 'bg-teal-500' },
  { name: 'Help & Support', icon: HelpCircle, path: '/dashboard/services/support', color: 'bg-indigo-500' },
  { name: 'Feedback', icon: MessageSquare, path: '/dashboard/services/feedback', color: 'bg-pink-500' },
]

export default function ServicesPage() {
  return (
    <div className="space-y-10 pb-24 max-w-4xl mx-auto">
      {/* Header section */}
      <div className="space-y-2">
        <h2 className="text-3xl font-black tracking-tight text-[var(--foreground)] uppercase italic">Elite Utilities</h2>
        <p className="text-sm text-slate-500 font-medium">Professional grade tools and services for the modern investor.</p>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service, i) => (
          <motion.div
            key={service.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Link href={service.path}>
              <div className="group relative p-8 rounded-[32px] bg-[var(--surface)] border border-[var(--border)] hover:border-emerald-500/30 transition-all duration-500 shadow-sm hover:shadow-2xl hover:shadow-emerald-500/5 cursor-pointer h-full flex flex-col justify-between active:scale-95">
                <div className="space-y-6">
                  <div className={cn(
                    "w-16 h-16 rounded-2xl flex items-center justify-center border transition-all duration-500 group-hover:scale-110 group-hover:rotate-6",
                    service.color === 'bg-emerald-500' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" :
                    service.color === 'bg-blue-500' ? "bg-blue-500/10 border-blue-500/20 text-blue-500" :
                    service.color === 'bg-amber-500' ? "bg-amber-500/10 border-amber-500/20 text-amber-500" :
                    service.color === 'bg-purple-500' ? "bg-purple-500/10 border-purple-500/20 text-purple-500" :
                    service.color === 'bg-rose-500' ? "bg-rose-500/10 border-rose-500/20 text-rose-500" :
                    service.color === 'bg-teal-500' ? "bg-teal-500/10 border-teal-500/20 text-teal-500" :
                    service.color === 'bg-indigo-500' ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-500" :
                    "bg-pink-500/10 border-pink-500/20 text-pink-500"
                  )}>
                    <service.icon className="w-8 h-8" />
                  </div>
                  
                  <div className="space-y-1">
                    <h3 className="text-xl font-black text-slate-950 dark:text-slate-100 uppercase italic leading-none tracking-tight">
                      {service.name.split(' ')[0]} <br />
                      <span className="text-slate-400 group-hover:text-emerald-500 transition-colors">
                        {service.name.split(' ').slice(1).join(' ')}
                      </span>
                    </h3>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-[var(--border)] flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 group-hover:text-emerald-500 transition-colors">Access Tool</span>
                  <TrendingUp className="w-4 h-4 text-slate-300 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Institutional Support */}
      <div className="p-10 rounded-[40px] bg-slate-950 text-white relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-32 -mt-32" />
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
           <div className="space-y-4 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-[9px] font-black uppercase tracking-widest text-emerald-400">
                 Elite Access
              </div>
              <h3 className="text-3xl font-black italic uppercase leading-tight">Need custom <br /> analytics?</h3>
              <p className="text-slate-400 text-sm font-medium max-w-xs">Our institutional tier provides direct NEPSE API access and advanced portfolio modeling.</p>
           </div>
           <button className="px-8 py-4 bg-emerald-500 text-slate-950 font-black rounded-2xl text-xs uppercase tracking-widest hover:bg-emerald-400 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-emerald-500/20">
              Contact Sales
           </button>
        </div>
      </div>
    </div>

  )
}
