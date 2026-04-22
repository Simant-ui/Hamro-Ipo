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
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden nav-blur px-4 pb-6 pt-3">
      <div className="flex items-center justify-between max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.path
          return (
            <Link key={item.path} href={item.path} className="relative px-4 py-2 flex flex-col items-center gap-1.5 group">
              <div className={cn(
                "transition-all duration-500",
                isActive ? "text-emerald-400 scale-125 drop-shadow-[0_0_10px_rgba(0,255,159,0.6)]" : "text-slate-500 group-hover:text-slate-300"
              )}>
                <item.icon className="w-6 h-6" />
              </div>
              <span className={cn(
                "text-[10px] font-black uppercase tracking-widest transition-all duration-500",
                isActive ? "text-emerald-400 opacity-100" : "text-slate-500 group-hover:text-slate-300 opacity-60"
              )}>
                {item.name}
              </span>
              
              {isActive && (
                <motion.div 
                  layoutId="active-tab"
                  className="absolute -top-3 left-1/2 -translate-x-1/2 w-14 h-1.5 bg-emerald-400 rounded-full shadow-[0_-5px_20px_rgba(0,255,159,0.8)]"
                />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
