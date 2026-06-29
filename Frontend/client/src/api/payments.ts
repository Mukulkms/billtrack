import api from './client'
export const createPaymentApi = (data: any) => api.post('/payments', data).then(r => r.data.data)
export const getPaymentsByBillApi = (billId: string) => api.get(`/payments/bill/${billId}`).then(r => r.data.data)
