'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  Trash2,
  CreditCard,
  ShieldCheck,
  Building2,
  User as UserIcon,
  X,
  Loader2,
  AlertCircle,
  Activity,
  Lock,
  Key,
  Check,
  Fingerprint,
  ArrowRight
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useAppStore } from '@/store/useAppStore'
import { toast } from 'react-hot-toast'
import { encrypt, maskBOID, maskAccountNumber } from '@/lib/encryption'
import { DematAccountDisplay } from '@/types'
import { NEPAL_BANKS } from '@/constants/banks'
import { AddAccountModal } from '@/components/dashboard/AddAccountModal'

export default function AccountsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)
  const [banks, setBanks] = useState<{ id: string, name: string, bank_class: string, dp_code?: string }[]>([])
  const [searchTerm, setSearchTerm] = useState('')

  const { accounts, setAccounts } = useAppStore()
  const supabase = createClient()

  const [editingAccount, setEditingAccount] = useState<any>(null)

  const fetchBanks = async () => {
    try {
      const { data, error } = await supabase.from('banks').select('*').eq('is_active', true).order('name')
      
      // Use local NEPAL_BANKS and NEPAL_BROKERS as the primary source to ensure completeness
      // but merge with any additional banks from the database
      const dbBanks = data || []
      const combinedBanks = [...NEPAL_BANKS]
      
      dbBanks.forEach((dbBank: any) => {
        if (!combinedBanks.find(b => b.name.toLowerCase() === dbBank.name.toLowerCase())) {
          combinedBanks.push({
            id: dbBank.id,
            name: dbBank.name,
            bank_class: dbBank.bank_class,
            dp_code: dbBank.dp_code
          } as any)
        }
      })
      
      setBanks(combinedBanks.sort((a, b) => a.name.localeCompare(b.name)) as any)
    } catch (e) {
      setBanks(NEPAL_BANKS as any)
    }
  }

  const fetchAccounts = async () => {
    setFetchLoading(true)
    const { data, error } = await supabase
      .from('demat_accounts')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      toast.error('Failed to fetch accounts')
    } else {
      const displayAccounts: DematAccountDisplay[] = data.map((acc: any) => ({
        ...acc,
        boid_masked: maskBOID(acc.boid_encrypted), // Assuming we decrypt or just use the masked version if we stored it (but here we decrypt)
        account_number_masked: maskAccountNumber(acc.account_number_encrypted),
      }))
      setAccounts(displayAccounts)
    }
    setFetchLoading(false)
  }

  useEffect(() => {
    fetchAccounts()
    fetchBanks()
  }, [])

  useEffect(() => {
    if (formData.bank_name) {
      const selectedBank = banks.find(b => b.name === formData.bank_name || `${b.dp_code} - ${b.name}` === formData.bank_name)
  const handleSaveAccount = async (formData: any) => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const selectedBank = banks.find(b => `${b.dp_code} - ${b.name}` === formData.dpName)
      const dpCode = selectedBank?.dp_code || '10000'
      const generatedBoid = '130' + dpCode + '00000'.slice(0, 8 - formData.username.length) + formData.username

      // Encrypt sensitive data
      const boid_encrypted = encrypt(generatedBoid)
      const account_number_encrypted = encrypt('NOT_PROVIDED')

      const payload = {
        user_id: user.id,
        account_name: formData.fullName,
        boid_encrypted,
        bank_name: formData.dpName.split('-')[1]?.trim() || formData.dpName,
        account_number_encrypted,
        crn_number: formData.crnNumber,
        meroshare_username: formData.username,
        meroshare_password_encrypted: encrypt(formData.password),
        transaction_pin_encrypted: encrypt(formData.transactionPin),
      }

      let error
      if (editingAccount) {
        const { error: updateError } = await supabase
          .from('demat_accounts')
          .update(payload)
          .eq('id', editingAccount.id)
        error = updateError
      } else {
        const { error: insertError } = await supabase
          .from('demat_accounts')
          .insert(payload)
        error = insertError
      }

      if (error) throw error

      toast.success(editingAccount ? 'Account updated' : 'Account added successfully')
      setIsModalOpen(false)
      setEditingAccount(null)
      fetchAccounts()
    } catch (error: any) {
      toast.error(error.message || 'Failed to save account')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAccount = async (id: string) => {
    if (!confirm('Are you sure you want to delete this account?')) return

    const { error } = await supabase
      .from('demat_accounts')
      .delete()
      .eq('id', id)

    if (error) {
      toast.error('Failed to delete account')
    } else {
      toast.success('Account deleted')
      fetchAccounts()
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Demat Accounts</h1>
          <p className="text-slate-400 mt-1">Manage multiple BOIDs for bulk IPO applications</p>
        </div>
        <button
          onClick={() => {
            setEditingAccount(null)
            setIsModalOpen(true)
          }}
          className="premium-btn premium-btn-primary"
        >
          <Plus className="w-5 h-5" />
          Add Account
        </button>
      </div>

      {/* Account List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {fetchLoading ? (
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="glass-card p-6 h-48 animate-pulse bg-slate-800/20" />
            ))
          ) : accounts.length === 0 ? (
            <div className="col-span-full py-20 text-center glass-card">
              <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <CreditCard className="w-8 h-8 text-slate-500" />
              </div>
              <h3 className="text-xl font-bold">No accounts found</h3>
              <p className="text-slate-500 mt-2">Add your first Demat account to start applying for IPOs</p>
              <button
                onClick={() => {
                  setIsModalOpen(true)
                  setStep(1)
                }}
                className="mt-6 text-blue-500 hover:underline font-semibold"
              >
                Add Account Now
              </button>
            </div>
          ) : (
            accounts.map((acc) => (
              <motion.div
                key={acc.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-card p-6 relative group overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                  <button
                    onClick={() => {
                      setEditingAccount({
                        id: acc.id,
                        name: acc.account_name,
                        bank: acc.bank_name,
                        username: acc.meroshare_username,
                        crn: acc.crn_number,
                        // pin and password would be decrypted here if needed for editing
                      })
                      setIsModalOpen(true)
                    }}
                    className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg hover:bg-emerald-500/20 transition-colors"
                  >
                    <Plus className="w-4 h-4 rotate-45" /> {/* Use a plus rotated as edit or just search for edit icon */}
                  </button>
                  <button
                    onClick={() => handleDeleteAccount(acc.id)}
                    className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 bg-blue-600/10 rounded-2xl flex items-center justify-center border border-blue-500/20 text-blue-500">
                    <UserIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{acc.account_name}</h3>
                    <p className="text-sm text-slate-500">{acc.bank_name}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-xl border border-slate-800">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                      <span className="text-xs text-slate-400">BOID</span>
                    </div>
                    <span className="text-sm font-mono text-slate-200">****{acc.boid_masked.slice(-4)}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-xl border border-slate-800">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-blue-500" />
                      <span className="text-xs text-slate-400">A/C Number</span>
                    </div>
                    <span className="text-sm font-mono text-slate-200">****{acc.account_number_masked.slice(-4)}</span>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      <AddAccountModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={editingAccount}
        onSave={handleSaveAccount}
      />
    </div>
  )
}
