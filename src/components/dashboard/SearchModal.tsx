'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, Command, Activity, User, LayoutGrid, TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/store/useAppStore'
import { useRouter } from 'next/navigation'
import { StockDetailModal } from './StockDetailModal'

interface SearchModalProps {
  isOpen: boolean
  onClose: () => void
  onSearch: (query: string) => void
  initialQuery?: string
}

export function SearchModal({ isOpen, onClose, onSearch, initialQuery = '' }: SearchModalProps) {
  const [query, setQuery] = useState(initialQuery)
  const { livePrices } = useAppStore()
  const router = useRouter()
  const [selectedStock, setSelectedStock] = useState<string | null>(null)
  const [isStockModalOpen, setIsStockModalOpen] = useState(false)
  
  useEffect(() => {
    if (isOpen) {
      setQuery(initialQuery)
      // Focus input
      setTimeout(() => {
        const input = document.getElementById('global-search-input')
        input?.focus()
      }, 100)
    }
  }, [isOpen, initialQuery])

  const handleSearch = (q: string) => {
    setQuery(q)
    onSearch(q)
  }

  const searchResults = useMemo(() => {
    if (!query) return []
    return livePrices.filter(p => 
      p.symbol.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 5)
  }, [query, livePrices])

  if (!isOpen) return null

  return (
    <>
      <AnimatePresence>
        <div className="fixed inset-0 z-[100] flex items-start justify-center p-4 pt-20 md:pt-32">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-xl"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="relative w-full max-w-2xl bg-slate-950 border border-white/10 rounded-[2.5rem] shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden"
          >
            <div className="p-6 flex items-center gap-4 border-b border-white/5 bg-white/[0.02]">
              <Search className="w-6 h-6 text-emerald-500" />
              <input 
                id="global-search-input"
                type="text"
                placeholder="Search accounts, symbols, or tools..."
                value={query}
                onChange={(e) => handleSearch(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none text-xl font-black text-white placeholder-slate-600 tracking-tight"
              />
              <button 
                onClick={onClose}
                className="p-2 hover:bg-white/5 rounded-xl text-slate-500 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-8 space-y-8 max-h-[60vh] overflow-y-auto no-scrollbar">
              {/* Quick Links */}
              <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Quick Navigation</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <QuickLink icon={<LayoutGrid />} label="Bulk Apply" href="/dashboard/bulk-apply" color="emerald" onClick={onClose} />
                  <QuickLink icon={<Activity />} label="Market Data" href="/dashboard/live-prices" color="blue" onClick={onClose} />
                  <QuickLink icon={<User />} label="Profile" href="/dashboard/profile" color="purple" onClick={onClose} />
                </div>
              </div>

              {/* Recent/Suggested */}
              {!query && (
                <div className="space-y-4">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Suggested Stocks</p>
                  <div className="flex flex-wrap gap-2">
                    {['NICA', 'HDL', 'SHL', 'NTC', 'UPPER', 'HRL'].map(sym => (
                      <button 
                        key={sym}
                        onClick={() => handleSearch(sym)}
                        className="px-4 py-2 bg-white/5 border border-white/5 rounded-xl text-xs font-black text-slate-400 hover:text-emerald-400 hover:border-emerald-500/30 transition-all"
                      >
                        {sym}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Results */}
              {query && (
                <div className="space-y-4">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Results for "{query}"</p>
                  <div className="flex flex-col gap-2">
                    {searchResults.length > 0 ? (
                      searchResults.map((stock) => (
                        <div 
                          key={stock.symbol}
                          onClick={() => {
                            setSelectedStock(stock.symbol)
                            setIsStockModalOpen(true)
                          }}
                          className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between group hover:border-emerald-500/30 hover:bg-emerald-500/[0.02] transition-all cursor-pointer"
                        >
                          <div className="flex items-center gap-4">
                             <div className="w-10 h-10 rounded-xl bg-black/40 flex items-center justify-center font-black text-emerald-500 border border-white/5 group-hover:border-emerald-500/20">
                               {stock.symbol[0]}
                             </div>
                             <div>
                               <p className="text-sm font-black text-white group-hover:text-emerald-400 transition-colors">{stock.symbol}</p>
                               <p className="text-[10px] font-bold text-slate-500 uppercase">LTP: Rs. {stock.ltp}</p>
                             </div>
                          </div>
                          <div className={cn(
                            "flex items-center gap-2 text-[10px] font-black px-3 py-1 rounded-lg",
                            stock.change.includes('+') ? "text-emerald-500 bg-emerald-500/10" : "text-rose-500 bg-rose-500/10"
                          )}>
                            {stock.change.includes('+') ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            {stock.percentChange}%
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center text-slate-600 font-bold italic text-sm">
                        No stocks matching your query.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

          <div className="p-4 bg-white/[0.01] border-t border-white/5 flex items-center justify-between px-8">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="px-1.5 py-0.5 bg-white/10 rounded text-[9px] font-black text-slate-400">ESC</span>
                <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Close</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="px-1.5 py-0.5 bg-white/10 rounded text-[9px] font-black text-slate-400">↵</span>
                <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Select</span>
              </div>
            </div>
            <p className="text-[9px] font-black text-slate-700 uppercase tracking-widest">Global Search v1.0</p>
          </div>
        </motion.div>
        </div>
      </AnimatePresence>

      <StockDetailModal 
        symbol={selectedStock}
        isOpen={isStockModalOpen}
        onClose={() => {
          setIsStockModalOpen(false)
          setSelectedStock(null)
        }}
      />
    </>
  )
}

function QuickLink({ icon, label, href, color, onClick }: any) {
  const colors: any = {
    emerald: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    blue: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    purple: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
  }
  
  return (
    <a 
      href={href}
      onClick={onClick}
      className={cn("flex items-center gap-3 p-4 rounded-2xl border transition-all hover:scale-[1.02] active:scale-95", colors[color])}
    >
      <div className="w-5 h-5">{icon}</div>
      <span className="text-xs font-black uppercase tracking-widest">{label}</span>
    </a>
  )
}
