import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-NP', {
    style: 'currency',
    currency: 'NPR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-IN').format(num)
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-NP', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date))
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat('en-NP', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export function getDaysRemaining(endDate: string): number {
  const end = new Date(endDate)
  const now = new Date()
  const diff = end.getTime() - now.getTime()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

export function getIPOStatus(openDate: string, closeDate: string): 'upcoming' | 'open' | 'closed' {
  const now = new Date()
  const open = new Date(openDate)
  const close = new Date(closeDate)
  if (now < open) return 'upcoming'
  if (now > close) return 'closed'
  return 'open'
}

export function calculateProfitLoss(
  investedAmount: number,
  currentValue: number
): { amount: number; percentage: number; isProfit: boolean } {
  const amount = currentValue - investedAmount
  const percentage = investedAmount > 0 ? (amount / investedAmount) * 100 : 0
  return { amount, percentage, isProfit: amount >= 0 }
}

export function generateCSV(headers: string[], rows: (string | number)[][]): string {
  const headerRow = headers.join(',')
  const dataRows = rows.map(row => row.map(cell => `"${cell}"`).join(','))
  return [headerRow, ...dataRows].join('\n')
}

export function downloadCSV(filename: string, csvContent: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = filename
  link.click()
}
