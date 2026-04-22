'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  BarChart3, 
  Info,
  Calendar,
  Layers,
  Globe
} from 'lucide-react'
import { CompanyDetails, PriceHistory } from '@/lib/services/stockDetails'

export default function StockDetailPage() {
  const params = useParams()
  const router = useRouter()
  const symbol = params.symbol as string
  const [data, setData] = useState<{ details: CompanyDetails; history: PriceHistory[] } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/market/stock-details?symbol=${symbol}`)
        const json = await res.json()
        if (json.success) {
          setData(json.data)
        }
      } catch (err) {
        console.error('Failed to fetch stock details')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [symbol])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl font-black text-white">Company not found</h1>
        <button onClick={() => router.back()} className="mt-4 text-emerald-500 font-bold uppercase tracking-widest text-xs">Go Back</button>
      </div>
    )
  }

  const { details, history } = data

  return (
    <div className="space-y-6 pb-20 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="p-3 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-all group"
          >
            <ArrowLeft className="w-6 h-6 text-slate-400 group-hover:text-white group-hover:-translate-x-1 transition-all" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-black tracking-tight text-white">{details.symbol}</h1>
              <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                {details.sector}
              </span>
            </div>
            <h2 className="text-xl font-black text-slate-200 mt-1">{details.name}</h2>
          </div>
        </div>
        
        <div className="bg-emerald-500/5 border border-emerald-500/10 p-4 rounded-3xl flex flex-col items-end">
          <span className="text-[10px] font-black text-emerald-500/70 uppercase tracking-widest">Current LTP</span>
          <p className="text-3xl font-black text-white tabular-nums">Rs. {details.ltp}</p>
        </div>
      </div>

      {/* Fundamentals Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="EPS (Annual)" value={details.eps} icon={<Activity className="w-4 h-4" />} color="emerald" />
        <StatCard label="P/E Ratio" value={details.peRatio} icon={<TrendingUp className="w-4 h-4" />} color="blue" />
        <StatCard label="Book Value" value={details.bookValue} icon={<Layers className="w-4 h-4" />} color="purple" />
        <StatCard label="P/B Ratio" value={details.pbRatio} icon={<BarChart3 className="w-4 h-4" />} color="amber" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Market Info */}
        <div className="md:col-span-1 space-y-6">
          <div className="glass-card p-6 space-y-4">
            <div className="flex items-center gap-2 text-slate-400">
              <Info className="w-4 h-4" />
              <h2 className="text-[10px] font-black uppercase tracking-widest">Market Profile</h2>
            </div>
            
            <div className="space-y-3">
              <InfoItem label="Day Range" value={details.dayRange} />
              <InfoItem label="52 Week High/Low" value={details.highLow52} />
              <InfoItem label="Shares Outstanding" value={details.sharesOutstanding} />
              <InfoItem label="Market Cap" value={details.marketCap} />
              <InfoItem label="Dividend" value={details.dividend} />
              <InfoItem label="Bonus" value={details.bonus} />
              <InfoItem label="Right Share" value={details.rightShare} />
            </div>
          </div>
        </div>

        {/* Price History */}
        <div className="md:col-span-2">
          <div className="glass-card p-6 space-y-6 h-full">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-400">
                <Calendar className="w-4 h-4" />
                <h2 className="text-[10px] font-black uppercase tracking-widest">Recent Price History</h2>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="py-3 text-[10px] font-black uppercase tracking-widest text-slate-500">Date</th>
                    <th className="py-3 text-[10px] font-black uppercase tracking-widest text-slate-500">LTP</th>
                    <th className="py-3 text-[10px] font-black uppercase tracking-widest text-slate-500">Change</th>
                    <th className="py-3 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Volume</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((day) => (
                    <tr key={day.date} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                      <td className="py-4 text-xs font-bold text-slate-400">{day.date}</td>
                      <td className="py-4 text-xs font-black text-white">{day.ltp.toFixed(2)}</td>
                      <td className="py-4">
                        <span className={`text-[10px] font-black ${day.change >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                          {day.change >= 0 ? '+' : ''}{day.change.toFixed(2)}
                        </span>
                      </td>
                      <td className="py-4 text-right text-[10px] font-bold text-slate-500">{day.volume.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
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
    <div className={`glass-card p-6 border transition-all hover:scale-[1.02] ${colors[color]}`}>
      <div className="flex items-center gap-3 mb-3">
        {icon}
        <span className="text-[10px] font-black uppercase tracking-widest opacity-70">{label}</span>
      </div>
      <p className="text-2xl font-black text-white">{value}</p>
    </div>
  )
}

function InfoItem({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tighter">{label}</span>
      <span className="text-xs font-black text-slate-200">{value}</span>
    </div>
  )
}
