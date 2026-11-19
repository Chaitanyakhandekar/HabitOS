import api from './api.js';

export const journalApi = {
  getAll: (params) => api.get('/journal', { params }),
  getByDate: (date) => api.get(`/journal/${date}`),
  save: (data) => api.post('/journal', data),
  update: (id, data) => api.patch(`/journal/${id}`, data),
  delete: (id) => api.delete(`/journal/${id}`),
  getWeeklyReview: (params) => api.get('/journal/weekly-review', { params }),
};

export default journalApi;
