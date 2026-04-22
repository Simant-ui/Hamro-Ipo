'use client'

import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { BottomNav } from '@/components/layout/BottomNav'
import { MembershipModal } from '@/components/dashboard/MembershipModal'
import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAppStore } from '@/store/useAppStore'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const setUser = useAppStore((state) => state.setUser)
  const isMembershipModalOpen = useAppStore((state) => state.isMembershipModalOpen)
  const setMembershipModalOpen = useAppStore((state) => state.setMembershipModalOpen)
  const supabase = createClient()

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        // Fetch profile data
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        
        if (profile) {
          setUser(profile)
        }
      }
    }
    fetchUser()
  }, [setUser, supabase])

  return (
    <div className="min-h-screen mesh-gradient relative overflow-hidden">
      <div className="hidden md:block">
        <Sidebar />
      </div>
      <Header />
      <main className="md:pl-64 pt-16 pb-24 md:pb-8 relative z-10">
        <div className="max-w-7xl mx-auto p-4 md:p-8">
          {children}
        </div>
      </main>
      <BottomNav />
      
      <MembershipModal 
        isOpen={isMembershipModalOpen} 
        onClose={() => setMembershipModalOpen(false)} 
      />
    </div>
  )
}
