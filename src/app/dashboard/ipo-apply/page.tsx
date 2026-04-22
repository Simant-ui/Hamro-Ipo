'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Activity, 
  ArrowRight, 
  Building2, 
  Clock, 
  Info,
  ChevronRight,
  TrendingUp,
  Tag
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { IPOListing } from '@/types'
import { formatCurrency, getDaysRemaining, formatDate } from '@/lib/utils'
import Link from 'next/link'
import { useAppStore } from '@/store/useAppStore'
import { toast } from 'react-hot-toast'

const REAL_IPOS: IPOListing[] = [
  {
    id: 'sopan-1',
    company_name: 'Sopan Pharmaceuticals Limited',
    symbol: 'SOPAN',
    type: 'IPO',
    status: 'open',
    open_date: '2026-04-16',
    close_date: '2026-04-21',
    issue_price: 100,
    total_units: 3474900,
    min_units: 10,
    max_units: 1000,
    lot_size: 10,
    sector: 'Pharmaceutical',
    description: 'Sopan Pharmaceuticals is issuing shares to the general public.'
  },
  {
    id: 'mepdl-1',
    company_name: 'Mount Everest Power Development Ltd',
    symbol: 'MEPDL',
    type: 'IPO',
    status: 'upcoming',
    open_date: '2026-05-05',
    close_date: '2026-05-10',
    issue_price: 100,
    total_units: 2580000,
    min_units: 10,
    max_units: 500,
    lot_size: 10,
    sector: 'Energy',
    description: 'Upcoming hydropower project approved by SEBON.'
  },
  {
    id: 'spil-1',
    company_name: 'Sarvottam Paints Industries Ltd',
    symbol: 'SPIL',
    type: 'IPO',
    status: 'upcoming',
    open_date: '2026-05-12',
    close_date: '2026-05-17',
    issue_price: 100,
    total_units: 850000,
    min_units: 10,
    max_units: 200,
    lot_size: 10,
    sector: 'Manufacturing',
    description: 'Premium paints manufacturer.'
  },
  {
    id: 'ecl-1',
    company_name: 'Everest Colour Limited',
    symbol: 'ECL',
    type: 'IPO',
    status: 'upcoming',
    open_date: '2026-05-20',
    close_date: '2026-05-25',
    issue_price: 100,
    total_units: 790000,
    min_units: 10,
    max_units: 300,
    lot_size: 10,
    sector: 'Manufacturing',
    description: 'Color and pigment manufacturer.'
  },
  {
    id: 'norvic-1',
    company_name: 'Norvic International Hospital',
    symbol: 'NIHMCL',
    type: 'IPO',
    status: 'upcoming',
    open_date: '2026-06-01',
    close_date: '2026-06-05',
    issue_price: 100,
    total_units: 1500000,
    min_units: 10,
    max_units: 1000,
    lot_size: 10,
    sector: 'Healthcare',
    description: 'Book building process initiated.'
  },
  {
    id: 'jsml-1',
    company_name: 'Jagdamba Spinning Mills Ltd',
    symbol: 'JSML',
    type: 'IPO',
    status: 'upcoming',
    open_date: '2026-06-10',
    close_date: '2026-06-15',
    issue_price: 100,
    total_units: 1200000,
    min_units: 10,
    max_units: 500,
    lot_size: 10,
    sector: 'Manufacturing',
    description: 'Spinning mills sector.'
  },
  {
    id: 'hdl-closed',
    company_name: 'Himalayan Distillery Ltd',
    symbol: 'HDL',
    type: 'IPO',
    status: 'closed',
    open_date: '2026-03-01',
    close_date: '2026-03-05',
    issue_price: 100,
    total_units: 500000,
    min_units: 10,
    max_units: 1000,
    lot_size: 10,
    sector: 'Manufacturing',
    description: 'Issue concluded.'
  }
]

