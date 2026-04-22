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
import { formatDateTime } from '@/lib/utils'
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
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="text-slate-400 mt-1">Stay updated with latest IPO news and alerts</p>
        </div>
        {notifications.some(n => !n.is_read) && (
          <button 
            onClick={markAllRead}
            className="text-xs font-bold text-blue-500 hover:underline flex items-center gap-1"
          >
            <MailOpen className="w-4 h-4" />
            Mark all as read
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="glass-card h-24 animate-pulse" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="glass-card p-20 text-center">
          <Bell className="w-16 h-16 text-slate-700 mx-auto mb-6" />
          <h3 className="text-2xl font-bold">All caught up!</h3>
          <p className="text-slate-500 mt-2">You don&apos;t have any new notifications.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {notifications.map((n) => (
              <motion.div
                key={n.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`glass-card p-6 flex gap-6 relative group transition-all duration-300 ${
                  !n.is_read ? 'border-blue-500/30 bg-blue-600/5' : 'border-slate-800'
                }`}
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
                  !n.is_read ? 'bg-blue-600/10 border-blue-500/20' : 'bg-slate-800/50 border-slate-700'
                }`}>
                  {getIcon(n.type)}
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className={`font-bold ${!n.is_read ? 'text-blue-400' : 'text-slate-200'}`}>
                      {n.title}
                    </h3>
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                      {formatDateTime(n.created_at)}
                    </span>
                  </div>
                  <p className="text-sm text-slate-400 leading-relaxed mb-4">{n.message}</p>
                  
                  <div className="flex items-center gap-4">
                    {!n.is_read && (
                      <button 
                        onClick={() => markAsRead(n.id)}
                        className="text-[10px] font-bold text-blue-500 uppercase tracking-widest hover:underline"
                      >
                        Mark as read
                      </button>
                    )}
                    <button 
                      onClick={() => deleteNotification(n.id)}
                      className="text-[10px] font-bold text-slate-500 uppercase tracking-widest hover:text-red-500 flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      Delete
                    </button>
                  </div>
                </div>

                {!n.is_read && (
                  <div className="absolute top-6 right-6 w-2 h-2 bg-blue-500 rounded-full" />
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
