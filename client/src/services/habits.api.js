import api from './api.js';

export const habitsApi = {
  getAll: (params) => api.get('/habits', { params }),
  getById: (id) => api.get(`/habits/${id}`),
  create: (data) => api.post('/habits', data),
  update: (id, data) => api.patch(`/habits/${id}`, data),
  delete: (id) => api.delete(`/habits/${id}`),
  pause: (id) => api.patch(`/habits/${id}/pause`),
  resume: (id) => api.patch(`/habits/${id}/resume`),
  archive: (id) => api.patch(`/habits/${id}/archive`),
  getToday: (params) => api.get('/habits/today', { params }),
  getTodaySummary: (params) => api.get('/habits/today/summary', { params }),
};

export default habitsApi;
