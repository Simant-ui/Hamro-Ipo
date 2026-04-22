'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  BarChart3, 
  Info,
  Calendar,
  Layers,
  Globe,
  Loader2,
  ExternalLink,
  RefreshCw
} from 'lucide-react'
import { CompanyDetails, PriceHistory } from '@/lib/services/stockDetails'
import { cn } from '@/lib/utils'
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts'

interface StockDetailModalProps {
  symbol: string | null
  isOpen: boolean
  onClose: () => void
}

export function StockDetailModal({ symbol, isOpen, onClose }: StockDetailModalProps) {
  const [data, setData] = useState<{ details: CompanyDetails; history: PriceHistory[] } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && symbol) {
      const fetchData = async () => {
        setLoading(true)
        setError(null)
        try {
          const res = await fetch(`/api/market/stock-details?symbol=${symbol}`)
          const json = await res.json()
          if (json.success) {
            setData(json.data)
          } else {
            setError(json.message || 'Failed to load details')
          }
        } catch (err) {
          setError('Failed to connect to server')
        } finally {
          setLoading(false)
        }
      }
      fetchData()
    } else {
      setData(null)
    }
  }, [isOpen, symbol])

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 md:left-64 z-[100] flex items-start justify-center p-4 md:p-8 pt-12 md:pt-24 overflow-y-auto no-scrollbar">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-md"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-6xl max-h-[90vh] overflow-hidden bg-slate-950 border border-white/10 rounded-[3rem] shadow-[0_0_100px_rgba(0,0,0,0.8)] flex flex-col"
        >
          {/* Header */}
          <div className="p-8 md:p-10 border-b border-white/5 flex items-start justify-between bg-white/[0.02] backdrop-blur-md">
            <div className="flex items-start gap-6">
              <div className="w-16 h-16 rounded-[1.5rem] bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20 shadow-inner group-hover:scale-110 transition-transform duration-500">
                <Activity className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-3xl font-black text-white tracking-tighter leading-tight max-w-xl">
                    {loading ? 'Loading Profile...' : data?.details.name || symbol || 'Stock Details'}
                  </h2>
                  <AnimatePresence>
                    {data?.details.sector && (
                      <motion.span 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] shadow-sm"
                      >
                        {data.details.sector}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
                <div className="flex items-center gap-2 text-slate-500 font-bold uppercase tracking-[0.1em] text-xs">
                  <span className="text-emerald-500/80">{symbol}</span>
                  <span className="w-1 h-1 rounded-full bg-slate-800" />
                  <span>Real-time Market Insights</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => {
                  const fetchData = async () => {
                    setLoading(true)
                    setError(null)
                    try {
                      const res = await fetch(`/api/market/stock-details?symbol=${symbol}`)
                      const json = await res.json()
                      if (json.success) setData(json.data)
                      else setError(json.message)
                    } catch (err) { setError('Failed to refresh') }
                    finally { setLoading(false) }
                  }
                  fetchData()
                }}
                className={cn("p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-[1.25rem] hover:bg-emerald-500/20 transition-all text-emerald-500 shadow-lg", loading && "animate-spin")}
              >
                <RefreshCw className="w-6 h-6" />
              </button>
              <button 
                onClick={onClose}
                className="p-4 bg-white/5 border border-white/10 rounded-[1.25rem] hover:bg-white/10 transition-all text-slate-400 hover:text-white hover:rotate-90 duration-300 shadow-lg"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 no-scrollbar">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
                <p className="text-xs font-black text-slate-500 uppercase tracking-widest animate-pulse">Loading Details...</p>
              </div>
            ) : error ? (
              <div className="text-center py-20">
                <p className="text-rose-500 font-bold">{error}</p>
                <button onClick={onClose} className="mt-4 px-6 py-2 bg-white/5 rounded-xl text-xs font-black uppercase tracking-widest">Close</button>
              </div>
            ) : data ? (
              <>
                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                  
                  {/* Left Section: Price & Metrics (5 cols) */}
                  <div className="lg:col-span-5 space-y-8 flex flex-col">
                    {/* Primary Price Card */}
                    <div className="relative p-10 bg-gradient-to-br from-emerald-600/[0.1] to-cyan-600/[0.1] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl flex-shrink-0">
                      <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 blur-[60px] -mr-20 -mt-20" />
                      <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.4em] mb-4 block">Market Price</span>
                      <div className="flex items-baseline gap-4">
                        <span className="text-3xl font-black text-emerald-500/40">Rs.</span>
                        <h3 className="text-7xl font-black text-white tracking-tighter tabular-nums">{data.details.ltp}</h3>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-8 mt-10 pt-8 border-t border-white/5">
                         <div>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">52W High</p>
                            <p className="text-xl font-black text-white">{data.details.highLow52.split('/')[0] || '-'}</p>
                         </div>
                         <div>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">52W Low</p>
                            <p className="text-xl font-black text-white">{data.details.highLow52.split('/')[1] || '-'}</p>
                         </div>
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4 flex-shrink-0">
                      <CompactStat label="EPS" value={data.details.eps} icon={<Activity className="w-4 h-4" />} color="emerald" />
                      <CompactStat label="P/E Ratio" value={data.details.peRatio} icon={<TrendingUp className="w-4 h-4" />} color="blue" />
                      <CompactStat label="Book Value" value={data.details.bookValue} icon={<Layers className="w-4 h-4" />} color="purple" />
                      <CompactStat label="P/B Ratio" value={data.details.pbRatio} icon={<BarChart3 className="w-4 h-4" />} color="amber" />
                    </div>

                    {/* Detailed Profile */}
                    <div className="glass-card p-8 bg-white/[0.03] border-white/5 rounded-[2rem] flex-1">
                      <div className="flex items-center gap-3 mb-6">
                        <Info className="w-4 h-4 text-slate-500" />
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Company Fundamentals</h3>
                      </div>
                      <div className="space-y-4">
                        <InfoItem label="Shares Out." value={data.details.sharesOutstanding} />
                        <InfoItem label="Market Cap" value={data.details.marketCap} />
                        <InfoItem label="Dividend" value={data.details.dividend} />
                        <InfoItem label="Bonus" value={data.details.bonus} />
                        <InfoItem label="Right Share" value={data.details.rightShare} />
                      </div>
                    </div>
                  </div>

                  {/* Right Section: Chart & History (7 cols) */}
                  <div className="lg:col-span-7 space-y-6 flex flex-col h-full">
                    
                    {/* Price Chart */}
                    <div className="glass-card p-8 bg-white/[0.03] border-white/5 rounded-[2.5rem] flex-shrink-0 h-[350px]">
                      <div className="flex items-center justify-between mb-8">
                        <div>
                          <h3 className="text-sm font-black text-white uppercase tracking-widest">Performance</h3>
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Price Trend (Last 10 Trading Days)</p>
                        </div>
                        <div className="flex items-center gap-4">
                           <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-emerald-500" />
                              <span className="text-[9px] font-black text-slate-400 uppercase">LTP</span>
                           </div>
                        </div>
                      </div>
                      
                      <div className="h-[220px] w-full">
                        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                          <AreaChart data={[...data.history].reverse()}>
                            <defs>
                              <linearGradient id="colorLtp" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                            <XAxis 
                              dataKey="date" 
                              hide 
                            />
                            <YAxis 
                              hide 
                              domain={['auto', 'auto']}
                            />
                            <Tooltip 
                              content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                  return (
                                    <div className="bg-slate-900 border border-white/10 p-3 rounded-xl shadow-2xl backdrop-blur-md">
                                      <p className="text-[10px] font-black text-slate-500 uppercase mb-1">{payload[0].payload.date}</p>
                                      <p className="text-sm font-black text-white">Rs. {payload[0].value}</p>
                                    </div>
                                  );
                                }
                                return null;
                              }}
                            />
                            <Area 
                              type="monotone" 
                              dataKey="ltp" 
                              stroke="#10b981" 
                              strokeWidth={3}
                              fillOpacity={1} 
                              fill="url(#colorLtp)" 
                              animationDuration={2000}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* History Table */}
                    <div className="glass-card flex-1 flex flex-col bg-white/[0.03] border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
                      <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                        <div className="flex items-center gap-4">
                          <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                            <Calendar className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="text-sm font-black text-white uppercase tracking-widest">Transaction History</h3>
                          </div>
                        </div>
                        <a 
                          href={`https://merolagani.com/CompanyDetail.aspx?symbol=${symbol}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/5 group"
                        >
                          <span className="text-[10px] font-black text-slate-400 group-hover:text-white uppercase tracking-widest">Details</span>
                          <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-500" />
                        </a>
                      </div>

                      <div className="flex-1 overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-white/[0.01]">
                              <th className="pl-10 pr-6 py-6 text-[10px] font-black uppercase tracking-widest text-slate-500 border-b border-white/5">Date</th>
                              <th className="px-6 py-6 text-[10px] font-black uppercase tracking-widest text-slate-500 border-b border-white/5">LTP (Rs.)</th>
                              <th className="px-6 py-6 text-[10px] font-black uppercase tracking-widest text-slate-500 border-b border-white/5">Change</th>
                              <th className="pl-6 pr-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-500 border-b border-white/5 text-right">Volume</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {data.history.map((day, idx) => (
                              <tr key={day.date} className="group hover:bg-emerald-500/[0.02] transition-colors">
                                <td className="pl-10 pr-6 py-5">
                                  <div className="flex items-center gap-3">
                                    <div className="w-1 h-1 rounded-full bg-emerald-500/30 group-hover:bg-emerald-500 transition-all" />
                                    <span className="text-xs font-bold text-slate-400 group-hover:text-slate-200 transition-colors">{day.date}</span>
                                  </div>
                                </td>
                                <td className="px-6 py-5 text-sm font-black text-white tabular-nums">{day.ltp.toFixed(2)}</td>
                                <td className="px-6 py-5">
                                  <div className={cn(
                                    "inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black border",
                                    day.change >= 0 ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                                  )}>
                                    {day.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                    {day.change >= 0 ? '+' : ''}{day.change.toFixed(2)}
                                  </div>
                                </td>
                                <td className="pl-6 pr-10 py-5 text-right text-xs font-black text-slate-500 tabular-nums">
                                  {day.volume.toLocaleString()}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : null}
          </div>

          {/* Footer */}
          <div className="p-6 bg-white/5 border-t border-white/5 flex items-center justify-between">
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em]">
              Real-time data powered by NEPSE Alpha & Merolagani
            </p>
            <button 
              onClick={onClose}
              className="px-8 py-3 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all shadow-lg"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

function CompactStat({ label, value, icon, color }: { label: string, value: string, icon: any, color: string }) {
  const colors: any = {
    emerald: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    blue: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    purple: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
    amber: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
  }

  return (
    <div className="p-4 bg-white/[0.03] border border-white/5 rounded-2xl group hover:border-white/10 transition-all">
      <div className="flex items-center gap-3 mb-2">
        <div className={cn("p-1.5 rounded-lg border", colors[color])}>
          {icon}
        </div>
        <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">{label}</span>
      </div>
      <p className="text-sm font-black text-white">{value.length > 20 ? '-' : value}</p>
    </div>
  )
}

function StatCard({ label, value, icon, color }: { label: string, value: string, icon: any, color: string }) {
  const colors: any = {
    emerald: 'bg-emerald-500/5 border-emerald-500/20 text-emerald-500',
    blue: 'bg-blue-500/5 border-blue-500/20 text-blue-500',
    purple: 'bg-purple-500/5 border-purple-500/20 text-purple-500',
    amber: 'bg-amber-500/5 border-amber-500/20 text-amber-500',
  }

  return (
    <div className={cn("glass-card p-5 border transition-all hover:scale-[1.02] flex flex-col gap-3 bg-white/5 border-white/10", colors[color])}>
      <div className="flex items-center gap-2 opacity-70">
        {icon}
        <span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
      </div>
      <p className="text-xl font-black text-white">{value.length > 20 ? '-' : value}</p>
    </div>
  )
}

function InfoItem({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex justify-between items-center py-3 border-b border-white/5 last:border-0">
      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em]">{label}</span>
      <span className="text-xs font-black text-slate-200">{value}</span>
    </div>
  )
}
