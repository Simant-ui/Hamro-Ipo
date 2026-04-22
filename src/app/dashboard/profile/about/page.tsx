'use client'

import { motion } from 'framer-motion'
import { 
  ArrowLeft,
  Settings,
  Shield,
  FileText,
  Video,
  Globe,
  MessageCircle
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function AboutPage() {
  const router = useRouter()

  const sections = [
    {
      title: 'What We Do',
      icon: Settings,
      content: 'This app makes it easy for you to apply for multiple IPOs at once and track effort by their status with our streamlined process. Additionally, you can import your information between data, devices or back up your data for safekeeping.'
    },
    {
      title: 'Disclaimer',
      icon: FileText,
      content: 'This app is not connected or associated with CDS and Clearing Limited. It is designed to assist users in applying for IPOs with minimal effort and can be used to apply for multiple IPOs simultaneously.'
    },
    {
      title: 'Security & Privacy',
      icon: Shield,
      content: "Rest assured, your data is our top priority. We've ensured that all your information is securely encrypted on your device and we do not store any sensitive information on our servers."
    }
  ]

  return (
    <div className="space-y-6 max-w-lg mx-auto pb-20">
      <div className="flex items-center gap-4 mb-4">
        <button onClick={() => router.back()} className="p-2 hover:bg-slate-900 rounded-xl transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-black tracking-tight">About</h1>
      </div>

      <div className="space-y-6">
        {sections.map((section, i) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-6 glass-card space-y-3"
          >
            <div className="flex items-center gap-3">
               <section.icon className="w-5 h-5 text-emerald-500" />
               <h3 className="text-sm font-black text-slate-200">{section.title}</h3>
            </div>
            <p className="text-xs font-bold text-slate-400 leading-relaxed">
               {section.content}
            </p>
          </motion.div>
        ))}
      </div>

      <div className="flex flex-wrap gap-4 pt-4 px-2">
         <div onClick={() => toast('Youtube channel coming soon!', { icon: '📺' })} className="cursor-pointer flex items-center gap-2 text-emerald-500 font-black text-[11px] uppercase tracking-widest">
            <Video className="w-4 h-4 text-red-500" /> Subscribe Youtube
         </div>
         <div onClick={() => toast('Facebook page coming soon!', { icon: '👍' })} className="cursor-pointer flex items-center gap-2 text-blue-500 font-black text-[11px] uppercase tracking-widest">
            <Globe className="w-4 h-4" /> Like Us
         </div>
         <div onClick={() => toast('Viber community coming soon!', { icon: '💬' })} className="cursor-pointer flex items-center gap-2 text-purple-500 font-black text-[11px] uppercase tracking-widest">
            <MessageCircle className="w-4 h-4" /> Join Viber Community
         </div>
      </div>

      <div className="pt-8 px-2">
          <div onClick={() => toast('Privacy Policy document coming soon!', { icon: '📄' })} className="cursor-pointer flex items-center justify-between p-4 glass-card hover:bg-white/5 transition-all">
            <div className="flex items-center gap-3">
               <Shield className="w-5 h-5 text-slate-400" />
               <span className="text-xs font-black text-slate-200 uppercase tracking-widest">Privacy Policy</span>
            </div>
          </div>
      </div>
    </div>
  )
}
