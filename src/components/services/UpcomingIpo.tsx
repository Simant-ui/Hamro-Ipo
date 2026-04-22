'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft, 
  Calendar, 
  Tag, 
  Layers, 
  Search,
  ChevronRight,
  TrendingUp,
  Clock,
  CheckCircle2
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { UPCOMING_IPOS, UpcomingIPO } from '@/constants/upcomingIpo'
import { toast } from 'react-hot-toast'
import { useEffect } from 'react'
import { useAppStore } from '@/store/useAppStore'

const types = ['All', 'IPO', 'Right', 'Mutual Fund', 'Debenture']

export function UpcomingIpo() {
  const router = useRouter()
  const [activeType, setActiveType] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [ipos, setIpos] = useState<UpcomingIPO[]>(UPCOMING_IPOS)
  const [loading, setLoading] = useState(true)
  const [reminders, setReminders] = useState<string[]>([])

  useEffect(() => {
    // Load reminders from localStorage
    const savedReminders = localStorage.getItem('ipo_reminders')
    if (savedReminders) setReminders(JSON.parse(savedReminders))

    // Fetch real data from ShareSansar API
    const fetchIpos = async () => {
      try {
        const res = await fetch('/api/ipo/upcoming')
        const json = await res.json()
        if (json.success && json.data.length > 0) {
          setIpos(json.data)
        }
      } catch (err) {
        console.error('Failed to fetch real-time IPOs:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchIpos()
  }, [])

  const { user } = useAppStore()

  const toggleReminder = async (ipo: UpcomingIPO) => {
    const idStr = ipo.id.toString()
    let newReminders: string[]
    
    if (reminders.includes(idStr)) {
      newReminders = reminders.filter(r => r !== idStr)
      setReminders(newReminders)
      localStorage.setItem('ipo_reminders', JSON.stringify(newReminders))
      toast.success('Reminder removed')
      return
    }

    // Setting a new reminder
    if (!user?.email) {
      toast.error('Please login to set email reminders')
      return
    }

    try {
      const res = await fetch('/api/ipo/reminder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          ipo_id: idStr,
          company_name: ipo.companyName,
          symbol: ipo.symbol,
          opening_date: ipo.openingDate,
          price: ipo.price
        })
      })
      
      const data = await res.json()
      if (data.success) {
        newReminders = [...reminders, idStr]
        setReminders(newReminders)
        localStorage.setItem('ipo_reminders', JSON.stringify(newReminders))
        toast.success('Email reminder set successfully!')
      } else {
        toast.error(data.message || 'Failed to set reminder')
      }
    } catch (err) {
      toast.error('Network error. Try again.')
    }
  }

  const filteredIpos = ipos.filter(ipo => {
    const matchesType = activeType === 'All' || ipo.type === activeType
    const matchesSearch = ipo.companyName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         ipo.symbol.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesType && matchesSearch
  })

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-20">
      {/* Header */}
      <div className="flex items-center gap-4 mb-4">
        <button onClick={() => router.back()} className="p-2 hover:bg-[var(--surface)] rounded-xl transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-xl font-black tracking-tight">Upcoming Issues</h1>
          <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest">IPO, Right Shares & More</p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="space-y-4">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-emerald-500 transition-colors" />
          <input 
            type="text"
            placeholder="Search company or symbol..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[var(--surface)] border border-white/5 rounded-2xl py-4 pl-12 pr-4 font-black text-sm outline-none focus:border-emerald-500/50 transition-all placeholder:text-slate-600"
          />
        </div>

        <div className="flex overflow-x-auto gap-3 no-scrollbar pb-2">
          {types.map((type) => (
            <button
              key={type}
              onClick={() => setActiveType(type)}
              className={`whitespace-nowrap px-6 py-2.5 rounded-xl text-xs font-black transition-all border ${
                activeType === type 
                ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                : 'bg-[var(--surface)] border-white/5 text-slate-500 hover:border-white/10'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {filteredIpos.map((ipo, index) => (
            <motion.div
              key={ipo.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: index * 0.05 }}
              className="group p-5 rounded-3xl bg-[var(--surface)] border border-white/5 hover:border-emerald-500/30 transition-all cursor-pointer relative overflow-hidden"
            >
              {/* Status Decoration */}
              <div className={`absolute top-0 right-0 w-24 h-24 -mr-12 -mt-12 opacity-10 blur-2xl rounded-full ${
                ipo.status === 'Open' ? 'bg-emerald-500' : 'bg-amber-500'
              }`} />

              <div className="flex justify-between items-start relative">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-black/20 border border-white/5 flex items-center justify-center font-black text-lg text-emerald-500">
                      {ipo.symbol[0]}
                    </div>
                    <div>
                      <h3 className="font-black text-slate-200 group-hover:text-emerald-500 transition-colors line-clamp-1">{ipo.companyName}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{ipo.symbol}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-700" />
                        <span className="text-[10px] font-black text-emerald-500/70 uppercase tracking-widest">{ipo.sector}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="flex items-center gap-2">
                      <Layers className="w-3.5 h-3.5 text-slate-500" />
                      <div>
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-tighter">Units</p>
                        <p className="text-xs font-black text-slate-300">{ipo.units}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-3.5 h-3.5 text-slate-500" />
                      <div>
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-tighter">Price</p>
                        <p className="text-xs font-black text-slate-300">Rs. {ipo.price}</p>
                      </div>
                    </div>
                  </div>
                </div>

                  <div className="flex flex-col items-end gap-3 min-w-[120px]">
                  <div className={`px-3 py-1.5 rounded-lg flex items-center gap-2 border w-full justify-center ${
                    ipo.status === 'Open' 
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' 
                    : ipo.status === 'Closed'
                    ? 'bg-red-500/10 border-red-500/20 text-red-500'
                    : 'bg-amber-500/10 border-amber-500/20 text-amber-500'
                  }`}>
                    {ipo.status === 'Open' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                    <span className="text-[10px] font-black uppercase tracking-widest">{ipo.status}</span>
                  </div>

                  {(ipo.status === 'Upcoming' || ipo.status === 'Open') && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleReminder(ipo)
                      }}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[10px] font-black uppercase tracking-widest transition-all w-full justify-center ${
                        reminders.includes(ipo.id.toString())
                        ? 'bg-emerald-500 border-emerald-500 text-white'
                        : 'bg-black/20 border-white/5 text-slate-400 hover:border-emerald-500/50 hover:text-emerald-500'
                      }`}
                    >
                      <Calendar className="w-3 h-3" />
                      {reminders.includes(ipo.id.toString()) ? 'Reminder Set' : 'Set Reminder'}
                    </button>
                  )}

                  <div className="space-y-2 w-full">
                    {ipo.openingDate && (
                      <div className="flex flex-col items-end">
                        <p className="text-[8px] font-black text-slate-500 uppercase tracking-tighter">Open Date</p>
                        <div className="flex items-center gap-1.5 text-slate-300">
                          <Clock className="w-2.5 h-2.5 text-emerald-500" />
                          <span className="text-[10px] font-black tabular-nums">{ipo.openingDate}</span>
                        </div>
                      </div>
                    )}
                    {ipo.closingDate && (
                      <div className="flex flex-col items-end">
                        <p className="text-[8px] font-black text-slate-500 uppercase tracking-tighter">End Date</p>
                        <div className="flex items-center gap-1.5 text-slate-300">
                          <Clock className="w-2.5 h-2.5 text-red-500" />
                          <span className="text-[10px] font-black tabular-nums">{ipo.closingDate}</span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <ChevronRight className="w-5 h-5 text-slate-700 group-hover:text-emerald-500 transition-all group-hover:translate-x-1" />
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredIpos.length === 0 && (
          <div className="py-20 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-[var(--surface)] border border-white/5 flex items-center justify-center mx-auto opacity-50">
              <Search className="w-8 h-8 text-slate-500" />
            </div>
            <p className="text-slate-500 font-black text-sm">No upcoming issues found.</p>
          </div>
        )}
      </div>
    </div>
  )
}
