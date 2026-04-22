import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export interface Account {
  id: number | string;
  name: string;
  boid: string;
  username: string;
  bank: string;
  clientId?: string;
  password?: string;
  crn?: string;
  pin?: string;
  isDefault?: boolean;
}

interface AccountState {
  accounts: Account[];
  addAccount: (account: Account) => void;
  updateAccount: (id: string | number, updatedAccount: Partial<Account>) => void;
  deleteAccount: (id: string | number) => void;
}

const initialMockAccounts: Account[] = [
  { id: 1, name: 'SALINA SHRESTHA', boid: '1301000000000509', username: '1189509', bank: 'GLOBAL IME BANK LTD.', isDefault: true },
  { id: 2, name: 'MAMTA KUMARI SHRESTHA', boid: '1301000000000301', username: '5542301', bank: 'NIC ASIA BANK LTD.', isDefault: true },
  { id: 3, name: 'Rudra Bahadur Shrestha', boid: '1301000000000742', username: '2284742', bank: 'GLOBAL IME BANK LTD.', isDefault: false },
]

export const useAccountStore = create<AccountState>()(
  persist(
    (set) => ({
      accounts: initialMockAccounts,
      addAccount: (account) => set((state) => ({ accounts: [...state.accounts, account] })),
      updateAccount: (id, updatedAccount) => set((state) => ({
        accounts: state.accounts.map((acc) => acc.id === id ? { ...acc, ...updatedAccount } : acc)
      })),
      deleteAccount: (id) => set((state) => ({
        accounts: state.accounts.filter((acc) => acc.id !== id)
      })),
    }),
    {
      name: 'hamro-ipo-accounts',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
