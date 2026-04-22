'use client'

import { Bell, Search, User } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import toast from 'react-hot-toast'
import { ThemeToggle } from './ThemeToggle'

export function Header() {
  const { user, searchQuery, setSearchQuery } = useAppStore()

  return (
    <header className="h-16 fixed top-0 right-0 left-0 md:left-64 bg-[var(--glass-bg)] backdrop-blur-2xl border-b border-[var(--glass-border)] flex items-center justify-between px-8 z-40">
      <div className="flex items-center gap-4 bg-slate-500/5 dark:bg-black/60 px-6 py-2.5 rounded-2xl border border-slate-200 dark:border-white/5 w-full max-w-lg group focus-within:border-emerald-500/50 focus-within:shadow-sm dark:focus-within:shadow-[0_0_20px_rgba(0,255,159,0.1)] transition-all duration-500 backdrop-blur-xl">
        <Search className="w-5 h-5 text-slate-400 dark:text-slate-500 group-focus-within:text-emerald-500 dark:group-focus-within:text-emerald-400 group-focus-within:scale-110 transition-all" />
        <input 
          type="text" 
          placeholder="Search accounts, stocks, or services..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-transparent border-none outline-none text-sm w-full text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 font-bold tracking-wide"
        />
      </div>

      <div className="flex items-center gap-4">
        <ThemeToggle />
        
        <button 
          onClick={() => toast('Notifications feature coming soon!', { icon: '🔔' })}
          className="relative p-3 rounded-2xl bg-white dark:bg-black/60 border border-slate-200 dark:border-white/10 text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400 hover:border-emerald-500/40 transition-all duration-500 shadow-sm dark:shadow-xl backdrop-blur-xl"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900 shadow-[0_0_10px_rgba(0,255,159,0.8)] animate-pulse" />
        </button>

        <div className="flex items-center gap-5 pl-5 border-l border-slate-200 dark:border-white/10">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-[0.15em]">{user?.full_name || 'Guest User'}</p>
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-black uppercase tracking-[0.3em] mt-1 opacity-80">Elite Investor</p>
          </div>
          <div 
            onClick={() => toast('Profile details coming soon!', { icon: '👤' })}
            className="w-12 h-12 rounded-[1.2rem] bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-white dark:text-slate-950 shadow-lg dark:shadow-[0_0_20px_rgba(0,255,159,0.3)] cursor-pointer hover:scale-110 hover:rotate-3 transition-all duration-500 border-2 border-white/20 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-white/20 group-hover:bg-transparent transition-colors" />
            {user?.avatar_url ? (
               <img src={user.avatar_url} alt="Profile" className="w-full h-full object-cover relative z-10" />
            ) : (
               <User className="w-6 h-6 relative z-10" />
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

