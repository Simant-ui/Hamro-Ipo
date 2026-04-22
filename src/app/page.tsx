'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  ArrowRight, 
  ShieldCheck, 
  Users, 
  TrendingUp, 
  Zap, 
  CheckCircle2,
  Activity,
  ChevronRight,
  Globe,
  Lock,
  BarChart3
} from 'lucide-react'

import React from 'react'
import toast from 'react-hot-toast'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LandingPage() {
  const router = useRouter();
  const [deferredPrompt, setDeferredPrompt] = React.useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = React.useState(false);

  React.useEffect(() => {
    // Redirect if running in standalone mode (installed app)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    
    if (isStandalone) {
      const checkSession = async () => {
        const { data: { session } } = await createClient().auth.getSession();
        if (session) {
          router.push('/dashboard');
        } else {
          router.push('/login');
        }
      };
      checkSession();
      return;
    }

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setShowInstallBanner(false);
      }
    } else {
      // Check if it's iOS
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
      if (isIOS) {
        toast.success("To install on iPhone: Tap 'Share' icon and then 'Add to Home Screen' 📲", {
          duration: 6000,
          style: {
            background: '#10b981',
            color: '#000',
            fontWeight: 'bold'
          }
        });
      } else {
        toast.success("Tap the three dots (⋮) in your browser menu and select 'Install App' or 'Add to Home Screen' 📱", {
          duration: 6000,
          style: {
            background: '#10b981',
            color: '#000',
            fontWeight: 'bold'
          }
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-emerald-500/30 overflow-hidden font-jakarta">
      {/* Install Banner for Mobile */}
      {showInstallBanner && (
        <motion.div 
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          className="fixed top-0 left-0 right-0 z-[100] px-4 py-3 bg-white/10 backdrop-blur-2xl border-b border-white/10 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center font-black text-slate-950">H</div>
            <div>
              <p className="font-bold text-sm">Hamro IPO Elite</p>
              <p className="text-[10px] text-slate-400">Professional Investment Suite</p>
            </div>
          </div>
          <button 
            onClick={handleInstall}
            className="px-5 py-2 bg-emerald-500 text-slate-950 rounded-xl text-xs font-black hover:bg-emerald-400 transition-all uppercase tracking-widest"
          >
            Install
          </button>
        </motion.div>
      )}

      {/* Premium Ambient Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/10 rounded-full blur-[140px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-blue-600/10 rounded-full blur-[160px]" />
        <div className="absolute top-[20%] right-[15%] w-[40%] h-[40%] bg-emerald-600/5 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
      </div>

      {/* Nav */}
      <nav className="container mx-auto px-6 py-8 flex items-center justify-between relative z-50">
        <div className="flex items-center gap-4 group cursor-pointer">
          <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:rotate-6 transition-all duration-500">
            <span className="text-slate-950 font-black text-2xl italic">H</span>
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-black text-white tracking-tighter uppercase italic leading-none">Hamro IPO</span>
            <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-[0.4em] mt-1">Version 2.0 Elite</span>
          </div>
        </div>
        
        <div className="hidden lg:flex items-center gap-10 px-10 py-3.5 bg-white/5 backdrop-blur-xl rounded-full border border-white/10">
          <Link href="#features" className="text-slate-400 hover:text-emerald-400 transition-colors text-xs font-bold uppercase tracking-widest">Features</Link>
          <Link href="#security" className="text-slate-400 hover:text-emerald-400 transition-colors text-xs font-bold uppercase tracking-widest">Security</Link>
          <Link href="#pricing" className="text-slate-400 hover:text-emerald-400 transition-colors text-xs font-bold uppercase tracking-widest">Elite Tiers</Link>
        </div>

        <div className="flex items-center gap-8">
          <Link href="/login" className="text-slate-400 hover:text-white transition-colors font-bold text-xs uppercase tracking-widest hidden md:block">Sign In</Link>
          <Link href="/signup" className="relative group">
            <div className="absolute -inset-1 bg-emerald-500 rounded-full blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
            <button className="relative px-8 py-3 bg-white text-slate-950 rounded-full text-xs font-black uppercase tracking-widest hover:bg-emerald-500 transition-colors active:scale-95">
              Get Started
            </button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="container mx-auto px-6 pt-24 pb-32 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-black uppercase tracking-[0.3em] mb-12 shadow-2xl"
        >
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          Institutional Investment Hub
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-6xl mx-auto mb-16"
        >
          <h1 className="text-7xl md:text-[120px] font-black leading-[0.82] tracking-tighter mb-10 uppercase italic">
            The Standard for <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-emerald-500 to-blue-500 animate-gradient-x">
              Nepalese Markets.
            </span>
          </h1>
          <p className="text-slate-400 text-xl md:text-2xl max-w-3xl mx-auto font-medium leading-relaxed">
            Experience professional-grade IPO management. Automated, secure, and designed for those who demand excellence.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-8 mb-32"
        >
          <Link href="/signup" className="group relative px-12 py-6 bg-emerald-500 rounded-2xl font-black text-slate-950 hover:bg-emerald-400 transition-all hover:scale-105 active:scale-95 shadow-[0_20px_50px_rgba(16,185,129,0.3)] flex items-center gap-3 overflow-hidden uppercase tracking-widest">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            Enter the Suite
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <button 
            onClick={handleInstall}
            className="px-12 py-6 rounded-2xl font-black text-white border border-white/10 hover:bg-white/5 hover:border-white/20 transition-all backdrop-blur-xl flex items-center gap-3 group uppercase tracking-widest"
          >
            Download App
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-slate-950 transition-all">
              <Zap className="w-4 h-4" />
            </div>
          </button>
        </motion.div>

        {/* Institutional Dashboard Preview */}
        <motion.div 
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="relative max-w-7xl mx-auto"
        >
          <div className="absolute -inset-4 bg-emerald-500/20 blur-[120px] -z-10" />
          <div className="p-4 bg-white/5 border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.8)] overflow-hidden rounded-[50px]">
            <div className="bg-slate-950 rounded-[40px] border border-white/5 overflow-hidden aspect-[16/9] relative group">
              <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/10 to-transparent pointer-events-none" />
              
              {/* Modern Interface Mockup */}
              <div className="h-full flex flex-col p-12 text-left">
                <div className="flex items-center justify-between mb-12">
                   <div className="flex gap-4">
                      <div className="w-3 h-3 rounded-full bg-emerald-500/40" />
                      <div className="w-3 h-3 rounded-full bg-emerald-500/20" />
                      <div className="w-3 h-3 rounded-full bg-emerald-500/10" />
                   </div>
                   <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-emerald-500">Live Sync Active</div>
                </div>
                
                <div className="grid grid-cols-3 gap-8">
                   <div className="col-span-2 space-y-8">
                      <div className="h-48 rounded-3xl bg-white/5 border border-white/5 p-8 relative overflow-hidden">
                         <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl" />
                         <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">NEPSE INDEX TODAY</div>
                         <div className="text-5xl font-black italic tracking-tighter text-white">2,807.12</div>
                         <div className="mt-4 flex items-center gap-2 text-emerald-500 text-sm font-bold">
                            <TrendingUp className="w-4 h-4" /> +12.4% Institutional Growth
                         </div>
                      </div>
                      <div className="grid grid-cols-2 gap-8">
                         <div className="h-32 rounded-3xl bg-white/5 border border-white/5 p-6">
                            <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Accounts Linked</div>
                            <div className="text-3xl font-black text-white italic">42</div>
                         </div>
                         <div className="h-32 rounded-3xl bg-white/5 border border-white/5 p-6">
                            <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Bulk IPO Applied</div>
                            <div className="text-3xl font-black text-white italic">128</div>
                         </div>
                      </div>
                   </div>
                   <div className="h-full rounded-3xl bg-white/5 border border-white/5 p-8">
                      <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">Market Movers</div>
                      <div className="space-y-6">
                         {[1,2,3,4].map(i => (
                            <div key={i} className="flex items-center justify-between">
                               <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10" />
                                  <div className="h-2 w-16 bg-white/10 rounded-full" />
                               </div>
                               <div className="h-2 w-10 bg-emerald-500/20 rounded-full" />
                            </div>
                         ))}
                      </div>
                   </div>
                </div>
              </div>

              {/* Floating Effects */}
              <div className="absolute top-20 right-20 w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px] group-hover:scale-150 transition-transform duration-1000" />
            </div>
          </div>
        </motion.div>

        {/* Features Section */}
        <section id="features" className="py-48">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { 
                icon: ShieldCheck, 
                title: "Quantum Security", 
                desc: "End-to-end encryption for your MeroShare credentials. Your data never touches our servers in plaintext.",
                color: "emerald"
              },
              { 
                icon: Zap, 
                title: "Bulk Precision", 
                desc: "Apply for IPOs across dozens of accounts in a single click. Automated validation and PIN entry.",
                color: "blue"
              },
              { 
                icon: BarChart3, 
                title: "Real-time Pulse", 
                desc: "Direct integration with NEPSE APIs for live portfolio tracking and institutional-grade analytics.",
                color: "purple"
              }
            ].map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group relative p-12 rounded-[40px] bg-white/5 border border-white/10 hover:border-emerald-500/40 transition-all duration-500 hover:shadow-2xl hover:shadow-emerald-500/5"
              >
                <div className="w-20 h-20 bg-emerald-500/10 rounded-3xl flex items-center justify-center mb-10 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 border border-emerald-500/20">
                  <f.icon className="w-10 h-10 text-emerald-400" />
                </div>
                <h3 className="text-3xl font-black mb-6 uppercase italic tracking-tight">{f.title}</h3>
                <p className="text-slate-400 leading-relaxed font-medium text-lg">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Social Proof */}
        <div className="py-24 border-y border-white/5">
          <p className="text-xs font-black text-slate-500 uppercase tracking-[0.4em] mb-16">Preferred by Nepal's Elite Investors</p>
          <div className="flex flex-wrap justify-center gap-20 grayscale opacity-30 hover:opacity-100 transition-opacity duration-1000">
            <div className="text-3xl font-black italic tracking-tighter text-white">NEPSE ALPHA</div>
            <div className="text-3xl font-black italic tracking-tighter text-white">SHARE SANSAR</div>
            <div className="text-3xl font-black italic tracking-tighter text-white">MEROSHARE</div>
            <div className="text-3xl font-black italic tracking-tighter text-white">HAMRO DATA</div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 bg-slate-950/80 backdrop-blur-3xl py-32">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-start gap-20 mb-24">
            <div className="max-w-sm text-left">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                  <span className="text-slate-950 font-black text-lg italic">H</span>
                </div>
                <span className="text-lg font-black text-white uppercase tracking-widest italic">Hamro IPO Elite</span>
              </div>
              <p className="text-slate-500 text-lg font-medium leading-relaxed">
                Elevating the investment experience for the modern generation. Built for performance, security, and absolute clarity.
              </p>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-20 text-left">
              <div className="space-y-6">
                <h4 className="text-white font-black text-xs uppercase tracking-widest">Platform</h4>
                <ul className="space-y-4 text-slate-500 text-sm font-bold uppercase tracking-widest">
                  <li><Link href="#" className="hover:text-emerald-400 transition-colors">Bulk Suite</Link></li>
                  <li><Link href="#" className="hover:text-emerald-400 transition-colors">Result Engine</Link></li>
                  <li><Link href="#" className="hover:text-emerald-400 transition-colors">Portfolio Hub</Link></li>
                </ul>
              </div>
              <div className="space-y-6">
                <h4 className="text-white font-black text-xs uppercase tracking-widest">Company</h4>
                <ul className="space-y-4 text-slate-500 text-sm font-bold uppercase tracking-widest">
                  <li><Link href="#" className="hover:text-emerald-400 transition-colors">About Elite</Link></li>
                  <li><Link href="#" className="hover:text-emerald-400 transition-colors">Privacy Policy</Link></li>
                  <li><Link href="#" className="hover:text-emerald-400 transition-colors">Terms of Access</Link></li>
                </ul>
              </div>
              <div className="space-y-6">
                <h4 className="text-white font-black text-xs uppercase tracking-widest">Global</h4>
                <ul className="space-y-4 text-slate-500 text-sm font-bold uppercase tracking-widest">
                  <li><Link href="#" className="hover:text-emerald-400 transition-colors">Support Center</Link></li>
                  <li><Link href="#" className="hover:text-emerald-400 transition-colors">Elite Status</Link></li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-center gap-10 pt-16 border-t border-white/5">
            <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.3em]">© 2026 Hamro IPO Elite. Advanced Infrastructure for Nepal.</p>
            <div className="flex gap-6">
              <div className="w-12 h-12 rounded-2xl border border-white/10 flex items-center justify-center text-slate-500 hover:text-emerald-500 cursor-pointer hover:border-emerald-500/50 transition-all">
                <Globe className="w-5 h-5" />
              </div>
              <div className="w-12 h-12 rounded-2xl border border-white/10 flex items-center justify-center text-slate-500 hover:text-emerald-500 cursor-pointer hover:border-emerald-500/50 transition-all">
                <Users className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>
      </footer>

      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(20px); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-delayed { animation: float-delayed 7s ease-in-out infinite; }
        
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 15s ease infinite;
        }
        @keyframes gradient-x {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  )
}
