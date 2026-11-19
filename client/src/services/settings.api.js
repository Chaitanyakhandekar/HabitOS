import api from './api.js';

export const settingsApi = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.patch('/users/profile', data),
  updatePassword: (data) => api.patch('/users/password', data),
  updateSettings: (data) => api.patch('/users/settings', data),
  updateNotifications: (data) => api.patch('/users/notifications', data),
  deleteAccount: () => api.delete('/users/account'),
  exportHabits: () => api.get('/export/habits'),
  exportLogs: (format = 'csv') =>
    api.get(`/export/logs?format=${format}`, {
      responseType: format === 'csv' ? 'blob' : 'json',
    }),
  exportJournal: (format = 'json') =>
    api.get(`/export/journal?format=${format}`, {
      responseType: format === 'csv' ? 'blob' : 'json',
    }),
};

export default settingsApi;
