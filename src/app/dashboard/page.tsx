'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { 
  TrendingUp, 
  Search, 
  Plus, 
  Copy, 
  Trash2, 
  ChevronRight,
  RefreshCw,
  Activity,
  Clock,
  Settings,
  UserCircle,
  Edit3,
  ArrowUpRight,
  Check
} from 'lucide-react'
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts'
import toast from 'react-hot-toast'
import { AddAccountModal } from '@/components/dashboard/AddAccountModal'
import { StockDetailModal } from '@/components/dashboard/StockDetailModal'
import { NEPAL_BANKS } from '@/constants/banks'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/store/useAppStore'
import { useAccountStore } from '@/store/useAccountStore'

const mockNepseData = [
  { time: '11:00 AM', value: 2810 },
  { time: '11:30 AM', value: 2825 },
  { time: '12:00 PM', value: 2815 },
  { time: '12:30 PM', value: 2805 },
  { time: '01:00 PM', value: 2818 },
  { time: '01:30 PM', value: 2812 },
  { time: '02:00 PM', value: 2830 },
  { time: '02:30 PM', value: 2835 },
  { time: '03:00 PM', value: 2838 },
]

export default function DashboardPage() {
  const { accounts, addAccount, updateAccount, deleteAccount } = useAccountStore()
  const [hasHydrated, setHasHydrated] = useState(false)

  // Hydration check
  useEffect(() => {
    setHasHydrated(true)
  }, [])

  useEffect(() => {
    if (hasHydrated) {
      fetchData()
    }
  }, [hasHydrated])

  const [mounted, setMounted] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingAccount, setEditingAccount] = useState<any>(null)
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null)
  const [isStockModalOpen, setIsStockModalOpen] = useState(false)
  const [nepalTime, setNepalTime] = useState(new Date())
  
  const [marketData, setMarketData] = useState<any>(null)
  const [subIndices, setSubIndices] = useState<any[]>([])
  const [news, setNews] = useState<any[]>([])
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [livePrices, setLivePrices] = useState<any[]>([])

  const fetchData = async () => {
    if (!hasHydrated) return
    setIsRefreshing(true)
    try {
      const [marketRes, newsRes, subRes, pricesRes] = await Promise.all([
        fetch('/api/market/summary'),
        fetch('/api/news/latest'),
        fetch('/api/market/sub-indices'),
        fetch('/api/market/live-prices')
      ])
      
      const marketJson = await marketRes.json()
      const newsJson = await newsRes.json()
      const subJson = await subRes.json()
      const pricesJson = await pricesRes.json()
      
      if (marketJson.success) setMarketData(marketJson.data)
      if (newsJson.success) setNews(newsJson.data)
      if (subJson.success) setSubIndices(subJson.data)
      if (pricesJson.success) setLivePrices(pricesJson.data)
    } catch (err) {
      console.error('Failed to fetch real-time data:', err)
    } finally {
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    setMounted(true)
    fetchData()
    const dataTimer = setInterval(fetchData, 60000) // Every minute

    const timer = setInterval(() => {
      // Get Nepal Time
      const now = new Date()
      const nepalNow = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kathmandu' }))
      setNepalTime(nepalNow)
    }, 1000)
    return () => {
      clearInterval(timer)
      clearInterval(dataTimer)
    }
  }, [])

  const getMarketStatus = () => {
    const hours = nepalTime.getHours()
    const minutes = nepalTime.getMinutes()
    const day = nepalTime.getDay() // 0 = Sunday, ..., 6 = Saturday

    // Market is Closed on Friday (5) and Saturday (6)
    if (day === 5 || day === 6) return { status: 'Closed', color: 'text-red-500 bg-red-500/10 border-red-500/20' }

    const timeInMinutes = hours * 60 + minutes
    
    // Pre-Open: 10:30 AM - 11:00 AM (630 - 660 mins)
    if (timeInMinutes >= 630 && timeInMinutes < 660) {
      return { status: 'Pre-Open', color: 'text-amber-500 bg-amber-500/10 border-amber-500/20' }
    }
    
    // Open: 11:00 AM - 3:00 PM (660 - 900 mins)
    if (timeInMinutes >= 660 && timeInMinutes < 900) {
      return { status: 'Open', color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' }
    }

    return { status: 'Closed', color: 'text-red-500 bg-red-500/10 border-red-500/20' }
  }

  const market = getMarketStatus()
  const timeString = nepalTime.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit',
    hour12: true 
  })

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('BOID Copied!')
  }

  const { searchQuery } = useAppStore()
  const filteredAccounts = accounts.filter(acc => 
    acc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    acc.boid.toLowerCase().includes(searchQuery.toLowerCase()) ||
    acc.bank.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (!mounted || !hasHydrated) return null

  return (
    <div className="space-y-8 pb-20 px-4 md:px-0">
      {/* NEPSE Index Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8 md:p-10 group hover:border-emerald-500/40 transition-all duration-700 relative overflow-hidden bg-[var(--surface)] shadow-xl dark:shadow-[0_0_50px_-20px_rgba(16,185,129,0.15)] border-[var(--glass-border)]"
      >
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none group-hover:bg-emerald-500/15 transition-all duration-700" />
        
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 relative z-10">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className={cn("px-4 py-1.5 rounded-full border flex items-center gap-2 jakarta transition-all duration-500 shadow-sm", market.color)}>
                  <div className={cn("w-2 h-2 rounded-full animate-pulse", market.status === 'Open' ? 'bg-emerald-500' : market.status === 'Pre-Open' ? 'bg-amber-500' : 'bg-red-500')} />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">Market {market.status}</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-1.5 bg-black/40 rounded-full border border-white/10 jakarta text-slate-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span className="text-[11px] font-bold tabular-nums tracking-wider">{timeString} (NPT)</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={fetchData}
                  disabled={isRefreshing}
                  className={cn(
                    "p-2.5 bg-emerald-500/10 rounded-xl text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 dark:border-emerald-500/10 hover:bg-emerald-500/20 transition-all",
                    isRefreshing && "animate-spin"
                  )}
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <h1 className="text-6xl md:text-7xl font-black text-[var(--foreground)] tracking-tighter leading-none jakarta">
                {marketData?.nepseIndex || '2,838.40'}
              </h1>
              <div className="flex items-center gap-4 pt-4">
                <div className={cn(
                  "flex items-center gap-1.5 px-3 py-1 rounded-full border jakarta",
                  marketData?.change?.includes('+') ? "bg-emerald-500/10 dark:bg-emerald-500/20 border-emerald-500/20" : "bg-red-500/10 dark:bg-red-500/20 border-red-500/20"
                )}>
                  <TrendingUp className={cn("w-4 h-4", marketData?.change?.includes('+') ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400")} />
                  <span className={cn("text-sm font-black", marketData?.change?.includes('+') ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400")}>
                    {marketData ? `${marketData.change} (${marketData.percentChange}%)` : '+5.36 (0.18%)'}
                  </span>
                </div>
                <span className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest jakarta">NEPSE Index Today</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 mt-10 pt-8 border-t border-white/5">
              <div>
                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1 jakarta">Day Low</p>
                <p className="text-lg font-black text-slate-700 dark:text-slate-300 jakarta">2,805.12</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1 jakarta">Day High</p>
                <p className="text-lg font-black text-slate-700 dark:text-slate-300 jakarta">2,838.40</p>
              </div>
            </div>
          </div>

          <div className="lg:w-[55%] h-[240px] min-h-[240px] relative">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <AreaChart data={mockNepseData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="8 8" stroke="currentColor" vertical={false} strokeOpacity={0.05} />
                <XAxis dataKey="time" hide />
                <YAxis hide domain={['dataMin - 10', 'dataMax + 10']} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--surface)', 
                    backdropFilter: 'blur(20px)',
                    border: '1px solid var(--border)', 
                    borderRadius: '20px', 
                    fontSize: '12px',
                    fontWeight: '900',
                    boxShadow: 'var(--card-shadow)'
                  }}
                  itemStyle={{ color: '#10b981' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#10b981" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorValue)" 
                  animationDuration={2500}
                />
              </AreaChart>
            </ResponsiveContainer>
            <div className="absolute bottom-0 right-0 flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <Clock className="w-3 h-3" /> Updated 1 min ago
            </div>
          </div>
        </div>
      </motion.div>
      
      {/* Sub-Indices Ticker */}
      <div className="flex overflow-x-auto gap-4 no-scrollbar pb-2 px-2">
        {(subIndices.length > 0 ? subIndices : [
          { name: 'Banking', value: '1,459.49', percentChange: '-0.84' },
          { name: 'Hotels', value: '8,360.91', percentChange: '+1.01' },
          { name: 'Hydro', value: '4,085.03', percentChange: '-0.23' },
          { name: 'Finance', value: '2,434.03', percentChange: '-0.70' },
          { name: 'Insurance', value: '12,693.38', percentChange: '-0.62' },
        ]).map((sub, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="flex-shrink-0 p-4 rounded-2xl bg-[var(--surface)] border border-white/5 shadow-sm min-w-[160px] group hover:border-emerald-500/20 transition-all"
          >
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 jakarta">{sub.name}</p>
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm font-black text-[var(--foreground)] jakarta">{sub.value}</span>
              <span className={cn(
                "text-[10px] font-black jakarta px-1.5 py-0.5 rounded-md",
                sub.percentChange?.includes('+') ? "text-emerald-500 bg-emerald-500/10" : "text-red-500 bg-red-500/10"
              )}>
                {sub.percentChange}%
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Live LTP Ticker */}
      {livePrices.length > 0 && (
        <div className="bg-emerald-500/10 border-y border-emerald-500/20 py-2 overflow-hidden relative">
          <motion.div 
            animate={{ x: [0, -2000] }}
            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
            className="flex whitespace-nowrap gap-8"
          >
            {livePrices.map((price, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{price.symbol}</span>
                <span className="text-xs font-black text-white">{price.ltp}</span>
                <span className={cn(
                  "text-[10px] font-bold",
                  price.change?.includes('+') ? "text-emerald-500" : "text-rose-500"
                )}>
                  {price.change} ({price.percentChange}%)
                </span>
              </div>
            ))}
            {/* Duplicate for seamless loop */}
            {livePrices.map((price, idx) => (
              <div key={`dup-${idx}`} className="flex items-center gap-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{price.symbol}</span>
                <span className="text-xs font-black text-white">{price.ltp}</span>
                <span className={cn(
                  "text-[10px] font-bold",
                  price.change?.includes('+') ? "text-emerald-500" : "text-rose-500"
                )}>
                  {price.change} ({price.percentChange}%)
                </span>
              </div>
            ))}
          </motion.div>
        </div>
      )}

      {/* Account List Header */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-4">
           <div className="w-2 h-8 bg-emerald-500 rounded-full shadow-[0_0_15px_rgba(0,255,159,0.5)]" />
           <h2 className="text-3xl font-black tracking-tighter uppercase text-[var(--foreground)] jakarta">
             Portfolio Accounts 
             <span className="text-emerald-600 dark:text-emerald-400 ml-4 bg-emerald-500/10 px-4 py-1 rounded-xl border border-emerald-500/20 text-sm shadow-inner jakarta">{accounts.length}</span>
           </h2>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-3.5 rounded-2xl bg-[var(--surface)] text-slate-400 hover:text-emerald-500 border border-white/5 transition-all shadow-lg backdrop-blur-md">
            <Search className="w-5 h-5" />
          </button>
          <button className="p-3.5 rounded-2xl bg-[var(--surface)] text-slate-400 hover:text-emerald-500 border border-white/5 transition-all shadow-lg backdrop-blur-md">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Account Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredAccounts.map((account, idx) => (
          <motion.div
            key={account.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="glass-card p-8 group hover:-translate-y-2 transition-all duration-500 bg-[var(--surface)] border-white/5 shadow-xl dark:shadow-none"
          >
            <div className="flex items-start justify-between mb-8">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-[0_0_20px_rgba(0,255,159,0.1)] group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                <UserCircle className="w-9 h-9" />
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => { setEditingAccount(account); setIsAddModalOpen(true); }}
                  className="p-3 rounded-xl bg-black/40 text-slate-400 hover:text-emerald-500 hover:bg-emerald-500/10 transition-all border border-white/5"
                >
                  <Edit3 className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => { deleteAccount(account.id); toast.success(`${account.name} deleted!`); }}
                  className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-all border border-slate-200 dark:border-white/5"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-black text-[var(--foreground)] tracking-tight truncate group-hover:text-emerald-500 transition-colors jakarta">{account.name}</h3>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-black uppercase tracking-[0.3em] mt-1 opacity-80 jakarta">{account.bank} • ID: {account.username}</p>
              </div>

              <div className="p-5 rounded-2xl bg-black/40 border border-white/5 group-hover:border-emerald-500/20 transition-all">
                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 jakarta">MeroShare ID</p>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-black text-emerald-500 tracking-[0.2em] jakarta">{account.username}</span>
                  <button onClick={() => copyToClipboard(account.boid)} className="p-2 text-slate-400 hover:text-emerald-500 transition-colors">
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest jakarta">BOID</span>
                  <span className="text-xs font-black text-slate-500 dark:text-slate-400 mt-1 jakarta">{account.boid}</span>
                </div>
                <div className="w-10 h-10 rounded-full border-2 border-emerald-500/30 flex items-center justify-center bg-emerald-500/5 group-hover:bg-emerald-500/10 transition-all shadow-inner">
                  <Check className="w-5 h-5 text-emerald-500" />
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Live Market Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-4">
            <div className="w-2 h-8 bg-blue-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
            <h2 className="text-3xl font-black tracking-tighter uppercase text-[var(--foreground)] jakarta">Live Market Prices</h2>
          </div>
          <Link href="/dashboard/live-prices" className="group flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-xl hover:bg-blue-500/20 transition-all">
            <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">View All Market</span>
            <ArrowUpRight className="w-4 h-4 text-blue-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {livePrices.length > 0 ? (
            livePrices.slice(0, 8).map((price, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                className="glass-card p-5 bg-[var(--surface)] border-white/5 flex flex-col gap-3 group hover:border-blue-500/30 transition-all cursor-pointer"
                onClick={() => {
                  setSelectedSymbol(price.symbol)
                  setIsStockModalOpen(true)
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-black text-blue-500 jakarta">{price.symbol}</span>
                  <span className={cn(
                    "text-[10px] font-black px-2 py-0.5 rounded-md",
                    price.change?.includes('+') ? "text-emerald-500 bg-emerald-500/10" : "text-rose-500 bg-rose-500/10"
                  )}>
                    {price.percentChange}%
                  </span>
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-xs font-black text-white jakarta">Rs. {price.ltp}</p>
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">LTP</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-400">Vol: {price.volume}</p>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            [1, 2, 3, 4].map(i => (
              <div key={i} className="glass-card p-5 animate-pulse bg-black/20 border-white/5 h-24" />
            ))
          )}
        </div>
      </div>

      {/* Latest News & Announcements */}
      <div className="space-y-6">
        <div className="flex items-center gap-4 px-2">
          <div className="w-2 h-8 bg-amber-500 rounded-full shadow-[0_0_15px_rgba(245,158,11,0.5)]" />
          <h2 className="text-3xl font-black tracking-tighter uppercase text-[var(--foreground)] jakarta">Latest News</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {news.length > 0 ? (
            news.map((item, idx) => (
              <motion.a
                key={idx}
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                className="glass-card p-6 group hover:border-emerald-500/30 transition-all bg-[var(--surface)] border-white/5"
              >
                <div className="flex flex-col h-full gap-4">
                  <div className="flex items-center justify-between">
                    <div className="px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
                      Market News
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{item.date}</span>
                  </div>
                  <h3 className="text-sm font-black text-[var(--foreground)] line-clamp-2 leading-relaxed group-hover:text-emerald-500 transition-colors jakarta">
                    {item.title}
                  </h3>
                  <div className="mt-auto pt-4 flex items-center justify-end">
                    <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-500 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </div>
                </div>
              </motion.a>
            ))
          ) : (
            [1, 2, 3].map((i) => (
              <div key={i} className="glass-card p-6 animate-pulse bg-black/20 border-white/5 h-32" />
            ))
          )}
        </div>
      </div>

      {/* FAB */}
      <motion.button 
        whileHover={{ scale: 1.1, rotate: 90 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => { setEditingAccount(null); setIsAddModalOpen(true); }}
        className="fixed bottom-10 right-10 w-20 h-20 bg-gradient-to-tr from-emerald-500 to-cyan-500 text-slate-900 dark:text-slate-950 rounded-[2rem] shadow-[0_10px_40px_-10px_rgba(0,255,159,0.5)] dark:shadow-[0_0_40px_rgba(0,255,159,0.5)] flex items-center justify-center z-50 group border-2 border-white/20"
      >
        <Plus className="w-10 h-10 group-hover:scale-125 transition-transform duration-500" />
      </motion.button>

      <AddAccountModal 
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false)
          setEditingAccount(null)
        }}
        initialData={editingAccount}
        onSave={(data) => {
          const bankName = data.dpName.includes('-') ? data.dpName.split('-')[1].trim() : data.dpName;
          const dpCode = data.dpName.includes('-') ? data.dpName.split('-')[0].trim() : '10000';
          const newBoid = '130' + dpCode + '00000'.slice(0, 8 - data.username.length) + data.username;
          
          const selectedBank = NEPAL_BANKS.find(b => `${b.dp_code} - ${b.name}` === data.dpName);

          const accountPayload = {
            name: data.fullName || (editingAccount ? editingAccount.name : 'NEW ACCOUNT'),
            username: data.username,
            bank: bankName,
            boid: newBoid,
            clientId: selectedBank?.id.toString(),
            password: data.password,
            crn: data.crnNumber,
            pin: data.transactionPin,
          };

          if (editingAccount) {
            updateAccount(editingAccount.id, accountPayload)
            toast.success('Account updated!')
          } else {
            addAccount({
              id: Date.now(),
              ...accountPayload,
              isDefault: accounts.length === 0,
            })
            toast.success('New account added!')
          }
        }}
      />

      <StockDetailModal 
        symbol={selectedSymbol}
        isOpen={isStockModalOpen}
        onClose={() => setIsStockModalOpen(false)}
      />
    </div>
  )
}
