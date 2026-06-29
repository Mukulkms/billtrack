import { BillStatus } from '../types'

export const fmtAmount = (n: number | string) => '₹' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
export const fmtDate = (d: string | Date | null) => { if (!d) return '—'; return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) }
export const fmtDateTime = (d: string | Date | null) => { if (!d) return '—'; return new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) }
export const todayISO = () => new Date().toISOString().split('T')[0]
export const addDays = (date: string, days: number) => { const d = new Date(date); d.setDate(d.getDate() + days); return d.toISOString().split('T')[0] }
export const daysLeft = (dueDate: string) => { const now = new Date(); now.setHours(0,0,0,0); const d = new Date(dueDate); d.setHours(0,0,0,0); return Math.ceil((d.getTime() - now.getTime()) / 86400000) }
export const initials = (name = '') => name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase()
export const statusColor: Record<BillStatus, string> = { PENDING: 'pill-pending', PARTIAL: 'pill-partial', PAID: 'pill-paid', OVERDUE: 'pill-overdue' }
export const SHOP_COLORS = ['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#f97316','#ec4899','#14b8a6','#a855f7']
export const getShopColor = (str: string) => SHOP_COLORS[str.charCodeAt(0) % SHOP_COLORS.length]
