'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Home, 
  LayoutGrid, 
  CheckCircle2, 
  User,
  Activity
} from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

const navItems = [
  { name: 'Home', path: '/dashboard', icon: Home },
  { name: 'Apply', path: '/dashboard/bulk-apply', icon: LayoutGrid },
  { name: 'Services', path: '/dashboard/services', icon: Activity },
  { name: 'Check', path: '/dashboard/check', icon: CheckCircle2 },
  { name: 'Profile', path: '/dashboard/profile', icon: User },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 md:hidden w-[92%] max-w-md">
      <nav className="bg-white/80 dark:bg-slate-950/80 backdrop-blur-2xl border border-[var(--border)] px-4 py-3 rounded-[32px] shadow-2xl shadow-black/10 flex items-center justify-between relative overflow-hidden">
        {/* Active Background Glow */}
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/5 to-transparent pointer-events-none" />

        {navItems.map((item) => {
          const isActive = pathname === item.path
          return (
            <Link key={item.path} href={item.path} className="relative flex-1 flex flex-col items-center gap-1.5 group outline-none">
              <div className={cn(
                "p-2.5 rounded-2xl transition-all duration-500",
                isActive 
                  ? "bg-slate-950 dark:bg-emerald-500 text-white dark:text-slate-950 scale-110 shadow-lg shadow-emerald-500/20" 
                  : "text-slate-400 group-hover:text-slate-950 dark:group-hover:text-slate-200"
              )}>
                <item.icon className="w-5 h-5" />
              </div>
              <span className={cn(
                "text-[8px] font-black uppercase tracking-widest transition-all duration-300",
                isActive ? "text-slate-900 dark:text-emerald-400 scale-105" : "text-slate-500 opacity-60"
              )}>
                {item.name}
              </span>
              
              {isActive && (
                <motion.div 
                  layoutId="bottom-indicator-elite"
                  className="absolute -bottom-1 w-1 h-1 bg-emerald-500 rounded-full"
                />
              )}
            </Link>
          )
        })}
      </nav>
    </div>

  )
}

