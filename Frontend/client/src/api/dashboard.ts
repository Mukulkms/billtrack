import api from './client'
export const getDashboardStatsApi = () => api.get('/dashboard/stats').then(r => r.data.data)
export const getMonthlySalesApi = (year: number, month: number) =>
  api.get('/dashboard/monthly-sales', { params: { year, month } }).then(r => r.data.data)
