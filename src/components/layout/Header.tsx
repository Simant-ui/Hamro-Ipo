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
    <header className="h-20 fixed top-0 right-0 left-0 md:left-72 bg-[var(--glass-bg)] backdrop-blur-xl border-b border-[var(--border)] flex items-center justify-between px-6 md:px-10 z-40 transition-all duration-300">
      {/* Dynamic Search Infrastructure */}
      <div 
        onClick={() => setIsSearchOpen(true)}
        className="hidden md:flex items-center gap-4 bg-[var(--surface-alt)] px-5 py-2.5 rounded-2xl border border-[var(--border)] hover:border-emerald-500/30 w-full max-w-lg transition-all cursor-pointer group shadow-sm"
      >
        <Search className="w-4 h-4 text-slate-400 group-hover:text-emerald-500 transition-colors" />
        <span className="flex-1 text-[13px] text-slate-400 font-bold uppercase tracking-wider">
          {searchQuery || "Access terminal search..."}
        </span>
        <div className="flex items-center gap-1.5 bg-[var(--surface)] px-2 py-1 rounded-lg border border-[var(--border)] shadow-sm">
           <Command className="w-3 h-3 text-slate-500" />
           <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">K</span>
        </div>
      </div>

      {/* Mobile Branding (Small Viewports Only) */}
      <div className="flex md:hidden items-center gap-3">
        <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <span className="text-slate-950 font-black text-lg italic">H</span>
        </div>
        <span className="text-sm font-black uppercase tracking-tight text-[var(--foreground)] italic">Hamro IPO</span>
      </div>

      {/* Command Actions */}
      <div className="flex items-center gap-4">
        <div className="md:hidden">
          <button 
            onClick={() => setIsSearchOpen(true)}
            className="p-2.5 rounded-xl text-slate-500 hover:bg-[var(--surface-alt)] transition-all border border-transparent hover:border-[var(--border)]"
          >
            <Search className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex items-center gap-2 p-1.5 bg-[var(--surface-alt)] border border-[var(--border)] rounded-2xl shadow-sm">
           <ThemeToggle />
           <div className="w-px h-4 bg-[var(--border)] mx-1" />
           <button 
             onClick={() => toast.success('Institutional alerts active')}
             className="relative p-2 rounded-xl text-slate-500 hover:text-emerald-500 transition-all"
           >
             <Bell className="w-5 h-5" />
             <span className="absolute top-2 right-2 w-2 h-2 bg-emerald-500 rounded-full border-2 border-[var(--surface)] shadow-sm" />
           </button>
        </div>

        <div 
          onClick={() => toast('Direct profile access enabled')}
          className="flex items-center gap-4 pl-2 cursor-pointer group"
        >
          <div className="text-right hidden lg:block space-y-0.5">
            <p className="text-[11px] font-black text-[var(--foreground)] uppercase italic tracking-wider group-hover:text-emerald-500 transition-colors">{user?.full_name || 'Terminal User'}</p>
            <div className="flex items-center justify-end gap-1.5">
               <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
               <p className="text-[9px] text-slate-500 font-bold uppercase tracking-[0.2em]">Institutional Tier</p>
            </div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center text-slate-400 overflow-hidden group-hover:border-emerald-500/50 transition-all shadow-sm relative">
            {user?.avatar_url ? (
               <img src={user.avatar_url} alt="Profile" className="w-full h-full object-cover" />
            ) : (
               <User className="w-5 h-5 group-hover:scale-110 transition-transform" />
            )}
            <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
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


