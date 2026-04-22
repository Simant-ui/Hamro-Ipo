'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Plus, 
  Edit3, 
  Trash2, 
  LayoutDashboard, 
  Users, 
  FileText, 
  BarChart3,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
  Calendar
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { IPOListing } from '@/types'
import { toast } from 'react-hot-toast'
import { formatCurrency, formatDate } from '@/lib/utils'

export default function AdminDashboardPage() {
  const [ipos, setIpos] = useState<IPOListing[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const supabase = createClient()

  const [formData, setFormData] = useState<Partial<IPOListing>>({
    company_name: '',
    symbol: '',
    type: 'IPO',
    status: 'upcoming',
    open_date: '',
    close_date: '',
    issue_price: 100,
    total_units: 1000000,
    min_units: 10,
    max_units: 1000,
    lot_size: 10,
    sector: 'Banking'
  })

  const fetchIpos = async () => {
    const { data, error } = await supabase
      .from('ipo_listings')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      toast.error('Failed to fetch IPOs')
    } else {
      setIpos(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchIpos()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    const { error } = await supabase
      .from('ipo_listings')
      .insert(formData)

    if (error) {
      toast.error(error.message)
    } else {
      toast.success('IPO listing created')
      setIsModalOpen(false)
      fetchIpos()
    }
    setSubmitting(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return
    const { error } = await supabase.from('ipo_listings').delete().eq('id', id)
    if (error) toast.error('Delete failed')
    else {
      toast.success('Deleted')
      fetchIpos()
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          <p className="text-slate-400 mt-1">Manage IPO listings and platform analytics</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="premium-btn premium-btn-primary"
        >
          <Plus className="w-5 h-5" />
          Create New Listing
        </button>
      </div>

      {/* Analytics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-card p-6 border-l-4 border-blue-500">
          <p className="text-xs text-slate-500 uppercase font-bold mb-1">Total IPOs</p>
          <h3 className="text-2xl font-black">{ipos.length}</h3>
        </div>
        <div className="glass-card p-6 border-l-4 border-emerald-500">
          <p className="text-xs text-slate-500 uppercase font-bold mb-1">Open Now</p>
          <h3 className="text-2xl font-black text-emerald-500">
            {ipos.filter(i => i.status === 'open').length}
          </h3>
        </div>
        <div className="glass-card p-6 border-l-4 border-amber-500">
          <p className="text-xs text-slate-500 uppercase font-bold mb-1">Upcoming</p>
          <h3 className="text-2xl font-black text-amber-500">
            {ipos.filter(i => i.status === 'upcoming').length}
          </h3>
        </div>
        <div className="glass-card p-6 border-l-4 border-purple-500">
          <p className="text-xs text-slate-500 uppercase font-bold mb-1">Results Pending</p>
          <h3 className="text-2xl font-black text-purple-500">
            {ipos.filter(i => i.status === 'closed').length}
          </h3>
        </div>
      </div>

      {/* Listings Table */}
      <div className="glass-card overflow-hidden">
        <div className="p-6 border-b border-slate-800 bg-slate-900/30">
          <h3 className="text-lg font-bold">All Listings</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-900/50 border-b border-slate-800">
                <th className="p-4 text-xs font-bold text-slate-500 uppercase">Company / Symbol</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase">Type</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase">Status</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase">Price</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {ipos.map((ipo) => (
                <tr key={ipo.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="p-4">
                    <div className="font-bold">{ipo.company_name}</div>
                    <div className="text-xs text-slate-500">{ipo.symbol} • {ipo.sector}</div>
                  </td>
                  <td className="p-4"><span className="text-xs font-bold px-2 py-1 bg-blue-500/10 text-blue-500 rounded">{ipo.type}</span></td>
                  <td className="p-4">
                    <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-full border ${
                      ipo.status === 'open' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                      ipo.status === 'upcoming' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                      'bg-slate-800 text-slate-500 border-slate-700'
                    }`}>
                      {ipo.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-4 text-sm font-bold">{formatCurrency(ipo.issue_price)}</td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2">
                      <button className="p-2 text-slate-500 hover:text-blue-500 hover:bg-blue-500/10 rounded-lg transition-all">
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(ipo.id)}
                        className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal (Simplified) */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-full max-w-2xl glass-card p-8 relative z-10"
            >
              <h2 className="text-2xl font-bold mb-6">Create IPO Listing</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Company Name</label>
                    <input 
                      required
                      className="input-premium h-12" 
                      placeholder="Nepal Telecom"
                      onChange={e => setFormData({...formData, company_name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Symbol</label>
                    <input 
                      required
                      className="input-premium h-12 uppercase" 
                      placeholder="NTC"
                      onChange={e => setFormData({...formData, symbol: e.target.value.toUpperCase()})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Type</label>
                    <select 
                      className="input-premium h-12"
                      onChange={e => setFormData({...formData, type: e.target.value as any})}
                    >
                      <option value="IPO">IPO</option>
                      <option value="FPO">FPO</option>
                      <option value="RIGHT">RIGHT</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Status</label>
                    <select 
                      className="input-premium h-12"
                      onChange={e => setFormData({...formData, status: e.target.value as any})}
                    >
                      <option value="upcoming">Upcoming</option>
                      <option value="open">Open</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Open Date</label>
                    <input 
                      type="date"
                      required
                      className="input-premium h-12" 
                      onChange={e => setFormData({...formData, open_date: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Close Date</label>
                    <input 
                      type="date"
                      required
                      className="input-premium h-12" 
                      onChange={e => setFormData({...formData, close_date: e.target.value})}
                    />
                  </div>
                </div>

                <div className="flex gap-4 mt-8">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="premium-btn premium-btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={submitting}
                    className="premium-btn premium-btn-primary flex-1"
                  >
                    {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Listing'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
