import api from './client'
export const getCategoriesApi = () => api.get('/categories').then(r => r.data.data)
export const createCategoryApi = (data: { name: string }) => api.post('/categories', data).then(r => r.data.data)
