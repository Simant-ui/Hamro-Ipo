'use client'

import { 
  Star, 
  Share, 
  Mail, 
  MessageSquare, 
  Video, 
  Globe, 
  MessageCircle, 
  Phone, 
  Info,
  ChevronRight,
  Settings
} from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'

const menuItems = [
  { name: 'Rate this App', icon: Star, path: '#', color: 'text-amber-400' },
  { name: 'Share this App', icon: Share, path: '#', color: 'text-blue-400' },
  { name: 'Feedback', icon: Mail, path: '#', color: 'text-rose-400' },
  { name: 'Feature Request', icon: MessageSquare, path: '#', color: 'text-emerald-400' },
]

const socialLinks = [
  { name: 'Subscribe Us', icon: Video, path: '#', color: 'bg-red-500' },
  { name: 'Like Us', icon: Globe, path: '#', color: 'bg-blue-600' },
  { name: 'Follow Us on TikTok', icon: Globe, path: '#', color: 'bg-slate-800' },
  { name: 'Viber Community', icon: MessageCircle, path: '#', color: 'bg-purple-600' },
  { name: 'Contact Us', icon: Phone, path: '#', color: 'bg-emerald-500' },
  { name: 'About', icon: Info, path: '/dashboard/profile/about', color: 'bg-slate-700' },
  { name: 'Settings', icon: Settings, path: '/dashboard/profile/settings', color: 'bg-slate-700' },
]

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
      }
    }
    fetchUser()
  }, [])

  const fullName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User Profile'
  const email = user?.email || 'Loading details...'
  
  // Google OAuth picture can be in various locations depending on Supabase version
  const avatarUrl = user?.user_metadata?.avatar_url || 
                    user?.user_metadata?.picture || 
                    user?.identities?.[0]?.identity_data?.avatar_url || 
                    user?.identities?.[0]?.identity_data?.picture

  const initials = fullName !== 'User Profile' ? fullName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : '...'

  return (
    <div className="space-y-6 pb-20 max-w-lg mx-auto">
      <div className="px-2 pt-4">
         <div className="flex items-center gap-4 mb-8">
            {avatarUrl ? (
              <div className="w-16 h-16 rounded-3xl overflow-hidden relative shadow-xl shadow-emerald-500/20 ring-2 ring-emerald-500/30">
                <img src={avatarUrl} alt={fullName} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-3xl premium-gradient flex items-center justify-center font-black text-slate-900 text-2xl shadow-xl shadow-emerald-500/20">
                 {initials}
              </div>
            )}
            <div>
               <h2 className="text-xl font-black">{fullName}</h2>
               <p className="text-slate-500 text-sm font-bold">{email}</p>
            </div>
         </div>
      </div>

      <div className="glass-card overflow-hidden">
        {menuItems.map((item, i) => {
          const content = (
            <div className={`flex items-center justify-between p-5 hover:bg-white/5 transition-all cursor-pointer ${i !== menuItems.length - 1 ? 'border-b border-white/5' : ''}`}>
              <div className="flex items-center gap-4">
                <item.icon className={`w-5 h-5 ${item.color}`} />
                <span className="text-sm font-black text-slate-200">{item.name}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-600" />
            </div>
          )

          return item.path === '#' ? (
            <div key={item.name} onClick={() => toast(`${item.name} coming soon!`, { icon: '🚀' })}>
              {content}
            </div>
          ) : (
            <Link key={item.name} href={item.path}>
              {content}
            </Link>
          )
        })}
      </div>

      <div className="space-y-4 pt-4">
        <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-500 px-2">Connect With Us</h3>
        <div className="glass-card overflow-hidden">
          {socialLinks.map((link, i) => {
            const content = (
              <div className={`flex items-center justify-between p-5 hover:bg-white/5 transition-all cursor-pointer ${i !== socialLinks.length - 1 ? 'border-b border-white/5' : ''}`}>
                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 ${link.color} rounded-lg flex items-center justify-center`}>
                    <link.icon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-black text-slate-200">{link.name}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-600" />
              </div>
            )

            return link.path === '#' ? (
              <div key={link.name} onClick={() => toast(`${link.name} coming soon!`, { icon: '🔗' })}>
                {content}
              </div>
            ) : (
              <Link key={link.name} href={link.path}>
                {content}
              </Link>
            )
          })}
        </div>
      </div>

      <div className="text-center pt-8">
        <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Hamro IPO v1.2.0</p>
      </div>
    </div>
  )
}
