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
  Check,
  Calendar
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
  const { livePrices, setLivePrices, searchQuery, setSearchQuery } = useAppStore()
  const [upcomingIpos, setUpcomingIpos] = useState<any[]>([])

  const fetchData = async () => {
    if (!hasHydrated) return
    setIsRefreshing(true)
    try {
      const [marketRes, newsRes, subRes, pricesRes, ipoRes] = await Promise.all([
        fetch('/api/market/summary'),
        fetch('/api/news/latest'),
        fetch('/api/market/sub-indices'),
        fetch('/api/market/live-prices'),
        fetch('/api/ipo/upcoming')
      ])
      
      const marketJson = await marketRes.json()
      const newsJson = await newsRes.json()
      const subJson = await subRes.json()
      const pricesJson = await pricesRes.json()
      const ipoJson = await ipoRes.json()
      
      if (marketJson.success) setMarketData(marketJson.data)
      if (newsJson.success) setNews(newsJson.data)
      if (subJson.success) setSubIndices(subJson.data)
      if (pricesJson.success) setLivePrices(pricesJson.data)
      if (ipoJson.success) setUpcomingIpos(ipoJson.data)
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

  const filteredAccounts = accounts.filter(acc => 
    acc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    acc.boid.toLowerCase().includes(searchQuery.toLowerCase()) ||
    acc.bank.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (!mounted || !hasHydrated) return null

  return (
    <div className="space-y-10 pb-20 px-4 md:px-0">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-[var(--foreground)] uppercase italic">Market Overview</h1>
          <p className="text-sm text-slate-500 font-medium">Real-time Nepalese Stock Market insights and your portfolio.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className={cn("px-4 py-2 rounded-xl border flex items-center gap-2 shadow-sm transition-all duration-300", 
            market.status === 'Open' 
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600' 
              : 'bg-rose-500/10 border-rose-500/20 text-rose-600'
          )}>
            <div className={cn("w-2 h-2 rounded-full", market.status === 'Open' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500')} />
            <span className="text-[10px] font-black uppercase tracking-widest">Market {market.status}</span>
          </div>
          <button 
            onClick={fetchData}
            className="p-2.5 bg-white dark:bg-slate-900 border border-[var(--border)] rounded-xl text-slate-500 hover:text-emerald-500 transition-all shadow-sm"
          >
            <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin")} />
          </button>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* NEPSE Main Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 glass-card p-8 md:p-10 bg-[var(--surface)]"
        >
          <div className="flex flex-col md:flex-row justify-between gap-10">
            <div className="flex-1 space-y-6">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2">Nepalese Stock Exchange</p>
                <div className="flex items-baseline gap-3">
                  <h2 className="text-5xl md:text-6xl font-black text-[var(--foreground)] tracking-tighter">
                    {marketData?.nepseIndex || '2,838.40'}
                  </h2>
                  <div className={cn(
                    "flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-bold",
                    marketData?.change?.includes('+') ? "text-emerald-500 bg-emerald-500/10" : "text-rose-500 bg-rose-500/10"
                  )}>
                    {marketData?.change || '+5.36'}
                  </div>
                </div>
                <p className="text-sm font-semibold text-slate-500 mt-2">
                   Last updated at {timeString} (NPT)
                </p>
              </div>

              <div className="grid grid-cols-2 gap-8 pt-6 border-t border-[var(--border)]">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Turnover</p>
                  <p className="text-xl font-black text-[var(--foreground)]">Rs. {marketData?.turnover || '5.77'}<span className="text-sm ml-1 text-slate-500 font-bold">Arba</span></p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Percent Change</p>
                  <p className={cn(
                    "text-xl font-black",
                    marketData?.change?.includes('+') ? "text-emerald-500" : "text-rose-500"
                  )}>
                    {marketData?.percentChange || '0.18'}%
                  </p>
                </div>
              </div>
            </div>

            <div className="flex-1 h-[200px] min-w-[200px] relative">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockNepseData}>
                  <defs>
                    <linearGradient id="nepseGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'var(--surface)', 
                      borderRadius: '12px', 
                      border: '1px border var(--border)',
                      boxShadow: 'var(--card-shadow)'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#10b981" 
                    strokeWidth={3}
                    fill="url(#nepseGradient)" 
                    animationDuration={2000}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>

        {/* Quick Stats / Sub-Indices */}
        <div className="grid grid-cols-1 gap-4">
          {(subIndices.length > 0 ? subIndices.slice(0, 4) : [
            { name: 'Banking', value: '1,459.49', percentChange: '-0.84' },
            { name: 'Hotels', value: '8,360.91', percentChange: '+1.01' },
            { name: 'Hydro', value: '4,085.03', percentChange: '-0.23' },
            { name: 'Insurance', value: '12,693.38', percentChange: '-0.62' },
          ]).map((sub, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-sm group hover:border-emerald-500/20 transition-all"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">{sub.name}</p>
                  <p className="text-base font-black text-[var(--foreground)] tracking-tight">{sub.value}</p>
                </div>
                <span className={cn(
                  "text-[10px] font-bold px-2 py-0.5 rounded-md",
                  sub.percentChange?.includes('+') ? "text-emerald-600 bg-emerald-500/10" : "text-rose-600 bg-rose-500/10"
                )}>
                  {sub.percentChange}%
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Account Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-1.5 h-6 bg-emerald-500 rounded-full" />
             <h2 className="text-2xl font-black tracking-tight text-[var(--foreground)] uppercase italic">Your Accounts</h2>
             <span className="text-xs font-bold bg-slate-100 dark:bg-slate-900 px-3 py-1 rounded-full border border-[var(--border)] text-slate-500">{accounts.length} Total</span>
          </div>
          <button 
            onClick={() => { setEditingAccount(null); setIsAddModalOpen(true); }}
            className="premium-btn premium-btn-primary"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add New Account</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAccounts.map((account, idx) => (
            <motion.div
              key={account.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              className="p-6 rounded-3xl bg-[var(--surface)] border border-[var(--border)] shadow-sm hover:shadow-md hover:border-emerald-500/20 transition-all group"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 rounded-xl bg-[var(--surface-alt)] flex items-center justify-center text-slate-400 group-hover:text-emerald-500 group-hover:bg-emerald-500/10 transition-all border border-[var(--border)]">
                  <UserCircle className="w-7 h-7" />
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => { setEditingAccount(account); setIsAddModalOpen(true); }}
                    className="p-2 text-slate-400 hover:text-emerald-500 transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => { deleteAccount(account.id); toast.success('Account removed'); }}
                    className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-black text-[var(--foreground)] tracking-tight group-hover:text-emerald-500 transition-colors">{account.name}</h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{account.bank}</p>
                </div>

                <div className="p-4 rounded-2xl bg-[var(--surface-alt)] border border-[var(--border)] flex justify-between items-center">
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">MeroShare ID</p>
                    <p className="text-base font-black text-[var(--foreground)] tracking-widest">{account.username}</p>
                  </div>
                  <button onClick={() => copyToClipboard(account.boid)} className="p-2 text-slate-400 hover:text-emerald-500 transition-colors">
                    <Copy className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center justify-between pt-2">
                   <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Status</span>
                   </div>
                   <Check className="w-4 h-4 text-emerald-500" />
                </div>
              </div>
            </motion.div>
          ))}
          {accounts.length === 0 && (
             <div 
               onClick={() => setIsAddModalOpen(true)}
               className="md:col-span-2 lg:col-span-3 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl p-12 flex flex-col items-center justify-center gap-4 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all cursor-pointer group"
             >
               <div className="p-4 bg-slate-100 dark:bg-slate-900 rounded-2xl group-hover:bg-emerald-500/20 group-hover:scale-110 transition-all">
                 <Plus className="w-8 h-8 text-slate-400 group-hover:text-emerald-500" />
               </div>
               <p className="text-sm font-bold text-slate-400 group-hover:text-emerald-500 transition-colors">Add your first Demat Account to get started</p>
             </div>
          )}
        </div>
      </div>

      {/* Market Prices */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
             <div className="w-1.5 h-6 bg-blue-500 rounded-full" />
             <h2 className="text-2xl font-black tracking-tight text-[var(--foreground)] uppercase italic">Live Prices</h2>
          </div>
          <Link href="/dashboard/live-prices" className="text-xs font-bold text-blue-500 hover:underline flex items-center gap-1">
            View Market Board <ChevronRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {(livePrices.length > 0 ? livePrices.slice(0, 12) : [1,2,3,4,5,6]).map((price: any, idx) => (
            <motion.div
              key={idx}
              className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--border)] group hover:border-blue-500/20 transition-all cursor-pointer"
              onClick={() => {
                if (price.symbol) {
                  setSelectedSymbol(price.symbol)
                  setIsStockModalOpen(true)
                }
              }}
            >
              {price.symbol ? (
                <>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-black text-blue-500 uppercase tracking-tight">{price.symbol}</span>
                    <span className={cn(
                      "text-[9px] font-bold px-1.5 py-0.5 rounded",
                      price.change?.includes('+') ? "text-emerald-600 bg-emerald-500/10" : "text-rose-600 bg-rose-500/10"
                    )}>
                      {price.percentChange}%
                    </span>
                  </div>
                  <p className="text-sm font-black text-[var(--foreground)]">Rs. {price.ltp}</p>
                </>
              ) : (
                <div className="h-10 animate-pulse bg-slate-100 dark:bg-slate-800 rounded-lg" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
      {/* Upcoming IPOs Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-4">
            <div className="w-2 h-8 bg-amber-500 rounded-full shadow-[0_0_15px_rgba(245,158,11,0.5)]" />
            <h2 className="text-3xl font-black tracking-tighter uppercase text-[var(--foreground)] jakarta">Upcoming Issues</h2>
          </div>
          <Link href="/dashboard/services/upcoming" className="group flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-xl hover:bg-amber-500/20 transition-all">
            <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">View All Issues</span>
            <ArrowUpRight className="w-4 h-4 text-amber-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {upcomingIpos.length > 0 ? (
            upcomingIpos.slice(0, 4).map((ipo, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="glass-card p-6 bg-[var(--surface)] border-[var(--border)] flex items-center justify-between group hover:border-amber-500/30 transition-all cursor-pointer"
                onClick={() => router.push('/dashboard/services/upcoming')}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 group-hover:scale-110 transition-transform">
                    <Calendar className="w-6 h-6 text-amber-500" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-[var(--foreground)] group-hover:text-amber-500 transition-colors">{ipo.companyName}</h3>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Rs. {ipo.price} • {ipo.units} Units</p>
                  </div>
                </div>
                <div className={cn(
                  "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border",
                  ipo.status === 'Open' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" : "bg-amber-500/10 border-amber-500/20 text-amber-500"
                )}>
                  {ipo.status}
                </div>
              </motion.div>
            ))
          ) : (
            [1, 2].map(i => (
              <div key={i} className="glass-card p-6 animate-pulse bg-black/20 border-white/5 h-20" />
            ))
          )}
        </div>
      </div>

      {/* News & Updates */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 px-2">
           <div className="w-1.5 h-6 bg-amber-500 rounded-full" />
           <h2 className="text-2xl font-black tracking-tight text-[var(--foreground)] uppercase italic">Latest Updates</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {news.length > 0 ? (
            news.slice(0, 6).map((item, idx) => (
              <motion.a
                key={idx}
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)] group hover:border-emerald-500/20 transition-all flex flex-col gap-4"
              >
                <div className="flex items-center justify-between">
                  <div className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 text-[9px] font-bold uppercase tracking-widest border border-[var(--border)]">
                    Market News
                  </div>
                  <span className="text-[10px] font-bold text-slate-400">{item.date}</span>
                </div>
                <h3 className="text-sm font-bold text-[var(--foreground)] line-clamp-2 leading-relaxed group-hover:text-emerald-500 transition-colors">
                  {item.title}
                </h3>
                <div className="mt-auto flex items-center justify-end">
                  <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-500 transition-all" />
                </div>
              </motion.a>
            ))
          ) : (
            [1, 2, 3].map((i) => (
              <div key={i} className="h-32 animate-pulse bg-slate-100 dark:bg-slate-900 border border-[var(--border)] rounded-2xl" />
            ))
          )}
        </div>
      </div>

      {/* FAB */}
      <motion.button 
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => { setEditingAccount(null); setIsAddModalOpen(true); }}
        className="fixed bottom-10 right-10 w-16 h-16 bg-emerald-500 text-slate-950 rounded-2xl shadow-2xl shadow-emerald-500/20 flex items-center justify-center z-50 group border border-white/20"
      >
        <Plus className="w-8 h-8 group-hover:rotate-90 transition-transform duration-300" />
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

