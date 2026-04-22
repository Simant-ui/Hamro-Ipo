'use client'

import { Bell, Search, User, Command } from 'lucide-react'
import { useState } from 'react'
import { useAppStore } from '@/store/useAppStore'
import toast from 'react-hot-toast'
import { ThemeToggle } from './ThemeToggle'
import { SearchModal } from '../dashboard/SearchModal'

export function Header() {
  const { user, searchQuery, setSearchQuery } = useAppStore()
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  return (
    <header className="h-16 fixed top-0 right-0 left-0 md:left-64 bg-[var(--glass-bg)] backdrop-blur-2xl border-b border-[var(--glass-border)] flex items-center justify-between px-4 md:px-8 z-40">
      <div 
        onClick={() => setIsSearchOpen(true)}
        className="hidden md:flex items-center gap-4 bg-slate-500/5 dark:bg-black/60 px-6 py-2.5 rounded-2xl border border-slate-200 dark:border-white/5 w-full max-w-lg group hover:border-emerald-500/50 hover:shadow-sm dark:hover:shadow-[0_0_20px_rgba(0,255,159,0.1)] transition-all duration-500 backdrop-blur-xl cursor-pointer"
      >
        <Search className="w-5 h-5 text-slate-400 dark:text-slate-500 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 group-hover:scale-110 transition-all" />
        <div className="flex-1 text-sm text-slate-400 dark:text-slate-600 font-bold tracking-wide">
          {searchQuery || "Search accounts, stocks, or services..."}
        </div>
        <div className="flex items-center gap-1 opacity-40">
           <Command className="w-3 h-3" />
           <span className="text-[10px] font-black">K</span>
        </div>
      </div>

      <div className="flex md:hidden items-center gap-2">
        <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center font-black text-black text-xs shadow-[0_0_15px_rgba(16,185,129,0.3)]">H</div>
        <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Hamro IPO</span>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <div className="md:hidden">
          <button 
            onClick={() => setIsSearchOpen(true)}
            className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-400"
          >
            <Search className="w-5 h-5" />
          </button>
        </div>
        
        <div className="hidden md:block">
          <ThemeToggle />
        </div>
        
        <button 
          onClick={() => toast('Notifications feature coming soon!', { icon: '🔔' })}
          className="relative p-2.5 md:p-3 rounded-2xl bg-white dark:bg-black/60 border border-slate-200 dark:border-white/10 text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400 hover:border-emerald-500/40 transition-all duration-500 shadow-sm dark:shadow-xl backdrop-blur-xl"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900 shadow-[0_0_10px_rgba(0,255,159,0.8)] animate-pulse" />
        </button>

        <div className="flex items-center gap-3 md:gap-5 pl-3 md:pl-5 border-l border-slate-200 dark:border-white/10">
          <div className="text-right hidden sm:block">
            <p className="text-[10px] md:text-xs font-black text-slate-900 dark:text-white uppercase tracking-[0.15em]">{user?.full_name?.split(' ')[0] || 'Guest'}</p>
          </div>
          <div 
            onClick={() => toast('Profile details coming soon!', { icon: '👤' })}
            className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-[1.2rem] bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-white dark:text-slate-950 shadow-lg dark:shadow-[0_0_20px_rgba(0,255,159,0.3)] cursor-pointer hover:scale-110 transition-all duration-500 border-2 border-white/20 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-white/20 group-hover:bg-transparent transition-colors" />
            {user?.avatar_url ? (
               <img src={user.avatar_url} alt="Profile" className="w-full h-full object-cover relative z-10" />
            ) : (
               <User className="w-5 h-5 md:w-6 md:h-6 relative z-10" />
            )}
          </div>
        </div>
      </div>

      <SearchModal 
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSearch={setSearchQuery}
        initialQuery={searchQuery}
      />
    </header>
  )
}

