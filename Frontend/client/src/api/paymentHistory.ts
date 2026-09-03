import api from './client'

export interface PaymentHistoryEntry {
  id: string
  shopName: string
  ownerName: string | null
  billNumber: string
  amount: number
  billDate: string
  paidAt: string
}

export const getPaymentHistoryApi = (): Promise<PaymentHistoryEntry[]> =>
  api.get('/payment-history').then(r => r.data.data)

export const deletePaymentHistoryApi = (ids: string[]): Promise<{ deletedCount: number }> =>
  api.delete('/payment-history', { data: { ids } }).then(r => r.data.data)
