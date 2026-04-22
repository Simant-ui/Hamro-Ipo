'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Bell, 
  CheckCircle2, 
  Clock, 
  Info, 
  MessageSquare, 
  Trash2, 
  MailOpen,
  Mail,
  Trophy,
  AlertTriangle
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Notification } from '@/types'
import { formatDateTime, cn } from '@/lib/utils'
import { toast } from 'react-hot-toast'

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchNotifications = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      toast.error('Failed to fetch notifications')
    } else {
      setNotifications(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchNotifications()
  }, [])

  const markAsRead = async (id: string) => {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id)

    if (!error) {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
    }
  }

  const deleteNotification = async (id: string) => {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id)

    if (!error) {
      setNotifications(prev => prev.filter(n => n.id !== id))
      toast.success('Notification deleted')
    }
  }

  const markAllRead = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user?.id)

    if (!error) {
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
      toast.success('All marked as read')
    }
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'ipo_open': return <Clock className="w-5 h-5 text-blue-500" />
      case 'ipo_result': return <Trophy className="w-5 h-5 text-amber-500" />
      case 'allotment': return <CheckCircle2 className="w-5 h-5 text-emerald-500" />
      default: return <Info className="w-5 h-5 text-slate-500" />
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-10 pb-24 px-4 md:px-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight text-[var(--foreground)] uppercase italic leading-none">Notifications</h1>
          <p className="text-sm text-slate-500 font-medium">Real-time terminal alerts and IPO audit reports.</p>
        </div>
        {notifications.some(n => !n.is_read) && (
          <button 
            onClick={markAllRead}
            className="flex items-center gap-2.5 px-5 py-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-[10px] font-black text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition-all uppercase tracking-[0.2em] italic shadow-sm shadow-emerald-500/5"
          >
            <MailOpen className="w-3.5 h-3.5" />
            Clear Pending
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-28 animate-pulse bg-slate-50 dark:bg-slate-900 border border-[var(--border)] rounded-[32px]" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="py-24 flex flex-col items-center justify-center text-center gap-6 bg-white dark:bg-slate-900/50 border border-[var(--border)] rounded-[40px] shadow-sm">
          <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-[32px] flex items-center justify-center text-slate-300 border border-[var(--border)] group">
             <Bell className="w-10 h-10 group-hover:rotate-12 transition-transform duration-500" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-black text-[var(--foreground)] uppercase italic tracking-tight">System Neutral</h3>
            <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest">No active alerts detected in this sector.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          <AnimatePresence mode="popLayout">
            {notifications.map((n, i) => (
              <motion.div
                key={n.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.05 }}
                className={cn(
                  "p-8 rounded-[40px] bg-[var(--surface)] border transition-all duration-500 flex flex-col md:flex-row gap-6 relative group",
                  !n.is_read ? 'border-emerald-500/30 shadow-xl shadow-emerald-500/5' : 'border-[var(--border)] hover:border-emerald-500/20 shadow-sm'
                )}
              >
                <div className={cn(
                  "w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 border transition-all duration-500 group-hover:scale-110 group-hover:rotate-3",
                  !n.is_read ? 'bg-emerald-500 text-slate-950 border-emerald-500/20 shadow-lg shadow-emerald-500/20' : 'bg-slate-50 dark:bg-slate-800 border-[var(--border)] text-slate-400'
                )}>
                  {getIcon(n.type)}
                </div>

                <div className="flex-1 space-y-3">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <h3 className={cn(
                      "text-lg font-black tracking-tight uppercase italic",
                      !n.is_read ? 'text-emerald-600 dark:text-emerald-400' : 'text-[var(--foreground)]'
                    )}>
                      {n.title}
                    </h3>
                    <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 dark:bg-slate-950 border border-[var(--border)] rounded-full text-[9px] font-black text-slate-400 uppercase tracking-widest">
                      <Clock className="w-3 h-3" />
                      {formatDateTime(n.created_at)}
                    </div>
                  </div>
                  <p className="text-[13px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-2xl">{n.message}</p>
                  
                  <div className="pt-4 flex items-center gap-8">
                    {!n.is_read && (
                      <button 
                        onClick={() => markAsRead(n.id)}
                        className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.2em] hover:underline transition-all"
                      >
                        Acknowledge
                      </button>
                    )}
                    <button 
                      onClick={() => deleteNotification(n.id)}
                      className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hover:text-rose-500 flex items-center gap-2 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Discard
                    </button>
                  </div>
                </div>

                {!n.is_read && (
                  <div className="absolute top-6 right-6 w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>


  )
}
