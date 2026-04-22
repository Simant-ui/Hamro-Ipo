export interface User {
  id: string
  email: string
  full_name: string
  avatar_url?: string
  role: 'user' | 'admin'
  created_at: string
}

export interface DematAccount {
  id: string
  user_id: string
  account_name: string
  boid_encrypted: string
  bank_name: string
  account_number_encrypted: string
  crn_number?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface DematAccountDisplay extends Omit<DematAccount, 'boid_encrypted' | 'account_number_encrypted'> {
  boid_masked: string
  account_number_masked: string
}

export type IPOType = 'IPO' | 'FPO' | 'RIGHT' | 'DEBENTURE'
export type IPOStatus = 'upcoming' | 'open' | 'closed' | 'result_published'
export type ApplicationStatus = 'pending' | 'success' | 'failed' | 'allotted' | 'not_allotted'

export interface IPOListing {
  id: string
  company_name: string
  symbol: string
  type: IPOType
  status: IPOStatus
  open_date: string
  close_date: string
  issue_price: number
  total_units: number
  min_units: number
  max_units: number
  lot_size: number
  description?: string
  sector: string
  logo_url?: string
  prospectus_url?: string
  result_date?: string
  created_at: string
  updated_at: string
}

export interface IPOApplication {
  id: string
  user_id: string
  ipo_id: string
  account_id: string
  quantity: number
  amount: number
  status: ApplicationStatus
  applied_at: string
  result_date?: string
  allotted_units?: number
  rejection_reason?: string
  ipo?: IPOListing
  account?: DematAccountDisplay
}

export interface Portfolio {
  id: string
  user_id: string
  account_id: string
  symbol: string
  company_name: string
  quantity: number
  average_price: number
  current_price?: number
  last_updated: string
}

export interface Watchlist {
  id: string
  user_id: string
  symbol: string
  company_name: string
  added_at: string
  current_price?: number
  change?: number
  change_percent?: number
}

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: 'ipo_open' | 'ipo_result' | 'allotment' | 'system'
  is_read: boolean
  created_at: string
}

export interface NEPSEIndex {
  value: number
  change: number
  change_percent: number
  volume: number
  turnover: number
  timestamp: string
}

export interface DashboardStats {
  total_accounts: number
  total_applications: number
  total_investment: number
  allotted_count: number
  pending_count: number
  open_ipos: number
}
