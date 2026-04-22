'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown, 
  Activity,
  ArrowUpRight,
  Filter,
  RefreshCw,
  Loader2
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { StockDetailModal } from '@/components/dashboard/StockDetailModal'
import { useAppStore } from '@/store/useAppStore'

interface StockPrice {
  symbol: string;
  ltp: string;
  change: string;
  percentChange: string;
  high: string;
  low: string;
  volume: string;
}

export default function LivePricesPage() {
  const router = useRouter()
  const [prices, setPrices] = useState<StockPrice[]>([])
  const [loading, setLoading] = useState(true)
  const { searchQuery, setSearchQuery } = useAppStore()
  const [sortBy, setSortBy] = useState<'symbol' | 'ltp' | 'change'>('symbol')
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const fetchPrices = async () => {
    try {
      const res = await fetch('/api/market/live-prices')
      const json = await res.json()
      if (json.success) {
        setPrices(json.data)
        setLastUpdated(new Date().toLocaleTimeString())
      }
    } catch (err) {
      console.error('Failed to fetch prices')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setMounted(true)
    setLastUpdated(new Date().toLocaleTimeString())
    fetchPrices()
    const interval = setInterval(fetchPrices, 30000) // 30 seconds
    return () => clearInterval(interval)
  }, [])

  if (!mounted) return null

  const filteredPrices = prices
    .filter(p => 
      p.symbol.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'symbol') return a.symbol.localeCompare(b.symbol)
      if (sortBy === 'ltp') return parseFloat(b.ltp.replace(/,/g, '')) - parseFloat(a.ltp.replace(/,/g, ''))
      if (sortBy === 'change') return parseFloat(b.percentChange) - parseFloat(a.percentChange)
      return 0
    })

  return (
    <div className="space-y-6 pb-20 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="p-3 bg-[var(--surface)] border border-[var(--border)] rounded-2xl hover:bg-emerald-500/10 transition-all group shadow-sm"
          >
            <ArrowLeft className="w-6 h-6 text-slate-400 group-hover:text-emerald-500 group-hover:-translate-x-1 transition-all" />
          </button>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-[var(--foreground)] uppercase italic">Live Market</h1>
            <div className="flex items-center gap-2 mt-1">
               <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                 Last Updated: {lastUpdated || 'Loading...'}
               </p>
            </div>
          </div>
        </div>
        
        <button 
          onClick={() => { setLoading(true); fetchPrices(); }}
          className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl hover:bg-emerald-500/20 transition-all group"
        >
          <RefreshCw className={cn("w-5 h-5 text-emerald-500", loading && "animate-spin")} />
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-6 border-emerald-500/20 bg-emerald-500/5">
          <div className="flex items-center gap-3 mb-2 text-emerald-500">
            <TrendingUp className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">Top Gainer</span>
          </div>
          <p className="text-xl font-black text-[var(--foreground)]">{prices.reduce((prev, current) => parseFloat(prev.percentChange) > parseFloat(current.percentChange) ? prev : current, prices[0] || {}).symbol || '-'}</p>
        </div>
        
        <div className="glass-card p-6 border-rose-500/20 bg-rose-500/5">
          <div className="flex items-center gap-3 mb-2 text-rose-500">
            <TrendingDown className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">Top Loser</span>
          </div>
          <p className="text-xl font-black text-[var(--foreground)]">{prices.reduce((prev, current) => parseFloat(prev.percentChange) < parseFloat(current.percentChange) ? prev : current, prices[0] || {}).symbol || '-'}</p>
        </div>

        <div className="glass-card p-6 border-blue-500/20 bg-blue-500/5">
          <div className="flex items-center gap-3 mb-2 text-blue-500">
            <Activity className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">Active Stocks</span>
          </div>
          <p className="text-xl font-black text-[var(--foreground)]">{prices.length}</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full group md:hidden">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-emerald-500 transition-colors" />
          <input 
            type="text"
            placeholder="Search symbols..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[var(--surface-alt)] border border-[var(--border)] rounded-2xl pl-14 pr-5 py-4 focus:outline-none focus:border-emerald-500/50 transition-all font-bold text-[var(--foreground)] text-sm"
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <button 
            onClick={() => setSortBy('symbol')}
            className={cn("flex-1 md:flex-none px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest border transition-all", sortBy === 'symbol' ? "bg-emerald-500 text-slate-950 border-emerald-500" : "bg-[var(--surface)] text-slate-500 border-[var(--border)]")}
          >
            Symbol
          </button>
          <button 
            onClick={() => setSortBy('ltp')}
            className={cn("flex-1 md:flex-none px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest border transition-all", sortBy === 'ltp' ? "bg-emerald-500 text-slate-950 border-emerald-500" : "bg-[var(--surface)] text-slate-500 border-[var(--border)]")}
          >
            Price
          </button>
          <button 
            onClick={() => setSortBy('change')}
            className={cn("flex-1 md:flex-none px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest border transition-all", sortBy === 'change' ? "bg-emerald-500 text-slate-950 border-emerald-500" : "bg-[var(--surface)] text-slate-500 border-[var(--border)]")}
          >
            % Change
          </button>
        </div>
      </div>

      {/* Prices Table */}
      <div className="glass-card overflow-hidden border-[var(--border)] bg-[var(--surface)] backdrop-blur-xl rounded-[2rem]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--surface-alt)]/50">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Symbol</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">LTP (Rs.)</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Change</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Volume</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="popLayout">
                {loading ? (
                  Array.from({ length: 10 }).map((_, i) => (
                    <tr key={`skeleton-${i}`} className="border-b border-[var(--border)] animate-pulse">
                      <td className="px-8 py-6"><div className="w-16 h-4 bg-[var(--surface-alt)] rounded" /></td>
                      <td className="px-8 py-6"><div className="w-20 h-4 bg-[var(--surface-alt)] rounded" /></td>
                      <td className="px-8 py-6"><div className="w-12 h-4 bg-[var(--surface-alt)] rounded" /></td>
                      <td className="px-8 py-6"><div className="w-24 h-4 bg-[var(--surface-alt)] rounded float-right" /></td>
                    </tr>
                  ))
                ) : filteredPrices.map((stock, idx) => (
                  <motion.tr 
                    key={stock.symbol}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => {
                      setSelectedSymbol(stock.symbol)
                      setIsModalOpen(true)
                    }}
                    className="border-b border-white/5 group hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                         <div className={cn("w-1 h-6 rounded-full", stock.change.includes('+') ? "bg-emerald-500" : "bg-rose-500")} />
                         <span className="font-black text-[var(--foreground)] group-hover:text-emerald-500 transition-colors uppercase italic">{stock.symbol}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 font-mono text-[var(--foreground)] font-bold">{stock.ltp}</td>
                    <td className="px-8 py-6">
                      <div className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black tracking-tighter uppercase",
                        stock.change.includes('+') ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                      )}>
                        {stock.change.includes('+') ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {stock.change} ({stock.percentChange}%)
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right text-[11px] font-bold text-slate-500">{stock.volume || '-'}</td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
        
        {!loading && filteredPrices.length === 0 && (
          <div className="py-20 text-center space-y-4">
             <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto">
               <Search className="w-8 h-8 text-slate-700" />
             </div>
             <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">No stocks matching "{searchQuery}"</p>
          </div>
        )}
      </div>
      <StockDetailModal 
        symbol={selectedSymbol}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  )
}
