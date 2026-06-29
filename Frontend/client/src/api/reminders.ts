import api from './client'
export const getUpcomingRemindersApi = (days=7) => api.get('/reminders/upcoming', { params: { days } }).then(r => r.data.data)
export const getTodayRemindersApi = () => api.get('/reminders/today').then(r => r.data.data)
