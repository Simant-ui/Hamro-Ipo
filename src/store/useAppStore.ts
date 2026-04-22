import { create } from 'zustand'
import { User, DematAccountDisplay, Notification } from '@/types'

interface AppState {
  user: User | null
  accounts: DematAccountDisplay[]
  notifications: Notification[]
  isLoading: boolean
  isMembershipModalOpen: boolean
  setUser: (user: User | null) => void
  setAccounts: (accounts: DematAccountDisplay[]) => void
  setNotifications: (notifications: Notification[]) => void
  addNotification: (notification: Notification) => void
  markNotificationAsRead: (id: string) => void
  searchQuery: string
  setSearchQuery: (query: string) => void
  setLoading: (isLoading: boolean) => void
  setMembershipModalOpen: (isOpen: boolean) => void
  livePrices: any[]
  setLivePrices: (prices: any[]) => void
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  accounts: [],
  notifications: [],
  isLoading: false,
  isMembershipModalOpen: false,
  setUser: (user) => set({ user }),
  setAccounts: (accounts) => set({ accounts }),
  setNotifications: (notifications) => set({ notifications }),
  addNotification: (notification) =>
    set((state) => ({ notifications: [notification, ...state.notifications] })),
  markNotificationAsRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, is_read: true } : n
      ),
    })),
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),
  setLoading: (isLoading) => set({ isLoading }),
  setMembershipModalOpen: (isOpen) => set({ isMembershipModalOpen: isOpen }),
  livePrices: [],
  setLivePrices: (livePrices) => set({ livePrices }),
}))
