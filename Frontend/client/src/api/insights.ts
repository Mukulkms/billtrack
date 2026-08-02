import api from './client'

export interface ShopInsightGroup {
  shopId: string
  shopName: string
  ownerName: string
  whatsapp: string | null
  phone: string
  pendingAmount: number
  maxDaysOverdue: number
  billCount: number
  nearestDueDate: string | null
}

export interface PaymentInsights {
  summary: string
  totalOverdueAmount: number
  totalUpcomingAmount: number
  overdue: ShopInsightGroup[]
  upcoming: ShopInsightGroup[]
}

export const getPaymentInsightsApi = (): Promise<PaymentInsights> =>
  api.get('/insights').then(r => r.data.data)
