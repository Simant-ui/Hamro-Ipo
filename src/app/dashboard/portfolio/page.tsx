'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  PieChart as PieChartIcon, 
  ArrowUpRight, 
  ArrowDownRight, 
  Download, 
  Filter, 
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  MoreVertical,
  ExternalLink,
  FileText,
  Briefcase,
  RefreshCw,
  TrendingUp as TrendingIcon
} from 'lucide-react'
import { fetchLivePortfolio } from '@/lib/meroshare'
import { useAccountStore } from '@/store/useAccountStore'
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Cell,
  Pie
} from 'recharts'
import { createClient } from '@/lib/supabase/client'
import { IPOApplication } from '@/types'
import { formatCurrency, formatNumber, formatDate, downloadCSV, generateCSV, cn } from '@/lib/utils'
import { toast } from 'react-hot-toast'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4']

export default function PortfolioPage() {
  const [applications, setApplications] = useState<IPOApplication[]>([])
  const [livePortfolio, setLivePortfolio] = useState<any[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [filter, setFilter] = useState('all')
  const { accounts } = useAccountStore()
  const supabase = createClient()

  useEffect(() => {
    const fetchPortfolio = async () => {
      const { data, error } = await supabase
        .from('ipo_applications')
        .select(`
          *,
          ipo:ipo_id (*),
          account:account_id (*)
        `)
        .order('applied_at', { ascending: false })

      if (error) {
        toast.error('Failed to fetch portfolio data')
      } else {
        setApplications(data || [])
      }
      setLoading(false)
    }

    fetchPortfolio()
  }, [supabase])

  const handleLiveSync = async () => {
    const defaultAccount = accounts.find(a => a.isDefault)
    if (!defaultAccount) {
      toast.error('Please set a default account first')
      return
    }

    const password = prompt(`Enter MeroShare password for ${defaultAccount.name}:`)
    if (!password) return

    setSyncing(true)
    try {
      // Find clientId (DP ID) from BOID (first 5 digits)
      const clientId = defaultAccount.boid.slice(0, 5)
      
      const data = await fetchLivePortfolio({
        clientId,
        username: defaultAccount.username,
        password
      })

      setLivePortfolio(data.myPortfolio)
      toast.success('Live portfolio synced!')
    } catch (error: any) {
      toast.error(error.message || 'Sync failed')
    } finally {
      setSyncing(false)
    }
  }

  const filteredApps = applications.filter(app => 
    filter === 'all' ? true : app.status === filter
  )

  const stats = {
    totalInvested: applications.reduce((acc, curr) => acc + curr.amount, 0),
    totalApplications: applications.length,
    allottedCount: applications.filter(a => a.status === 'allotted').length,
    allottedUnits: applications.filter(a => a.status === 'allotted').reduce((acc, curr) => acc + (curr.allotted_units || 0), 0)
  }

  const exportCSV = () => {
    const headers = ['Company', 'Symbol', 'Account', 'Quantity', 'Amount', 'Status', 'Date']
    const rows = applications.map(app => [
      app.ipo?.company_name || 'N/A',
      app.ipo?.symbol || 'N/A',
      app.account?.account_name || 'N/A',
      app.quantity,
      app.amount,
      app.status,
      formatDate(app.applied_at)
    ])
    const csvContent = generateCSV(headers, rows)
    downloadCSV('hamro-ipo-portfolio.csv', csvContent)
    toast.success('CSV exported successfully')
  }

  const exportPDF = () => {
    const doc = new jsPDF()
    doc.text('Hamro IPO - Portfolio Summary', 14, 15)
    
    const tableData = applications.map(app => [
      app.ipo?.symbol || 'N/A',
      app.account?.account_name || 'N/A',
      app.quantity,
      formatCurrency(app.amount),
      app.status,
      formatDate(app.applied_at)
    ])

    // @ts-ignore
    doc.autoTable({
      head: [['Symbol', 'Account', 'Units', 'Amount', 'Status', 'Date']],
      body: tableData,
      startY: 25,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [59, 130, 246] }
    })

    doc.save('hamro-ipo-portfolio.pdf')
    toast.success('PDF exported successfully')
  }

  const pieData = [
    { name: 'Allotted', value: applications.filter(a => a.status === 'allotted').length },
    { name: 'Pending', value: applications.filter(a => a.status === 'pending').length },
    { name: 'Not Allotted', value: applications.filter(a => a.status === 'not_allotted').length },
    { name: 'Failed', value: applications.filter(a => a.status === 'failed').length },
  ].filter(d => d.value > 0)

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Your Portfolio</h1>
          <p className="text-slate-400 mt-1">Track your investments and allotment results</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={exportCSV}
            className="premium-btn premium-btn-secondary py-2 px-4 text-xs"
          >
            <Download className="w-4 h-4" />
            CSV
          </button>
          <button 
            onClick={exportPDF}
            className="premium-btn premium-btn-secondary py-2 px-4 text-xs"
          >
            <FileText className="w-4 h-4" />
            PDF
          </button>
          <button 
            onClick={handleLiveSync}
            disabled={syncing}
            className="premium-btn premium-btn-primary py-2 px-4 text-xs"
          >
            <RefreshCw className={cn("w-4 h-4", syncing && "animate-spin")} />
            {syncing ? 'Syncing...' : 'Live Sync'}
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 glass-card p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-blue-500" />
              Investment Summary
            </h3>
            <div className="text-right">
              <p className="text-xs text-slate-500 uppercase tracking-wider font-bold">Total Invested</p>
              <h2 className="text-3xl font-black text-blue-500">{formatCurrency(stats.totalInvested)}</h2>
            </div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            <div className="space-y-1">
              <p className="text-xs text-slate-500">Applications</p>
              <p className="text-xl font-bold">{stats.totalApplications}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-slate-500">Allotted Issues</p>
              <p className="text-xl font-bold text-emerald-500">{stats.allottedCount}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-slate-500">Total Units</p>
              <p className="text-xl font-bold">{stats.allottedUnits}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-slate-500">Success Rate</p>
              <p className="text-xl font-bold">
                {stats.totalApplications > 0 ? ((stats.allottedCount / stats.totalApplications) * 100).toFixed(1) : 0}%
              </p>
            </div>
          </div>
        </div>

        <div className="glass-card p-8 flex flex-col items-center justify-center">
          <h3 className="text-lg font-bold mb-4 self-start flex items-center gap-2">
            <PieChartIcon className="w-5 h-5 text-purple-500" />
            Status Split
          </h3>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4 w-full">
            {pieData.map((d, i) => (
              <div key={d.name} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                <span className="text-[10px] text-slate-400 whitespace-nowrap">{d.name} ({d.value})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Live Holdings Table */}
      {livePortfolio && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card overflow-hidden border-emerald-500/20"
        >
          <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-emerald-500/5">
            <h3 className="text-lg font-bold flex items-center gap-2 text-emerald-500">
              <TrendingIcon className="w-5 h-5" />
              Live Holdings (MeroShare)
            </h3>
            <button 
              onClick={() => setLivePortfolio(null)}
              className="text-xs text-slate-500 hover:text-white transition-colors"
            >
              Clear Live View
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900/50 border-b border-slate-800">
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Scrip</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Units</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Current Price</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Total Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {livePortfolio.map((stock: any) => (
                  <tr key={stock.script} className="hover:bg-emerald-500/5 transition-colors">
                    <td className="p-4">
                      <div>
                        <p className="font-bold text-sm text-white">{stock.script}</p>
                        <p className="text-[10px] text-slate-500">{stock.scriptDesc}</p>
                      </div>
                    </td>
                    <td className="p-4 text-sm font-bold text-right">{stock.currentBalance}</td>
                    <td className="p-4 text-sm font-bold text-right text-slate-300">Rs. {stock.lastTradedPrice}</td>
                    <td className="p-4 text-sm font-black text-right text-emerald-500">
                      Rs. {formatNumber(stock.currentBalance * stock.lastTradedPrice)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Applications Table */}
      <div className="glass-card overflow-hidden">
        <div className="p-6 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/30">
          <h3 className="text-lg font-bold">Application History</h3>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="bg-slate-800/50 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-xs focus:ring-1 focus:ring-blue-500 outline-none w-48"
              />
            </div>
            <select 
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-xs focus:ring-1 focus:ring-blue-500 outline-none"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="allotted">Allotted</option>
              <option value="not_allotted">Not Allotted</option>
              <option value="success">Applied (Success)</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/50 border-b border-slate-800">
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Asset / Symbol</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Account</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Units</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Invested</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Applied Date</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Status</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={7} className="p-4 h-16 bg-slate-800/10"></td>
                  </tr>
                ))
              ) : filteredApps.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-500">No applications found matching the criteria.</td>
                </tr>
              ) : (
                filteredApps.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-4">
                      <div>
                        <p className="font-bold text-sm text-slate-200">{app.ipo?.symbol}</p>
                        <p className="text-[10px] text-slate-500 line-clamp-1">{app.ipo?.company_name}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-blue-600/10 rounded flex items-center justify-center text-[8px] font-bold text-blue-500">
                          {app.account?.account_name.slice(0, 1)}
                        </div>
                        <span className="text-xs text-slate-400 font-medium">{app.account?.account_name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm font-bold text-right">{app.quantity}</td>
                    <td className="p-4 text-sm font-bold text-right text-slate-300">{formatCurrency(app.amount)}</td>
                    <td className="p-4 text-xs text-slate-500">{formatDate(app.applied_at)}</td>
                    <td className="p-4 text-center">
                      <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-400 border border-slate-700">
                        {app.status === 'pending' && <Clock className="w-3 h-3 text-amber-500" />}
                        {app.status === 'success' && <CheckCircle2 className="w-3 h-3 text-blue-500" />}
                        {app.status === 'failed' && <XCircle className="w-3 h-3 text-red-500" />}
                        {app.status === 'allotted' && <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
                        {app.status === 'not_allotted' && <XCircle className="w-3 h-3 text-slate-400" />}
                        {app.status}
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      {app.status === 'allotted' ? (
                        <div className="flex flex-col items-center">
                          <span className="text-xs font-black text-emerald-500">{app.allotted_units} Units</span>
                          <span className="text-[8px] text-emerald-500/50 uppercase">Allocated</span>
                        </div>
                      ) : app.status === 'not_allotted' ? (
                        <span className="text-[10px] text-slate-500">Better luck next time</span>
                      ) : app.status === 'pending' || app.status === 'success' ? (
                        <span className="text-[10px] text-amber-500 animate-pulse font-bold">Waiting...</span>
                      ) : (
                        <span className="text-[10px] text-red-500">Rejection: {app.rejection_reason || 'N/A'}</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
