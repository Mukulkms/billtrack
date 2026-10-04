import api from './client'

export const getBillsApi = (params?: any) => api.get('/bills', { params }).then((r: any) => r.data)
export const getBillByIdApi = (id: string) => api.get(`/bills/${id}`).then((r: any) => r.data.data)
export const createBillApi = (data: any) => api.post('/bills', data).then((r: any) => r.data.data)
export const updateBillApi = (id: string, data: any) => api.put(`/bills/${id}`, data).then((r: any) => r.data.data)
export const deleteBillApi = (id: string) => api.delete(`/bills/${id}`)
export const markOverdueApi = () => api.post('/bills/mark-overdue').then((r: any) => r.data)

// Original bill image (Backblaze B2)
export const uploadBillImageApi = (file: File) => {
  const fd = new FormData()
  fd.append('file', file)
  return api.post('/bills/attachment', fd).then((r: any) => r.data.data.key as string)
}
export const getBillImageUrlApi = (id: string) =>
  api.get(`/bills/${id}/attachment`).then((r: any) => r.data.data.url as string)
