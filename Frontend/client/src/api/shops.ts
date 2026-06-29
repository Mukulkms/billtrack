import api from './client'
export const getShopsApi = (p=1, l=50, s='') => api.get('/shops', { params: { page:p, limit:l, search:s } }).then(r => r.data.data)
export const getShopByIdApi = (id: string) => api.get(`/shops/${id}`).then(r => r.data.data)
export const createShopApi = (data: any) => api.post('/shops', data).then(r => r.data.data)
export const updateShopApi = (id: string, data: any) => api.put(`/shops/${id}`, data).then(r => r.data.data)
export const deleteShopApi = (id: string) => api.delete(`/shops/${id}`)
