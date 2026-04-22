'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, 
  Trash2, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Search,
  Star,
  RefreshCw,
  Loader2,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Watchlist } from '@/types'
import { toast } from 'react-hot-toast'
import { formatCurrency, formatNumber } from '@/lib/utils'

export default function WatchlistPage() {
  const [watchlist, setWatchlist] = useState<Watchlist[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [searchSymbol, setSearchSymbol] = useState('')
  const supabase = createClient()

  const fetchWatchlist = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('watchlist')
      .select('*')
      .eq('user_id', user.id)
      .order('added_at', { ascending: false })

    if (error) {
      toast.error('Failed to fetch watchlist')
    } else {
      // Mocking some price data
      const dataWithPrices = (data || []).map(item => ({
        ...item,
        current_price: Math.floor(Math.random() * 2000) + 200,
        change: (Math.random() * 50 - 25),
        change_percent: (Math.random() * 4 - 2)
      }))
      setWatchlist(dataWithPrices)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchWatchlist()
  }, [])

  const handleAddSymbol = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchSymbol) return

    setIsAdding(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from('watchlist')
      .insert({
        user_id: user.id,
        symbol: searchSymbol.toUpperCase(),
        company_name: `${searchSymbol.toUpperCase()} Limited` // In real app, fetch from NEPSE symbols list
      })

    if (error) {
      if (error.code === '23505') {
        toast.error('Symbol already in watchlist')
      } else {
        toast.error('Failed to add symbol')
      }
    } else {
      toast.success('Symbol added to watchlist')
      setSearchSymbol('')
      fetchWatchlist()
    }
    setIsAdding(false)
  }

  const handleRemove = async (id: string) => {
    const { error } = await supabase
      .from('watchlist')
      .delete()
      .eq('id', id)

    if (error) {
      toast.error('Failed to remove symbol')
    } else {
      setWatchlist(prev => prev.filter(item => item.id !== id))
      toast.success('Symbol removed')
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Watchlist</h1>
          <p className="text-slate-400 mt-1">Track your favorite NEPSE stocks in real-time</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => { setLoading(true); fetchWatchlist(); }}
            className="p-3 bg-slate-800 rounded-xl border border-slate-700 hover:bg-slate-700 transition-colors"
          >
            <RefreshCw className={`w-5 h-5 text-slate-400 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <form onSubmit={handleAddSymbol} className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
              <input 
                type="text" 
                placeholder="Add Symbol (e.g. NICA)" 
                value={searchSymbol}
                onChange={(e) => setSearchSymbol(e.target.value)}
                className="input-premium pl-9 py-2 text-sm w-48 h-12 uppercase"
              />
            </div>
            <button 
              type="submit"
              disabled={isAdding}
              className="premium-btn premium-btn-primary py-2 h-12"
            >
              {isAdding ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
            </button>
          </form>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="glass-card h-40 animate-pulse" />
          ))}
        </div>
      ) : watchlist.length === 0 ? (
        <div className="glass-card p-20 text-center">
          <Star className="w-16 h-16 text-slate-700 mx-auto mb-6" />
          <h3 className="text-2xl font-bold">Your watchlist is empty</h3>
          <p className="text-slate-500 mt-2">Add symbols to monitor price movements and trends.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {watchlist.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="glass-card p-6 group hover:border-blue-500/30 transition-all cursor-pointer relative"
              >
                <button 
                  onClick={() => handleRemove(item.id)}
                  className="absolute top-4 right-4 p-2 opacity-0 group-hover:opacity-100 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-blue-600/10 rounded-2xl flex items-center justify-center border border-blue-500/20 text-blue-500 font-bold text-lg">
                    {item.symbol.slice(0, 1)}
                  </div>
                  <div>
                    <h3 className="font-black text-xl text-slate-200">{item.symbol}</h3>
                    <p className="text-xs text-slate-500 truncate w-40">{item.company_name}</p>
                  </div>
                </div>

                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Last Traded Price</p>
                    <p className="text-2xl font-black">{formatCurrency(item.current_price || 0)}</p>
                  </div>
                  <div className={`text-right flex flex-col items-end ${ (item.change || 0) >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                    <div className="flex items-center gap-1 font-bold">
                      { (item.change || 0) >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                      <span>{Math.abs(item.change || 0).toFixed(2)}</span>
                    </div>
                    <span className="text-xs font-medium">({ (item.change_percent || 0).toFixed(2)}%)</span>
                  </div>
                </div>
                
                <div className="mt-6 pt-6 border-t border-slate-800/50 flex items-center justify-between text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                  <div className="flex items-center gap-1">
                    <Activity className="w-3 h-3" />
                    NEPSE Live
                  </div>
                  <span>Updated just now</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
