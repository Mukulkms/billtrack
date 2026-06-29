import api from './client'
export const getDashboardStatsApi = () => api.get('/dashboard/stats').then(r => r.data.data)
