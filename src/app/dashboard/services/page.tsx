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
    <div className="space-y-6 pb-20 max-w-lg mx-auto">
      <div className="px-2 pt-2">
        <h1 className="text-2xl font-black tracking-tight">Our Services</h1>
        <p className="text-slate-400 text-sm font-bold mt-1">Tools and utilities for smarter investing</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {services.map((service, i) => (
          <motion.div
            key={service.name}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
          >
            <Link href={service.path}>
              <div className="glass-card p-6 flex flex-col items-center gap-4 group cursor-pointer border-white/5 hover:border-white/20 transition-all active:scale-95">
                <div className={`w-14 h-14 ${service.color}/10 rounded-2xl flex items-center justify-center border border-${service.color}/20 group-hover:scale-110 transition-transform`}>
                   <service.icon className={`w-7 h-7 ${service.color.replace('bg-', 'text-')}`} />
                </div>
                <span className="text-sm font-black text-center text-slate-200">{service.name}</span>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
