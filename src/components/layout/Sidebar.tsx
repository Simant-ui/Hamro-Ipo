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
      // Use window.location.href for a clean redirect if router initialization is being finicky
      window.location.href = '/login'
    }
  }

  return (
    <aside className="hidden md:flex w-64 h-screen fixed left-0 top-0 bg-[var(--glass-bg)] backdrop-blur-2xl border-r border-[var(--glass-border)] flex-col z-50 overflow-y-auto custom-scrollbar">
      <div className="p-8">
        <div className="flex items-center gap-4 mb-12 px-2 mt-2">
          <div className="w-14 h-14 rounded-[1.5rem] flex items-center justify-center shadow-lg dark:shadow-[0_0_30px_rgba(0,255,159,0.25)] border-2 border-emerald-500/30 overflow-hidden bg-white dark:bg-black relative group">
            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/10 dark:from-emerald-500/20 to-transparent pointer-events-none" />
            <img src="/logo.png" alt="Hamro IPO Logo" className="w-full h-full object-cover relative z-10 group-hover:scale-110 transition-transform duration-500" />
          </div>
          <div>
            <span className="text-2xl font-black tracking-tighter text-[var(--foreground)] block">Hamro IPO</span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-black uppercase tracking-[0.4em] block -mt-1 opacity-80">v2.0 Elite</span>
          </div>
        </div>

        <nav className="space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-500 group relative overflow-hidden",
                  isActive 
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 dark:border-emerald-500/30 shadow-sm dark:shadow-[0_0_20px_rgba(0,255,159,0.1)]" 
                    : "text-slate-400 dark:text-slate-500 hover:bg-slate-500/5 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"
                )}
              >
                {isActive && (
                  <>
                    <motion.div 
                      layoutId="sidebar-active"
                      className="absolute left-0 w-1.5 h-6 bg-emerald-500 rounded-full shadow-[0_0_15px_rgba(0,255,159,0.8)]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent pointer-events-none" />
                  </>
                )}
                <item.icon className={cn(
                  "w-5 h-5 transition-all duration-500",
                  isActive ? "text-emerald-400 scale-110 drop-shadow-[0_0_8px_rgba(0,255,159,0.5)]" : "text-slate-600 group-hover:text-slate-300"
                )} />
                <span className="font-black text-[12px] uppercase tracking-[0.15em]">{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </div>

      <div className="mt-auto p-6 space-y-4">
        <div 
          onClick={() => setMembershipModalOpen(true)}
          className="bg-slate-900/40 dark:bg-black/40 backdrop-blur-xl p-5 rounded-3xl border border-slate-800 dark:border-white/10 relative overflow-hidden group cursor-pointer hover:border-emerald-500/50 transition-all duration-500 shadow-2xl"
        >
          <div className="absolute top-[-20%] right-[-10%] w-24 h-24 bg-emerald-500/10 rounded-full blur-[40px] group-hover:bg-emerald-500/20 transition-all duration-700" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Membership</p>
              <Trophy className="w-4 h-4 text-emerald-500 animate-pulse" />
            </div>
            <p className="text-sm font-black text-white">Pro Lifetime Plan</p>
            <div className="mt-3 w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
               <div className="w-full h-full bg-gradient-to-r from-emerald-500 to-cyan-400" />
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3.5 rounded-2xl w-full text-slate-500 hover:bg-rose-500/10 hover:text-rose-500 transition-all duration-300 group border border-transparent hover:border-rose-500/20"
        >
          <LogOut className="w-5 h-5 group-hover:rotate-12 transition-transform" />
          <span className="font-black text-[11px] uppercase tracking-widest">Sign Out</span>
        </button>
      </div>
    </aside>
  )
}
