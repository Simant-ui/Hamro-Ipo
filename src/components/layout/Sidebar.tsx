'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  LayoutDashboard, 
  UserCircle, 
  FileText, 
  Settings, 
  LogOut,
  Layers,
  LayoutGrid,
  CheckCircle2,
  Trophy
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { useAppStore } from '@/store/useAppStore'

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: Layers, label: 'Bulk Apply', href: '/dashboard/bulk-apply' },
  { icon: LayoutGrid, label: 'Services', href: '/dashboard/services' },
  { icon: CheckCircle2, label: 'Portfolio Check', href: '/dashboard/check' },
  { icon: UserCircle, label: 'Profile', href: '/dashboard/profile' },
  { icon: Trophy, label: 'Bulk Result', href: '/dashboard/result-checker' },
  { icon: Settings, label: 'Settings', href: '/dashboard/profile/settings' },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const setMembershipModalOpen = useAppStore((state) => state.setMembershipModalOpen)

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Logged out successfully')
      window.location.href = '/login'
    }
  }

  return (
    <aside className="hidden md:flex w-72 h-screen fixed left-0 top-0 bg-[var(--surface)] border-r border-[var(--border)] flex-col z-50 overflow-hidden">
      {/* Brand Infrastructure */}
      <div className="pt-10 pb-8 px-8 flex items-center justify-between">
        <div className="flex items-center gap-4 group cursor-pointer">
          <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/10 group-hover:rotate-6 transition-all duration-500 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent" />
            <span className="text-slate-950 font-black text-2xl italic relative z-10">H</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black text-[var(--foreground)] tracking-tighter uppercase italic leading-none">Hamro IPO</span>
            <span className="text-[8px] font-bold text-emerald-500 uppercase tracking-[0.4em] mt-1">Elite v2.0</span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col px-6 overflow-y-auto custom-scrollbar">
        {/* Navigation Layer */}
        <nav className="space-y-1 mt-6">
          <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] px-4 mb-4">Core Infrastructure</p>
          {menuItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-300 group relative overflow-hidden",
                  isActive 
                    ? "bg-emerald-500/10 dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-sm border border-emerald-500/20" 
                    : "text-slate-500 hover:text-emerald-600 dark:hover:text-slate-200 hover:bg-emerald-50/50 dark:hover:bg-slate-900/40"
                )}
              >
                {isActive && (
                  <motion.div 
                    layoutId="sidebar-active-glow"
                    className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent pointer-events-none"
                  />
                )}
                <item.icon className={cn(
                  "w-5 h-5 transition-all duration-300",
                  isActive ? "text-emerald-500 scale-110" : "text-slate-400 group-hover:text-emerald-500 group-hover:scale-110"
                )} />
                <span className={cn(
                  "text-[13px] font-black uppercase tracking-widest italic transition-all duration-300",
                  isActive ? "translate-x-1" : "group-hover:translate-x-1"
                )}>
                  {item.label}
                </span>
                
                {isActive && (
                  <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-emerald-500 rounded-r-full" />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Elite Tier Banner */}
        <div className="mt-12 mb-8">
          <div 
            onClick={() => setMembershipModalOpen(true)}
            className="p-6 rounded-[32px] bg-[var(--surface-alt)] border border-[var(--border)] relative overflow-hidden group cursor-pointer hover:border-emerald-500/30 transition-all duration-500 shadow-sm"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-all -mr-8 -mt-8" />
            <div className="relative z-10 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                  <Trophy className="w-4 h-4 text-emerald-500" />
                </div>
                <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Elite Tier</span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium leading-relaxed">Unlock multi-terminal bulk apply & institutional data sync.</p>
              <button className="w-full py-3 bg-emerald-500 dark:bg-emerald-500 text-slate-950 dark:text-slate-950 text-[9px] font-black uppercase tracking-[0.2em] rounded-xl transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-emerald-500/10">
                Upgrade Access
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Footer */}
      <div className="p-8 border-t border-[var(--border)] bg-[var(--surface-alt)]/50">
        <button
          onClick={handleLogout}
          className="flex items-center gap-4 px-5 py-3 rounded-xl w-full text-slate-500 hover:text-rose-500 transition-all group font-black uppercase tracking-widest text-[11px] italic"
        >
          <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>

  )
}

