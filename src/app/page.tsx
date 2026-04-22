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
    <div className="min-h-screen bg-[#05060f] text-white selection:bg-emerald-500/30 overflow-hidden font-jakarta">
      {/* Install Banner for Mobile */}
      {showInstallBanner && (
        <motion.div 
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          className="install-banner"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center font-bold text-emerald-400">H</div>
            <div>
              <p className="font-bold text-sm">Install Hamro IPO</p>
              <p className="text-[10px] opacity-70">Experience the full power of our app</p>
            </div>
          </div>
          <button 
            onClick={handleInstall}
            className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:scale-105 transition-transform"
          >
            Install Now
          </button>
        </motion.div>
      )}

      {/* Premium Ambient Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[140px]" />
        <div className="absolute top-[20%] right-[15%] w-[30%] h-[30%] bg-purple-600/5 rounded-full blur-[100px]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
      </div>

      {/* Nav */}
      <nav className="container mx-auto px-6 py-8 flex items-center justify-between relative z-50">
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:rotate-6 transition-transform">
            <span className="text-white font-bold text-xl">H</span>
          </div>
          <span className="text-xl font-bold text-white tracking-tight uppercase">Hamro IPO</span>
        </div>
        
        <div className="hidden md:flex items-center gap-8 bg-white/5 backdrop-blur-xl px-8 py-3 rounded-full border border-white/10">
          <Link href="#features" className="text-slate-400 hover:text-emerald-400 transition-colors text-sm font-medium">Features</Link>
          <Link href="#security" className="text-slate-400 hover:text-emerald-400 transition-colors text-sm font-medium">Security</Link>
          <Link href="#pricing" className="text-slate-400 hover:text-emerald-400 transition-colors text-sm font-medium">Elite Tiers</Link>
        </div>

        <div className="flex items-center gap-6">
          <Link href="/login" className="text-slate-400 hover:text-white transition-colors font-medium text-sm">Sign In</Link>
          <Link href="/signup" className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-full blur opacity-30 group-hover:opacity-60 transition duration-1000 group-hover:duration-200"></div>
            <button className="relative px-6 py-2.5 bg-[#05060f] rounded-full text-sm font-semibold text-white border border-white/10 hover:border-emerald-500/50 transition-colors">
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
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-12 shadow-inner"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
          Elite Fintech Infrastructure
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-5xl mx-auto mb-12"
        >
          <h1 className="text-6xl md:text-[100px] font-black leading-[0.85] tracking-tighter mb-8">
            The Future of <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400 animate-gradient-x">
              Nepalese Investing.
            </span>
          </h1>
          <p className="text-slate-400 text-xl md:text-2xl max-w-2xl mx-auto font-medium leading-relaxed">
            Institutional-grade IPO management for professional investors. Secure, automated, and lightning-fast.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-24"
        >
          <Link href="/signup" className="group relative px-10 py-5 bg-emerald-500 rounded-2xl font-bold text-black hover:bg-emerald-400 transition-all hover:scale-105 active:scale-95 shadow-[0_20px_50px_rgba(16,_185,_129,_0.3)] flex items-center gap-2 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            Join the Elite
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <button 
            onClick={handleInstall}
            className="px-10 py-5 rounded-2xl font-bold text-white border border-white/10 hover:bg-white/5 transition-all backdrop-blur-xl flex items-center gap-2 group"
          >
            Download for Android
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-black transition-colors">
              <Activity className="w-4 h-4" />
            </div>
          </button>
        </motion.div>

        {/* Dynamic Dashboard Preview */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="relative max-w-6xl mx-auto"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 blur-[100px] -z-10" />
          <div className="glass-card p-2 bg-white/5 border-white/10 shadow-[0_0_80px_rgba(0,0,0,0.5)] overflow-hidden rounded-[40px]">
            <div className="bg-[#05060f]/90 rounded-[34px] border border-white/5 overflow-hidden aspect-[16/10] relative group">
              <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent pointer-events-none" />
              <div className="h-full flex items-center justify-center">
                <div className="text-center p-12">
                  <div className="relative mb-8">
                    <Activity className="w-24 h-24 text-emerald-500 mx-auto opacity-20 group-hover:scale-110 transition-transform duration-1000" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Lock className="w-8 h-8 text-emerald-400 group-hover:animate-bounce" />
                    </div>
                  </div>
                  <h3 className="text-3xl font-bold text-slate-400 mb-2">Secure Trading Core</h3>
                  <p className="text-slate-600 font-medium">Real-time NEPSE synchronization active</p>
                  <div className="flex gap-3 justify-center mt-8">
                    <div className="w-12 h-1.5 rounded-full bg-emerald-500/20" />
                    <div className="w-24 h-1.5 rounded-full bg-emerald-500/40" />
                    <div className="w-8 h-1.5 rounded-full bg-emerald-500/10" />
                  </div>
                </div>
              </div>
              
              {/* Floating UI Elements */}
              <div className="absolute top-12 left-12 p-4 glass-card border-white/10 bg-black/40 rounded-2xl animate-float">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-bold">+12.4%</span>
                </div>
                <div className="h-1 w-24 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full w-2/3 bg-emerald-500" />
                </div>
              </div>

              <div className="absolute bottom-12 right-12 p-4 glass-card border-white/10 bg-black/40 rounded-2xl animate-float-delayed">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                    <BarChart3 className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-medium text-slate-400">Portfolio Health</span>
                </div>
                <div className="flex gap-1">
                  {[1,2,3,4,5].map(i => <div key={i} className="w-4 h-8 rounded-sm bg-blue-500/20" style={{ height: `${20 + i*10}px` }} />)}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Feature Grid */}
        <section id="features" className="py-32">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { 
                icon: ShieldCheck, 
                title: "AES-256 Vault", 
                desc: "Your MeroShare credentials never leave your browser unencrypted. Bank-grade security by default.",
                color: "emerald"
              },
              { 
                icon: Zap, 
                title: "One-Click Bulk Apply", 
                desc: "Apply for IPOs for up to 50 accounts in seconds. Automated CRN and PIN management.",
                color: "blue"
              },
              { 
                icon: BarChart3, 
                title: "Advanced Analytics", 
                desc: "Real-time portfolio valuation and allotment tracking with institutional accuracy.",
                color: "purple"
              }
            ].map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group relative p-8 rounded-[32px] bg-white/5 border border-white/10 hover:border-emerald-500/30 transition-all"
              >
                <div className={`w-16 h-16 bg-${f.color}-500/10 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500`}>
                  <f.icon className={`w-8 h-8 text-${f.color}-400`} />
                </div>
                <h3 className="text-2xl font-bold mb-4">{f.title}</h3>
                <p className="text-slate-400 leading-relaxed font-medium">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Trust/Social Proof */}
        <div className="py-20 border-y border-white/5">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-[0.3em] mb-12">Trusted by 10,000+ Professional Investors</p>
          <div className="flex flex-wrap justify-center gap-16 grayscale opacity-40">
            {/* Branding logos would go here */}
            <div className="text-2xl font-black italic tracking-tighter">NEPSE ALPHA</div>
            <div className="text-2xl font-black italic tracking-tighter">SHARE SANSAR</div>
            <div className="text-2xl font-black italic tracking-tighter">MEROSHARE</div>
            <div className="text-2xl font-black italic tracking-tighter">CHHAINAM</div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 bg-black/40 backdrop-blur-3xl py-20">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-20">
            <div className="max-w-xs">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20">
                  <span className="text-black font-bold text-sm">H</span>
                </div>
                <span className="text-sm font-black text-white uppercase tracking-widest">Hamro IPO</span>
              </div>
              <p className="text-slate-500 text-sm font-medium leading-relaxed">
                Elevating the investment experience for the modern Nepalese generation. Built with security and performance at its core.
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-12">
              <div className="space-y-4">
                <h4 className="text-white font-bold text-sm">Product</h4>
                <ul className="space-y-2 text-slate-500 text-sm font-medium">
                  <li><Link href="#" className="hover:text-emerald-400">Bulk Apply</Link></li>
                  <li><Link href="#" className="hover:text-emerald-400">Result Checker</Link></li>
                  <li><Link href="#" className="hover:text-emerald-400">Portfolio</Link></li>
                </ul>
              </div>
              <div className="space-y-4">
                <h4 className="text-white font-bold text-sm">Company</h4>
                <ul className="space-y-2 text-slate-500 text-sm font-medium">
                  <li><Link href="#" className="hover:text-emerald-400">About Us</Link></li>
                  <li><Link href="#" className="hover:text-emerald-400">Privacy</Link></li>
                  <li><Link href="#" className="hover:text-emerald-400">Terms</Link></li>
                </ul>
              </div>
              <div className="space-y-4">
                <h4 className="text-white font-bold text-sm">Connect</h4>
                <ul className="space-y-2 text-slate-500 text-sm font-medium">
                  <li><Link href="#" className="hover:text-emerald-400">Twitter</Link></li>
                  <li><Link href="#" className="hover:text-emerald-400">Support</Link></li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-12 border-t border-white/5">
            <p className="text-slate-600 text-xs font-bold uppercase tracking-widest">© 2026 Hamro IPO. Securely Powered by Supabase & Next Gen Logic.</p>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-slate-500 hover:text-white cursor-pointer hover:border-emerald-500/50 transition-colors">
                <Activity className="w-4 h-4" />
              </div>
              <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-slate-500 hover:text-white cursor-pointer hover:border-emerald-500/50 transition-colors">
                <Users className="w-4 h-4" />
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