export default function IPOApplyPage() {
  const [ipos, setIpos] = useState<IPOListing[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const { addNotification } = useAppStore()

  useEffect(() => {
    const fetchIPOs = async () => {
      const { data, error } = await supabase
        .from('ipo_listings')
        .select('*')
        .order('open_date', { ascending: false })

      if (error) {
        console.error('Error fetching IPOs:', error)
        setIpos(REAL_IPOS)
      } else {
        // Merge DB data with real-time fallbacks, excluding old data
        const dbData = (data || []).filter((d: any) => !['NLIC', 'HBL', 'PRABHU'].includes(d.symbol))
        const combined = [...dbData]
        
        REAL_IPOS.forEach(real => {
          if (!combined.find(d => d.symbol === real.symbol)) {
            combined.push(real)
          }
        })
        
        setIpos(combined)
      }
      setLoading(false)
    }

    fetchIPOs()
  }, [])

  const handleSetReminder = (ipo: IPOListing) => {
    const notification = {
      id: Math.random().toString(36).substr(2, 9),
      title: `Reminder Set: ${ipo.company_name}`,
      message: `We will notify you when ${ipo.company_name} (${ipo.symbol}) opens for subscription on ${formatDate(ipo.open_date)}.`,
      type: 'info' as const,
      is_read: false,
      created_at: new Date().toISOString()
    }
    
    addNotification(notification)
    toast.success(`Reminder set for ${ipo.symbol}! Check your notifications.`)
  }

  const openIpos = ipos.filter(ipo => ipo.status === 'open')
  const upcomingIpos = ipos.filter(ipo => ipo.status === 'upcoming')
  const closedIpos = ipos.filter(ipo => ipo.status === 'closed')

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold">IPO Application Center</h1>
        <p className="text-slate-400 mt-1">Apply for current IPOs, FPOs, and Right shares in bulk</p>
      </div>

      {/* Active IPOs */}
      <section className="space-y-6">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <h2 className="text-xl font-bold">Currently Open</h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="glass-card h-64 animate-pulse" />
            ))}
          </div>
        ) : openIpos.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <Info className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">No IPOs are currently open for application.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {openIpos.map((ipo) => (
              <motion.div
                key={ipo.id}
                whileHover={{ y: -5 }}
                className="glass-card overflow-hidden group border border-slate-800 hover:border-blue-500/50 transition-all duration-300"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-14 h-14 bg-slate-800 rounded-2xl flex items-center justify-center font-bold text-lg border border-slate-700 group-hover:bg-blue-600/10 group-hover:border-blue-500/20 transition-colors">
                      {ipo.symbol}
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold px-2 py-1 bg-emerald-500/10 text-emerald-500 rounded-lg border border-emerald-500/20">
                        {ipo.type}
                      </span>
                      <p className="text-xs text-slate-500 mt-2 flex items-center justify-end gap-1">
                        <Clock className="w-3 h-3" />
                        {getDaysRemaining(ipo.close_date)} days left
                      </p>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold line-clamp-1 mb-1">{ipo.company_name}</h3>
                  <p className="text-sm text-slate-400 mb-6">{ipo.sector}</p>

                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800">
                      <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Price per Share</p>
                      <p className="text-sm font-bold text-slate-200">{formatCurrency(ipo.issue_price)}</p>
                    </div>
                    <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800">
                      <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Min Units</p>
                      <p className="text-sm font-bold text-slate-200">{ipo.min_units} Units</p>
                    </div>
                  </div>

                  <Link 
                    href={`/dashboard/ipo-apply/${ipo.id}`}
                    className="premium-btn premium-btn-primary w-full group"
                  >
                    Apply Now
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Upcoming IPOs */}
      <section className="space-y-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Clock className="w-5 h-5 text-amber-500" />
          Upcoming Issues
        </h2>

        <div className="glass-card overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/50 border-b border-slate-800">
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Company Name</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Symbol</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Type</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Price</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Open Date</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Close Date</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Status</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {upcomingIpos.map((ipo) => (
                <tr key={ipo.id} className="hover:bg-slate-800/30 transition-colors group">
                  <td className="p-4 font-bold text-sm text-slate-200">{ipo.company_name}</td>
                  <td className="p-4 text-xs font-mono text-slate-400">
                    <span className="bg-slate-800/50 px-2 py-1 rounded border border-slate-700/50">{ipo.symbol}</span>
                  </td>
                  <td className="p-4">
                    <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded-md">
                      {ipo.type}
                    </span>
                  </td>
                  <td className="p-4 text-sm font-black text-white">{formatCurrency(ipo.issue_price)}</td>
                  <td className="p-4 text-sm text-emerald-500 font-bold">{formatDate(ipo.open_date)}</td>
                  <td className="p-4 text-sm text-slate-400">{formatDate(ipo.close_date)}</td>
                  <td className="p-4 text-center">
                    <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter ${
                      ipo.status === 'open' 
                        ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
                        : ipo.status === 'upcoming'
                        ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                        : 'bg-slate-500/10 text-slate-500 border border-slate-500/20'
                    }`}>
                      {ipo.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => handleSetReminder(ipo)}
                      className="text-blue-500 hover:text-blue-400 text-xs font-black flex items-center gap-1 ml-auto"
                    >
                      Set Reminder
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {upcomingIpos.length === 0 && !loading && (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-slate-500 text-sm italic">No upcoming IPOs listed.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
