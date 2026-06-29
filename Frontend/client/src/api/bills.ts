import api from './client'
export const getBillsApi = (params?: any) => api.get('/bills', { params }).then(r => r.data.data)
export const getBillByIdApi = (id: string) => api.get(`/bills/${id}`).then(r => r.data.data)
export const createBillApi = (data: any) => api.post('/bills', data).then(r => r.data.data)
export const updateBillApi = (id: string, data: any) => api.put(`/bills/${id}`, data).then(r => r.data.data)
export const deleteBillApi = (id: string) => api.delete(`/bills/${id}`)
export const markOverdueApi = () => api.post('/bills/mark-overdue').then(r => r.data)
