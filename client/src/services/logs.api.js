import api from './api.js';

export const logsApi = {
  getAll: (params) => api.get('/habit-logs', { params }),
  log: (data) => api.post('/habit-logs', data),
  update: (id, data) => api.patch(`/habit-logs/${id}`, data),
  delete: (id) => api.delete(`/habit-logs/${id}`),
};

export default logsApi;
