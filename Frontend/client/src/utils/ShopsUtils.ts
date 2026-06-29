// src/components/shops/shopsUtils.ts
import { Shop } from '../types'

export type ShopWithStats = Shop & {
  _pending: number
  _outstanding: number
  _hasOverdue: boolean
  _isClear: boolean
}

export const computeShopStats = (shops: Shop[]): ShopWithStats[] => {
  const now = new Date()
  return shops.map(shop => {
    const allBills    = shop.bills || []
    const pending     = allBills.filter(b => b.status !== 'PAID')
    const outstanding = pending.reduce((s, b) => s + Number(b.pendingAmount), 0)
    const hasOverdue  = pending.some(b => new Date(b.dueDate) < now)
    const isClear     = pending.length === 0
    return {
      ...shop,
      _pending: pending.length,
      _outstanding: outstanding,
      _hasOverdue: hasOverdue,
      _isClear: isClear,
    }
  })
}

export const FILTER_OPTIONS = [
  { value: 'all',     label: 'All' },
  { value: 'overdue', label: '🔴 Overdue' },
  { value: 'pending', label: 'Pending' },
  { value: 'clear',   label: '✓ Clear' },
]

export const SEARCH_BY_OPTIONS = [
  { value: 'name',  label: 'Shop name' },
  { value: 'owner', label: 'Owner name' },
  { value: 'phone', label: 'Phone' },
  { value: 'gstin', label: 'GSTIN' },
  { value: 'city',  label: 'City' },
]